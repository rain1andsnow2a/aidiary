"""add heart light checkins and light point ledger

Revision ID: 0002_heart_light
Revises: 1e20ab06a63c
Create Date: 2026-05-02

2026-05 改动：
- 心灯签到不再写入 diaries 表，改为独立的 heart_light_checkins
- 映光积分持久化：light_point_ledger（流水）+ care_statuses.total_light_points（缓存）
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0002_heart_light"
down_revision: Union[str, None] = "1e20ab06a63c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1) care_statuses 加 total_light_points（映光总数缓存）
    with op.batch_alter_table("care_statuses", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "total_light_points",
                sa.Integer(),
                nullable=False,
                server_default="0",
            )
        )

    # 2) 每日心灯签到（替代写进 diaries 的做法）
    op.create_table(
        "heart_light_checkins",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("checkin_date", sa.Date(), nullable=False),
        sa.Column("emotion", sa.String(length=20), nullable=False),
        sa.Column("energy", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("event", sa.String(length=40), nullable=True),
        sa.Column("one_line_text", sa.Text(), nullable=True),
        sa.Column("reflection_key", sa.String(length=40), nullable=True),
        sa.Column("is_rest", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("awarded_points", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "checkin_date", name="uq_heart_light_user_date"),
    )
    with op.batch_alter_table("heart_light_checkins", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_heart_light_checkins_checkin_date"),
            ["checkin_date"],
            unique=False,
        )
        batch_op.create_index(
            batch_op.f("ix_heart_light_checkins_user_id"),
            ["user_id"],
            unique=False,
        )

    # 3) 映光流水
    op.create_table(
        "light_point_ledger",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("delta", sa.Integer(), nullable=False),
        sa.Column("reason", sa.String(length=40), nullable=False),
        sa.Column("ref_date", sa.Date(), nullable=False),
        sa.Column("ref_id", sa.Integer(), nullable=True),
        sa.Column("meta", sa.JSON(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("light_point_ledger", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_light_point_ledger_ref_date"),
            ["ref_date"],
            unique=False,
        )
        batch_op.create_index(
            batch_op.f("ix_light_point_ledger_user_id"),
            ["user_id"],
            unique=False,
        )


def downgrade() -> None:
    with op.batch_alter_table("light_point_ledger", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_light_point_ledger_user_id"))
        batch_op.drop_index(batch_op.f("ix_light_point_ledger_ref_date"))
    op.drop_table("light_point_ledger")

    with op.batch_alter_table("heart_light_checkins", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_heart_light_checkins_user_id"))
        batch_op.drop_index(batch_op.f("ix_heart_light_checkins_checkin_date"))
    op.drop_table("heart_light_checkins")

    with op.batch_alter_table("care_statuses", schema=None) as batch_op:
        batch_op.drop_column("total_light_points")
