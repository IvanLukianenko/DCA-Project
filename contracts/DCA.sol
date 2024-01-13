// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;
pragma abicoder v2;

import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@chainlink/contracts/src/v0.7/interfaces/AggregatorV3Interface.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';


import "hardhat/console.sol";

contract dcaContract{

    struct singleDcaParams {
        uint purchaseAmount;
        uint purchaseInterval;
    }

    struct balances {
        mapping (address => uint) tokenAmount;
    }

    struct tradePair {
        address tokenIn;
        address tokenOut;
        uint24 poolFee;
    }

    struct dcaParams { // describe why bytes32
        mapping (bytes32 => singleDcaParams) tradePairParams;
    }

    event deposited(
        address user,
        uint256 depositedAmount
    );

    event dcaParametersSet(
        address user,
        tradePair userTradePair,
        singleDcaParams userDcaParams
    );

    event dcaExecuted(
        address user,
        uint256 amountIn
    );

    mapping (address => dcaParams) usersDcaParams;
    mapping (address => balances) usersBalances;

    ISwapRouter public immutable swapRouter;
    mapping(address => AggregatorV3Interface) internal priceFeeds;
    mapping(string => address) public tokenAddresses;

    uint24 public constant constantPoolFee = 3000;

    constructor(
        ISwapRouter _swapRouter, 
        address daiToken,
        address usdtToken,
        address wethToken,
        address daiEthAggregator,
        address usdtEthAggregetor
    ) {
        swapRouter = _swapRouter;
        tokenAddresses["DAI"] = daiToken;
        tokenAddresses["USDT"] = usdtToken;
        tokenAddresses["WETH"] = wethToken;
        priceFeeds[tokenAddresses["DAI"]] = AggregatorV3Interface(daiEthAggregator);
        priceFeeds[tokenAddresses["USDT"]] = AggregatorV3Interface(usdtEthAggregetor);
    }

    function deposit(address _token, uint _tokenAmount) external {
        // Transfer the specified amount of token to this contract.
        TransferHelper.safeTransferFrom(_token, msg.sender, address(this), _tokenAmount);

        // Approve the router to spend the specifed `_tokenAmount` of token.
        // In production, you should choose the amount to spend based on oracles or other data sources to acheive a better swap.
        TransferHelper.safeApprove(_token, address(swapRouter), _tokenAmount);

        usersBalances[msg.sender].tokenAmount[_token] += _tokenAmount;

        emit deposited(msg.sender, _tokenAmount);
    }

    function getBalance(address _token) external view returns (uint) {
        return usersBalances[msg.sender].tokenAmount[_token];
    }

    function setDcaParams(
        tradePair memory _tradePair,
        singleDcaParams memory _singleDcaParams
    ) external {
        address user = msg.sender;
        usersDcaParams[user].tradePairParams[
            keccak256(abi.encode(_tradePair))
        ] = _singleDcaParams;

        emit dcaParametersSet(user, _tradePair, _singleDcaParams);
    }

    function getDcaParams(tradePair memory _tradePair) external view returns (uint256, uint256){
        address user = msg.sender;
        singleDcaParams memory userSingleDcaParams = usersDcaParams[user].tradePairParams[
            keccak256(abi.encode(_tradePair))
        ];
        return (
            userSingleDcaParams.purchaseAmount,
            userSingleDcaParams.purchaseInterval
        );
    }

    function executeDca(tradePair memory _tradePair) external {
        address user = msg.sender;

        singleDcaParams storage currentDcaParams = usersDcaParams[user].tradePairParams[keccak256(abi.encode(_tradePair))];
        uint256 userTokenAmount = usersBalances[user].tokenAmount[_tradePair.tokenIn];
        uint256 amountIn = this.swapExactOutputSingle(user, _tradePair, currentDcaParams.purchaseAmount, userTokenAmount);

        emit dcaExecuted(user, amountIn);
    }

    function getLatestPrice(address _token) public view returns (int256, uint8) {
        uint8 decimals = priceFeeds[_token].decimals();
        (, int256 price, , , ) = priceFeeds[_token].latestRoundData();
        return (price, decimals);
    }

    function calculateEquivalentAmount(tradePair memory _tradePair,  uint256 _tokenInAmount) external view returns (int){
        (int256 tokenInUsdPrice, uint8 tokenInDecimals) = this.getLatestPrice(_tradePair.tokenIn);
        (int256 tokenOutUsdPrice, uint8 tokenOutDecimals) = this.getLatestPrice(_tradePair.tokenOut);
        return tokenInUsdPrice / tokenOutUsdPrice * int256(_tokenInAmount);
    }

    function swapExactOutputSingle(
        address _userAddress,
        tradePair memory _tradePair,
        uint256 _amountOut,
        uint256 _amountInMaximum
    ) external returns (uint256 amountIn) {
        ISwapRouter.ExactOutputSingleParams memory params =
            ISwapRouter.ExactOutputSingleParams({
                tokenIn: _tradePair.tokenIn,
                tokenOut: _tradePair.tokenOut,
                fee: _tradePair.poolFee,
                recipient: _userAddress,
                deadline: block.timestamp,
                amountOut: _amountOut,
                amountInMaximum: _amountInMaximum,
                sqrtPriceLimitX96: 0
            });

        // Executes the swap returning the amountIn needed to spend to receive the desired amountOut.
        amountIn = swapRouter.exactOutputSingle(params);
        usersBalances[_userAddress].tokenAmount[_tradePair.tokenIn] -= _amountInMaximum;

        // For exact output swaps, the amountInMaximum may not have all been spent.
        // If the actual amount spent (amountIn) is less than the specified maximum amount, we must refund the _userAddress and approve the swapRouter to spend 0.
        if (amountIn < _amountInMaximum) {
            TransferHelper.safeApprove(_tradePair.tokenIn, address(swapRouter), 0);
            TransferHelper.safeTransfer(_tradePair.tokenIn, address(this), _amountInMaximum - amountIn);
            usersBalances[_userAddress].tokenAmount[_tradePair.tokenIn] += _amountInMaximum - amountIn;
        }
    }

}