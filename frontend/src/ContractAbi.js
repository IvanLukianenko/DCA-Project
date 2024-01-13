
let dcaABI = [
    {
        "inputs": [
            {
                "internalType": "contract ISwapRouter",
                "name": "_swapRouter",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "daiToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "usdtToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "wethToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "daiEthAggregator",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "usdtEthAggregetor",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            }
        ],
        "name": "dcaExecuted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "tokenIn",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "tokenOut",
                        "type": "address"
                    },
                    {
                        "internalType": "uint24",
                        "name": "poolFee",
                        "type": "uint24"
                    }
                ],
                "indexed": false,
                "internalType": "struct dcaContract.tradePair",
                "name": "userTradePair",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "purchaseAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "purchaseInterval",
                        "type": "uint256"
                    }
                ],
                "indexed": false,
                "internalType": "struct dcaContract.singleDcaParams",
                "name": "userDcaParams",
                "type": "tuple"
            }
        ],
        "name": "dcaParametersSet",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "depositedAmount",
                "type": "uint256"
            }
        ],
        "name": "deposited",
        "type": "event"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "tokenIn",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "tokenOut",
                        "type": "address"
                    },
                    {
                        "internalType": "uint24",
                        "name": "poolFee",
                        "type": "uint24"
                    }
                ],
                "internalType": "struct dcaContract.tradePair",
                "name": "_tradePair",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "_tokenInAmount",
                "type": "uint256"
            }
        ],
        "name": "calculateEquivalentAmount",
        "outputs": [
            {
                "internalType": "int256",
                "name": "",
                "type": "int256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "constantPoolFee",
        "outputs": [
            {
                "internalType": "uint24",
                "name": "",
                "type": "uint24"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_tokenAmount",
                "type": "uint256"
            }
        ],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_token",
                "type": "address"
            }
        ],
        "name": "getBalance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "tokenIn",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "tokenOut",
                        "type": "address"
                    },
                    {
                        "internalType": "uint24",
                        "name": "poolFee",
                        "type": "uint24"
                    }
                ],
                "internalType": "struct dcaContract.tradePair",
                "name": "_tradePair",
                "type": "tuple"
            }
        ],
        "name": "getDcaParams",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_token",
                "type": "address"
            }
        ],
        "name": "getLatestPrice",
        "outputs": [
            {
                "internalType": "int256",
                "name": "",
                "type": "int256"
            },
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "tokenIn",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "tokenOut",
                        "type": "address"
                    },
                    {
                        "internalType": "uint24",
                        "name": "poolFee",
                        "type": "uint24"
                    }
                ],
                "internalType": "struct dcaContract.tradePair",
                "name": "_tradePair",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "purchaseAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "purchaseInterval",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct dcaContract.singleDcaParams",
                "name": "_singleDcaParams",
                "type": "tuple"
            }
        ],
        "name": "setDcaParams",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_userAddress",
                "type": "address"
            },
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "tokenIn",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "tokenOut",
                        "type": "address"
                    },
                    {
                        "internalType": "uint24",
                        "name": "poolFee",
                        "type": "uint24"
                    }
                ],
                "internalType": "struct dcaContract.tradePair",
                "name": "_tradePair",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "_amountOut",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_amountInMaximum",
                "type": "uint256"
            }
        ],
        "name": "swapExactOutputSingle",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "swapRouter",
        "outputs": [
            {
                "internalType": "contract ISwapRouter",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "name": "tokenAddresses",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
