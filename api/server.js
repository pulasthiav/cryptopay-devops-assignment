require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error(err));

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model(
    'Transaction',
    new mongoose.Schema({
      time: { type: Date, default: Date.now },
      amount: Number,
      coin: String,
      plan: String,
    })
  );

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/search?query=${query}`
    );
    const coins = response.data.coins.slice(0, 7).map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      thumb: coin.thumb,
    }));
    res.json(coins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/api/calculate-payment', async (req, res) => {
  const { amount, coin } = req.query;
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=lkr`
    );

    const rate = response.data[coin].lkr;

    const payNowLKR = amount * 1.01;
    const payNowCrypto = payNowLKR / rate;

    const monthlyLKR = (amount * 1.1) / 3;
    const monthlyCrypto = monthlyLKR / rate;

    const schedule = [
      { date: 'Today', amountLKR: monthlyLKR.toFixed(2) },
      { date: 'Month 2', amountLKR: monthlyLKR.toFixed(2) },
      { date: 'Month 3', amountLKR: monthlyLKR.toFixed(2) },
    ];

    res.json({
      coin,
      rate,
      options: {
        payNow: {
          lkrTotal: payNowLKR.toFixed(2),
          cryptoTotal: payNowCrypto.toFixed(8),
        },
        installments: {
          monthlyPayment: monthlyLKR.toFixed(2),
          monthlyCrypto: monthlyCrypto.toFixed(8),
          schedule,
        },
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error' });
  }
});

app.get('/api/record-sale', async (req, res) => {
  try {
    await new Transaction({ ...req.query, time: new Date() }).save();
    res.json({ status: 'Saved' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'DB Error' });
  }
});

app.get('/api/admin-stats', async (req, res) => {
  if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).send();
  }
  const transactions = await Transaction.find().sort({ time: -1 });
  const total = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  res.json({ totalIncome: total.toFixed(2), recentSales: transactions });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
