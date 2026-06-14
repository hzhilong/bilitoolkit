# =====================================================================
# 1. 备份阶段：在旧版本被卸载清空前，将数据安全移至临时目录
# =====================================================================
!macro customInit
  # 我们先确保临时根目录存在
  CreateDirectory "$TEMP\my_app_backup_dir"

  # --- 备份 dbs ---
  IfFileExists "$INSTDIR\dbs\*.*" 0 +3
    CreateDirectory "$TEMP\my_app_backup_dir\dbs"
    CopyFiles /SILENT "$INSTDIR\dbs\*.*" "$TEMP\my_app_backup_dir\dbs\"

  # --- 备份 files ---
  IfFileExists "$INSTDIR\files\*.*" 0 +3
    CreateDirectory "$TEMP\my_app_backup_dir\files"
    CopyFiles /SILENT "$INSTDIR\files\*.*" "$TEMP\my_app_backup_dir\files\"

  # --- 备份 logs ---
  IfFileExists "$INSTDIR\logs\*.*" 0 +3
    CreateDirectory "$TEMP\my_app_backup_dir\logs"
    CopyFiles /SILENT "$INSTDIR\logs\*.*" "$TEMP\my_app_backup_dir\logs\"

  # --- 备份 plugins ---
  IfFileExists "$INSTDIR\plugins\*.*" 0 +3
    CreateDirectory "$TEMP\my_app_backup_dir\plugins"
    CopyFiles /SILENT "$INSTDIR\plugins\*.*" "$TEMP\my_app_backup_dir\plugins\"

  # --- 备份 temp ---
  IfFileExists "$INSTDIR\temp\*.*" 0 +3
    CreateDirectory "$TEMP\my_app_backup_dir\temp"
    CopyFiles /SILENT "$INSTDIR\temp\*.*" "$TEMP\my_app_backup_dir\temp\"
!macroend


# =====================================================================
# 2. 还原阶段：在新版本文件解压完成后，将临时目录的数据覆盖回来
# =====================================================================
!macro customInstall
  # --- 还原 dbs ---
  IfFileExists "$TEMP\my_app_backup_dir\dbs\*.*" 0 +3
    CreateDirectory "$INSTDIR\dbs"
    CopyFiles /SILENT "$TEMP\my_app_backup_dir\dbs\*.*" "$INSTDIR\dbs\"

  # --- 还原 files ---
  IfFileExists "$TEMP\my_app_backup_dir\files\*.*" 0 +3
    CreateDirectory "$INSTDIR\files"
    CopyFiles /SILENT "$TEMP\my_app_backup_dir\files\*.*" "$INSTDIR\files\"

  # --- 还原 logs ---
  IfFileExists "$TEMP\my_app_backup_dir\logs\*.*" 0 +3
    CreateDirectory "$INSTDIR\logs"
    CopyFiles /SILENT "$TEMP\my_app_backup_dir\logs\*.*" "$INSTDIR\logs\"

  # --- 还原 plugins ---
  IfFileExists "$TEMP\my_app_backup_dir\plugins\*.*" 0 +3
    CreateDirectory "$INSTDIR\plugins"
    CopyFiles /SILENT "$TEMP\my_app_backup_dir\plugins\*.*" "$INSTDIR\plugins\"

  # --- 还原 temp ---
  IfFileExists "$TEMP\my_app_backup_dir\temp\*.*" 0 +3
    CreateDirectory "$INSTDIR\temp"
    CopyFiles /SILENT "$TEMP\my_app_backup_dir\temp\*.*" "$INSTDIR\temp\"

  # =====================================================================
  # 3. 清理阶段：数据恢复完毕后，我们必须斩草除根，清空系统的临时备份目录
  # =====================================================================
  RMDir /r "$TEMP\my_app_backup_dir"
!macroend