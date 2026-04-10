# PEZY-475: Pay Now & PayHere Checkout Integration Guide

## Overview

This document describes the implementation of the "Pay Now" button and PayHere checkout integration for the P-EZY Traffic Fine Management System.

**Ticket:** PEZY-475  
**Page:** Web | FinePay | Fine Pay Outstanding  
**Feature:** Implement Pay Now and PayHere checkout integration

---

## What Was Implemented

### Frontend Changes

#### 1. Payment API Endpoints (`frontend/src/api/index.ts`)
Added `paymentAPI` object with three endpoints:

```typescript
export const paymentAPI = {
  // Initiate payment - POST to /api/payments/initiate
  initiatePayment: (payload: { fineIds: string[]; licenseNo: string }) =>
    axiosInstance.post<{
      success: boolean
      orderId: string
      total: string
      currency: string
      fineCount: number
      driver: { licenseNo: string; name: string; email: string; phone: string }
      checkoutParams: any
    }>('/payments/initiate', payload),

  // Simulate payment gateway callback (for testing)
  simulateWebhook: (payload: { transaction_id: string; status: 'completed' | 'failed'; hash: string }) =>
    axiosInstance.post<{ success: boolean; message: string }>('/payments/webhook', payload),

  // Get payment status
  getPaymentStatus: (orderId: string) =>
    axiosInstance.get<{ success: boolean; data: { orderId: string; status: string; amount: string; paymentMethod: string; fineIds: string[] } }>(`/payments/${orderId}`),
}
```

#### 2. FinePayOutstanding Component (`frontend/src/pages/FinePayOutstanding.tsx`)
Updated the component with:

**Added State:**
- `isProcessing` - Track payment processing state
- `paymentError` - Store error messages

**Updated handlePayNow function:**
```typescript
const handlePayNow = async () => {
  // 1. Validate selection
  // 2. Call POST /api/payments/initiate with selected fineIds and licenseNo
  // 3. Receive checkoutParams from backend
  // 4. Load PayHere script using loadPayHereScript()
  // 5. Call payhere.startPayment(checkoutParams)
  // 6. Handle callbacks:
  //    - onCompleted: Navigate to success page
  //    - onDismissed: Show cancellation message
  //    - onError: Show error message
}
```

**Error Handling:**
- HTTP errors (400, 403, 404, 500) mapped to user-friendly messages
- PayHere loading errors with specific diagnostics
- Multi-line error messages with retry button for PayHere failures

**UI Updates:**
- "Pay Now" button disabled while processing
- Button text shows "Processing Payment..." during transaction
- Error message display with styling
- Retry button for PayHere failures

#### 3. Error Styling (`frontend/src/pages/FinePayOutstanding.css`)
Added CSS for error message display:
- Red error box with left border accent
- Icon indicator
- Slide-in animation
- Retry button styling

---

## Complete Payment Flow

### Step 1: User Selects Fines
1. Driver views outstanding fines on `/fine-pay/outstanding`
2. Selects specific fines to pay
3. Clicks "Pay Now" button

### Step 2: Initiate Payment (Frontend → Backend)
**Request:**
```
POST /api/payments/initiate
{
  "fineIds": ["uuid-1", "uuid-2"],
  "licenseNo": "B1234567"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "orderId": "PEZY-1712345678901-AB12CD",
  "total": "5000.00",
  "currency": "LKR",
  "fineCount": 2,
  "driver": {
    "licenseNo": "B1234567",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+94771234567"
  },
  "checkoutParams": {
    "sandbox": true,
    "merchant_id": "TESTMERCHANT123",
    "order_id": "PEZY-1712345678901-AB12CD",
    "items": "Speeding | No helmet",
    "amount": "5000.00",
    "currency": "LKR",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+94771234567",
    "hash": "ABCDEF123456...",
    "return_url": "http://localhost:5173/fine-pay/success",
    "cancel_url": "http://localhost:5173/fine-pay",
    "notify_url": "http://localhost:8000/api/payments/webhook"
  }
}
```

### Step 3: Load PayHere & Open Modal
1. Frontend loads PayHere JS SDK from CDN
2. Calls `payhere.startPayment(checkoutParams)`
3. PayHere modal opens

### Step 4: User Completes Payment
User enters card details in PayHere modal and completes payment.

### Step 5: PayHere Notifies Backend
PayHere sends webhook to `/api/payments/webhook`:
```
POST /api/payments/webhook
{
  "merchant_id": "TESTMERCHANT123",
  "order_id": "PEZY-1712345678901-AB12CD",
  "payment_id": "PAY-XXXX-1234",
  "payhere_amount": "5000.00",
  "payhere_currency": "LKR",
  "status_code": "2",
  "md5sig": "SIGNATURE...",
  "custom_1": "uuid-1,uuid-2",
  "custom_2": "B1234567"
}
```

Backend:
- Validates webhook signature
- Updates `payments` table: status = `completed`
- Updates `fines` table: status = `paid`

### Step 6: Frontend Updates
- PayHere modal closes
- Frontend navigates to `/fine-pay/success`
- Success page displays payment confirmation with:
  - Order ID
  - Amount paid
  - Number of fines paid
  - Fines details

---

## Testing the Payment Flow

### Prerequisites
1. Backend running on port 8000
2. Frontend running on port 5173
3. Supabase configured with test data

### Test Data
From `backend/database/seed.sql`:
- **License:** `B7283912`
- **Driver:** John Doe
- **Unpaid Fines:**
  - Fine 1: `33333333-3333-3333-3333-333333333331` - 2500 LKR
  - Fine 2: `33333333-3333-3333-3333-333333333332` - 2500 LKR

### Manual Testing Steps

#### Step 1: Navigate to Fine Pay Outstanding
```
1. Go to http://localhost:5173
2. Click "Pay Outstanding Fines"
3. Enter license: B7283912
4. Click Search
```

#### Step 2: Select Fines
```
1. Both fines should appear
2. Select both fines
3. Total should be 5000 LKR
```

#### Step 3: Click Pay Now
```
1. Click "Pay Now" button
2. Observe POST /api/payments/initiate call in Network tab
3. PayHere modal should open (sandbox mode)
```

#### Step 4: Complete Test Payment
```
1. In PayHere modal, select "Credit Card / Debit Card"
2. Use test card: 4111 1111 1111 1111
3. Future date, any CVV
4. Enter name and email
5. Click "complete"
```

#### Step 5: Verify Success
```
1. Success page displays
2. Order ID shown
3. Amount displays as 5000 LKR
4. 2 fines paid
```

#### Step 6: Verify Database
```sql
-- Check payments table
SELECT status, transaction_id, reference_number FROM payments 
WHERE reference_number LIKE 'PEZY-%';

-- Check fines table
SELECT id, status, payment_method, payment_date FROM fines 
WHERE id IN ('33333333-3333-3333-3333-333333333331', 
             '33333333-3333-3333-3333-333333333332');
```

Expected:
- `payments.status = 'completed'`
- `fines.status = 'paid'`
- Both have today's date in `payment_date`

---

## Error Scenarios & Handling

### Scenario 1: PayHere CDN Not Accessible
**Error Display:**
```
PayHere payment gateway is unavailable.

This could be due to:
• Network or firewall blocking payhere.lk domain
• PayHere service temporarily unavailable  
• DNS resolution issues

Try:
1. Check your internet connection
2. Disable VPN if enabled
3. Check firewall/network settings
4. Visit /diagnostics to test connectivity

[Retry Payment] button
```

**Solution:**
- User clicks "Retry Payment"
- Navigate to `/diagnostics` to test network
- Check firewall/VPN settings

### Scenario 2: Fine Already Paid
**Error Response (400):**
```json
{
  "message": "The following fines are not payable: uuid (paid)"
}
```

**Display:**
```
Invalid payment request - fines may already be paid
```

### Scenario 3: Fine Doesn't Exist
**Error Response (404):**
```json
{
  "message": "No fines found for the provided IDs"
}
```

**Display:**
```
One or more fines were not found. Please try again.
```

### Scenario 4: Fine Belongs to Different License
**Error Response (403):**
```json
{
  "message": "One or more fines do not belong to the given license number"
}
```

**Display:**
```
One or more fines do not belong to this license
```

### Scenario 5: Network Error
**Error Display:**
```
Network error. Please check your connection.
```

---

## Configuration & Environment

### Frontend Configuration
**File:** `frontend/src/api/axiosInstance.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
```

Default: `http://localhost:8000/api`

### Backend Configuration
**File:** `backend/.env`

```env
PORT=8000
PAYHERE_MERCHANT_ID=TESTMERCHANT123
PAYHERE_MERCHANT_SECRET=TESTSECRET123
PAYHERE_SANDBOX=true
PAYHERE_RETURN_URL=http://localhost:5173/fine-pay/success
PAYHERE_CANCEL_URL=http://localhost:5173/fine-pay
PAYHERE_NOTIFY_URL=http://localhost:8000/api/payments/webhook

SUPABASE_URL=https://xscovlmarporellzhsmw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Files Modified/Created

### Frontend
- ✅ `frontend/src/api/index.ts` - Added payment API endpoints
- ✅ `frontend/src/pages/FinePayOutstanding.tsx` - Implemented payment flow
- ✅ `frontend/src/pages/FinePayOutstanding.css` - Added error styling
- ✅ `frontend/src/utils/payHereUtils.ts` - PayHere script loading (existing)
- ✅ `frontend/src/utils/diagnostics.ts` - Network diagnostics (existing)

### Backend (Already Implemented)
- ✅ `backend/src/routes/paymentRoutes.js`
- ✅ `backend/src/controllers/paymentController.js`
- ✅ `backend/src/services/paymentService.js`

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/TypeScript)               │
│                                                               │
│  FinePayOutstanding.tsx                                       │
│  ├─ User selects fines                                       │
│  ├─ Click "Pay Now"                                          │
│  └─ handlePayNow() function                                  │
│     ├─ POST /api/payments/initiate                           │
│     ├─ Load PayHere SDK                                      │
│     ├─ Call payhere.startPayment(checkoutParams)             │
│     └─ Handle callbacks (success/cancel/error)               │
│                                                               │
└─────────────────────────────┬───────────────────────────────┘
                              │
                    HTTP/REST API (Port 8000)
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                  Backend (Node.js/Express)                   │
│                                                               │
│  POST /api/payments/initiate                                 │
│  ├─ Validate fines & driver (paymentService)                │
│  ├─ Calculate total amount                                   │
│  ├─ Generate PayHere checkout hash                           │
│  ├─ Create pending payment records                           │
│  └─ Return checkoutParams                                    │
│                                                               │
│  POST /api/payments/webhook                                  │
│  ├─ Verify PayHere signature                                 │
│  ├─ Update payment status to completed                       │
│  ├─ Update fines status to paid                              │
│  └─ Return success                                           │
│                                                               │
└─────────────────────────────┬───────────────────────────────┘
                              │
                    SQL Queries (Supabase)
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                  Database (PostgreSQL)                       │
│                                                               │
│  Tables:                                                     │
│  ├─ drivers                                                  │
│  ├─ fines (status, payment_date, payment_method)             │
│  └─ payments (status, reference_number, transaction_id)      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Code Examples

### Calling Payment Initiation (Frontend)
```typescript
const response = await paymentAPI.initiatePayment({
  fineIds: ['uuid-1', 'uuid-2'],
  licenseNo: 'B1234567',
})

console.log('Order ID:', response.data.orderId)
console.log('Checkout Params:', response.data.checkoutParams)
```

### Handling Payment Callbacks
```typescript
await startPayHerePayment(
  checkoutParams,
  // Success callback
  (paymentId: string) => {
    navigate('/fine-pay/success', { state: { orderId, paymentId } })
  },
  // Dismissed callback
  () => {
    setPaymentError('Payment was cancelled')
  },
  // Error callback
  (error: string) => {
    setPaymentError(`Payment error: ${error}`)
  },
)
```

---

## Verification Checklist

- [ ] Backend `/api/payments/initiate` endpoint working
- [ ] Backend generates correct PayHere hash
- [ ] Frontend calls payment API with correct fineIds
- [ ] PayHere SDK loads successfully
- [ ] PayHere modal opens with correct amount
- [ ] Payment completed webhook received
- [ ] Database updates: fines marked as paid
- [ ] Success page displays order confirmation
- [ ] Error handling works for all scenarios
- [ ] Retry button appears for PayHere failures

---

## Next Steps (Future Enhancements)

1. **Real PayHere Credentials** - Switch to live merchant account
2. **Email Notifications** - Send payment receipts to driver
3. **SMS Notifications** - Send payment confirmation SMS
4. **Receipt Generation** - Create downloadable PDF receipts
5. **Payment History** - Show previous payments on dashboard
6. **Partial Payments** - Allow paying individual fines
7. **Payment Plans** - Support installment payments
8. **Multiple Payment Methods** - Support other gateways

---

## Support & Troubleshooting

### Payment Fails to Initiate
1. Check backend is running: `curl http://localhost:8000/api/health`
2. Check fine data exists in database
3. Verify fines are still unpaid
4. Check backend logs for detailed errors

### PayHere Modal Doesn't Open
1. Check browser console (F12) for errors
2. Visit `/diagnostics` to test PayHere CDN accessibility
3. Check if VPN is blocking payhere.lk domain
4. Try from different network (mobile hotspot)

### Payment Completes But Fine Not Marked Paid
1. Check webhook URL in `.env` (should be `http://localhost:8000/api/payments/webhook`)
2. Check backend logs for webhook receipt
3. Verify webhook signature validation passes
4. Check database directly for payment record

### Database Not Updating
1. Verify Supabase connection: `curl http://localhost:8000/api/health/supabase`
2. Check if user has permission to update fines table
3. Verify fine IDs are correct UUIDs
4. Check Supabase RLS (Row Level Security) policies

---

**Last Updated:** April 10, 2026  
**Version:** 1.0  
**Status:** ✅ Implementation Complete
