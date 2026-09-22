import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from database.connection import get_db

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/analyze-pdf")
async def analyze_pdf(file: UploadFile = File(...), db = Depends(get_db)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    content = await file.read()
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Save to database
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO documents (filename, content_type, file_size) VALUES (?, ?, ?)",
        (file.filename, file.content_type, len(content))
    )
    db.commit()
    
    # Return dummy analysis (simulating an AI extraction)
    return {
        "status": "success", 
        "suggestion": f"Successfully analyzed {file.filename}. We recommend adjusting your Q3 supplier contracts to mitigate supply chain volatility. Your current liquidity supports taking advantage of early payment discounts."
    }
