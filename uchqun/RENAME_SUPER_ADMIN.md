# Rename super-admin to admin

## Issue
The `super-admin` folder cannot be renamed automatically because it's currently in use by another process (likely your IDE or a dev server).

## Solution

### Option 1: Manual Rename (Easiest)
1. **Close Cursor/VS Code** or close the workspace
2. **Stop any running dev servers** in the `super-admin` folder
3. **Open Windows Explorer**
4. Navigate to: `C:\Users\Ilhamov Akbar\Desktop\uchqun`
5. **Right-click** the `super-admin` folder
6. Select **Rename**
7. Type: `admin`
8. Press **Enter**

### Option 2: Command Line (After Closing Processes)
1. Close all processes using the folder
2. Open PowerShell
3. Run:
   ```powershell
   cd "C:\Users\Ilhamov Akbar\Desktop\uchqun"
   Rename-Item -Path "super-admin" -NewName "admin"
   ```

### Option 3: Use the Script
1. Close all processes
2. Run:
   ```powershell
   cd "C:\Users\Ilhamov Akbar\Desktop\uchqun"
   .\rename-directories.ps1
   ```

## After Renaming

After successfully renaming, you may need to:
- Restart your IDE to refresh the workspace
- Update any configuration files that reference `super-admin`
- Update import paths in code if they reference the old folder name

## Verification

After renaming, you should have:
```
uchqun/
├── admin/          (formerly super-admin) ✅
├── admin-panel/    (to be renamed to reception)
├── backend/
├── parents/
└── teacher/
```



