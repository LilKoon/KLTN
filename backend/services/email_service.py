import smtplib
import ssl
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from database import settings


def generate_otp(length: int = 6) -> str:
    return ''.join(random.choices(string.digits, k=length))


def send_verification_email(to_email: str, user_name: str, otp: str) -> bool:
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0;">
      <div style="max-width: 520px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #0f766e, #0e7490); padding: 36px 40px; text-align: center;">
          <div style="font-size: 32px; margin-bottom: 8px;">&#127891;</div>
          <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">EdTech AI</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px;">N\u1ec1n t\u1ea3ng h\u1ecdc ti\u1ebfng Anh th\u00f4ng minh</p>
        </div>
        <div style="padding: 36px 40px;">
          <p style="color: #334155; font-size: 16px; margin: 0 0 16px;">Xin ch\u00e0o <strong>{user_name}</strong>!</p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.7; margin: 0 0 28px;">
            C\u1ea3m \u01a1n b\u1ea1n \u0111\u00e3 \u0111\u0103ng k\u00fd. \u0110\u1ec3 ho\u00e0n t\u1ea5t t\u1ea1o t\u00e0i kho\u1ea3n, h\u00e3y nh\u1eadp m\u00e3 x\u00e1c nh\u1eadn b\u00ean d\u01b0\u1edbi:
          </p>
          <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 28px;">
            <p style="color: #166534; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px; font-weight: 600;">M\u00c3 X\u00c1C NH\u1eacN</p>
            <div style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #15803d; font-family: 'Courier New', monospace;">{otp}</div>
          </div>
          <div style="background: #fef9c3; border-left: 4px solid #eab308; border-radius: 8px; padding: 14px 18px; margin: 0 0 24px;">
            <p style="color: #854d0e; font-size: 13px; margin: 0;">
              &#9201; M\u00e3 c\u00f3 hi\u1ec7u l\u1ef1c trong <strong>15 ph\u00fat</strong>. Kh\u00f4ng chia s\u1ebb m\u00e3 n\u00e0y v\u1edbi ai.
            </p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            N\u1ebfu b\u1ea1n kh\u00f4ng \u0111\u0103ng k\u00fd t\u00e0i kho\u1ea3n EdTech AI, h\u00e3y b\u1ecf qua email n\u00e0y.
          </p>
        </div>
        <div style="background: #f8fafc; padding: 20px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 EdTech AI &middot; M\u1ecdi b\u1ea3n quy\u1ec1n \u0111\u01b0\u1ee3c b\u1ea3o l\u01b0u</p>
        </div>
      </div>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "M\u00e3 x\u00e1c nh\u1eadn \u0111\u0103ng k\u00fd EdTech AI"
    msg["From"] = settings.MAIL_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.ehlo()
            server.starttls(context=context)
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        return False
