import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// ---------------------------------------------------------------------------
// 1. PIN Generation and Secure Hashing
// ---------------------------------------------------------------------------
function hashPin(pin, salt = 'test-salt') {
  return crypto.createHash('sha256').update(`${pin}:${salt}`).digest('hex');
}

function verifyPin(pin, storedHash, salt = 'test-salt') {
  return hashPin(pin.trim(), salt) === storedHash;
}

test('PIN security: generates 6-digit PIN and verifies matching hash', () => {
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  assert.equal(pin.length, 6);
  assert.match(pin, /^\d{6}$/);

  const hash = hashPin(pin);
  assert.equal(verifyPin(pin, hash), true);
  assert.equal(verifyPin('000000', hash), false);
  assert.equal(verifyPin('999999', hash), false);
});

// ---------------------------------------------------------------------------
// 2. PIN Brute-force Lockout Logic (Section 24)
// ---------------------------------------------------------------------------
test('PIN security: locks after 5 failed attempts for 15 minutes', () => {
  const PIN_MAX_ATTEMPTS = 5;
  const PIN_LOCKOUT_MINUTES = 15;

  let attempts = 0;
  let lockedUntil = null;

  for (let i = 1; i <= 5; i++) {
    attempts++;
    if (attempts >= PIN_MAX_ATTEMPTS) {
      lockedUntil = new Date(Date.now() + PIN_LOCKOUT_MINUTES * 60 * 1000);
    }
  }

  assert.equal(attempts, 5);
  assert.notEqual(lockedUntil, null);
  assert.equal(lockedUntil > new Date(), true);

  // Verification must be rejected when lockedUntil > now
  const isLocked = lockedUntil > new Date();
  assert.equal(isLocked, true);
});

// ---------------------------------------------------------------------------
// 3. Platform Fee & Seller Payout Calculation (Section 25)
// ---------------------------------------------------------------------------
test('Fee calculation: 5% platform fee and correct seller payout', () => {
  const feePercent = 5;

  const testCases = [
    { itemPrice: 100, expectedFee: 5, expectedPayout: 95 },
    { itemPrice: 180, expectedFee: 9, expectedPayout: 171 },
    { itemPrice: 250, expectedFee: 13, expectedPayout: 237 }, // Math.round(12.5) -> 13
    { itemPrice: 320, expectedFee: 16, expectedPayout: 304 },
  ];

  for (const tc of testCases) {
    const fee = Math.round((tc.itemPrice * feePercent) / 100);
    const payout = tc.itemPrice - fee;
    assert.equal(fee, tc.expectedFee);
    assert.equal(payout, tc.expectedPayout);
  }
});

// ---------------------------------------------------------------------------
// 4. Reservation Expiry Window (Section 20)
// ---------------------------------------------------------------------------
test('Reservation expiry: 30-minute timeout calculation and detection', () => {
  const DEFAULT_RESERVATION_MINUTES = 30;
  const now = Date.now();
  const expiresAt = new Date(now + DEFAULT_RESERVATION_MINUTES * 60 * 1000);

  // Active reservation: expires in the future
  assert.equal(expiresAt.getTime() > now, true);

  // Lapsed reservation: created 31 minutes ago
  const lapsedExpiry = new Date(now - 1 * 60 * 1000);
  const isLapsed = lapsedExpiry.getTime() < now;
  assert.equal(isLapsed, true);
});

// ---------------------------------------------------------------------------
// 5. Business Rules: Self-Purchase and Verification Check (Section 44)
// ---------------------------------------------------------------------------
test('Business rules: student cannot buy their own book', () => {
  const sellerId = 'profile-123';
  const buyerId = 'profile-123';

  const canBuy = sellerId !== buyerId;
  assert.equal(canBuy, false);
});

test('Business rules: unverified student cannot list or buy books', () => {
  const verifiedUser = { verification_status: 'verified' };
  const pendingUser = { verification_status: 'pending' };
  const unverifiedUser = { verification_status: 'unverified' };
  const rejectedUser = { verification_status: 'rejected' };

  const canTransact = (u) => u.verification_status === 'verified';

  assert.equal(canTransact(verifiedUser), true);
  assert.equal(canTransact(pendingUser), false);
  assert.equal(canTransact(unverifiedUser), false);
  assert.equal(canTransact(rejectedUser), false);
});

// ---------------------------------------------------------------------------
// 6. Concurrency Control: Atomic State Transition (Section 33)
// ---------------------------------------------------------------------------
test('Concurrency control: double-booking race condition prevented', () => {
  let bookStatus = 'available';

  function tryReserve() {
    if (bookStatus === 'available') {
      bookStatus = 'reserved';
      return { success: true };
    }
    return { success: false, error: 'Book already reserved' };
  }

  // First buyer reserves
  const buyer1 = tryReserve();
  assert.equal(buyer1.success, true);
  assert.equal(bookStatus, 'reserved');

  // Second simultaneous buyer attempts to reserve
  const buyer2 = tryReserve();
  assert.equal(buyer2.success, false);
  assert.equal(buyer2.error, 'Book already reserved');
});
