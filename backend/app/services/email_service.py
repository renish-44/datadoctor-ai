import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import aiosmtplib

from app.config import settings

logger = logging.getLogger("datadoctor.email")


class EmailService:
    """Async email service using aiosmtplib for SMTP delivery."""

    @staticmethod
    async def send_password_reset_email(
        to_email: str, reset_token: str, full_name: str | None = None
    ) -> bool:
        """
        Send a password reset email with a secure link.

        Returns True if the email was sent successfully, False otherwise.
        Failures are logged but never bubble up — callers should always
        return a generic "if an account exists…" message regardless.
        """
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        recipient_name = full_name or "there"

        subject = "DataDoctor AI — Password Reset Request"

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }}
                .container {{ max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden; }}
                .header {{ background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 24px; text-align: center; }}
                .header h1 {{ color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; }}
                .body {{ padding: 32px 24px; color: #334155; line-height: 1.6; }}
                .body p {{ margin: 0 0 16px; }}
                .btn {{ display: inline-block; background: #6366f1; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }}
                .btn:hover {{ background: #4f46e5; }}
                .footer {{ padding: 16px 24px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }}
                .warning {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 6px 6px 0; margin: 16px 0; font-size: 13px; color: #92400e; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔒 Password Reset</h1>
                </div>
                <div class="body">
                    <p>Hi {recipient_name},</p>
                    <p>We received a request to reset the password for your DataDoctor AI account associated with <strong>{to_email}</strong>.</p>
                    <p>Click the button below to set a new password:</p>
                    <p style="text-align: center;">
                        <a href="{reset_link}" class="btn">Reset My Password</a>
                    </p>
                    <div class="warning">
                        ⏳ This link expires in <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email.
                    </div>
                    <p style="font-size: 13px; color: #64748b;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="{reset_link}" style="color: #6366f1; word-break: break-all;">{reset_link}</a>
                    </p>
                </div>
                <div class="footer">
                    &copy; DataDoctor AI &mdash; Data Quality &amp; Cleaning Platform
                </div>
            </div>
        </body>
        </html>
        """

        plain_body = (
            f"Hi {recipient_name},\n\n"
            f"We received a request to reset your DataDoctor AI password.\n\n"
            f"Reset your password by visiting this link (expires in 15 minutes):\n"
            f"{reset_link}\n\n"
            f"If you didn't request this, you can safely ignore this email.\n\n"
            f"— DataDoctor AI"
        )

        message = MIMEMultipart("alternative")
        message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        message["To"] = to_email
        message["Subject"] = subject
        message.attach(MIMEText(plain_body, "plain"))
        message.attach(MIMEText(html_body, "html"))

        try:
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                start_tls=settings.SMTP_USE_TLS,
            )
            logger.info(
                "Password reset email sent successfully",
                extra={"to_email": to_email},
            )
            return True
        except aiosmtplib.SMTPAuthenticationError:
            logger.error(
                "SMTP authentication failed — check SMTP_USER and SMTP_PASSWORD in .env",
                extra={"to_email": to_email},
            )
            return False
        except aiosmtplib.SMTPConnectError:
            logger.error(
                "Could not connect to SMTP server — check SMTP_HOST and SMTP_PORT in .env",
                extra={"smtp_host": settings.SMTP_HOST, "smtp_port": settings.SMTP_PORT},
            )
            return False
        except Exception as e:
            logger.error(
                f"Failed to send password reset email: {type(e).__name__}: {e}",
                extra={"to_email": to_email},
            )
            return False
