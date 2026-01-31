# Troubleshooting PostgreSQL Connection

## Error: Password authentication failed (28P01)

This error means PostgreSQL is rejecting the password in your `.env` file.

### Solution 1: Update .env with correct password

1. Open `backend/.env`
2. Find the line: `DB_PASSWORD=postgres`
3. Replace `postgres` with your actual PostgreSQL password
4. Save the file
5. Test connection: `node scripts/test-connection.js`

### Solution 2: Reset PostgreSQL password to "postgres"

If you want to use the default password "postgres":

**Using psql:**
```bash
psql -U postgres
ALTER USER postgres WITH PASSWORD 'postgres';
\q
```

**Using pgAdmin:**
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Login/Group Roles" → "postgres" → "Properties"
4. Go to "Definition" tab
5. Set password to "postgres"
6. Click "Save"

### Solution 3: Find your PostgreSQL password

- Check your PostgreSQL installation notes
- Check if you set it during installation
- Check Windows Credential Manager for stored passwords
- If installed via installer, password might be in installation logs

### Solution 4: Use a different PostgreSQL user

If you have another PostgreSQL user with known password:

1. Open `backend/.env`
2. Update:
   ```
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```

## Test Connection

Run the test script to verify your connection:
```bash
node scripts/test-connection.js
```

## Create Database

If database doesn't exist:
```bash
createdb uchqun
```

Or using psql:
```bash
psql -U postgres
CREATE DATABASE uchqun;
\q
```

## Common Issues

### PostgreSQL not running
- Check: `Get-Service -Name "*postgres*"`
- Start: `Start-Service postgresql-x64-18`

### Port 5432 not accessible
- Check firewall settings
- Verify PostgreSQL is listening on port 5432

### Database doesn't exist
- Error code: `3D000`
- Solution: Create database (see above)



