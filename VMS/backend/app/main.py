"""FastAPI application entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.v1 import api as api_v1
from .core.config import settings

app = FastAPI(title=settings.APP_NAME)

# Allow the Vite dev server to call this API from the browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Health check for uptime monitors and quick smoke tests."""
    return {"status": "ok"}


app.include_router(api_v1.router, prefix="/api/v1")
