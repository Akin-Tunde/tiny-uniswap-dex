// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// This is our Automated Market Maker contract
contract AmmExchange is ERC20 {
    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;

    uint256 public reserveA;
    uint256 public reserveB;

    // The constructor initializes the two tokens the exchange will trade
    constructor(address _tokenA, address _tokenB) ERC20("Akin LP Token", "AK-LP") {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    // --- VIEW FUNCTIONS ---
    function getReserves() public view returns (uint256, uint256) {
        return (reserveA, reserveB);
    }

    // --- LIQUIDITY FUNCTIONS ---

    // Adds liquidity to the pool.
    function addLiquidity(uint256 _amountA, uint256 _amountB) public returns (uint256 liquidity) {
        // This contract must be approved to spend the user's tokens first!
        require(tokenA.transferFrom(msg.sender, address(this), _amountA), "Transfer A failed");
        require(tokenB.transferFrom(msg.sender, address(this), _amountB), "Transfer B failed");

        // Mint LP tokens to the user
        if (totalSupply() == 0) {
            // If this is the first liquidity provider, mint LP tokens equal to amountA
            liquidity = _amountA;
        } else {
            // Otherwise, mint LP tokens proportionally
            liquidity = (_amountA * totalSupply()) / reserveA;
        }

        require(liquidity > 0, "Insufficient liquidity minted");
        _mint(msg.sender, liquidity);

        // Update reserves
        reserveA += _amountA;
        reserveB += _amountB;
    }

    // Removes liquidity from the pool.
    function removeLiquidity(uint256 _lpTokenAmount) public returns (uint256 amountA, uint256 amountB) {
        require(_lpTokenAmount > 0, "Cannot remove 0 liquidity");
        
        uint256 totalLP = totalSupply();
        amountA = (reserveA * _lpTokenAmount) / totalLP;
        amountB = (reserveB * _lpTokenAmount) / totalLP;

        require(amountA > 0 && amountB > 0, "Insufficient amounts to withdraw");

        _burn(msg.sender, _lpTokenAmount); // Burn the user's LP tokens
        tokenA.transfer(msg.sender, amountA); // Send back Token A
        tokenB.transfer(msg.sender, amountB); // Send back Token B
        
        reserveA -= amountA;
        reserveB -= amountB;
    }

    // --- SWAP FUNCTION ---

    // Swaps one token for another.
    function swap(address _tokenIn, uint256 _amountIn) public returns (uint256 amountOut) {
        require(_tokenIn == address(tokenA) || _tokenIn == address(tokenB), "Invalid input token");
        require(_amountIn > 0, "Amount in must be positive");

        // Pull the input tokens from the user
        IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountIn);

        // Calculate output amount based on constant product formula, with a 0.3% fee
        uint256 amountInWithFee = _amountIn * 997; // 100% - 0.3% = 99.7%

        if (_tokenIn == address(tokenA)) { // User is swapping Token A for Token B
            uint256 numerator = amountInWithFee * reserveB;
            uint256 denominator = (reserveA * 1000) + amountInWithFee;
            amountOut = numerator / denominator;
            
            reserveA += _amountIn;
            reserveB -= amountOut;
            tokenB.transfer(msg.sender, amountOut);
        } else { // User is swapping Token B for Token A
            uint256 numerator = amountInWithFee * reserveA;
            uint256 denominator = (reserveB * 1000) + amountInWithFee;
            amountOut = numerator / denominator;

            reserveB += _amountIn;
            reserveA -= amountOut;
            tokenA.transfer(msg.sender, amountOut);
        }
    }
}