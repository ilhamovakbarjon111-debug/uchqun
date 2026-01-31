# Fix PostgreSQL Password - Step by Step Guide

## The Problem
Your `.env` file has `DB_PASSWORD=postgres`, but your PostgreSQL server is rejecting this password.

## Solution Options

### Option 1: Use pgAdmin (Easiest - Recommended)

1. **Open pgAdmin** (usually in Start Menu or Desktop)

2. **Connect to PostgreSQL Server:**
   - If you see a server already listed, double-click it
   - If it asks for a password, try:
     - Your Windows password
     - Empty password (just press Enter)
     - The password you set during PostgreSQL installation

3. **Reset the Password:**
   - In the left panel, expand: **Servers** → Your Server → **Login/Group Roles**
   - Right-click on **postgres** → **Properties**
   - Go to **Definition** tab
   - In the **Password** field, enter: `postgres`
   - In the **Password (again)** field, enter: `postgres` again
   - Click **Save**

4. **Test the connection:**
   ```bash
   npm run test:db
   ```

### Option 2: Use psql Command Line

1. **Find psql location:**
   - Usually at: `C:\Program Files\PostgreSQL\18\bin\psql.exe`
   - Or search for "psql" in Start Menu

2. **Open PowerShell or Command Prompt**

3. **Navigate to psql directory** (if not in PATH):
   ```powershell
   cd "C:\Program Files\PostgreSQL\18\bin"
   ```

4. **Reset password:**
   ```powershell
   .\psql.exe -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
   ```
   
   - If it asks for password, try:
     - Press Enter (empty)
     - Your Windows password
     - The password you remember setting

5. **Test the connection:**
   ```bash
   cd C:\Users\Ilhamov Akbar\Desktop\uchqun\backend
   npm run test:db
   ```

### Option 3: Update .env with Your Actual Password

If you know your PostgreSQL password:

1. **Open** `backend/.env` file

2. **Find this line:**
   ```
   DB_PASSWORD=postgres
   ```

3. **Replace** `postgres` with your actual password:
   ```
   DB_PASSWORD=your_actual_password_here
   ```

4. **Save** the file

5. **Test:**
   ```bash
   npm run test:db
   ```

## After Password is Fixed

Once `npm run test:db` shows ✅ Connection successful:

1. **Create the database:**
   ```bash
   createdb uchqun
   ```
   Or if that doesn't work:
   ```bash
   psql -U postgres -c "CREATE DATABASE uchqun;"
   ```

2. **Seed the database:**
   ```bash
   npm run seed
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

## Still Having Issues?

- Check if PostgreSQL service is running: `Get-Service postgresql*`
- Try connecting with pgAdmin first to verify your password
- Check Windows Credential Manager for stored PostgreSQL passwords
- Review PostgreSQL installation logs for the password you set



