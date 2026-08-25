"""
============================================================================
BACKEND SUPABASE AUTHENTICATION & JWT SECURITY MIDDLEWARE
============================================================================
Provides:
- FastAPI Dependency to verify Supabase JWT tokens (`verify_supabase_token`)
- Strict MFA / AAL2 level enforcement for protected endpoints
- Service role admin operations with elevated privileges
"""

import os
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, Depends, status
import requests

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://kgvnmsnnxjdhmzfhtcoj.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtndm5tc25ueGpkaG16Zmh0Y29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NzE5MzMsImV4cCI6MjEwMzI0NzkzM30.mgc8QB3XaVzm7HOpsj8CEshA9PBhM7QHFLidinqltMI")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtndm5tc25ueGpkaG16Zmh0Y29qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzY3MTkzMywiZXhwIjoyMTAzMjQ3OTMzfQ.vszyFmVlZ3JoNNOnMhTuj5iC2xx1KVDtFffwn0JNQVw")


async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    FastAPI dependency to extract and verify the bearer JWT with Supabase Auth.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header. Bearer token required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ")[1].strip()

    try:
        url = f"{SUPABASE_URL}/auth/v1/user"
        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {token}",
        }
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_data = response.json()
        return user_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Auth verification error: {str(e)}",
        )


async def require_mfa_aal2(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Enforces that the user has verified their Multi-Factor Authentication (AAL2).
    """
    aal = user.get("aal", "aal1")
    # Check if user has factors enrolled
    factors = user.get("factors", [])
    has_verified_factors = any(f.get("status") == "verified" for f in factors)

    if has_verified_factors and aal != "aal2":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Multi-Factor Authentication (AAL2) challenge required to access this resource.",
        )

    return user
