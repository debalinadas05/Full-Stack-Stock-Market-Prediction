# Alpha Predict — AI Stock Analysis Dashboard

A full-stack Indian stock market intelligence platform built with React + Flask.

## Features
- 🔍 Instant NSE/BSE stock search with smart autocomplete (200+ stocks)
- 📊 AI-powered Buy/Sell/Hold signals using ensemble ML (Random Forest + Gradient Boosting)
- 📈 Interactive price charts with MA20 & MA50 overlays
- 🎯 Multi-factor scoring — Momentum, Profitability, Quality, Sentiment, Valuation
- ⚡ Live price polling every 15 seconds via Yahoo Finance
- 🗓️ Short / Mid / Long term horizon analysis
- 📰 Latest stock news aggregation
- 💾 Prediction logging to CSV
- 🔐 Simple login system with role-based demo accounts

## Tech Stack
- **Frontend:** React, custom SVG charts, Syne + DM Mono fonts
- **Backend:** Python Flask, yfinance, scikit-learn
- **Data:** Yahoo Finance (live + historical), Finnhub (fallback search)

## Getting Started
```bash
pip install flask yfinance scikit-learn flask-cors
python app.py        # starts Flask on port 5000
# open index.html or run React dev server
```
Login with `demo / demo123`
