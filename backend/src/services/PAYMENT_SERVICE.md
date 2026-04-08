# Payment Service Documentation

File: `src/services/paymentService.js`

---

## Overview

`paymentService.js` handles the business logic for initiating a PayHere payment. It validates fines, fetches driver details, calculates the total, and returns ready-to-use PayHere checkout parameters.

---

## Function: `initiatePayment(fineIds, licenseNo)`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fineIds` | `string[]` | Yes | Array of fine UUIDs to be paid |
| `licenseNo` | `string` | Yes | Driver's license number |

### Returns

```json
{
  "orderId": "PEZY-1712345678901-AB12CD",
  "total": "4000.00",
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
    "merchant_id": "...",
    "return_url": "...",
    "cancel_url": "...",
    "notify_url": "...",
    "order_id": "PEZY-1712345678901-AB12CD",
    "items": "Speeding | No helmet",
    "amount": "4000.00",
    "currency": "LKR",
    "hash": "ABCDEF123456...",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+94771234567",
    "custom_1": "fine-uuid-1,fine-uuid-2",
    "custom_2": "B1234567"
  }
}
```

> `checkoutParams` is the object to pass directly to the PayHere payment form or SDK.

### Validation Logic (in order)

| Step | Check | Error |
|------|-------|-------|
| 1 | `fineIds` is a non-empty array | `400` |
| 2 | `licenseNo` is provided | `400` |
| 3 | Driver exists in `drivers` table | `404` |
| 4 | All fine IDs exist in `fines` table | `404` — lists missing IDs |
| 5 | All fines belong to the driver | `403` |
| 6 | All fines have status `unpaid` | `400` — lists non-payable IDs with their status |

### PayHere Hash Formula

```
MD5( merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase() ).toUpperCase()
```

Amount is always formatted to 2 decimal places (e.g. `4000.00`).

---

## How to Use (from a controller)

```javascript
import { initiatePayment } from '../services/paymentService.js';

export const initiatePaymentHandler = async (req, res, next) => {
  try {
    const { fineIds, licenseNo } = req.body;
    const result = await initiatePayment(fineIds, licenseNo);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    next(error);
  }
};
```

---

## Environment Variables

All variables must be set in `.env` before using this service.

| Variable | Description | Example |
|----------|-------------|---------|
| `PAYHERE_MERCHANT_ID` | PayHere merchant ID | `1234567` |
| `PAYHERE_MERCHANT_SECRET` | PayHere merchant secret for hash generation | `AbCdEfGhIj...` |
| `PAYHERE_RETURN_URL` | Redirect URL after successful payment | `http://localhost:3000/payment/success` |
| `PAYHERE_CANCEL_URL` | Redirect URL if payment is cancelled | `http://localhost:3000/payment/cancel` |
| `PAYHERE_NOTIFY_URL` | Webhook URL PayHere calls after payment | `http://localhost:5000/api/payments/webhook` |
| `PAYHERE_SANDBOX` | Set to `true` for sandbox/test mode | `true` |

> All team members must use the same `PAYHERE_MERCHANT_SECRET` or the hash will be invalid and PayHere will reject the payment.

---

## Error Reference

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `fineIds must be a non-empty array` | Missing or empty `fineIds` |
| `400` | `licenseNo is required` | Missing `licenseNo` |
| `400` | `The following fines are not payable: <id> (paid)` | Fine already paid or outdated |
| `403` | `One or more fines do not belong to the given license number` | Fine belongs to a different driver |
| `404` | `Driver not found for the given license number` | Invalid `licenseNo` |
| `404` | `No fines found for the provided IDs` | None of the fine IDs exist |
| `404` | `The following fine IDs were not found: <ids>` | Some fine IDs don't exist |

---

## Notes

- `custom_1` in checkout params stores the fine IDs (comma-separated) — used later by the webhook to update fine statuses after payment confirmation.
- `custom_2` stores the driver's license number for reference.
- `order_id` format: `PEZY-{timestamp}-{random}` — unique per payment session.
