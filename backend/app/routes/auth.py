from datetime import datetime, timedelta
from secrets import token_urlsafe

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.db import get_session
from ..models import User, PasswordResetToken
from ..core.auth import (
    create_access_token,
    get_password_hash,
    authenticate_user,
    get_current_user,
)
from ..utils.email_utils import send_email

router = APIRouter()



class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    is_donor: bool = False


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    username: str
    email: str
    is_admin: bool
    is_donor: bool


class ResetRequest(BaseModel):
    email: str


class PasswordReset(BaseModel):
    token: str
    new_password: str


@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_session)):
    if db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first():
        raise HTTPException(status_code=400, detail="User already exists")
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        is_donor=user.is_donor,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    token = create_access_token({"sub": db_user.username})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_session),
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/logout")
def logout():
    return {"message": "Logged out"}


@router.post("/request-reset")
def request_password_reset(
    payload: ResetRequest,
    db: Session = Depends(get_session),
):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        return {"message": "If the email exists, a reset link was sent."}
    token = token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(hours=1)
    db_token = PasswordResetToken(user_id=user.id, token=token, expires_at=expires)
    db.add(db_token)
    db.commit()
    send_email(user.email, "Password Reset", f"Your reset token is: {token}")
    return {"message": "If the email exists, a reset link was sent."}


@router.post("/reset-password")
def reset_password(
    payload: PasswordReset,
    db: Session = Depends(get_session),
):
    db_token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token == payload.token,
            PasswordResetToken.used.is_(False),
        )
        .first()
    )
    if not db_token or db_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user = db.get(User, db_token.user_id)
    user.hashed_password = get_password_hash(payload.new_password)
    db_token.used = True
    db.commit()
    return {"message": "Password updated"}


@router.get("/users/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return UserOut(
        username=current_user.username,
        email=current_user.email,
        is_admin=current_user.is_admin,
        is_donor=current_user.is_donor,
    )
