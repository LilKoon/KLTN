# -*- coding: utf-8 -*-
"""One-shot script to create or promote an admin user."""
import uuid
import sys
sys.path.insert(0, '.')

from sqlalchemy.orm import Session
import database
import models
from api.auth import get_password_hash

EMAIL = "admin@edtech.ai"
PASSWORD = "123456"
NAME = "Administrator"

db: Session = next(database.get_db())

existing = db.query(models.NguoiDung).filter(models.NguoiDung.Email == EMAIL).first()
if existing:
    existing.VaiTro = "ADMIN"
    existing.MatKhau = get_password_hash(PASSWORD)
    existing.IsVerified = True
    db.commit()
    print(f"Updated existing user -> ADMIN")
    print(f"  Email:    {EMAIL}")
    print(f"  Password: {PASSWORD}")
    print(f"  ID:       {existing.MaNguoiDung}")
else:
    new_admin = models.NguoiDung(
        MaNguoiDung=uuid.uuid4(),
        TenNguoiDung=NAME,
        Email=EMAIL,
        MatKhau=get_password_hash(PASSWORD),
        VaiTro="ADMIN",
        IsVerified=True,
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    print(f"Created new admin user")
    print(f"  Email:    {EMAIL}")
    print(f"  Password: {PASSWORD}")
    print(f"  ID:       {new_admin.MaNguoiDung}")
