# PEZY Payment Integration - Quick Start

## Status
**Issue:** Blank/black page when searching for fines on `/fine-pay/outstanding`

**Root Cause:** Database likely doesn't have test data. No fines are being returned even though the API is working.

**Solution:** Seed database with test data and verify connection.

---

## Step-by-Step Fix (5 minutes)

### 1️⃣ Seed Database (Creates test data)

**In a NEW terminal window:**

```bash
cd backend
npm run seed
```

**Expected output:**
```
✅ Seeding database...
✅ Creating tables...
✅ Inserting test data...
✅ Database seeded successfully!
```

**What gets created:**
- Driver: `B7283912` (Kamal Gunaratne) 
- Driver: `B1122334` (Sunil Fernando)
- Fine: 2500 LKR (Speeding - unpaid)
- Fine: 1500 LKR (Illegal Parking - paid)
- Plus admin and officer users

---

### 2️⃣ Verify Backend is Running

**Backend should be running in a terminal. If not:**

```bash
cd backend
npm run dev
```

**Test connection:**
```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Backend server is running"
}
```

---

### 3️⃣ Verify Frontend is Running

**Frontend should be running in a terminal. If not:**

```bash
cd frontend
npm run dev
```

Should see:
```
Local:   http://localhost:5173/
```

---

### 4️⃣ Test the Complete Flow

**In browser console (F12), run:**

```javascript
testPaymentFlow()
```

This will test:
- ✅ Backend connection
- ✅ Database connection
- ✅ Test driver data
- ✅ Payment API
- ✅ PayHere CDN

**Expected output:** All tests PASS (green checkmarks)

---

### 5️⃣ Try the Payment Flow

1. Go to: `http://localhost:5173/fine-pay`
2. Enter: `B7283912`
3. Click: Search
4. Should see: Fines list with 1 unpaid fine (2500 LKR)

**If still blank:**
- Check browser console (F12) for errors
- Check Network tab for API response
- Run `testPaymentFlow()` again to diagnose

---

## Troubleshooting

### Symptom: "No records found" error
**Cause:** Bad license number entered  
**Fix:** Try `B7283912` from seed data

### Symptom: Page is still blank
**Cause:** Database still empty or API not working  
**Fix:** Run `npm run seed` and restart backend

### Symptom: API returns 500 error
**Cause:** Backend crashed or database connection issue  
**Fix:**
```bash
# Check backend terminal for errors
# Verify .env has correct database credentials
# Restart backend: npm run dev
```

### Symptom: PayHere failing to load
**Cause:** Network blocking payhere.lk  
**Fix:**
- Check internet connection
- Disable VPN
- Check firewall settings
- Run `/diagnostics` page to test

---

## Testing Licenses (from seed)

| License | Driver | Fine | Status |
|---------|--------|------|--------|
| B7283912 | Kamal Gunaratne | 2500 LKR | Unpaid ✓ |
| B1122334 | Sunil Fernando | 1500 LKR | Paid |

Use `B7283912` for testing payments (has unpaid fine).

---

## Reset Database

If something goes wrong, reset to clean state:

```bash
# Clear all test data
cd backend
npm run seed:clear

# Or reset completely (clear + reseed)
npm run seed:reset
```

---

## Full Payment Test Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Database seeded (`npm run seed`)
- [ ] `testPaymentFlow()` shows all ✅
- [ ] Can search for license B7283912
- [ ] Fines display on page
- [ ] "Pay Now" button works
- [ ] PayHere modal opens (if credentials configured)
- [ ] Payment gateway responds

---

## Next: Production Deployment

Once testing is complete:

1. **PayHere Production Credentials**
   - Replace TESTMERCHANT123 with real merchant ID
   - Replace TESTSECRET123 with real secret
   - Update in backend/.env and payment service

2. **Database Setup**
   - Remove seed data from production
   - Set up real driver data from traffic authority

3. **Deployment**
   - Deploy backend to production server
   - Deploy frontend to static hosting
   - Configure SSL certificates
   - Test with real PayHere account

---

## Support Commands

```bash
# Seed test data
cd backend && npm run seed

# Clear database
cd backend && npm run seed:clear

# Reset database
cd backend && npm run seed:reset

# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# View backend logs
# Check terminal where backend is running
```

---

## Quick Reference

```
Frontend:     http://localhost:5173
Backend API:  http://localhost:8000/api
Payment page: http://localhost:5173/fine-pay
Test utility: Open console and run: testPaymentFlow()
Diagnostics:  http://localhost:5173/diagnostics
```

---

**Still stuck?** Follow DEBUGGING_FINE_PAY.md for detailed troubleshooting.
