from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
import requests
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
    cursor.execute("INSERT INTO chat_history (sender, message) VALUES (?, ?)", ("user", req.message))
    
    msg_lower = req.message.lower()
    
    # Keyword based responses
    if any(word in msg_lower for word in ["cash", "forecast", "runway"]):
        reply = "Your projected cash balance is looking healthy for the next 30 days, but it approaches the reserve threshold in week 6. Consider reducing discretionary spending."
    elif any(word in msg_lower for word in ["invoice", "vendor", "spend", "expense"]):
        reply = "Vendor Brightline Supplies has a 65% jump in spend this month. I recommend reviewing their latest invoice (INV-28491) for potential errors."
    elif any(word in msg_lower for word in ["hi", "hello", "hey"]):
        reply = "FinGuard is an AI-powered financial copilot that helps you monitor cash flow, forecast runway, and detect anomalies. Upload a document or ask me a question about your financials!"
    else:
        # Fallback to human support
        reply = "I'm sorry, I don't have enough information on that. Would you like me to connect you to a human support agent? Please contact support@asterco.in or call 1-800-FINGUARD."
        
    cursor.execute("INSERT INTO chat_history (sender, message) VALUES (?, ?)", ("bot", reply))
    db.commit()
    
    return {"reply": reply}
