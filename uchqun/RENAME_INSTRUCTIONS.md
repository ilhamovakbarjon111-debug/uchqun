# Directory Renaming Instructions

## Required Renames

1. **`super-admin`** → **`admin`**
2. **`admin-panel`** → **`reception`**

## Why the Rename Failed

The directories couldn't be renamed automatically because they are currently in use by:
- Your IDE (Cursor/VS Code)
- Development servers
- File system watchers
- Other processes

## Solution

### Option 1: Use the PowerShell Script (Recommended)

1. **Close all processes** using these directories:
   - Close Cursor/VS Code
   - Stop any running dev servers (`npm run dev`, etc.)
   - Close any file explorers with these folders open

2. **Run the rename script**:
   ```powershell
   cd "C:\Users\Ilhamov Akbar\Desktop\uchqun"
   .\rename-directories.ps1
   ```

### Option 2: Manual Rename via Windows Explorer

1. Close all processes (IDE, dev servers, etc.)
2. Open Windows Explorer
3. Navigate to: `C:\Users\Ilhamov Akbar\Desktop\uchqun`
4. Right-click `super-admin` folder → Rename → `admin`
5. Right-click `admin-panel` folder → Rename → `reception`

### Option 3: Manual Rename via Command Line

1. Close all processes
2. Open PowerShell in the project directory
3. Run:
   ```powershell
   cd "C:\Users\Ilhamov Akbar\Desktop\uchqun"
   Rename-Item -Path "super-admin" -NewName "admin"
   Rename-Item -Path "admin-panel" -NewName "reception"
   ```

## After Renaming

After successfully renaming the directories, you may need to:

1. **Update any configuration files** that reference the old directory names
2. **Restart your IDE** to refresh the workspace
3. **Update package.json scripts** if they reference the old paths
4. **Update any import paths** in code that reference these directories

## Verification

After renaming, verify the new structure:
```
uchqun/
├── admin/          (formerly super-admin)
├── reception/      (formerly admin-panel)
├── parents/
├── teacher/
└── backend/
```

## Notes

- The backend role names have already been updated (this is just for frontend directories)
- Make sure to update any build scripts or CI/CD configurations that reference the old names
- If you're using Git, you may need to handle the rename carefully to preserve history



