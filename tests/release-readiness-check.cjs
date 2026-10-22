const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
require('tsx/cjs');
const { validateInvoicePayment, currencyCents } = require('../lib/invoice-payment.ts');
assert.equal(currencyCents('9999999999.99'), BigInt('999999999999'));
assert.equal(currencyCents('0.01'), BigInt(1));
for (const amount of ['1.001', '-1', '1e3', 'NaN', '', '10000000000']) {
  assert.throws(() => currencyCents(amount));
}
assert.throws(() => validateInvoicePayment('1000', '0', 'PAID'), /full amount/);
assert.throws(() => validateInvoicePayment('1000', '1001', 'PAID'), /exceed/);
assert.throws(() => validateInvoicePayment('1000', '1000', 'PARTIALLY_PAID'));
assert.throws(() => validateInvoicePayment('1000', '0', 'PARTIALLY_PAID'));
assert.throws(() => validateInvoicePayment('1000', '1000', 'OVERDUE'));
assert.throws(() => validateInvoicePayment('1000', '10', 'SENT'));
assert.deepEqual(validateInvoicePayment('1000', '1000', 'PAID'), { status: 'PAID', paid: '1000' });
validateInvoicePayment('1000', '250.01', 'PARTIALLY_PAID');
validateInvoicePayment('1000', '250', 'OVERDUE');
for (const [timezone, expected] of [
  ['Africa/Accra', '2030-06-10T09:30:00.000Z'],
  ['America/New_York', '2030-06-10T13:30:00.000Z'],
  ['Asia/Kolkata', '2030-06-10T04:00:00.000Z'],
]) {
  const result = execFileSync(process.execPath, ['--require', 'tsx/cjs', '-e', `
    const { bookingDateToISO } = require('./lib/booking-date.ts');
    process.stdout.write(bookingDateToISO('2030-06-10', '09:30'));
  `], { cwd: process.cwd(), env: { ...process.env, TZ: timezone }, encoding: 'utf8' });
  assert.equal(result, expected, timezone);
}
const { bookingDateToISO } = require('../lib/booking-date.ts');
assert.equal(bookingDateToISO('2030-02-31', '10:00'), null);
assert.equal(bookingDateToISO('2030-06-01', '25:00'), null);
console.log('PASS: exact invoice amounts, payment/status invariants, three booking timezones and invalid dates.');
