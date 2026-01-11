const express = require("express");
const axios = require("axios");
const path = require("path");
const app = express();
const port = process.env.PORT || 3001;

// Memory Database
let transactions = [];
let totalIncomeLKR = 0;

// --- BACKUP DATA (API Block වුනොත් පාවිච්චි කරන්න) ---
const BACKUP_COINS = [
    { id: "bitcoin", name: "Bitcoin", symbol: "BTC", thumb: "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png" },
    { id: "ethereum", name: "Ethereum", symbol: "ETH", thumb: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png" },
    { id: "tether", name: "Tether", symbol: "USDT", thumb: "https://assets.coingecko.com/coins/images/325/thumb/Tether.png" },
    { id: "binancecoin", name: "BNB", symbol: "BNB", thumb: "https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png" },
    { id: "solana", name: "Solana", symbol: "SOL", thumb: "https://assets.coingecko.com/coins/images/4128/thumb/solana.png" }
];

// Serve Static Files
app.use(express.static(__dirname));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 1. Search API (Robust Mode)
app.get("/api/search", async (req, res) => {
  const query = req.query.q ? req.query.q.toLowerCase() : "";
  if (!query) return res.json([]);

  try {
    // මුලින්ම CoinGecko එකෙන් ඉල්ලනවා (Real Data)
    const response = await axios.get(`https://api.coingecko.com/api/v3/search?query=${query}`, { timeout: 3000 });
    const coins = response.data.coins.slice(0, 7).map((coin) => ({
      id: coin.id, name: coin.name, symbol: coin.symbol, thumb: coin.thumb,
    }));
    res.json(coins);
  } catch (error) {
    console.log("API Error (Using Backup): Search Failed");
    // API වැඩ නැත්නම් Backup List එකෙන් ෆිල්ටර් කරලා යවනවා
    const backupResults = BACKUP_COINS.filter(c => 
        c.name.toLowerCase().includes(query) || c.symbol.toLowerCase().includes(query)
    );
    res.json(backupResults);
  }
});

// 2. Price Calculation API (Robust Mode)
app.get("/api/calculate-payment", async (req, res) => {
  const { amount, coin } = req.query;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid Amount!" });
  }

  // Default Rates (API එක කැඩුනොත් ගන්න මිල ගණන්)
  let rateLKR = 30000000; // Example Bitcoin Price
  let rateUSD = 96000;

  try {
    // මුලින්ම CoinGecko එකෙන් ඉල්ලනවා
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=lkr,usd`, 
      { timeout: 3000 }
    );
    
    if (response.data[coin]) {
        rateLKR = response.data[coin].lkr;
        rateUSD = response.data[coin].usd;
    }
  } catch (error) {
    console.log("API Error (Using Backup): Price Check Failed");
    // Error එකක් ආවට නවතින්නේ නෑ, උඩ තියෙන Default Rates පාවිච්චි වෙනවා
  }

  // Calculation Logic (කලින් තිබුන එකමයි)
  const totalLKR_Now = amount * 1.01;
  const totalLKR_Inst = amount * 1.1;
  const monthlyPaymentLKR = totalLKR_Inst / 3;

  const today = new Date();
  const date2 = new Date(new Date().setMonth(today.getMonth() + 1));
  const date3 = new Date(new Date().setMonth(today.getMonth() + 2));
  const options = { year: "numeric", month: "short", day: "numeric" };

  const schedule = [
    { date: "Today (Now)", amountLKR: monthlyPaymentLKR.toFixed(2), cryptoAmount: (monthlyPaymentLKR / rateLKR).toFixed(6), status: "Due Now" },
    { date: date2.toLocaleDateString("en-US", options), amountLKR: monthlyPaymentLKR.toFixed(2), cryptoAmount: "At Market Rate 🔄", status: "Auto-Schedule" },
    { date: date3.toLocaleDateString("en-US", options), amountLKR: monthlyPaymentLKR.toFixed(2), cryptoAmount: "At Market Rate 🔄", status: "Auto-Schedule" },
  ];

  res.json({
    coin: coin || "bitcoin",
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
});

// Record Sale API
app.get("/api/record-sale", (req, res) => {
  const { amount, coin, plan } = req.query;
  const sale = {
    id: transactions.length + 1,
    time: new Date().toLocaleTimeString(),
    amount: parseFloat(amount),
    coin: coin,
    plan: plan,
  };
  transactions.push(sale);
  const income = plan === "Pay Now" ? parseFloat(amount) : parseFloat(amount) / 3;
  totalIncomeLKR += income;
  res.json({ status: "Saved" });
});

// Admin Stats API
app.get("/api/admin-stats", (req, res) => {
  const providedPass = req.headers["x-admin-password"];
  if (providedPass !== "admin123") {
    return res.status(401).json({ error: "Unauthorized! Wrong Password." });
  }
  res.json({
    totalIncome: totalIncomeLKR.toFixed(2),
    totalCount: transactions.length,
    recentSales: transactions.slice(-5).reverse(),
  });
});

// --- වැදගත්ම කොටස: Server Start (Fix for Vercel) ---
if (require.main === module) {
    app.listen(port, () => {
        console.log(`CryptoPOS running at http://localhost:${port}`);
    });
}

// Vercel සඳහා Export කිරීම
module.exports = app;