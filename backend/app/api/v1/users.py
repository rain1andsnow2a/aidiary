"""
用户画像相关API端点
"""
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas.auth import UserResponse, ProfileUpdateRequest
from app.core.deps import get_current_active_user
from app.models.database import User

router = APIRouter(prefix="/users", tags=["用户"])

# 头像上传目录
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "uploads", "avatars")


@router.get("/profile", response_model=UserResponse, summary="获取用户画像")
async def get_profile(
    current_user: User = Depends(get_current_active_user)
):
    """获取当前用户的完整画像信息"""
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse, summary="更新用户画像")
async def update_profile(
    data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    更新用户画像信息

    支持更新：用户名、MBTI、社交风格、当前状态、口头禅
    """
    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)

    return UserResponse.model_validate(current_user)


@router.post("/avatar", response_model=UserResponse, summary="上传头像")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    上传用户头像

    - 支持 jpg/jpeg/png/gif/webp 格式
    - 最大 2MB
    """
    # 验证文件类型
    allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只支持 jpg/png/gif/webp 格式的图片"
        )

    # 读取文件内容并验证大小
    contents = await file.read()
    if len(contents) > 2 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="图片大小不能超过 2MB"
        )

    # 确保上传目录存在
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # 生成唯一文件名
    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "png"
    filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    # 删除旧头像文件
    if current_user.avatar_url:
        old_filename = current_user.avatar_url.split("/")[-1]
        old_filepath = os.path.join(UPLOAD_DIR, old_filename)
        if os.path.exists(old_filepath):
            os.remove(old_filepath)

    # 保存文件
    with open(filepath, "wb") as f:
        f.write(contents)

    # 更新数据库
    current_user.avatar_url = f"/uploads/avatars/{filename}"
    await db.commit()
    await db.refresh(current_user)

    return UserResponse.model_validate(current_user)
