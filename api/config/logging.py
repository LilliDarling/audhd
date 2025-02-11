import structlog
import logging
import sys
from typing import Any

def setup_logging() -> None:
    """Configure structlog for the application"""
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.INFO,
    )

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True
    )

logger = structlog.get_logger()

class RequestLoggingContext:
    def __init__(self, user_id: str | None = None, **kwargs: Any):
        self.user_id = user_id
        self.extra = kwargs
        
    def __enter__(self) -> None:
        structlog.contextvars.bind_contextvars(
            user_id=self.user_id,
            **self.extra
        )
        
    def __exit__(self, *args: Any) -> None:
        structlog.contextvars.unbind_contextvars("user_id", *self.extra.keys())