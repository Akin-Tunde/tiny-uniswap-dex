import os
import json
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from web3 import AsyncWeb3
from web3.middleware import geth_poa_middleware
from decimal import Decimal

# --- Pre-computation and Setup ---
# Load environment variables from the .env file
load_dotenv()
app = FastAPI(
    title="Multi-Chain DEX Analytics API",
    description="Provides live and historical data for the Tiny Uniswap DEX across multiple chains."
)

# A list of all supported chains
CHAINS = ["base", "bsc", "optimism", "celo", "arbitrum"]
CONFIG = {}

# This loop runs ONCE at startup to load all necessary configurations.
for chain in CHAINS:
    try:
        # Load ABIs from the dedicated abi folder
        with open(f"abi/AkinToken.json") as f: akin_abi = json.load(f)
        with open(f"abi/WethToken.json") as f: weth_abi = json.load(f)
        with open(f"abi/AmmExchange.json") as f: exchange_abi = json.load(f)

        chain_upper = chain.upper()
        # Build a configuration dictionary for the current chain
        CONFIG[chain] = {
            "rpc": os.getenv(f"{chain_upper}_RPC_URL") or f"https://{chain}.drpc.org", # Fallback to a public RPC
            "exchange_address": os.getenv(f"{chain_upper}_AMM_EXCHANGE_ADDRESS"),
            "tokenA_address": os.getenv(f"{chain_upper}_AKIN_TOKEN_ADDRESS"),
            "tokenB_address": os.getenv(f"{chain_upper}_WETH_TOKEN_ADDRESS"),
            "exchange_abi": exchange_abi,
            "tokenA_abi": akin_abi,
            "tokenB_abi": weth_abi
        }
    except Exception as e:
        # If config for one chain fails, print a warning but continue with the others.
        print(f"Warning: Could not load configuration for chain '{chain}'. It will be unavailable. Error: {e}")

# --- Helper Function to Fetch Data ---
async def get_exchange_stats(chain: str):
    """Asynchronously fetches live statistics for a single AMM exchange."""
    if chain not in CONFIG or not CONFIG[chain].get('exchange_address'):
        return {"chain": chain, "error": "Configuration for this chain is missing or incomplete."}

    conf = CONFIG[chain]
    w3 = AsyncWeb3(AsyncWeb3.AsyncHTTPProvider(conf["rpc"]))

    # Some chains (PoA) require special middleware
    if chain in ['bsc', 'celo']:
        w3.middleware_onion.inject(geth_poa_middleware, layer=0)
    
    exchange = w3.eth.contract(address=conf["exchange_address"], abi=conf["exchange_abi"])

    try:
        # Use asyncio.gather to make all read calls concurrently for maximum speed
        reserves, total_supply, tokenA_symbol, tokenB_symbol = await asyncio.gather(
            exchange.functions.getReserves().call(),
            exchange.functions.totalSupply().call(),
            w3.eth.contract(address=conf["tokenA_address"], abi=conf["tokenA_abi"]).functions.symbol().call(),
            w3.eth.contract(address=conf["tokenB_address"], abi=conf["tokenB_abi"]).functions.symbol().call()
        )
        
        # Calculate the price from the reserves
        reserve_a = Decimal(reserves[0])
        reserve_b = Decimal(reserves[1])
        price = reserve_b / reserve_a if reserve_a > 0 else Decimal(0)

        return {
            "chain": chain,
            "exchangeAddress": conf["exchange_address"],
            "tokenA": {"address": conf["tokenA_address"], "symbol": tokenA_symbol, "reserve": w3.from_wei(reserves[0], 'ether')},
            "tokenB": {"address": conf["tokenB_address"], "symbol": tokenB_symbol, "reserve": w3.from_wei(reserves[1], 'ether')},
            "price_AKT_per_WETH": f"{price:.6f}",
            "totalLPSupply": w3.from_wei(total_supply, 'ether'),
            "error": None
        }
    except Exception as e:
        return {"chain": chain, "error": f"Failed to fetch data: {str(e)}"}

# --- API Endpoints ---
@app.get("/", summary="API Health Check")
def read_root():
    """Provides the operational status of the API and lists all chains it's configured to monitor."""
    return {"status": "ok", "configured_chains": list(CONFIG.keys())}

@app.get("/stats/{chain_name}", summary="Get Live Stats for a Specific Exchange")
async def get_single_exchange_stats(chain_name: str):
    """Fetches live pool reserves, price, and LP token supply for a single, specified chain."""
    if chain_name not in CONFIG:
        raise HTTPException(status_code=404, detail="Chain not found or not configured.")
    return await get_exchange_stats(chain_name)

@app.get("/stats/all", summary="Get Live Stats for All Exchanges")
async def get_all_exchange_stats():
    """Concurrently fetches live pool reserves, price, and LP token supply from all configured chains."""
    tasks = [get_exchange_stats(chain) for chain in CHAINS if chain in CONFIG]
    results = await asyncio.gather(*tasks)
    return results