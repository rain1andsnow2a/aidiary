"""
数据库迁移脚本：给 users 表添加画像字段
运行方式：python migrate_add_profile_fields.py
"""
import sqlite3
import sys
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "yinji.db")


def migrate():
    if not os.path.exists(DB_PATH):
        print(f"[ERROR] 数据库文件不存在: {DB_PATH}")
        sys.exit(1)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 查询现有列
    cursor.execute("PRAGMA table_info(users)")
    existing_columns = {row[1] for row in cursor.fetchall()}
    print(f"[INFO] 现有列: {existing_columns}")

    # 需要添加的列
    new_columns = [
        ("avatar_url", "VARCHAR(500)"),
        ("mbti", "VARCHAR(10)"),
        ("social_style", "VARCHAR(20)"),
        ("current_state", "VARCHAR(20)"),
        ("catchphrases", "JSON"),
    ]

    added = 0
    for col_name, col_type in new_columns:
        if col_name not in existing_columns:
            sql = f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"
            print(f"[INFO] 执行: {sql}")
            cursor.execute(sql)
            added += 1
        else:
            print(f"[SKIP] 列 {col_name} 已存在")

    conn.commit()
    conn.close()

    if added > 0:
        print(f"[OK] 成功添加 {added} 个新列")
    else:
        print("[OK] 无需迁移，所有列已存在")


if __name__ == "__main__":
    migrate()
