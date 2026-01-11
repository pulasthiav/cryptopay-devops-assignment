const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3001;


let transactions = [];
let totalIncomeLKR = 0;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});


app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.json([]);
    try {
        const response = await axios.get(https://api.coingecko.com/api/v3/search?query=${query});
        const coins = response.data.coins.slice(0, 7).map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            thumb: coin.thumb
        }));
        res.json(coins);
    } catch (error) {
        res.status(500).json({ error: "Search failed" });
    }
});


app.get('/api/calculate-payment', async (req, res) => {
    const { amount, coin } = req.query;

    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: "Invalid Amount!" });
    }

    try {
        const response = await axios.get(https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=lkr,usd);
        
        if (!response.data[coin]) return res.status(404).json({ error: "Coin not found" });

        const rateLKR = response.data[coin].lkr;
        const rateUSD = response.data[coin].usd;
        
        
        const totalLKR_Now = amount * 1.01;

        
        const totalLKR_Inst = amount * 1.10;
        const monthlyPaymentLKR = totalLKR_Inst / 3;
        
        
        const today = new Date();
        const date2 = new Date(new Date().setMonth(today.getMonth() + 1));
        const date3 = new Date(new Date().setMonth(today.getMonth() + 2));
        const options = { year: 'numeric', month: 'short', day: 'numeric' };

        
        const schedule = [
            { 
                date: "Today (Now)", 
                amountLKR: monthlyPaymentLKR.toFixed(2), 
                cryptoAmount: (monthlyPaymentLKR / rateLKR).toFixed(6), 
                status: "Due Now"
            },
            { 
                date: date2.toLocaleDateString('en-US', options), 
                amountLKR: monthlyPaymentLKR.toFixed(2), 
                cryptoAmount: "At Market Rate 🔄",
                status: "Auto-Schedule"
            },
            { 
                date: date3.toLocaleDateString('en-US', options), 
                amountLKR: monthlyPaymentLKR.toFixed(2), 
                cryptoAmount: "At Market Rate 🔄", 
                status: "Auto-Schedule"
            }
        ];

        res.json({
            coin: coin,
            rateLKR: rateLKR,
            options: {
                payNow: {
                    lkrTotal: totalLKR_Now.toFixed(2),
                    usdTotal: ((totalLKR_Now / rateLKR) * rateUSD).toFixed(2),
                    cryptoTotal: (totalLKR_Now / rateLKR).toFixed(6)
                },
                installments: {
                    totalLKR: totalLKR_Inst.toFixed(2),
                    monthlyPayment: monthlyPaymentLKR.toFixed(2),
                    schedule: schedule // අර අලුත් Schedule එක යවනවා
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Error calculating price" });
    }
});


app.get('/api/record-sale', (req, res) => {
    const { amount, coin, plan } = req.query;
    const sale = {
        id: transactions.length + 1,
        time: new Date().toLocaleTimeString(),
        amount: parseFloat(amount),
        coin: coin,
        plan: plan
    };
    transactions.push(sale);
    const income = plan === 'Pay Now' ? parseFloat(amount) : (parseFloat(amount) / 3); 
    totalIncomeLKR += income;
    
    res.json({ status: "Saved" });
});


app.get('/api/admin-stats', (req, res) => {
    res.json({
        totalIncome: totalIncomeLKR.toFixed(2),
        totalCount: transactions.length,
        recentSales: transactions.slice(-5).reverse()
    });
});

app.listen(port, () => {
    console.log(CryptoPOS running at http://localhost:${port});
});