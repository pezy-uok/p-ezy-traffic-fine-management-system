# 🧪 PEZY Backend Authentication Test Suite

Complete test coverage for OTP-based JWT authentication using real project seed data.

## 📋 Overview

This test suite validates the complete OTP → JWT authentication flow for the PEZY backend:

- **Request OTP**: Police officers and admins request one-time passwords
- **Verify OTP**: Valid OTP codes return JWT tokens and mark users as online
- **Logout**: Users can log out and get marked as offline
- **JWT Validation**: Tokens contain correct user data and expiry information

## 🎯 Test Files

### 1. `testAuthWithSeedData.js` - Initial Validation
**Purpose**: Validate that test users exist and OTP system works

**Runs**:
```bash
npm run test:auth
# or
node testAuthWithSeedData.js
```

**What it tests**:
- ✓ Server connectivity (backend running)
- ✓ All seed users defined correctly
- ✓ Invalid users are rejected (security check)
- ✓ Admin can request OTP
- ✓ All officers can request OTP
- ✓ OTP temporary IDs are generated

**Output**: Colored console output showing pass/fail for each test.

**Requires**: 
- Backend running (`npm run dev`)
- Database seeded with users (`npm run seed`)

---

### 2. `testCompleteAuthFlow.js` - Interactive End-to-End Test
**Purpose**: Test the complete authentication flow with real OTP codes

**Runs**:
```bash
npm run test:auth:flow
# or
node testCompleteAuthFlow.js
```

**What it does**:
1. Prompts you to select a test account from 4 options
2. Requests OTP for selected user
3. Asks you to manually enter the OTP (from backend console)
4. Verifies OTP and receives JWT token
5. Decodes JWT and displays payload
6. Tests logout endpoint
7. Shows complete summary with all details

**Interactive prompts**:
```
1. Admin - admin@pezy.gov
2. Officer 1 - officer.bandara@pezy.gov
3. Officer 2 - officer.silva@pezy.gov
4. Officer 3 - officer.fernando@pezy.gov

Select account (1-4): _
Enter the 6-digit OTP code: _
```

**Output**: Full JWT structure, payload, token expiry, and test results.

**Requires**: 
- Backend running (`npm run dev`)
- Database seeded with users (`npm run seed`)
- Manual OTP input from backend logs

---

### 3. `SEED_AND_TEST_GUIDE.md` - Complete Documentation
**Purpose**: Comprehensive guide for seeding database and testing

**Contains**:
- Database seeding instructions
- Complete test data reference tables
- Troubleshooting guide
- API endpoint documentation
- Quick start checklist

---

## 🚀 Quick Start

### Step 1: Start Backend Server
```bash
cd backend
npm run dev
```
Expected output:
```
Server running on port 3001 🚀
```

### Step 2: Seed Database
```bash
npm run seed
```
Expected output:
```
✓ Database seeding completed successfully! 📊
✓ Total records inserted:
  - Users: 4 (1 Admin + 3 Officers)
  - Drivers: 4
  - Criminals: 3
  - Fines: 4
  - Warnings: 3
```

### Step 3: Validate Seed Data
```bash
npm run test:auth
```
Expected results: All tests should ✓ pass

### Step 4: Test Complete Flow
```bash
npm run test:auth:flow
```
Follow the interactive prompts to test OTP → JWT → Logout.

---

## 📊 Test Data Reference

### Users (4 Total)

| Email | Role | Phone | Badge |
|-------|------|-------|-------|
| `admin@pezy.gov` | Admin | +94711111111 | ADM-001 |
| `officer.bandara@pezy.gov` | Police Officer | +94772222222 | PO-7721 |
| `officer.silva@pezy.gov` | Police Officer | +94773333333 | PO-7722 |
| `officer.fernando@pezy.gov` | Police Officer | +94774444444 | PO-7723 |

### Drivers (4 Total)

| License | Name | Vehicle | Violations |
|---------|------|---------|-----------|
| B1234567 | Kamal Perera | CAB-1234 | 1 (OUTDATED) |
| B1234568 | Anura Jayasundara | CAB-1235 | 2 |
| B1234569 | Nishantha Gunawardana | CAB-1236 | 1 (3000 LKR) |
| B1234570 | Priya Wijesinghe | CAB-1237 | 0 (1 PAID) |

### Fines (4 Total)

| Amount | Reason | Status | Driver |
|--------|--------|--------|--------|
| 2500 LKR | Over-speeding | OUTDATED | Kamal Perera |
| 1500 LKR | No seat belt | UNPAID | Anura Jayasundara |
| 3000 LKR | Rash driving | OUTDATED | Nishantha G. |
| 2000 LKR | Traffic light | PAID | Priya Wijesinghe |

---

## 🔑 Test Credentials

**All passwords**: `password123`

Use any of the user emails above for testing.

---

## 📝 API Endpoints Summary

### Request OTP
```
POST /api/auth/request-otp

Request:
{
  "email": "officer.bandara@pezy.gov"
}

Response:
{
  "success": true,
  "temporary_id": "otp_1234567890_abc123..."
}
```

### Verify OTP
```
POST /api/auth/verify-otp

Request:
{
  "temporary_id": "otp_1234567890_abc123...",
  "otp": "123456"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "00000000-0000-0000-0000-000000000002",
    "email": "officer.bandara@pezy.gov",
    "name": "Officer Shashmitha Bandara",
    "role": "police_officer",
    "badge_number": "PO-7721",
    "department": "Traffic",
    "is_online": true,
    "last_login_at": "2026-03-30T14:32:00.000Z"
  }
}
```

### Logout
```
POST /api/auth/logout

Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Body:
{
  "user_id": "00000000-0000-0000-0000-000000000002"
}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🐛 Troubleshooting

### "Email not found in system" after running test:auth
**Cause**: Database hasn't been seeded yet
**Solution**: 
```bash
npm run seed
```

### "Backend server not responding"
**Cause**: Backend not running
**Solution**:
```bash
npm run dev
```

### "Invalid OTP" in test:auth:flow
**Cause**: OTP expired or incorrect code
**Details**: OTP is valid for 5 minutes, max 3 attempts
**Solution**: Re-run and enter code quickly

### "No OTP shown in logs"
**Cause**: Backend console not visible
**Solution**: Check the terminal where `npm run dev` is running

---

## ✨ Test Coverage

- [x] Server connectivity validation
- [x] Seed data structure validation
- [x] Invalid user rejection (security)
- [x] OTP generation for admin
- [x] OTP generation for all officers
- [x] Temporary ID creation
- [x] OTP verification
- [x] JWT token generation
- [x] JWT payload validation
- [x] Token expiry (15 minutes)
- [x] User online status tracking
- [x] Logout functionality
- [x] Role-based access control

---

## 🔗 Related Files

- **Seed Data**: `src/database/seedData.js`
- **OTP Logic**: `src/controllers/authController.js`
- **JWT Utils**: `src/utils/jwtUtils.js`
- **Routes**: `src/routes/authRoutes.js`
- **Database Config**: `src/config/supabaseClient.js`

---

## 📚 Commands Cheat Sheet

```bash
# Development
npm run dev              # Start backend with hot reload

# Database
npm run seed            # Insert test data
npm run seed:clear      # Remove test data
npm run seed:reset      # Clear and re-seed

# Testing
npm run test:auth       # Validate seed data and OTP requests
npm run test:auth:flow  # Interactive complete auth flow test

# Code Quality
npm run lint            # Check code style
npm run lint:fix        # Fix linting issues
npm run format          # Format code with prettier
```

---

## ✅ Final Validation Checklist

After running all tests:

- [ ] `npm run dev` starts backend on port 3001
- [ ] `npm run seed` inserts 4 users, 4 drivers, 3 criminals, 4 fines
- [ ] `npm run test:auth` shows all users can request OTP
- [ ] `npm run test:auth:flow` completes full authentication
- [ ] JWT token is valid and contains user data
- [ ] Token expires in 15 minutes
- [ ] Logout marks user as offline
- [ ] Database fields update correctly (`is_online`, `last_login_at`, `last_logout_at`)

---

## 🎓 Learning Outcomes

By using this test suite you'll understand:

1. **OTP Authentication**: How temporary codes provide secure login
2. **JWT Tokens**: Structure, payload, expiry, and usage
3. **Database Seeding**: Populating test data for development
4. **API Testing**: Making HTTP requests and validating responses
5. **Role-Based Access**: Different access levels for admin vs officers
6. **User Tracking**: Monitoring online/offline status

---

## 📞 Support

If tests fail:

1. Check backend console for error messages
2. Verify database connection in `.env`
3. Ensure all seed data was inserted: Check Supabase dashboard
4. Review SEED_AND_TEST_GUIDE.md for detailed troubleshooting

---

**Last Updated**: March 30, 2026
**Backend Version**: 1.0.0
**Test Suite Version**: 1.0.0
