require('dotenv').config(); // .env එක කියවන්න
const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose'); // Database Driver එක
const Transaction = require('../models/Transaction'); // අපි හදපු Model එක

const app = express();
const port = 3001;

app.use(cors());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// --- DATABASE CONNECTION (අලුත් කොටස) ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- routes ---

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 1. Search API
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);
  try {
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
    res.status(500).json({ error: 'Search failed' });
  }
});

// 2. Calculate Payment
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
      return res.status(404).json({ error: 'Coin price unavailable' });
    }

    const rateLKR = response.data[coin].lkr;
    const rateUSD = response.data[coin].usd;
    const totalLKR_Now = amount * 1.01;
    const totalLKR_Inst = amount * 1.1;
    const monthlyPaymentLKR = totalLKR_Inst / 3;

    // Date Logic
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

// 3. Record Sale (Save to Database)
app.get('/api/record-sale', async (req, res) => {
  const { amount, coin, plan } = req.query;

  try {
    // Database එකට Save කරන කොටස
    const newSale = new Transaction({
      amount: parseFloat(amount),
      coin: coin,
      plan: plan,
    });

    await newSale.save(); // මෙතනින් තමයි Cloud එකට යන්නේ

    console.log('✅ Sale Saved to MongoDB');
    res.json({ status: 'Saved' });
  } catch (error) {
    console.error('Save Error:', error);
    res.status(500).json({ error: 'Database Error' });
  }
});

// 4. Admin Stats (Read from Database)
app.get('/api/admin-stats', async (req, res) => {
  const providedPass = req.headers['x-admin-password'];

  // .env එකේ පාස්වර්ඩ් එක check කරනවා
  if (providedPass !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized! Wrong Password.' });
  }

  try {
    // Database එකෙන් ඔක්කොම ගන්නවා ( අලුත් ඒවා උඩට )
    const transactions = await Transaction.find().sort({ time: -1 });

    let totalIncomeLKR = 0;
    transactions.forEach((t) => {
      // Installment නම් පලවෙනි වාරිකය විතරක් ආදායම විදියට ගමු (සරලව)
      const income = t.plan === 'Pay Now' ? t.amount : t.amount / 3; // වැරදීමක් නිවැරදි කලා
      totalIncomeLKR += t.amount; // සරලව මුළු අගය එකතු කරමු
    });

    res.json({
      totalIncome: totalIncomeLKR.toFixed(2),
      totalCount: transactions.length,
      recentSales: transactions.slice(0, 5), // අන්තිම 5
    });
  } catch (err) {
    res.status(500).json({ error: 'DB Fetch Error' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = app;
