from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel
import requests
import os
from database.connection import get_db

router = APIRouter()

def money(n): 
    return round(n)

def analyze_scenario(expense_delta=15.0, sales_delta=0.0):
    current_cash = 402000
    monthly_expenses = 71800
    monthly_revenue = 102400
    projected = current_cash + (monthly_revenue * (sales_delta / 100)) - (monthly_expenses * (1 + expense_delta / 100))
    risk = 'low' if projected >= 350000 else 'medium' if projected >= 300000 else 'high'
    rec = 'Maintain a ₹3L minimum reserve and monitor vendor concentration.' if risk != 'high' else f'Reduce discretionary spending by approximately ₹{money(monthly_expenses*expense_delta/100):,} per month and review top vendor commitments.'
    
    return {
        'current_cash': current_cash,
        'projected_cash': money(projected),
        'risk': risk,
        'recommendation': rec
    }

class ScenarioRequest(BaseModel):
    expense_delta: float = 15.0
    sales_delta: float = 0.0

class ChatRequest(BaseModel):
    message: str

class SettingsUpdate(BaseModel):
    name: str
    email: str
    company: str
    notifications: int

class TranslateRequest(BaseModel):
    text: str
    target_lang: str

class TimeMachineRequest(BaseModel):
    vendor_name: str
    months_ago: int

class AuthRequest(BaseModel):
    username: str
    password: str

@router.get("/health")
def health():
    return {"status": "ok", "service": "finguard-api"}

@router.get("/summary")
def summary(db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT cash_balance, revenue, expenses, overall_risk, alerts FROM metrics LIMIT 1")
    row = cursor.fetchone()
    if not row:
        return {"cash_balance": 0, "revenue": 0, "expenses": 0, "overall_risk": 0, "alerts": 0}
    
    return {
        "cash_balance": row[0],
        "revenue": row[1],
        "expenses": row[2],
        "overall_risk": row[3],
        "alerts": row[4]
    }

@router.get("/vendors")
def get_vendors(db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT name, monthly_spend, change_percent, risk, last_payment, initials, color, bg FROM vendors")
    rows = cursor.fetchall()
    return [{"name": r[0], "monthly_spend": r[1], "change": r[2], "risk": r[3], "last_payment": r[4], "initials": r[5], "color": r[6], "bg": r[7]} for r in rows]

@router.get("/invoices")
def get_invoices(db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT invoice_id, vendor, amount, risk, due_date FROM invoices")
    rows = cursor.fetchall()
    return [{"invoice_id": r[0], "vendor": r[1], "amount": r[2], "risk": r[3], "due_date": r[4]} for r in rows]

@router.get("/anomalies")
def get_anomalies(db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT id, title, description, impact_level, detected_time, confidence_score FROM anomalies ORDER BY id DESC")
    rows = cursor.fetchall()
    return [{"id": r[0], "title": r[1], "description": r[2], "impact_level": r[3], "detected_time": r[4], "confidence_score": r[5]} for r in rows]

@router.post("/anomalies/detect")
def detect_anomaly(db = Depends(get_db)):
    import difflib
    cursor = db.cursor()
    
    # Clear existing anomalies for a clean demo state
    cursor.execute("DELETE FROM anomalies")
    
    new_anomalies = []

    # 1. Vendor-Employee Match (High risk)
    cursor.execute("""
        SELECT v.name, e.name, v.bank_account
        FROM vendors v
        JOIN employees e ON v.bank_account = e.bank_account
        WHERE v.bank_account != ''
    """)
    matches = cursor.fetchall()
    for v_name, e_name, bank in matches:
        new_anomalies.append((
            f"Vendor-Employee Conflict: {v_name}",
            f"Vendor {v_name} shares bank account {bank} with employee {e_name}.",
            "high",
            "Just now",
            99
        ))
        
    # 2. Duplicate Invoices
    cursor.execute("SELECT invoice_id, vendor, amount, due_date, description FROM invoices")
    invoices = cursor.fetchall()
    
    vendor_invoices = {}
    for inv in invoices:
        v = inv[1]
        if v not in vendor_invoices:
            vendor_invoices[v] = []
        vendor_invoices[v].append(inv)
        
    for v, invs in vendor_invoices.items():
        for i in range(len(invs)):
            for j in range(i + 1, len(invs)):
                inv1 = invs[i]
                inv2 = invs[j]
                
                # Same amount, check fuzzy description match
                if inv1[2] == inv2[2]:
                    ratio = difflib.SequenceMatcher(None, inv1[4] or "", inv2[4] or "").ratio()
                    if ratio > 0.8: 
                        new_anomalies.append((
                            f"Duplicate Invoice Detected: {v}",
                            f"Invoice {inv1[0]} and {inv2[0]} have identical amounts (₹{inv1[2]:,}) and highly similar descriptions.",
                            "high",
                            "Just now",
                            95
                        ))

    # 3. Round-Dollar Transactions
    for inv in invoices:
        amount = inv[2]
        if amount >= 5000 and amount % 5000 == 0:
            new_anomalies.append((
                f"Round-Dollar Transaction: {inv[0]}",
                f"Invoice {inv[0]} from {inv[1]} is exactly ₹{amount:,}. Real expenses rarely land on exact round numbers.",
                "medium",
                "Just now",
                85
            ))

    if new_anomalies:
        cursor.executemany(
            "INSERT INTO anomalies (title, description, impact_level, detected_time, confidence_score) VALUES (?, ?, ?, ?, ?)",
            new_anomalies
        )
        db.commit()
        
    return {"status": "success", "detected": len(new_anomalies)}

@router.get("/forecast")
def forecast():
    return {
        "horizon_days": 90,
        "reserve_threshold": 300000,
        "checkpoints": [374000, 318000, 276000],
        "message": "Cash approaches the reserve threshold in approximately 6 weeks."
    }

@router.post("/scenario")
def scenario(req: ScenarioRequest):
    return analyze_scenario(req.expense_delta, req.sales_delta)

@router.get("/settings")
def get_settings(db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT name, email, company, notifications FROM user_settings ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    if row:
        return {"name": row[0], "email": row[1], "company": row[2], "notifications": row[3]}
    return {"name": "", "email": "", "company": "", "notifications": 0}

@router.post("/settings")
def update_settings(req: SettingsUpdate, db = Depends(get_db)):
    cursor = db.cursor()
    # update the first record
    cursor.execute("UPDATE user_settings SET name=?, email=?, company=?, notifications=? WHERE id=(SELECT MIN(id) FROM user_settings)",
                   (req.name, req.email, req.company, req.notifications))
    db.commit()
    return {"status": "success"}

@router.post("/translate")
def translate_text(req: TranslateRequest):
    # Free translation API (MyMemory)
    url = f"https://api.mymemory.translated.net/get?q={requests.utils.quote(req.text)}&langpair=en|{req.target_lang}"
    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            return {"translatedText": data['responseData']['translatedText']}
    except Exception:
        pass
    # Fallback to original text if API fails
    return {"translatedText": req.text}

@router.post("/time-machine")
def time_machine(req: TimeMachineRequest, db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT monthly_spend FROM vendors WHERE name = ?", (req.vendor_name,))
    row = cursor.fetchone()
    
    current_cash = 402000
    if not row:
        return {"current_cash": current_cash, "simulated_cash": current_cash, "recovered": 0, "message": "Vendor not found."}
        
    monthly_spend = row[0]
    recovered_cash = monthly_spend * req.months_ago
    simulated_cash = current_cash + recovered_cash
    
    return {
        "current_cash": current_cash,
        "simulated_cash": simulated_cash,
        "recovered_cash": recovered_cash,
        "vendor": req.vendor_name,
        "months": req.months_ago,
        "insight": f"By excluding {req.vendor_name}, your runway would have increased significantly with an extra ₹{recovered_cash:,} in reserve."
    }

@router.post("/chat")
def chat(req: ChatRequest, db = Depends(get_db)):
    cursor = db.cursor()
    
    # Save user message
    cursor.execute("INSERT INTO chat_history (sender, message) VALUES (?, ?)", ("user", req.message))
    db.commit()

    api_key = os.environ.get("OPENAI_API_KEY")
    if api_key and api_key != "":
        try:
            headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
            data = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "system", "content": "You are FinGuard, an AI financial copilot. Keep responses brief and insightful."}, {"role": "user", "content": req.message}]
            }
            resp = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=data, timeout=10)
            if resp.status_code == 200:
                reply = resp.json()['choices'][0]['message']['content']
                cursor.execute("INSERT INTO chat_history (sender, message) VALUES (?, ?)", ("ai", reply))
                db.commit()
                return {"reply": reply}
        except Exception:
            pass
            
    # Fallback to mock logic if OpenAI fails or key is missing
    msg_lower = req.message.lower()
    
    if any(word in msg_lower for word in ["cash", "forecast", "runway"]):
        reply = "Your projected cash balance is looking healthy for the next 30 days, but it approaches the reserve threshold in week 6. Consider reducing discretionary spending."
    elif any(word in msg_lower for word in ["invoice", "vendor", "spend", "expense"]):
        reply = "Vendor Brightline Supplies has a 65% jump in spend this month. I recommend reviewing their latest invoice (INV-28491) for potential errors."
    elif any(word in msg_lower for word in ["hi", "hello", "hey"]):
        reply = "FinGuard is an AI-powered financial copilot that helps you monitor cash flow, forecast runway, and detect anomalies. Upload a document or ask me a question about your financials!"
    else:
        reply = "I'm sorry, I don't have enough information on that. Would you like me to connect you to a human support agent?"
        
    cursor.execute("INSERT INTO chat_history (sender, message) VALUES (?, ?)", ("ai", reply))
    db.commit()
    
    return {"reply": reply}

@router.post("/login")
def login(req: AuthRequest, db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT id FROM users WHERE username = ? AND password = ?", (req.username, req.password))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"token": f"fake-jwt-token-{row[0]}", "username": req.username}

@router.post("/register")
def register(req: AuthRequest, db = Depends(get_db)):
    cursor = db.cursor()
    try:
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (req.username, req.password))
        db.commit()
        return {"message": "User created successfully"}
    except Exception:
        raise HTTPException(status_code=400, detail="Username already exists")

@router.get("/transactions")
def get_transactions(db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT id, date, amount, description, type, category FROM transactions ORDER BY date DESC")
    txs = cursor.fetchall()
    return [{"id": t[0], "date": t[1], "amount": t[2], "description": t[3], "type": t[4], "category": t[5] or "General"} for t in txs]

@router.get("/monthly-history")
def get_monthly_history(db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT month, revenue, expenses, cash_balance, profit FROM monthly_history ORDER BY id ASC")
    rows = cursor.fetchall()
    return [{"month": r[0], "revenue": r[1], "expenses": r[2], "cash_balance": r[3], "profit": r[4]} for r in rows]

@router.get("/vendor-detail/{name}")
def get_vendor_detail(name: str, db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT name, monthly_spend, change_percent, risk, last_payment, initials, color, bg, bank_account, address, tax_id FROM vendors WHERE name = ?", (name,))
    r = cursor.fetchone()
    if not r:
        raise HTTPException(status_code=404, detail="Vendor not found")
    cursor.execute("SELECT invoice_id, amount, risk, due_date, description FROM invoices WHERE vendor = ?", (name,))
    invoices = [{"invoice_id": i[0], "amount": i[1], "risk": i[2], "due_date": i[3], "description": i[4]} for i in cursor.fetchall()]
    return {"name": r[0], "monthly_spend": r[1], "change": r[2], "risk": r[3], "last_payment": r[4], "initials": r[5], "color": r[6], "bg": r[7], "bank_account": r[8], "address": r[9], "tax_id": r[10], "invoices": invoices}

@router.get("/crisis-detect")
def crisis_detect(db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT cash_balance, expenses FROM metrics LIMIT 1")
    m = cursor.fetchone()
    cash = m[0] if m else 402000
    expenses = m[1] if m else 718000
    monthly_burn = expenses
    
    cursor.execute("SELECT name, monthly_spend, change_percent FROM vendors WHERE risk = 'high' ORDER BY monthly_spend DESC LIMIT 1")
    risky = cursor.fetchone()
    vendor_name = risky[0] if risky else "Unknown Vendor"
    vendor_spend = risky[1] if risky else 0
    
    events = [
        {"day": 0, "severity": "warning", "title": f"Vendor cost rises — {vendor_name}", "desc": f"Monthly spend jumped to ₹{vendor_spend:,}. This is the trigger event."},
        {"day": 14, "severity": "warning", "title": "Cash reserve drops below baseline", "desc": f"Projected cash falls to ₹{cash - int(monthly_burn * 0.5):,} as mid-month expenses clear."},
        {"day": 27, "severity": "danger", "title": "Salary pressure builds", "desc": f"Payroll of ₹3,20,000 due. Cash buffer shrinks to ₹{cash - int(monthly_burn * 0.9):,}."},
        {"day": 39, "severity": "danger", "title": "Supplier payment risk", "desc": "Insufficient funds for net-30 vendor invoices. Payment delays begin."},
        {"day": 46, "severity": "critical", "title": "⚠️ RESERVE BREACHED", "desc": f"Cash balance falls below ₹3,00,000 safety threshold. Emergency measures required."},
    ]
    return {"events": events, "current_cash": cash, "monthly_burn": monthly_burn}
