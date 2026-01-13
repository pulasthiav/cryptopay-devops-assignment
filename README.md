# CryptoPay Gateway Simulator

![CI Pipeline](https://github.com/[YOUR_USERNAME]/[REPO_NAME]/workflows/CI%20Pipeline/badge.svg)
![Deploy to Production](https://github.com/[YOUR_USERNAME]/[REPO_NAME]/workflows/Deploy%20to%20Production/badge.svg)

## Group Information

* **Student 1:** Pulasthi Avinash - [INSERT STUDENT ID] - Role: [e.g., DevOps Engineer / Backend Developer]
* **Student 2:** [INSERT NAME] - [INSERT STUDENT ID] - Role: [e.g., Frontend Developer]
* **Student 3:** [INSERT NAME] - [INSERT STUDENT ID] - Role: [e.g., Release Manager]

## Project Description
CryptoPay Gateway Simulator is a web-based cryptocurrency Point-of-Sale (POS) system designed to simulate real-world crypto transactions. It allows merchants to generate bills in LKR, converts them to major cryptocurrencies (BTC, ETH, SOL, USDT) via live rates, and offers flexible payment options including full immediate payments or 3-month installment plans. [cite_start]The system also includes a secure Admin Dashboard for tracking revenue and a receipt generation feature[cite: 199, 200].

## Live Deployment
[cite_start]**Live URL:** https://cryptopay-devops-assignment.vercel.app/ [cite: 201, 202]

## Technologies Used
* [cite_start]**Frontend:** HTML5, CSS3, JavaScript (Vanilla) [cite: 203, 204]
* **Backend:** Node.js, Express.js
* **External APIs:** CoinGecko API (for live crypto rates), QRServer API
* [cite_start]**CI/CD:** GitHub Actions [cite: 206]
* [cite_start]**Deployment Platform:** Vercel [cite: 207]

## Features
* [cite_start]**Merchant POS Interface:** Real-time bill entry and coin selection (BTC, ETH, SOL, USDT)[cite: 208].
* **Live Rate Calculation:** Automatic conversion of LKR to Crypto based on real-time market data.
* **Flexible Payment Plans:**
    * *Pay Full:* Immediate payment with a 1% fee.
    * *3-Month Plan:* Installment option with a 10% fee and auto-scheduling.
* **Admin Dashboard:** Password-protected area to view Total Income and Recent Transactions.
* **Digital Receipt System:** Generates printable receipts with payment breakdown.

## Branch Strategy
[cite_start]We implemented the following branching strategy in accordance with industry best practices[cite: 212]:

* [cite_start]`main` - Production-ready code (Protected branch, auto-deploys to Vercel)[cite: 214].
* [cite_start]`develop` - Integration branch for merging features before production[cite: 215].
* [cite_start]`feature/**` - Individual feature branches for each developer (e.g., `feature/payment-logic`, `feature/ui-design`)[cite: 216].

## Individual Contributions

### Pulasthi Avinash
* **Repository Setup:** Initialized the Git repository and configured `.gitignore`[cite: 219].
* [cite_start]**CI/CD Pipeline:** Created `.github/workflows/ci.yml` for testing and `deploy.yml` for Vercel deployment[cite: 220].
* **Backend Logic:** Implemented `server.js` API endpoints for rate calculation and transaction recording.
* **Conflict Resolution:** Managed merge conflicts between feature branches and the develop branch.

### [Student 2 Name]
* [cite_start]**UI/UX Design:** Designed the `index.html` layout and responsive CSS styles[cite: 224].
* **Frontend Interactivity:** Developed the JavaScript logic for the Merchant POS and Customer screens.
* **Receipt Generation:** Implemented the dynamic receipt rendering and print functionality.

### [Student 3 Name] (If applicable)
* **Documentation:** Created the README.md and updated project documentation[cite: 228].
* **Testing:** Conducted manual testing of payment plans and API error handling.
* **Feature Implementation:** Added the Admin Dashboard and security PIN logic.

## Setup Instructions

### Prerequisites
* [cite_start]Node.js (version 18 or higher) [cite: 231]
* [cite_start]Git [cite: 232]
* npm (Node Package Manager)

### Installation
```bash
# Clone the repository
[cite_start]git clone [https://github.com/](https://github.com/)[YOUR_USERNAME]/[REPO_NAME].git [cite: 236]

# Navigate to project directory
cd [REPO_NAME] [cite: 238]

# Install dependencies
npm install [cite: 240]

# Run development server
npm run dev [cite: 242]