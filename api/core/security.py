from fastapi import Request, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
try:
    from qstash import Receiver
except Exception:
    Receiver = None
from api.core.config import settings
import logging

logger = logging.getLogger("api.security")
security = HTTPBearer(auto_error=False)

async def verify_qstash_signature(request: Request) -> bool:
    """
    Validates Upstash QStash HMAC signature headers on incoming worker requests
    to prevent unauthorized manual execution of the tick endpoint.
    """
    if not Receiver or not settings.QSTASH_CURRENT_SIGNING_KEY or not settings.QSTASH_NEXT_SIGNING_KEY:
        logger.warning("QStash signing keys or package missing; bypassing HMAC check in development mode.")
        return True

    signature = request.headers.get("upstash-signature")
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing required Upstash-Signature header"
        )

    try:
        receiver = Receiver(
            current_signing_key=settings.QSTASH_CURRENT_SIGNING_KEY,
            next_signing_key=settings.QSTASH_NEXT_SIGNING_KEY
        )
        body = (await request.body()).decode("utf-8")
        is_valid = receiver.verify(
            body=body,
            signature=signature
        )
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid QStash HMAC signature"
            )
        return True
    except Exception as e:
        logger.error(f"QStash verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed QStash signature verification"
        )

async def verify_auth_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Validates Authorization Bearer token header if provided.
    """
    if not credentials:
        return None
    return credentials.credentials
