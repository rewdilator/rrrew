const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const DATA_FILE = path.join(__dirname, 'w.json');

// Initialize empty array if file doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

app.post('/api/store-wallet', (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    data.push({
      walletAddress,
      timestamp: new Date().toISOString(),
      network: req.body.network || 'unknown'
    });

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error storing wallet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
