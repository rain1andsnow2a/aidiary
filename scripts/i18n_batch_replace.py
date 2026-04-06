#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
i18n 批量替换脚本
自动查找 React 组件中的中文字符串并生成替换建议
"""

import os
import re
from pathlib import Path

def find_chinese_strings(file_path):
    """查找文件中的中文字符串"""
    chinese_strings = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        for line_num, line in enumerate(lines, 1):
            # 匹配引号中的中文
            matches = re.findall(r"['\"`]([^'\"`]*[\u4e00-\u9fff]+[^'\"`]*)['\"`]", line)
            for match in matches:
                if len(match.strip()) > 0 and not match.strip().startswith('http'):
                    chinese_strings.append({
                        'line': line_num,
                        'text': match.strip(),
                        'original_line': line.strip()
                    })
    
    return chinese_strings

def generate_translation_key(chinese_text):
    """根据中文生成翻译键"""
    # 简单映射
    key_map = {
        '欢迎回来': 'auth.login.title',
        '创建账号': 'auth.register.title',
        '验证邮箱': 'auth.register.verifyEmail',
        '设置密码': 'auth.register.setPassword',
        '开始探索': 'auth.register.startExplore',
        '输入邮箱，开始你的心灵之旅': 'auth.register.step1Desc',
        '完善信息，完成注册': 'auth.register.step2Desc',
        '忘记密码': 'auth.forgotPassword.title',
        '重置密码': 'auth.forgotPassword.resetButton',
        '邮箱': 'common.email',
        '密码': 'common.password',
        '用户名': 'common.username',
        '验证码': 'common.verificationCode',
        '发送验证码': 'common.sendCode',
        '注册': 'common.register',
        '登录': 'common.login',
        '保存': 'common.save',
        '取消': 'common.cancel',
        '删除': 'common.delete',
        '编辑': 'common.edit',
        '创建': 'common.create',
        '搜索': 'common.search',
        '返回': 'common.back',
        '确认': 'common.confirm',
        '提交': 'common.submit',
        '加载中': 'common.loading',
        '成功': 'common.success',
        '错误': 'common.error',
        '警告': 'common.warning',
    }
    
    return key_map.get(chinese_text, f'common.{hash(chinese_text) % 10000}')

def process_directory(directory):
    """处理目录中的所有 tsx 文件"""
    results = {}
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx'):
                file_path = os.path.join(root, file)
                chinese_strings = find_chinese_strings(file_path)
                
                if chinese_strings:
                    results[file_path] = chinese_strings
    
    return results

def generate_report(results):
    """生成报告"""
    report = []
    report.append("# i18n 批量替换报告\n")
    report.append(f"共找到 {len(results)} 个文件包含中文\n")
    
    for file_path, strings in results.items():
        report.append(f"\n## {file_path}")
        report.append(f"共 {len(strings)} 处中文\n")
        
        for item in strings[:20]:  # 只显示前20个
            key = generate_translation_key(item['text'])
            report.append(f"- 行 {item['line']}: `{item['text']}` → `t('{key}')`")
        
        if len(strings) > 20:
            report.append(f"- ... 还有 {len(strings) - 20} 处")
    
    return '\n'.join(report)

if __name__ == '__main__':
    # 处理 frontend/src 目录
    src_dir = 'd:/bigproject/映记/frontend/src'
    results = process_directory(src_dir)
    
    # 生成报告
    report = generate_report(results)
    
    # 保存报告
    with open('d:/bigproject/映记/docs/i18n批量替换报告.md', 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"处理完成！")
    print(f"找到 {len(results)} 个文件包含中文")
    print(f"报告已保存到: docs/i18n批量替换报告.md")
