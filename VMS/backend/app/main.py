"""FastAPI application entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.v1 import api as api_v1
from .core.config import settings

app = FastAPI(title=settings.APP_NAME)

_default_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
_extra = [o.strip() for o in settings.CORS_ALLOW_ORIGINS.split(",") if o.strip()]
_allow_origins = _default_origins + _extra

# Browser origins: local Vite + optional production (e.g. Vercel) from CORS_ALLOW_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Health check for uptime monitors and quick smoke tests."""
    return {"status": "ok"}


app.include_router(api_v1.router, prefix="/api/v1")
