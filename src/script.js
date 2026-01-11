const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.static(__dirname));
app.use(express.json());

// 1. Search API (Using CoinCap - Real Time & No Block)
app.get('/api/search', async (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : "";
    
    if (!query) return res.json([]);

    try {
        // CoinGecko වෙනුවට CoinCap පාවිච්චි කරයි
        const response = await axios.get(`https://api.coincap.io/v2/assets?search=${query}&limit=10`);
        
        // CoinCap දත්ත අපේ Format එකට හරවා යැවීම
        const coins = response.data.data.map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            thumb: `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png` // CoinCap Icon URL
        }));
        
        res.json(coins);
    } catch (error) {
        console.error("Search API Error:", error.message);
        res.status(500).json([]);
    }
});

// 2. Price Calculation API (Using CoinCap + ExchangeRate API)
app.get('/api/calculate-payment', async (req, res) => {
    const { amount, coin } = req.query;
    
    try {
        // 1. Crypto මිල ගන්න (USD වලින්)
        const cryptoResponse = await axios.get(`https://api.coincap.io/v2/assets/${coin}`);
        const priceUSD = parseFloat(cryptoResponse.data.data.priceUsd);

        // 2. Dollar Rate එක ගන්න (USD to LKR) - Real Time
        let rateLKRPerUSD = 300; // Default fallback
        try {
            const currencyResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
            rateLKRPerUSD = currencyResponse.data.rates.LKR;
        } catch (e) {
            console.log("Currency API failed, using default 300");
        }

        // 3. ගණනය කිරීම් (Calculation)
        const rateLKR = priceUSD * rateLKRPerUSD; // 1 Coin = ? LKR
        
        const totalLKR_Now = amount * 1.01;
        const totalLKR_Inst = amount * 1.10;
        const monthlyPaymentLKR = totalLKR_Inst / 3;
        
        const today = new Date();
        const date2 = new Date(new Date().setMonth(today.getMonth() + 1));
        const date3 = new Date(new Date().setMonth(today.getMonth() + 2));
        const options = { year: 'numeric', month: 'short', day: 'numeric' };

        const schedule = [
            { date: "Today (Now)", amountLKR: monthlyPaymentLKR.toFixed(2), cryptoAmount: (monthlyPaymentLKR / rateLKR).toFixed(6), status: "Due Now" },
            { date: date2.toLocaleDateString('en-US', options), amountLKR: monthlyPaymentLKR.toFixed(2), cryptoAmount: "At Market Rate", status: "Auto-Schedule" },
            { date: date3.toLocaleDateString('en-US', options), amountLKR: monthlyPaymentLKR.toFixed(2), cryptoAmount: "At Market Rate", status: "Auto-Schedule" }
        ];

        res.json({
            coin: coin, 
            rateLKR: rateLKR, // Real Time Price
            options: {
                payNow: { 
                    lkrTotal: totalLKR_Now.toFixed(2), 
                    usdTotal: ((totalLKR_Now / rateLKR) * priceUSD).toFixed(2), 
                    cryptoTotal: (totalLKR_Now / rateLKR).toFixed(6) 
                },
                installments: { 
                    totalLKR: totalLKR_Inst.toFixed(2), 
                    monthlyPayment: monthlyPaymentLKR.toFixed(2), 
                    schedule: schedule 
                }
            }
        });

    } catch (error) {
        console.error("Calculation Error:", error.message);
        res.status(500).json({ error: "Failed to fetch real-time data" });
    }
});

// Server Start Logic
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
module.exports = app;