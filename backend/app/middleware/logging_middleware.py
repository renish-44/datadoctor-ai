"""
Structured request logging middleware for FastAPI.

Captures: timestamp, request_id, client_ip, method, path, query_params,
user_agent, content_type, status_code, latency_ms, action, and user_id (from JWT).
Outputs structured JSON to both console and rotating log file.
"""

import json
import logging
import time
import uuid
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Optional

from fastapi import Request, Response
from jose import JWTError, jwt
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from app.config import settings

# ---------------------------------------------------------------------------
# Action mapping: derive a human-readable "action" from the request path
# ---------------------------------------------------------------------------
_ACTION_MAP = {
    # Auth
    ("POST", "/api/v1/auth/register"): "auth.register",
    ("POST", "/api/v1/auth/login"): "auth.login",
    ("GET", "/api/v1/auth/me"): "auth.me",
    ("POST", "/api/v1/auth/forgot-password"): "auth.forgot_password",
    ("POST", "/api/v1/auth/reset-password"): "auth.reset_password",
    # Datasets
    ("POST", "/api/v1/datasets/upload"): "datasets.upload",
    ("GET", "/api/v1/datasets"): "datasets.list",
    ("DELETE", "/api/v1/datasets"): "datasets.delete",
    # Health
    ("GET", "/"): "root",
    ("GET", "/health"): "health.check",
    ("GET", "/api/v1/health"): "health.check",
    ("GET", "/health/db"): "health.db",
    ("GET", "/api/v1/health/db"): "health.db",
}

# Paths with dynamic segments — matched by prefix
_PREFIX_ACTIONS = [
    # Order matters: more specific prefixes first
    ("POST", "/api/v1/cleaning/jobs/", "cleaning.undo"),
    ("POST", "/api/v1/cleaning/", "cleaning.apply"),
    ("GET", "/api/v1/cleaning/", "cleaning.history"),
    ("POST", "/api/v1/audit/", "audit.run"),
    ("GET", "/api/v1/audit/reports/", "audit.get_report"),
    ("GET", "/api/v1/audit/", "audit.list_reports"),
    ("GET", "/api/v1/datasets/", "datasets.get"),
    ("DELETE", "/api/v1/datasets/", "datasets.delete"),
]


def _resolve_action(method: str, path: str) -> str:
    """Derive a human-readable action label from HTTP method + path."""
    # Exact match first
    action = _ACTION_MAP.get((method, path))
    if action:
        return action

    # Prefix match for dynamic routes
    for prefix_method, prefix, action_name in _PREFIX_ACTIONS:
        if method == prefix_method and path.startswith(prefix):
            # Refine for sub-resources like /datasets/{id}/preview
            if "/preview" in path:
                return action_name.replace(".get", ".preview")
            if "/columns" in path:
                return action_name.replace(".get", ".columns")
            return action_name

    return f"{method.lower()}.unknown"


# ---------------------------------------------------------------------------
# JSON log formatter
# ---------------------------------------------------------------------------
class JSONFormatter(logging.Formatter):
    """Emit each log record as a single-line JSON object."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        # Merge any extra fields attached to the record
        for key in (
            "request_id", "client_ip", "method", "path", "query_params",
            "user_agent", "content_type", "status_code", "latency_ms",
            "action", "user_id",
        ):
            value = getattr(record, key, None)
            if value is not None:
                log_entry[key] = value

        return json.dumps(log_entry, default=str)


# ---------------------------------------------------------------------------
# Logger setup (called once at app startup)
# ---------------------------------------------------------------------------
def setup_request_logger() -> logging.Logger:
    """
    Configure the 'datadoctor.access' logger with:
    - Console handler  (structured JSON, INFO level)
    - Rotating file handler (logs/access.log, 10 MB max, 5 backups)
    """
    logger = logging.getLogger("datadoctor.access")
    if logger.handlers:
        # Already configured (e.g. during hot-reload)
        return logger

    logger.setLevel(logging.DEBUG)
    logger.propagate = False

    formatter = JSONFormatter(datefmt="%Y-%m-%dT%H:%M:%S")

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # Rotating file handler
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    file_handler = RotatingFileHandler(
        log_dir / "access.log",
        maxBytes=10 * 1024 * 1024,  # 10 MB
        backupCount=5,
        encoding="utf-8",
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    return logger


# ---------------------------------------------------------------------------
# JWT user extraction (best-effort, never raises)
# ---------------------------------------------------------------------------
def _extract_user_id_from_token(request: Request) -> Optional[str]:
    """Try to extract user_id from the Authorization Bearer token."""
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header[7:]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


# ---------------------------------------------------------------------------
# Client IP extraction (respects reverse proxy headers)
# ---------------------------------------------------------------------------
def _get_client_ip(request: Request) -> str:
    """Get client IP, respecting X-Forwarded-For from trusted proxies."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # Take the first (client) IP from the chain
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


# ---------------------------------------------------------------------------
# Health-check paths (logged at DEBUG to reduce noise)
# ---------------------------------------------------------------------------
_HEALTH_PATHS = {"/health", "/api/v1/health", "/health/db", "/api/v1/health/db"}


# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Logs every HTTP request with structured metadata:
    request_id, client_ip, method, path, status_code, latency_ms, action, user_id.
    """

    def __init__(self, app):
        super().__init__(app)
        self.logger = setup_request_logger()

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        request_id = str(uuid.uuid4())
        start_time = time.perf_counter()

        # Attach request_id to request state so downstream handlers can use it
        request.state.request_id = request_id

        # Process the request
        try:
            response = await call_next(request)
        except Exception:
            # Log the failure, then re-raise so FastAPI's exception handlers run
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
            self.logger.error(
                "Request failed with unhandled exception",
                extra={
                    "request_id": request_id,
                    "client_ip": _get_client_ip(request),
                    "method": request.method,
                    "path": request.url.path,
                    "query_params": str(request.query_params) or None,
                    "user_agent": request.headers.get("user-agent"),
                    "content_type": request.headers.get("content-type"),
                    "status_code": 500,
                    "latency_ms": latency_ms,
                    "action": _resolve_action(request.method, request.url.path),
                    "user_id": _extract_user_id_from_token(request),
                },
            )
            raise

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

        log_data = {
            "request_id": request_id,
            "client_ip": _get_client_ip(request),
            "method": request.method,
            "path": request.url.path,
            "query_params": str(request.query_params) if request.query_params else None,
            "user_agent": request.headers.get("user-agent"),
            "content_type": request.headers.get("content-type"),
            "status_code": response.status_code,
            "latency_ms": latency_ms,
            "action": _resolve_action(request.method, request.url.path),
            "user_id": _extract_user_id_from_token(request),
        }

        # Health checks log at DEBUG to avoid noise
        if request.url.path in _HEALTH_PATHS:
            self.logger.debug(
                f"{request.method} {request.url.path} → {response.status_code} ({latency_ms}ms)",
                extra=log_data,
            )
        elif response.status_code >= 500:
            self.logger.error(
                f"{request.method} {request.url.path} → {response.status_code} ({latency_ms}ms)",
                extra=log_data,
            )
        elif response.status_code >= 400:
            self.logger.warning(
                f"{request.method} {request.url.path} → {response.status_code} ({latency_ms}ms)",
                extra=log_data,
            )
        else:
            self.logger.info(
                f"{request.method} {request.url.path} → {response.status_code} ({latency_ms}ms)",
                extra=log_data,
            )

        # Attach request_id to response headers for traceability
        response.headers["X-Request-ID"] = request_id

        return response
