import { expect, test } from "vitest";

import { decrypt, encrypt } from "../src/crypto";

test("round-trips a plaintext value", () => {
  const plaintext = "sk-test-1234567890";
  const ciphertext = encrypt(plaintext);
  expect(decrypt(ciphertext)).toBe(plaintext);
});

test("encrypts the same plaintext differently each time", () => {
  const plaintext = "sk-test-1234567890";
  const first = encrypt(plaintext);
  const second = encrypt(plaintext);
  expect(first).not.toBe(second);
});

test("fails to decrypt tampered ciphertext", () => {
  const ciphertext = encrypt("sk-test-1234567890");
  const bytes = Buffer.from(ciphertext, "base64");
  bytes[bytes.length - 1] = (bytes[bytes.length - 1] ?? 0) ^ 0xff;
  const tampered = bytes.toString("base64");

  expect(() => decrypt(tampered)).toThrow();
});

test("throws when ENCRYPTION_KEY is not set", () => {
  const original = process.env.ENCRYPTION_KEY;
  delete process.env.ENCRYPTION_KEY;

  expect(() => encrypt("value")).toThrow(/ENCRYPTION_KEY/);

  process.env.ENCRYPTION_KEY = original;
});

test("throws when ENCRYPTION_KEY does not decode to 32 bytes", () => {
  const original = process.env.ENCRYPTION_KEY;
  process.env.ENCRYPTION_KEY = Buffer.from("too-short").toString("base64");

  expect(() => encrypt("value")).toThrow(/32 bytes/);

  process.env.ENCRYPTION_KEY = original;
});
