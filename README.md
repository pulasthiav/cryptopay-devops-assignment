# CryptoPOS System

![CI Pipeline](https://github.com/pulasthiav/cryptopay-devops-assignment/workflows/CI%20Pipeline/badge.svg)
![Deploy to Production](https://github.com/pulasthiav/cryptopay-devops-assignment/workflows/Deploy%20to%20Production/badge.svg)

## Group Information

- Student 1: Pulasthi Avinash - ITBIN-2313-0014 - Role: Group Leader / DevOps Engineer
- Student 2: Savisara Dissanayake - ITBIN-2313-0034 - Role: Frontend Developer
- Student 3: Isuru Chathushka - ITBIN-2313-0082 - Role: Backend Developer

## Project Description

CryptoPay Gateway Simulator is a web-based cryptocurrency Point-of-Sale (POS) system designed to simulate real-world crypto transactions. It allows merchants to generate bills in LKR, converts them to major cryptocurrencies (BTC, ETH, SOL, USDT) via live rates, and offers flexible payment options including full immediate payments or 3-month installment plans. The system also includes a secure Admin Dashboard for tracking revenue and a receipt generation feature.

## Live Deployment

Live URL: https://cryptopay-devops-assignment.vercel.app/

## Technologies Used

- Frontend: HTML5, CSS3, JavaScript (Vanilla)
- Backend: Node.js, Express.js
- DevOps & Tools: Docker, GitHub Actions, ESLint, Prettier
- External APIs: CoinGecko API (for live crypto rates), QRServer API
- Deployment Platform: Vercel

## Features

### Application Features

- Merchant POS Interface: Real-time bill entry and coin selection (BTC, ETH, SOL, USDT).
- Live Rate Calculation: Automatic conversion of LKR to Crypto based on real-time market data.
- Flexible Payment Plans:
  - Pay Full: Immediate payment with a 1% fee.
  - 3-Month Plan: Installment option with a 10% fee and auto-scheduling.
- Admin Dashboard: Password-protected area to view Total Income and Recent Transactions.
- Digital Receipt System: Generates printable receipts with payment breakdown.

### DevOps & Bonus Features (Above & Beyond)

- Automated Code Quality: Integrated ESLint and Prettier to automatically enforce code standards and formatting on every commit.
- Docker Containerization: Application includes a Dockerfile and is fully containerized, exposing port 3001.
- Advanced CI/CD: Pipeline includes automated steps for Linting, Docker Build validation, and Vercel Deployment.

## Branch Strategy

We implemented the following branching strategy in accordance with industry best practices:

- main - Production-ready code (Protected branch, auto-deploys to Vercel).
- develop - Integration branch for merging features before production.
- feature/\*\* - Individual feature branches for each developer (e.g., feature/payment-logic, feature/docker-setup).

## Individual Contributions

### Pulasthi Avinash (Group Leader)

- DevOps Setup: Configured Docker, ESLint, and Prettier for the project ecosystem.
- CI/CD Pipeline: Created .github/workflows/ci.yml for automated testing/linting and deploy.yml for Vercel deployment.
- Repository Management: Initialized the Git repository, configured .gitignore, and managed branch protection rules.
- Conflict Resolution: Successfully resolved merge conflicts between feature branches and the develop branch (documented in git history).
- Leadership & Support: Coordinated the team, managed code integrations, and provided technical support for both frontend and backend tasks.

### Savisara Dissanayake

- UI/UX Design: Designed the index.html layout and responsive CSS styles.
- Frontend Interactivity: Developed the JavaScript logic for the Merchant POS and Customer screens.
- Receipt Generation: Implemented the dynamic receipt rendering and print functionality.

### Isuru Chathushka

- Backend Logic: Implemented server.js API endpoints for rate calculation and transaction recording.
- Admin Dashboard: Developed the password-protected area to view Total Income and Recent Transactions.
- API Integration: Handled the integration with CoinGecko and QRServer APIs.

## Setup Instructions

### Prerequisites

- Node.js (version 18 or higher)
- Git
- npm (Node Package Manager)

### Installation

```bash
# Clone the repository
git clone https://github.com/pulasthiav/cryptopay-devops-assignment.git

# Navigate to project directory
cd cryptopay-devops-assignment

# Install dependencies
npm install

# Run Code Quality Check (Linting)
npm run lint

# Run development server
npm run dev
```

### Run with Docker

Since the application is fully containerized, you can run it using Docker without installing Node.js locally.

```bash
# Build the Docker image
docker build -t cryptopay-app .

# Run the container
docker run -p 3001:3001 cryptopay-app
```

## CI/CD Pipeline & Deployment Strategy

This project uses GitHub Actions to automate the integration and deployment processes. The pipeline is divided into two main workflows:

### 1. Continuous Integration (CI) - `ci.yml`

Trigger: Runs on every push to `main`, `develop`, `feature/*` and on Pull Requests.

Jobs & Steps:

1.  Environment Setup: Sets up an Ubuntu runner with Node.js version 18.
2.  Dependency Installation: Runs `npm install` to ensure all packages are available.
3.  Automated Code Quality Check: Executes `npm run lint`. This ensures that all code adheres to ESLint and Prettier standards. If there are formatting errors, the build fails immediately.
4.  Docker Build Validation: Runs `docker build .` to verify that the application can be successfully containerized.

### 2. Continuous Deployment (CD) - `deploy.yml`

Trigger: Runs only when code is successfully merged or pushed to the `main` branch.

Jobs & Steps:

1.  Checkout: Retrieves the latest production-ready code.
2.  Vercel Deployment: Uses the `amondnet/vercel-action` to automatically deploy the application to Vercel's production environment.

```

```
