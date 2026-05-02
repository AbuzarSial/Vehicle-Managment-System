"""Standardized API responses."""

from fastapi import JSONResponse


def ok(data=None):
    return JSONResponse(status_code=200, content={"success": True, "data": data})
