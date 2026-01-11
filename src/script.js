const express = require("express");
const axios = require("axios");
const path = require("path");
const app = express();
const port = 3001;

// Memory Database
let transactions = [];
let totalIncomeLKR = 0;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

// Search API
app.get("/api/search", async (req, res) => {
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
    res.status(500).json({ error: "Search failed" });
  }
});

// Price Calculation (Fiat Pegging Logic 🧠)
app.get("/api/calculate-payment", async (req, res) => {
  const { amount, coin } = req.query;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid Amount!" });
  }

  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=lkr,usd`
    );

    if (!response.data[coin])
      return res.status(404).json({ error: "Coin not found" });

    const rateLKR = response.data[coin].lkr;
    const rateUSD = response.data[coin].usd;

    // 1. Pay Now Logic (Full + 1%)
    const totalLKR_Now = amount * 1.01;

    // 2. Installment Logic (Full + 10%)
    const totalLKR_Inst = amount * 1.1;
    const monthlyPaymentLKR = totalLKR_Inst / 3;

    // Date Calculation
    const today = new Date();
    const date2 = new Date(new Date().setMonth(today.getMonth() + 1));
    const date3 = new Date(new Date().setMonth(today.getMonth() + 2));
    const options = { year: "numeric", month: "short", day: "numeric" };

    // --- FIAT PEGGING SCHEDULE ---
    // අපි LKR අගය Lock කරනවා. Crypto අගය අද දවසට විතරක් හදනවා.
    const schedule = [
      {
        date: "Today (Now)",
        amountLKR: monthlyPaymentLKR.toFixed(2),
        cryptoAmount: (monthlyPaymentLKR / rateLKR).toFixed(6), // අද ගෙවන Crypto ගාණ
        status: "Due Now",
      },
      {
        date: date2.toLocaleDateString("en-US", options),
        amountLKR: monthlyPaymentLKR.toFixed(2),
        cryptoAmount: "At Market Rate 🔄", // අනාගතයේ ගාණ දන්නේ නෑ (Dynamic)
        status: "Auto-Schedule",
      },
      {
        date: date3.toLocaleDateString("en-US", options),
        amountLKR: monthlyPaymentLKR.toFixed(2),
        cryptoAmount: "At Market Rate 🔄", // අනාගතයේ ගාණ දන්නේ නෑ (Dynamic)
        status: "Auto-Schedule",
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
          schedule: schedule, // අර අලුත් Schedule එක යවනවා
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Error calculating price" });
  }
});

// Record Sale
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
  const income =
    plan === "Pay Now" ? parseFloat(amount) : parseFloat(amount) / 3;
  totalIncomeLKR += income;

  res.json({ status: "Saved" });
});

// Admin Stats
app.get("/api/admin-stats", (req, res) => {
  // 1. Password එක Header එකෙන් ගන්නවා
  const providedPass = req.headers["x-admin-password"];
  const REAL_PASS = "admin123"; // මුදලාලිගේ Password එක

  // 2. Password එක හරිද බලනවා
  if (providedPass !== REAL_PASS) {
    return res.status(401).json({ error: "Unauthorized! Wrong Password." });
  }

  // 3. හරි නම් විතරක් Data යවනවා
  res.json({
    totalIncome: totalIncomeLKR.toFixed(2),
    totalCount: transactions.length,
    recentSales: transactions.slice(-5).reverse(),
  });
});

app.listen(port, () => {
  console.log(`CryptoPOS running at http://localhost:${port}`);
});
