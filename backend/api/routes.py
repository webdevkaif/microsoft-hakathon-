from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
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

@router.get("/health")
def health():
    return {"status": "ok", "service": "finguard-api"}

@router.get("/summary")
def summary():
    return {"cash_balance": 402000, "revenue": 1024000, "expenses": 718000, "overall_risk": 39, "alerts": 3}

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

@router.post("/chat")
def chat(req: ChatRequest, db = Depends(get_db)):
    # Save to database
    cursor = db.cursor()
    cursor.execute("INSERT INTO chat_history (sender, message) VALUES (?, ?)", ("user", req.message))
    
    reply = "FinGuard is an AI-powered financial copilot that helps you monitor cash flow, forecast runway, and detect anomalies. Upload a document or ask me another question!"
    
    cursor.execute("INSERT INTO chat_history (sender, message) VALUES (?, ?)", ("bot", reply))
    db.commit()
    
    return {"reply": reply}
