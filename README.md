
# CryptoPOS System (DevOps Assignment)

![CI Pipeline](https://github.com/pulasthiav/cryptopay-devops-assignment/workflows/CI%20Pipeline/badge.svg)
![Deploy to Production](https://github.com/pulasthiav/cryptopay-devops-assignment/workflows/Deploy%20to%20Production/badge.svg)



# Group Information

Student 1: Pulasthi Avinash - ITBIN-2313-0014 - Role: DevOps Engineer & Team Lead

Student 2: Isuru Chathushka - ITBIN-2313-0082 - Role: Backend & Security Developer

Student 3:Savisara Dissanayake - ITBIN-2313-0034 - Role: Frontend Developer / QA



# Project Description

CryptoPay Gateway Simulator is a web-based cryptocurrency Point-of-Sale (POS) system designed to simulate real-world crypto transactions. Merchants can generate bills in LKR, convert them into major cryptocurrencies (BTC, ETH, SOL, USDT) using live exchange rates, and process secure transactions through a centralized system. The platform also includes an Admin Dashboard for monitoring revenue and transaction history.



# Live Deployment

Live URL : (https://cryptopay-devops-assignment.vercel.app/)



# Technologies Used

Frontend: HTML5, CSS3, Vanilla JavaScript
Backend: Node.js, Express.js
DevOps: GitHub Actions (CI/CD), Vercel
API: CoinGecko Public API



# Features

Merchant POS Interface:** Real-time bill entry and cryptocurrency selection
Secure Admin Dashboard:** Backend-based PIN authentication
Live Rate Calculation:** Fetches real-time crypto prices
Transaction History:** Tracks all payments (in-memory storage)


# Branch Strategy

We followed the Gitflow branching strategy as required:

 `main` - Production-ready code (protected, auto-deploys to Vercel)
 `develop` - Integration and testing branch
 `feature/**` - Individual feature branches



# Individual Contributions

# Pulasthi Avinash (DevOps Engineer)

Initialized Git repository and project structure
Configured Vercel deployment
Implemented CI/CD pipelines using GitHub Actions
Developed core backend APIs and managed branch integrations

# Isuru Chathushka (Backend & Security)

Implemented secure Admin PIN verification on the backend
Fixed critical `ENOENT` errors by correcting Express static paths
Stabilized the development environment by fixing missing npm scripts
Improved backend security against client-side manipulation

# Student 3 (Frontend / QA)

Designed responsive POS user interface
Tested payment logic and UI responsiveness 
Assisted with usability and bug verification


## Setup Instructions

# Prerequisites

Node.js (version 18 or higher)
Git
npm

# Installation


# Clone the repository
git clone https://github.com/pulasthiav/cryptopay-devops-assignment.git

# Navigate to project directory
cd cryptopay-devops-assignment

# Install dependencies
npm install

# Start the server
npm start



# Merge Conflict Resolution (Assignment Requirement)

As part of the DevOps assignment, a merge conflict resolution was intentionally demonstrated.

Scenario: A conflict occurred in `README.md` when both the DevOps Engineer and Backend Developer modified the *Group Information* section in separate branches.

Issue: Git detected conflicting changes during merge due to edits on the same lines.

Resolution Process:

  1. Identified conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
  2. Reviewed both versions carefully
  3. Selected the correct combined content
  4. Removed conflict markers and committed the resolved file

This demonstrated proper version control practices and collaborative development workflow.