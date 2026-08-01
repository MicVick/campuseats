import assert from "node:assert/strict";
import test from "node:test";

import {
  getCampusDayRange,
  getNextOpenTime,
  isVendorOpen,
} from "../src/lib/utils.ts";

const chaiMaggiHours = JSON.stringify({
  mon: { open: "16:00", close: "02:00" },
  tue: { open: "16:00", close: "02:00" },
  wed: { open: "16:00", close: "02:00" },
  thu: { open: "16:00", close: "02:00" },
  fri: { open: "16:00", close: "03:00" },
  sat: { open: "16:00", close: "03:00" },
  sun: { open: "17:00", close: "01:00" },
});

test("Chai & Maggi is open during its Saturday evening window", () => {
  assert.equal(
    isVendorOpen(chaiMaggiHours, false, new Date("2026-08-01T18:00:00.000Z")),
    true
  );
});

test("overnight hours carry over from the previous campus day", () => {
  assert.equal(
    isVendorOpen(chaiMaggiHours, false, new Date("2026-07-31T21:29:00.000Z")),
    true,
    "Saturday 2:59 AM IST should inherit Friday's 3:00 AM close"
  );
  assert.equal(
    isVendorOpen(chaiMaggiHours, false, new Date("2026-07-31T21:30:00.000Z")),
    false,
    "Saturday 3:00 AM IST is the exclusive closing boundary"
  );
});

test("temporary closure overrides a currently open schedule", () => {
  assert.equal(
    isVendorOpen(chaiMaggiHours, true, new Date("2026-08-01T18:00:00.000Z")),
    false
  );
});

test("next opening copy uses campus time and a customer-friendly clock", () => {
  assert.equal(
    getNextOpenTime(chaiMaggiHours, new Date("2026-08-01T09:30:00.000Z")),
    "today at 4:00 PM"
  );
});

test("campus day bounds map IST midnight to the correct UTC instant", () => {
  const { start, end } = getCampusDayRange("2026-08-01");
  assert.equal(start.toISOString(), "2026-07-31T18:30:00.000Z");
  assert.equal(end.toISOString(), "2026-08-01T18:30:00.000Z");
});

test("invalid calendar dates are rejected instead of silently rolling over", () => {
  assert.throws(() => getCampusDayRange("2026-02-30"), /valid calendar day/);
});

test("invalid stored hours fail closed", () => {
  assert.equal(
    isVendorOpen('{"sat":{"open":"29:00","close":"03:00"}}', false),
    false
  );
});
