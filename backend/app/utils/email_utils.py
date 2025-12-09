import logging
import os
import smtplib
from email.message import EmailMessage

logger = logging.getLogger(__name__)


def send_email(to_email: str, subject: str, body: str) -> None:
    """Send an email or log it if SMTP not configured."""
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT", "25"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    from_addr = os.getenv("FROM_EMAIL", "noreply@example.com")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = to_email
    msg.set_content(body)

    if not smtp_server:
        logger.info("Email to %s: %s", to_email, body)
        return

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            if smtp_user and smtp_pass:
                server.starttls()
                server.login(smtp_user, smtp_pass)
            server.send_message(msg)
    except Exception as exc:  # pragma: no cover - smtp errors
        logger.error("Failed to send email: %s", exc)
        raise
