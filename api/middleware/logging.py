from utils.authentication import decode_jwt
from fastapi import Request, Response
from typing import Callable, Awaitable
import structlog
import time
from datetime import datetime

logger = structlog.get_logger()

async def logging_middleware(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    user_id = None
    if "fast_api_token" in request.cookies:
        try:
            token = request.cookies["fast_api_token"]
            payload = await decode_jwt(token)
            if payload and payload.user:
                user_id = payload.user.id
        except Exception:
            pass

    start_time = time.time()
    
    logger.info(
        "request_started",
        method=request.method,
        path=request.url.path,
        user_id=user_id
    )

    try:
        response = await call_next(request)
        
        process_time = round((time.time() - start_time) * 1000)
        logger.info(
            "request_completed",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            process_time_ms=process_time,
            user_id=user_id
        )
        
        return response
        
    except Exception as e:
        logger.exception(
            "request_failed",
            method=request.method,
            path=request.url.path,
            error=str(e),
            user_id=user_id
        )
        raise