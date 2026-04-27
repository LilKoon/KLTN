import smtplib
import ssl
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from database import settings


def generate_otp(length: int = 6) -> str:
    return ''.join(random.choices(string.digits, k=length))


def _send_email(to_email: str, subject: str, html_body: str) -> bool:
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        # Dev fallback: print to console nếu chưa cấu hình SMTP
        print(f"[EMAIL DEV] To: {to_email} | Subject: {subject}")
        print("[EMAIL DEV] (Set MAIL_USERNAME/MAIL_PASSWORD trong .env để gửi thật)")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
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


def _otp_email_template(user_name: str, otp: str, *, title: str, intro_html: str, accent: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0;">
      <div style="max-width: 520px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: {accent}; padding: 36px 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">EdTech AI</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">{title}</p>
        </div>
        <div style="padding: 36px 40px;">
          <p style="color: #334155; font-size: 16px; margin: 0 0 16px;">Xin chào <strong>{user_name}</strong>!</p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.7; margin: 0 0 28px;">{intro_html}</p>
          <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 28px;">
            <p style="color: #166534; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px; font-weight: 600;">MÃ XÁC NHẬN</p>
            <div style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #15803d; font-family: 'Courier New', monospace;">{otp}</div>
          </div>
          <div style="background: #fef9c3; border-left: 4px solid #eab308; border-radius: 8px; padding: 14px 18px; margin: 0 0 24px;">
            <p style="color: #854d0e; font-size: 13px; margin: 0;">Mã có hiệu lực trong <strong>15 phút</strong>. Không chia sẻ mã này với ai.</p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        </div>
        <div style="background: #f8fafc; padding: 20px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 EdTech AI</p>
        </div>
      </div>
    </body>
    </html>
    """


def send_verification_email(to_email: str, user_name: str, otp: str) -> bool:
    html = _otp_email_template(
        user_name, otp,
        title="Xác thực email đăng ký",
        intro_html="Cảm ơn bạn đã đăng ký. Để hoàn tất tạo tài khoản, hãy nhập mã xác nhận bên dưới:",
        accent="linear-gradient(135deg, #0f766e, #0e7490)",
    )
    if not _send_email(to_email, "Mã xác nhận đăng ký EdTech AI", html):
        print(f"[EMAIL DEV] OTP đăng ký cho {to_email}: {otp}")
        return False
    return True


def send_password_reset_email(to_email: str, user_name: str, otp: str) -> bool:
    html = _otp_email_template(
        user_name, otp,
        title="Khôi phục mật khẩu",
        intro_html="Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản EdTech AI. Hãy nhập mã xác nhận bên dưới:",
        accent="linear-gradient(135deg, #b91c1c, #c2410c)",
    )
    if not _send_email(to_email, "Mã khôi phục mật khẩu EdTech AI", html):
        print(f"[EMAIL DEV] OTP reset password cho {to_email}: {otp}")
        return False
    return True
