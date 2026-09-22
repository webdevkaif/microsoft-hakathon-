import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from database.models import init_db
from api.routes import router as api_router
from api.pdf_handler import router as pdf_router

# Initialize database
init_db()

app = FastAPI(title="FinGuard AI API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(api_router, prefix="/api")
app.include_router(pdf_router, prefix="/api")

# Static files (Frontend)
ROOT = Path(__file__).resolve().parents[1]
FRONT = ROOT / 'frontend'

@app.get("/")
async def serve_index():
    return FileResponse(FRONT / "index.html")

app.mount("/", StaticFiles(directory=FRONT), name="frontend")

if __name__ == '__main__':
    import uvicorn
    port = int(os.getenv('PORT', '8000'))
    print(f'FinGuard API running on http://localhost:{port}')
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
