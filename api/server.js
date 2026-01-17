const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors'); // Added CORS for safety
const app = express();
app.use(express.static('public'));
const port = 3001;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files if needed

// Memory Database
let transactions = [];
let totalIncomeLKR = 0;

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Search API (Wrapper to avoid exposing API Key logic later)
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  try {
    // Added User-Agent to prevent some API blocks
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/search?query=${query}`,
      { headers: { 'User-Agent': 'CryptoPOS/1.0' } }
    );

    const coins = response.data.coins.slice(0, 7).map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      thumb: coin.thumb,
    }));
    res.json(coins);
  } catch (error) {
    console.error('Search API Error:', error.message);
    res.status(500).json({ error: 'Search failed due to API limits' });
  }
});

// Price Calculation (Fiat Pegging Logic 🧠)
app.get('/api/calculate-payment', async (req, res) => {
  const { amount, coin } = req.query;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid Amount!' });
  }

  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=lkr,usd`
    );

    if (!response.data[coin]) {
      return res.status(404).json({ error: 'Coin price data unavailable' });
    }

    const rateLKR = response.data[coin].lkr;
    const rateUSD = response.data[coin].usd;

    // 1. Pay Now Logic (Full + 1%)
    const totalLKR_Now = amount * 1.01;

    // 2. Installment Logic (Full + 10%)
    const totalLKR_Inst = amount * 1.1;
    const monthlyPaymentLKR = totalLKR_Inst / 3;

    // Robust Date Calculation
    const today = new Date();

    const date2 = new Date(today);
    date2.setMonth(today.getMonth() + 1);

    const date3 = new Date(today);
    date3.setMonth(today.getMonth() + 2);

    const options = { year: 'numeric', month: 'short', day: 'numeric' };

    const schedule = [
      {
        date: 'Today (Now)',
        amountLKR: monthlyPaymentLKR.toFixed(2),
        cryptoAmount: (monthlyPaymentLKR / rateLKR).toFixed(6),
        status: 'Due Now',
      },
      {
        date: date2.toLocaleDateString('en-US', options),
        amountLKR: monthlyPaymentLKR.toFixed(2),
        cryptoAmount: 'At Market Rate 🔄',
        status: 'Auto-Schedule',
      },
      {
        date: date3.toLocaleDateString('en-US', options),
        amountLKR: monthlyPaymentLKR.toFixed(2),
        cryptoAmount: 'At Market Rate 🔄',
        status: 'Auto-Schedule',
      },
    ];

    res.json({
      coin: coin,
      rateLKR: rateLKR,
      options: {
        payNow: {
          lkrTotal: totalLKR_Now.toFixed(2),
          usdTotal: ((totalLKR_Now / rateLKR) * rateUSD).toFixed(2),
          cryptoTotal: (totalLKR_Now / rateLKR).toFixed(6),
        },
        installments: {
          totalLKR: totalLKR_Inst.toFixed(2),
          monthlyPayment: monthlyPaymentLKR.toFixed(2),
          schedule: schedule,
        },
      },
    });
  } catch (error) {
    console.error('Calculation Error:', error.message);
    res.status(500).json({ error: 'Error calculating price' });
  }
});

// Record Sale
app.get('/api/record-sale', (req, res) => {
  const { amount, coin, plan } = req.query;

  const sale = {
    id: transactions.length + 1,
    time: new Date().toLocaleTimeString(),
    amount: parseFloat(amount).toFixed(2),
    coin: coin,
    plan: plan,
  };

  transactions.push(sale);

  // Update Income based on Plan Type
  // If installment, we only count the FIRST payment as immediate cash income
  const income =
    plan === 'Pay Now' ? parseFloat(amount) : parseFloat(amount) / 3;

  totalIncomeLKR += income;

  res.json({ status: 'Saved' });
});

// Admin Stats
app.get('/api/admin-stats', (req, res) => {
  const providedPass = req.headers['x-admin-password'];
  const REAL_PASS = 'admin123';

  if (providedPass !== REAL_PASS) {
    return res.status(401).json({ error: 'Unauthorized! Wrong Password.' });
  }

  res.json({
    totalIncome: totalIncomeLKR.toFixed(2),
    totalCount: transactions.length,
    recentSales: transactions.slice(-5).reverse(),
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = app;
