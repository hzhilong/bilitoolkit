# =====================================================================
# 1. 备份阶段：同级“盲改名”，向旧版卸载器隐藏长路径目录
# =====================================================================
!macro customInit
  # 注意：不要加 IfFileExists，不要创建目录，不要跨盘符
  # 直接将目录重命名为同级的 -backup 文件夹。
  # 这是一个 O(1) 的纯 MFT 表修改操作，系统根本不会去遍历里面的长路径，瞬间完成。

  Rename "$INSTDIR\dbs" "$INSTDIR-backup-dbs"
  Rename "$INSTDIR\files" "$INSTDIR-backup-files"
  Rename "$INSTDIR\logs" "$INSTDIR-backup-logs"
  Rename "$INSTDIR\plugins" "$INSTDIR-backup-plugins"
  Rename "$INSTDIR\temp" "$INSTDIR-backup-temp"
!macroend


# =====================================================================
# 2. 还原阶段：新版本解压完成后，瞬间改回原名
# =====================================================================
!macro customInstall
  Rename "$INSTDIR-backup-dbs" "$INSTDIR\dbs"
  Rename "$INSTDIR-backup-files" "$INSTDIR\files"
  Rename "$INSTDIR-backup-logs" "$INSTDIR\logs"
  Rename "$INSTDIR-backup-plugins" "$INSTDIR\plugins"
  Rename "$INSTDIR-backup-temp" "$INSTDIR\temp"
!macroend