from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
import httpx
import uuid
from sqlalchemy.orm import Session
import database, models
from api.auth import create_access_token, get_password_hash

router = APIRouter(prefix="/auth", tags=["OAuth Social Login"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

FACEBOOK_AUTH_URL = "https://www.facebook.com/v19.0/dialog/oauth"
FACEBOOK_TOKEN_URL = "https://graph.facebook.com/v19.0/oauth/access_token"
FACEBOOK_USERINFO_URL = "https://graph.facebook.com/v19.0/me"


@router.get("/google")
def google_login():
    params = {
        "client_id": database.settings.GOOGLE_CLIENT_ID,
        "redirect_uri": database.settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    }
    url = GOOGLE_AUTH_URL + "?" + "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(url)


@router.get("/google/callback")
def google_callback(code: str, db: Session = Depends(database.get_db)):
    with httpx.Client() as client:
        token_res = client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": database.settings.GOOGLE_CLIENT_ID,
            "client_secret": database.settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": database.settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        if not token_res.is_success:
            return RedirectResponse(f"{database.settings.FRONTEND_URL}/login?error=google_failed")

        access_token = token_res.json().get("access_token")
        user_res = client.get(GOOGLE_USERINFO_URL,
                              headers={"Authorization": f"Bearer {access_token}"})
        if not user_res.is_success:
            return RedirectResponse(f"{database.settings.FRONTEND_URL}/login?error=google_userinfo_failed")
        google_user = user_res.json()

    google_id = google_user.get("sub")
    email = google_user.get("email")
    name = google_user.get("name", email.split("@")[0] if email else "User")
    avatar = google_user.get("picture")

    if not email:
        return RedirectResponse(f"{database.settings.FRONTEND_URL}/login?error=no_email")

    user = _find_or_create_oauth_user(db, email, name, avatar, "google", google_id)
    jwt_token = create_access_token(data={"sub": user.Email, "role": user.VaiTro})
    return RedirectResponse(
        f"{database.settings.FRONTEND_URL}/oauth-callback?token={jwt_token}&role={user.VaiTro}"
    )


@router.get("/facebook")
def facebook_login():
    params = {
        "client_id": database.settings.FACEBOOK_CLIENT_ID,
        "redirect_uri": database.settings.FACEBOOK_REDIRECT_URI,
        "scope": "email,public_profile",
        "response_type": "code",
    }
    url = FACEBOOK_AUTH_URL + "?" + "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(url)


@router.get("/facebook/callback")
def facebook_callback(code: str, db: Session = Depends(database.get_db)):
    with httpx.Client() as client:
        token_res = client.get(FACEBOOK_TOKEN_URL, params={
            "client_id": database.settings.FACEBOOK_CLIENT_ID,
            "client_secret": database.settings.FACEBOOK_CLIENT_SECRET,
            "redirect_uri": database.settings.FACEBOOK_REDIRECT_URI,
            "code": code,
        })
        if not token_res.is_success:
            return RedirectResponse(f"{database.settings.FRONTEND_URL}/login?error=facebook_failed")

        fb_access_token = token_res.json().get("access_token")
        user_res = client.get(FACEBOOK_USERINFO_URL, params={
            "fields": "id,name,email,picture.type(large)",
            "access_token": fb_access_token,
        })
        fb_user = user_res.json()

    fb_id = fb_user.get("id")
    email = fb_user.get("email")
    name = fb_user.get("name", "Facebook User")
    avatar = fb_user.get("picture", {}).get("data", {}).get("url")

    if not email:
        email = f"fb_{fb_id}@facebook.oauth"

    user = _find_or_create_oauth_user(db, email, name, avatar, "facebook", fb_id)
    jwt_token = create_access_token(data={"sub": user.Email, "role": user.VaiTro})
    return RedirectResponse(
        f"{database.settings.FRONTEND_URL}/oauth-callback?token={jwt_token}&role={user.VaiTro}"
    )


def _find_or_create_oauth_user(
    db: Session,
    email: str,
    name: str,
    avatar: str | None,
    provider: str,
    provider_id: str,
) -> models.NguoiDung:
    # 1. Find by provider ID
    if provider == "google":
        user = db.query(models.NguoiDung).filter(models.NguoiDung.GoogleId == provider_id).first()
    else:
        user = db.query(models.NguoiDung).filter(models.NguoiDung.FacebookId == provider_id).first()

    if user:
        if avatar:
            user.AvatarUrl = avatar
        db.commit()
        return user

    # 2. Find by email (account merge)
    user = db.query(models.NguoiDung).filter(models.NguoiDung.Email == email).first()
    if user:
        if provider == "google":
            user.GoogleId = provider_id
        else:
            user.FacebookId = provider_id
        if avatar:
            user.AvatarUrl = avatar
        user.IsVerified = True
        db.commit()
        return user

    # 3. Create new user
    kwargs = {"GoogleId": provider_id} if provider == "google" else {"FacebookId": provider_id}
    new_user = models.NguoiDung(
        MaNguoiDung=uuid.uuid4(),
        TenNguoiDung=name,
        Email=email,
        MatKhau=get_password_hash(str(uuid.uuid4())),
        IsVerified=True,
        OAuthProvider=provider,
        AvatarUrl=avatar,
        **kwargs,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
