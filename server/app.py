# app.py
"""
Flask server for Advanced Stock Analysis Dashboard.

- Serves static/index.html
- /analyze      -> runs chart_model.run_analysis
- /predictions.csv -> downloads prediction log
- /search_tickers  -> LIVE ticker/company suggestions (Yahoo Finance)
- /suggestions     -> peer company suggestions based on sector
"""

import os
import logging
from flask import Flask, request, jsonify, send_from_directory
import pandas as pd
import numpy as np
import requests  # <--- IMPORTANT for live suggestions
import yfinance as yf

import chart_model
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import jwt
import datetime
from dotenv import load_dotenv

load_dotenv()

try:
    from flask_cors import CORS
    HAS_CORS = True
except Exception:
    HAS_CORS = False

APP_ROOT = os.path.dirname(os.path.abspath(__file__))
STATIC_FOLDER = os.path.join(APP_ROOT, "static")
PRED_LOG = getattr(chart_model, "PRED_LOG", "predictions_log.csv")

LOG = logging.getLogger("stock_api")
LOG.setLevel(logging.INFO)
if not LOG.handlers:
    ch = logging.StreamHandler()
    ch.setFormatter(logging.Formatter("[%(asctime)s] %(levelname)s %(message)s"))
    LOG.addHandler(ch)

app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path="/static")
if HAS_CORS:
    CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
    "connect_args": {"sslmode": "require"},
}

JWT_SECRET = os.getenv('JWT_SECRET')

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

#with app.app_context():
#   db.create_all()

# ── SECTOR PEERS (hardcoded fallback) ─────────────────────────────────────────
SECTOR_PEERS = {
    # IT
    "TCS":       ["INFY", "WIPRO", "HCLTECH", "TECHM", "LTIM"],
    "INFY":      ["TCS", "WIPRO", "HCLTECH", "TECHM", "LTIM"],
    "WIPRO":     ["TCS", "INFY", "HCLTECH", "TECHM", "LTIM"],
    "HCLTECH":   ["TCS", "INFY", "WIPRO", "TECHM", "LTIM"],
    "TECHM":     ["TCS", "INFY", "WIPRO", "HCLTECH", "LTIM"],
    "LTIM":      ["TCS", "INFY", "WIPRO", "HCLTECH", "TECHM"],
    "MPHASIS":   ["TCS", "INFY", "WIPRO", "HCLTECH", "COFORGE"],
    "COFORGE":   ["MPHASIS", "PERSISTENT", "LTIM", "TECHM", "WIPRO"],
    "PERSISTENT":["COFORGE", "MPHASIS", "LTIM", "TECHM", "WIPRO"],
    # Banking / Finance
    "HDFCBANK":  ["ICICIBANK", "SBIN", "KOTAKBANK", "AXISBANK", "INDUSINDBK"],
    "ICICIBANK": ["HDFCBANK", "SBIN", "KOTAKBANK", "AXISBANK", "INDUSINDBK"],
    "SBIN":      ["HDFCBANK", "ICICIBANK", "KOTAKBANK", "AXISBANK", "BANKBARODA"],
    "KOTAKBANK": ["HDFCBANK", "ICICIBANK", "SBIN", "AXISBANK", "INDUSINDBK"],
    "AXISBANK":  ["HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK", "INDUSINDBK"],
    "INDUSINDBK":["HDFCBANK", "ICICIBANK", "KOTAKBANK", "AXISBANK", "FEDERALBNK"],
    "BANKBARODA":["SBIN", "ICICIBANK", "CANBK", "PNB", "UNIONBANK"],
    "BAJFINANCE":["BAJAJFINSV", "HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK"],
    "BAJAJFINSV":["BAJFINANCE", "HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK"],
    # Energy / Oil
    "RELIANCE":  ["ONGC", "IOC", "BPCL", "GAIL", "HINDPETRO"],
    "ONGC":      ["RELIANCE", "IOC", "BPCL", "GAIL", "HINDPETRO"],
    "IOC":       ["RELIANCE", "ONGC", "BPCL", "GAIL", "HINDPETRO"],
    "BPCL":      ["RELIANCE", "ONGC", "IOC", "GAIL", "HINDPETRO"],
    "GAIL":      ["RELIANCE", "ONGC", "IOC", "BPCL", "PETRONET"],
    # Auto
    "TATAMOTORS":["MARUTI", "M&M", "BAJAJ-AUTO", "EICHERMOT", "HEROMOTOCO"],
    "MARUTI":    ["TATAMOTORS", "M&M", "BAJAJ-AUTO", "EICHERMOT", "HEROMOTOCO"],
    "M&M":       ["TATAMOTORS", "MARUTI", "BAJAJ-AUTO", "EICHERMOT", "HEROMOTOCO"],
    "BAJAJ-AUTO":["TATAMOTORS", "MARUTI", "M&M", "EICHERMOT", "HEROMOTOCO"],
    "EICHERMOT": ["TATAMOTORS", "MARUTI", "M&M", "BAJAJ-AUTO", "HEROMOTOCO"],
    "HEROMOTOCO":["TATAMOTORS", "MARUTI", "M&M", "BAJAJ-AUTO", "EICHERMOT"],
    # Pharma
    "SUNPHARMA": ["DRREDDY", "CIPLA", "DIVISLAB", "AUROPHARMA", "LUPIN"],
    "DRREDDY":   ["SUNPHARMA", "CIPLA", "DIVISLAB", "AUROPHARMA", "LUPIN"],
    "CIPLA":     ["SUNPHARMA", "DRREDDY", "DIVISLAB", "AUROPHARMA", "LUPIN"],
    "DIVISLAB":  ["SUNPHARMA", "DRREDDY", "CIPLA", "AUROPHARMA", "LUPIN"],
    "LUPIN":     ["SUNPHARMA", "DRREDDY", "CIPLA", "DIVISLAB", "AUROPHARMA"],
    # FMCG
    "HINDUNILVR":["ITC", "NESTLEIND", "BRITANNIA", "DABUR", "MARICO"],
    "ITC":       ["HINDUNILVR", "NESTLEIND", "BRITANNIA", "DABUR", "MARICO"],
    "NESTLEIND": ["HINDUNILVR", "ITC", "BRITANNIA", "DABUR", "MARICO"],
    "BRITANNIA": ["HINDUNILVR", "ITC", "NESTLEIND", "DABUR", "MARICO"],
    "DABUR":     ["HINDUNILVR", "ITC", "NESTLEIND", "BRITANNIA", "MARICO"],
    # Infra / Industrials
    "LT":        ["ADANIPORTS", "SIEMENS", "ABB", "BHEL", "CUMMINSIND"],
    "ADANIPORTS":["LT", "CONCOR", "GMRINFRA", "IRFC", "RVNL"],
    "SIEMENS":   ["LT", "ABB", "BHEL", "CUMMINSIND", "THERMAX"],
    "BHEL":      ["LT", "SIEMENS", "ABB", "CUMMINSIND", "THERMAX"],
    # Metals
    "TATASTEEL": ["JSWSTEEL", "HINDALCO", "VEDL", "SAIL", "NMDC"],
    "JSWSTEEL":  ["TATASTEEL", "HINDALCO", "VEDL", "SAIL", "NMDC"],
    "HINDALCO":  ["TATASTEEL", "JSWSTEEL", "VEDL", "SAIL", "NMDC"],
    "VEDL":      ["TATASTEEL", "JSWSTEEL", "HINDALCO", "SAIL", "NMDC"],
    # Telecom
    "BHARTIARTL":["VODAFONEIDEA", "IDEA", "TATACOMM", "BSNL", "HFCL"],
    # Real Estate
    "DLF":       ["GODREJPROP", "OBEROIRLTY", "PRESTIGE", "BRIGADE", "PHOENIXLTD"],
    "GODREJPROP":["DLF", "OBEROIRLTY", "PRESTIGE", "BRIGADE", "PHOENIXLTD"],
}

# Sector → tickers map (used when ticker not in SECTOR_PEERS)
SECTOR_MAP = {
    "Technology":          ["TCS", "INFY", "WIPRO", "HCLTECH", "TECHM", "LTIM"],
    "Financial Services":  ["HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK", "AXISBANK", "BAJFINANCE"],
    "Energy":              ["RELIANCE", "ONGC", "IOC", "BPCL", "GAIL", "HINDPETRO"],
    "Consumer Cyclical":   ["TATAMOTORS", "MARUTI", "M&M", "TITAN", "BAJAJ-AUTO", "EICHERMOT"],
    "Healthcare":          ["SUNPHARMA", "DRREDDY", "CIPLA", "DIVISLAB", "LUPIN", "AUROPHARMA"],
    "Industrials":         ["LT", "ADANIPORTS", "SIEMENS", "ABB", "BHEL", "CUMMINSIND"],
    "Consumer Defensive":  ["HINDUNILVR", "ITC", "NESTLEIND", "BRITANNIA", "DABUR", "MARICO"],
    "Basic Materials":     ["TATASTEEL", "JSWSTEEL", "HINDALCO", "VEDL", "SAIL", "NMDC"],
    "Communication Services": ["BHARTIARTL", "TATACOMM", "HFCL"],
    "Real Estate":         ["DLF", "GODREJPROP", "OBEROIRLTY", "PRESTIGE", "BRIGADE"],
    "Utilities":           ["NTPC", "POWERGRID", "TATAPOWER", "ADANIGREEN", "CESC"],
}


def _normalize_request_json(req_json):
    if not isinstance(req_json, dict):
        return {}

    ticker = req_json.get("ticker") or req_json.get("symbol") or ""
    own_raw = req_json.get("ownStock", req_json.get("own", "No"))
    if isinstance(own_raw, str):
        own = own_raw.strip().lower() in ("yes", "true", "1")
    else:
        own = bool(own_raw)

    try:
        avg_price = float(req_json.get("avgPrice", req_json.get("avg_price", 0) or 0) or 0)
    except Exception:
        avg_price = 0.0
    try:
        quantity = int(req_json.get("quantity", 0) or 0)
    except Exception:
        quantity = 0

    chart_range = req_json.get("chart_range", req_json.get("period", "1y"))
    horizon = req_json.get("horizon", None)
    hold_plan = req_json.get("holdPlan", req_json.get("hold_plan", None))

    return {
        "ticker": ticker,
        "own": own,
        "avg_price": avg_price,
        "quantity": quantity,
        "chart_range": chart_range,
        "horizon": horizon,
        "hold_plan": hold_plan,
    }


def build_price_history(ticker: str, chart_range: str = "1y"):
    try:
        t = chart_model._normalize_ticker(ticker)
        yf_t = yf.Ticker(t)
        hist = yf_t.history(period=chart_range)
        if hist is None or hist.empty:
            return {"dates": [], "closes": [], "ma20": [], "ma50": []}
        use_col = "Adj Close" if "Adj Close" in hist.columns else "Close"
        closes = hist[use_col].astype(float).tolist()
        dates = [pd.to_datetime(idx).strftime("%Y-%m-%d") for idx in hist.index]
        ma20 = hist[use_col].rolling(window=20, min_periods=1).mean().astype(float).tolist()
        ma50 = hist[use_col].rolling(window=50, min_periods=1).mean().astype(float).tolist()
        return {"dates": dates, "closes": closes, "ma20": ma20, "ma50": ma50}
    except Exception:
        LOG.exception("build_price_history failed")
        return {"dates": [], "closes": [], "ma20": [], "ma50": []}


def build_debug_metrics_from_hist(ticker: str, chart_range: str = "1y"):
    try:
        t = chart_model._normalize_ticker(ticker)
        yf_t = yf.Ticker(t)
        hist = yf_t.history(period=chart_range)
        if hist is None or hist.empty:
            return {}
        last = hist.iloc[-1]
        sample = []
        tail = hist.tail(30)
        for idx, row in tail.iterrows():
            date_str = pd.to_datetime(idx).strftime("%Y-%m-%d")
            close_val = float(
                row["Adj Close"] if "Adj Close" in row and not np.isnan(row["Adj Close"]) else row.get("Close", np.nan)
            )
            sample.append([date_str, close_val])
        metrics = {
            "open": float(last.get("Open", np.nan)) if "Open" in last else None,
            "high": float(last.get("High", np.nan)) if "High" in last else None,
            "low": float(last.get("Low", np.nan)) if "Low" in last else None,
            "volume": int(last.get("Volume", 0)) if "Volume" in last else None,
            "sample_prices": sample,
        }
        return metrics
    except Exception:
        LOG.exception("build_debug_metrics_from_hist error")
        return {}


@app.route("/", methods=["GET"])
def index():
    index_path = os.path.join(STATIC_FOLDER, "index.html")
    if os.path.exists(index_path):
        return send_from_directory(STATIC_FOLDER, "index.html")
    return "<h3>Index not found (place your HTML at static/index.html)</h3>", 404

# ── TOKEN HELPER ──
def verify_token(req):
    token = req.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return None
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    except:
        return None

# ── REGISTER ──
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json(force=True)
    if not data.get('username') or not data.get('password') or not data.get('email') or not data.get('name'):
        return jsonify({'error': 'All fields required'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    hashed = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(
        username=data['username'],
        email=data['email'],
        password=hashed,
        name=data['name']
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Account created successfully'}), 201

# ── LOGIN ──
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json(force=True)
    user = User.query.filter_by(username=data.get('username')).first()
    if not user or not bcrypt.check_password_hash(user.password, data.get('password', '')):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = jwt.encode({
        'user_id': user.id,
        'username': user.username,
        'name': user.name,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, JWT_SECRET, algorithm='HS256')
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'name': user.name,
            'email': user.email
        }
    })

# ── GET CURRENT USER ──
@app.route('/me', methods=['GET'])
def me():
    payload = verify_token(request)
    if not payload:
        return jsonify({'error': 'Unauthorized'}), 401
    user = User.query.get(payload['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'id': user.id,
        'username': user.username,
        'name': user.name,
        'email': user.email
    })

@app.route("/analyze", methods=["POST"])
def analyze():
    # ── AUTH CHECK ──
    payload = verify_token(request)
    if not payload:
        return jsonify({"error": "Unauthorized"}), 401
    try:
        req_json = request.get_json(force=True)
    except Exception:
        return jsonify({"reasons": ["Invalid JSON in request"]}), 400

    params = _normalize_request_json(req_json)
    ticker = params.get("ticker", "")
    if not ticker:
        return jsonify({"reasons": ["Ticker empty"]}), 400

    try:
        res = chart_model.run_analysis(
            ticker=ticker,
            chart_range=params.get("chart_range", "1y"),
            own=params.get("own", False),
            avg_price=params.get("avg_price", 0.0),
            quantity=params.get("quantity", 0),
            hold_plan=params.get("hold_plan", None),
            horizon=params.get("horizon", None),
        )
    except Exception:
        LOG.exception("chart_model.run_analysis raised an exception")
        return jsonify({"reasons": ["Internal model error"]}), 500

    resp = {}
    resp["forecast_price"] = res.get("forecast_price") or res.get("current_price") or None
    resp["forecast_date"] = res.get("forecast_date") or "-"
    resp["score"] = int(res.get("score", 0) or 0)
    resp["decision"] = (res.get("decision") or "-").upper()

    gs = res.get("group_scores") or {}
    for k in ["Momentum", "Profitability", "Quality", "Sentiment", "Valuation"]:
        if k not in gs:
            gs[k] = 50
    resp["group_scores"] = {k: int(gs[k]) for k in gs}

    resp["reasons"] = res.get("reasons") or []
    resp["model_score"] = res.get("model_score")
    resp["model_confidence"] = res.get("model_confidence")
    resp["strategy_summary"] = res.get("strategy_summary")
    resp["recommendation_primary"] = res.get("recommendation_primary")
    resp["recommendation_options"] = res.get("recommendation_options") or []
    resp["n_training_rows"] = res.get("n_training_rows", None)

    resp["live_stats"] = res.get("live_stats") or {}
    resp["company"] = res.get("company") or {}
    resp["news"] = res.get("news") or []

    # price history
    if "price_history" in res and isinstance(res["price_history"], dict):
        ph = res["price_history"]
        resp["price_history"] = {
            "dates": ph.get("dates", []),
            "closes": ph.get("closes", []),
            "ma20": ph.get("ma20", []),
            "ma50": ph.get("ma50", []),
        }
    else:
        resp["price_history"] = build_price_history(ticker, chart_range=params.get("chart_range", "1y"))

    # current price
    try:
        if resp["price_history"]["closes"]:
            resp["current_price"] = float(resp["price_history"]["closes"][-1])
        else:
            resp["current_price"] = float(resp.get("forecast_price") or 0) or None
    except Exception:
        resp["current_price"] = None

    resp["debug_metrics"] = res.get("debug_metrics") or build_debug_metrics_from_hist(
        ticker, chart_range=params.get("chart_range", "1y")
    )

    LOG.info(
        f"/analyze {ticker} -> decision={resp['decision']} "
        f"score={resp['score']} rows={resp.get('n_training_rows')}"
    )
    return jsonify(resp)


@app.route("/predictions.csv", methods=["GET"])
def predictions_csv():
    if os.path.exists(PRED_LOG):
        return send_from_directory(APP_ROOT, PRED_LOG, as_attachment=True)
    return jsonify({"error": "No predictions log found"}), 404


@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory(STATIC_FOLDER, filename)


@app.route("/search_tickers", methods=["GET"])
def search_tickers():
    """
    LIVE search: user can type part of company name or symbol.
    We call Yahoo Finance search API and filter to Indian stocks (.NS / .BO).
    Returns [{symbol, displaySymbol, name, exchange}, ...]
    """
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"results": []})

    try:
        url = "https://query1.finance.yahoo.com/v1/finance/search"
        params = {
            "q": q,
            "quotesCount": 15,
            "newsCount": 0,
            "region": "IN",
            "lang": "en-IN",
        }
        r = requests.get(url, params=params, timeout=5)
        data = r.json()
        out = []
        for item in data.get("quotes", []):
            sym = item.get("symbol")
            if not sym:
                continue
            if not (sym.endswith(".NS") or sym.endswith(".BO")):
                continue
            if item.get("quoteType") not in (None, "EQUITY", "COMMON_STOCK"):
                continue

            name = item.get("shortname") or item.get("longname") or sym
            exch = "NSE" if sym.endswith(".NS") else "BSE" if sym.endswith(".BO") else (item.get("exchange") or "")
            display_symbol = sym.replace(".NS", "").replace(".BO", "")

            out.append(
                {
                    "symbol": sym,
                    "displaySymbol": display_symbol,
                    "name": name,
                    "exchange": exch,
                }
            )
        return jsonify({"results": out})
    except Exception:
        LOG.exception("search_tickers failed")
        return jsonify({"results": []})


@app.route("/suggestions", methods=["GET"])
def suggestions():
    """
    Returns peer company suggestions for a given ticker.
    Strategy:
      1. Check hardcoded SECTOR_PEERS dict (fast, reliable)
      2. If not found, fetch sector from yfinance and use SECTOR_MAP
      3. Return up to 5 peers as [{symbol, displaySymbol, name, exchange}]
    """
    ticker = request.args.get("ticker", "").strip().upper()
    if not ticker:
        return jsonify({"results": []})

    # Normalise: strip .NS / .BO for lookup
    clean = ticker.replace(".NS", "").replace(".BO", "")

    # Step 1 — hardcoded peers
    peers = SECTOR_PEERS.get(clean, [])

    # Step 2 — yfinance sector lookup if not in hardcoded map
    if not peers:
        try:
            info = yf.Ticker(clean + ".NS").info
            sector = info.get("sector", "")
            LOG.info(f"/suggestions yfinance sector for {clean}: {sector}")
            peers = [t for t in SECTOR_MAP.get(sector, []) if t != clean]
        except Exception:
            LOG.exception(f"/suggestions yfinance lookup failed for {clean}")
            peers = []

    # Build response
    out = []
    for sym in peers[:5]:
        if sym == clean:
            continue
        out.append({
            "symbol": sym + ".NS",
            "displaySymbol": sym,
            "name": sym,       # keeping it simple; name resolves on analysis
            "exchange": "NSE",
        })

    LOG.info(f"/suggestions {clean} -> {[o['displaySymbol'] for o in out]}")
    return jsonify({"results": out})

@app.route("/live_price", methods=["GET"])
def live_price():
    ticker = request.args.get("ticker", "").strip()
    if not ticker:
        return jsonify({"error": "no ticker"})
    try:
        t = ticker if "." in ticker else ticker.upper() + ".NS"
        data = yf.Ticker(t).history(period="1d", interval="1m")
        if data is None or data.empty:
            return jsonify({"error": "no data"})
        last = data.iloc[-1]
        prev = float(data["Close"].iloc[-2]) if len(data) > 1 else float(last["Close"])
        price = float(last["Close"])
        return jsonify({
            "price": round(price, 2),
            "prev": round(prev, 2),
            "change_pct": round((price - prev) / prev * 100, 2) if prev else 0,
            "volume": float(last["Volume"]),
            "high": float(last["High"]),
            "low": float(last["Low"]),
        })
    except Exception as e:
        LOG.exception("live_price failed")
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)