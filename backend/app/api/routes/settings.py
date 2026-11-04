from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.models.setting import ApplicationSetting
from backend.app.schemas.setting import (
    SettingCreate,
    SettingUpdate,
    SettingResponse,
    SettingListResponse,
)

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingListResponse)
def list_settings(db: Session = Depends(get_db)):
    """List all application settings (secrets masked)."""
    items = db.query(ApplicationSetting).order_by(ApplicationSetting.key.asc()).all()
    return SettingListResponse(
        items=[SettingResponse(**s.to_dict()) for s in items],
        total=len(items),
    )


@router.post("", response_model=SettingResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_setting(payload: SettingCreate, db: Session = Depends(get_db)):
    """Create or update an application setting."""
    setting = db.query(ApplicationSetting).filter(ApplicationSetting.key == payload.key).first()
    if setting:
        setting.value = payload.value
        if payload.description is not None:
            setting.description = payload.description
        setting.is_secret = payload.is_secret
    else:
        setting = ApplicationSetting(
            key=payload.key,
            value=payload.value,
            description=payload.description,
            is_secret=payload.is_secret,
        )
        db.add(setting)

    db.commit()
    db.refresh(setting)
    return SettingResponse(**setting.to_dict())


@router.put("/{key}", response_model=SettingResponse)
def update_setting(key: str, payload: SettingUpdate, db: Session = Depends(get_db)):
    """Update setting value by key."""
    setting = db.query(ApplicationSetting).filter(ApplicationSetting.key == key).first()
    if not setting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Setting '{key}' not found.")

    setting.value = payload.value
    if payload.description is not None:
        setting.description = payload.description
    if payload.is_secret is not None:
        setting.is_secret = payload.is_secret

    db.commit()
    db.refresh(setting)
    return SettingResponse(**setting.to_dict())


@router.delete("/{key}", status_code=status.HTTP_204_NO_CONTENT)
def delete_setting(key: str, db: Session = Depends(get_db)):
    """Delete an application setting by key."""
    setting = db.query(ApplicationSetting).filter(ApplicationSetting.key == key).first()
    if not setting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Setting '{key}' not found.")

    db.delete(setting)
    db.commit()
    return None
