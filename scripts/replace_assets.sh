#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="/Users/raeouyang/Downloads/开发插图"
TARGET_DIR="$ROOT_DIR/asset/images"
BACKUP_DIR="$ROOT_DIR/asset/backups/images-$(date +%Y%m%d-%H%M%S)"

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Source directory not found: $SOURCE_DIR" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

copy_asset() {
  local source_name="$1"
  local target_name="$2"
  local source_path="$SOURCE_DIR/$source_name"
  local target_path="$TARGET_DIR/$target_name"

  if [[ ! -f "$source_path" ]]; then
    echo "Missing source: $source_path" >&2
    exit 1
  fi

  if [[ ! -f "$target_path" ]]; then
    echo "Missing target: $target_path" >&2
    exit 1
  fi

  cp "$target_path" "$BACKUP_DIR/$target_name"
  cp "$source_path" "$target_path"
  echo "Replaced: $target_name <= $source_name"
}

copy_asset "主图@2x 2.png" "2719b3e33a689b1fbf8936a420e613a2.png"
copy_asset "3-采购闭环管理@2x.png" "全链路闭环.png"
copy_asset "3-移动端审批@2x.png" "移动端审批.png"
copy_asset "3-竞价询价@2x.png" "竞价询价.png"
copy_asset "3-无纸化报销@2x.png" "无纸化报销.png"
copy_asset "3-审批流定制@2x.png" "审批流定制.png"
copy_asset "3-系统对接@2x.png" "系统对接.png"
copy_asset "3-危化品管理@2x.png" "危化品管理.png"

echo "Backup saved to: $BACKUP_DIR"
