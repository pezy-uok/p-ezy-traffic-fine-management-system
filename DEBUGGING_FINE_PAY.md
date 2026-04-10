# Frontend Payment Integration - Debugging Guide

## Issue: Blank Page When Clicking Search

If you see a blank/black page after searching for a license number, follow these steps:

---

## Step 1: Verify Backend is Running

```bash
# In a terminal, check if backend health endpoint returns data
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Backend server is running"
}
```

If this fails, start the backend:
```bash
cd backend
npm run dev
```

---

## Step 2: Check Browser Console for Errors

1. Open DevTools: Press `F12`
2. Go to **Console** tab
3. Look for error messages
4. Look for log messages from our component:
   - `🔍 FinePayOutstanding Component Loaded`
   - `📍 Location State:`
   - `📋 Fines Data:`

**Common errors:**
- `Cannot read property 'fines'` → Data wasn't passed to component
- `API call failed` → Backend API is down or returned error
- `JSON parse error` → Malformed response from backend

---

## Step 3: Test License Numbers

Try these license numbers when searching (from seed data):

| License Number | Status |
|---|---|
| B7283912 | Should have unpaid fines |
| AB123456 | Test data (if seeded) |
| B1234567 | Test data (if seeded) |

If you get "No records found" error:
- The database might be empty
- Run the seed script: `npm run seed` (in backend folder)
- Check Supabase connection is working

---

## Step 4: Inspect Network Tab

1. Open DevTools: Press `F12`
2. Go to **Network** tab
3. Search for a license number
4. Look for the API request: `GET /api/public-fines/driver/{licenseNo}`

Check:
- **Status**: Should be 200 (OK)
- **Response**: Click on it and view JSON response in Response tab
- **Headers**: Check if response has proper Content-Type

**Expected response:**
```json
{
  "success": true,
  "driver": {
    "driver_id": "uuid",
    "driver_name": "John Doe",
    "license_number": "B7283912"
  },
  "fines": [
    {
      "id": "uuid",
      "reason": "Speeding",
      "amount": 2500,
      "status": "unpaid",
      "issue_date": "2024-03-15T00:00:00Z",
      "location": "Main Street"
    }
  ]
}
```

---

## Step 5: Verify Supabase Connection

Check if Supabase is properly configured:

```bash
# Test from backend
curl http://localhost:8000/api/health/supabase
```

Expected response:
```
✓ Supabase REST API connection successful
```

If it fails:
- Check `.env` file has correct SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
- Verify Supabase account is active
- Check if tables exist in Supabase console

---

## Step 6: Manual API Test

Test the API directly to isolate the issue:

```bash
# Test getting fines for license B7283912
curl "http://localhost:8000/api/public-fines/driver/B7283912"
```

Response should be JSON with driver and fines data.

---

## Step 7: Check Database Tables

Log into Supabase dashboard and verify:

1. **drivers** table exists with data
2. **fines** table exists with data
3. At least one fine has status = 'unpaid'
4. Fine has a driver_id matching a driver record

Sample SQL query to check:
```sql
-- Check drivers
SELECT id, license_number, first_name, last_name FROM drivers LIMIT 5;

-- Check fines
SELECT id, driver_id, amount, status, issue_date FROM fines LIMIT 10;

-- Check fines for specific license
SELECT f.* FROM fines f
JOIN drivers d ON f.driver_id = d.id
WHERE d.license_number = 'B7283912';
```

---

## Step 8: Seed Test Data

If no data exists, create test data:

```bash
# In backend folder
npm run seed
```

This will populate:
- Test drivers (with various licenses)
- Test fines (unpaid and paid)
- Test officers
- Related data

Check logs to confirm seeding succeeded.

---

## Step 9: Reload Frontend

After ensuring backend and data are correct:

1. **Refresh browser**: Ctrl+R (or Cmd+R on Mac)
2. **Clear cache**: Ctrl+Shift+Delete
3. **Close DevTools**: Press F12 again
4. **Retry**: Go to /fine-pay and search again

---

## FAQ & Troubleshooting

### Q: I see "No records found" error
**A:** 
- Either no fines exist for that license
- Or the license number format is wrong
- Try: B7283912 (format: B + 7 digits)

### Q: Page shows "No fines found" after navigation
**A:** 
- Backend returned an empty fines array
- This license has no unpaid fines
- Try a different license or check if fines are marked as paid

### Q: Page is still blank/black
**A:**
- Check console for JavaScript errors
- Clear browser cache
- Try incognito window (Ctrl+Shift+N)
- Restart both frontend and backend

### Q: API error 404
**A:**
- Driver not found for that license
- Check database has drivers with that license number
- Try running seed: `npm run seed`

### Q: API error 500
**A:**
- Backend error
- Check backend terminal for error logs
- Verify Supabase connection is working
- Check backend `.env` configuration

### Q: Fines load but "Pay Now" doesn't work
**A:**
- Check Payment API is implemented
- Check network tab for errors when clicking Pay Now
- Verify payment endpoint is working

---

## Debug Checklist

- [ ] Backend is running on port 8000
- [ ] Frontend is running on port 5173
- [ ] Browser console has no errors
- [ ] Network API response shows real data
- [ ] Database has test drivers and fines
- [ ] License number format is correct (e.g., B7283912)
- [ ] API response has fines array with data
- [ ] Page shows fines after search
- [ ] "Pay Now" button is visible
- [ ] Payment flow starts when clicked

---

## Still Having Issues?

1. **Collect logs:**
   - Browser console (F12)
   - Backend terminal output
   - Network tab responses

2. **Create a test case:**
   - Exact license number you used
   - Expected vs actual result
   - Error messages seen

3. **Check git status:**
   - Are files saved?
   - Did changes get compiled?

4. **Restart everything:**
   ```bash
   # Terminal 1
   cd backend && npm run dev

   # Terminal 2
   cd frontend && npm run dev

   # Browser
   http://localhost:5173/fine-pay
   ```

---
