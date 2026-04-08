# Payment API Documentation

Base URL: `/api/payments`

---

## Prerequisites — Getting an Access Token

The `/initiate` endpoint requires a valid JWT token. Use the existing auth endpoints to obtain one.

### Step 1 — Request OTP

```
POST http://localhost:5000/api/auth/request-otp
Content-Type: application/json

{
  "email": "admin@pezy.gov"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to +94711111111",
  "temporary_id": "otp_1712345678_abc123"
}
```

> The OTP code is **not in the response**. Check your **server terminal** for a box like:
> ```
> ║  OTP Code: 123456                         ║
> ```

Available test accounts:

| Email | Role |
|-------|------|
| `admin@pezy.gov` | admin |
| `officer.bandara@pezy.gov` | police_officer |
| `officer.silva@pezy.gov` | police_officer |

---

### Step 2 — Verify OTP and get token

```
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "temporary_id": "otp_1712345678_abc123",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": { ... }
}
```

> Copy the `accessToken` — you'll use it as `Authorization: Bearer <accessToken>` in payment requests.

---

## POST /api/payments/initiate

Initiates a payment for an unpaid fine. Creates a `pending` payment record in the database and returns a `webhook_hash` to simulate the gateway callback.

**Auth:** Required — `Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "fine_id": "uuid-of-the-fine",
  "payment_method": "credit_card"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `fine_id` | UUID | Yes | Must exist in `fines` table and be unpaid |
| `payment_method` | string | Yes | `cash`, `credit_card`, `debit_card`, `online` |

**Success Response `201`:**
```json
{
  "success": true,
  "payment": {
    "id": "payment-uuid",
    "fine_id": "fine-uuid",
    "amount": "1500.00",
    "payment_method": "credit_card",
    "status": "pending",
    "transaction_id": "TXN-1712345678901",
    "reference_number": "REF-54321",
    "created_at": "2026-04-07T05:00:00.000Z"
  },
  "webhook_hash": "abc123def456..."
}
```

> **Note:** Save `transaction_id` and `webhook_hash` from this response — you need them to call the webhook endpoint.

**Error Responses:**

| Status | Message |
|--------|---------|
| 400 | `fine_id and payment_method are required` |
| 400 | `payment_method must be one of: cash, credit_card, debit_card, online` |
| 400 | `This fine has already been paid` |
| 401 | Invalid or missing token |
| 404 | `Fine not found` |

---

## POST /api/payments/webhook

Simulates the payment gateway callback. Verifies the request using an HMAC-SHA256 hash, then updates the payment and fine status.

**Auth:** None (public endpoint, verified by hash)

**Request Body:**
```json
{
  "transaction_id": "TXN-1712345678901",
  "status": "completed",
  "hash": "abc123def456..."
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `transaction_id` | string | Yes | From `/initiate` response |
| `status` | string | Yes | `completed` or `failed` |
| `hash` | string | Yes | From `/initiate` response (`webhook_hash`) |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Payment completed successfully processed"
}
```

**What happens internally:**
- `completed` → payment status set to `completed`, fine status set to `paid`
- `failed` → payment status set to `failed`, fine remains unchanged

**Error Responses:**

| Status | Message |
|--------|---------|
| 400 | `transaction_id, status, and hash are required` |
| 400 | `status must be one of: completed, failed` |
| 400 | `Payment is already completed/failed` |
| 401 | `Invalid webhook hash — request could not be verified` |
| 404 | `Payment not found for this transaction_id` |

---

## Testing Flow (Postman)

### Step 1 — Get access token
```
POST /api/auth/request-otp
Body: { "email": "admin@pezy.gov" }
→ Copy temporary_id, check server terminal for OTP code

POST /api/auth/verify-otp
Body: { "temporary_id": "...", "otp": "123456" }
→ Copy accessToken
```

### Step 2 — Initiate payment
```
POST /api/payments/initiate
Authorization: Bearer <accessToken>
Body: { "fine_id": "<uuid>", "payment_method": "credit_card" }
→ Copy transaction_id and webhook_hash
```

### Step 3 — Simulate gateway callback
```
POST /api/payments/webhook
Body: {
  "transaction_id": "TXN-...",
  "status": "completed",
  "hash": "<webhook_hash from step 2>"
}
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WEBHOOK_SECRET` | Secret key used for HMAC hash generation | `mock_webhook_secret` |

> Set `WEBHOOK_SECRET` in your `.env` file. All team members must use the same value or hash verification will fail across environments.
