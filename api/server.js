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

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// --- TRANSACTION MODEL ---
const TransactionSchema = new mongoose.Schema({
    time: { type: Date, default: Date.now },
    amount: Number,
    coin: String,
    plan: String
});
// පරණ නම තිබුනේ 'Transaction' නම් ඒකම පාවිච්චි කරමු
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

// --- ROUTES ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 1. Search API
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.json([]);
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/search?query=${query}`);
        const coins = response.data.coins.slice(0, 7).map(coin => ({
            id: coin.id, name: coin.name, symbol: coin.symbol, thumb: coin.thumb
        }));
        res.json(coins);
    } catch (error) {
        res.status(500).json({ error: "Search failed" });
    }
});

// 2. Calculate Payment
app.get('/api/calculate-payment', async (req, res) => {
    const { amount, coin } = req.query;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid Amount" });

    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=lkr,usd`);
        if (!response.data[coin]) return res.status(404).json({ error: "Coin unavailable" });

        const rateLKR = response.data[coin].lkr;
        const totalLKR_Now = amount * 1.01; // 1% Fee
        const totalLKR_Inst = amount * 1.1; // 10% Fee
        const monthly = totalLKR_Inst / 3;

        // Date Logic
        const today = new Date();
        const d2 = new Date(today); d2.setMonth(today.getMonth() + 1);
        const d3 = new Date(today); d3.setMonth(today.getMonth() + 2);
        const opts = { year: 'numeric', month: 'short', day: 'numeric' };

        const schedule = [
            { date: 'Today (Now)', amountLKR: monthly.toFixed(2), status: "Due Now" },
            { date: d2.toLocaleDateString('en-US', opts), amountLKR: monthly.toFixed(2), status: "Auto-Schedule" },
            { date: d3.toLocaleDateString('en-US', opts), amountLKR: monthly.toFixed(2), status: "Auto-Schedule" }
        ];

        res.json({
            coin: coin,
            rateLKR: rateLKR,
            options: {
                payNow: { lkrTotal: totalLKR_Now.toFixed(2), cryptoTotal: (totalLKR_Now / rateLKR).toFixed(6) },
                installments: { monthlyPayment: monthly.toFixed(2), schedule: schedule }
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Calculation Error" });
    }
});

// 3. Record Sale
app.get('/api/record-sale', async (req, res) => {
    const { amount, coin, plan } = req.query;
    try {
        const newSale = new Transaction({
            amount: parseFloat(amount),
            coin: coin,
            plan: plan,
            time: new Date()
        });
        await newSale.save();
        console.log("✅ Sale Saved:", amount);
        res.json({ status: "Saved" });
    } catch (error) {
        res.status(500).json({ error: "Database Error" });
    }
});

// 4. Admin Stats (Updated for Table)
app.get('/api/admin-stats', async (req, res) => {
    const providedPass = req.headers['x-admin-password'];
    if (providedPass !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        // මෙන්න වෙනස: limit(5) අයින් කළා. දැන් ඔක්කොම එනවා.
        const transactions = await Transaction.find().sort({ time: -1 });

        let totalIncomeLKR = 0;
        transactions.forEach(t => {
            const val = t.plan === 'Installment' ? (t.amount / 3) : t.amount;
            totalIncomeLKR += (t.amount || 0);
        });

        res.json({
            totalIncome: totalIncomeLKR.toFixed(2),
            recentSales: transactions // ඔක්කොම යවනවා
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB Fetch Error" });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});