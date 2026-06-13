import { customType } from "drizzle-orm/pg-core";

import { decrypt, encrypt } from "@repo/shared/crypto";

/**
 * A `text` column that is transparently encrypted with AES-256-GCM on
 * write and decrypted on read via @repo/shared/crypto. Reuse this for
 * any column holding a secret (API keys now, PII fields later).
 */
export const encryptedText = customType<{ data: string; driverData: string }>({
  dataType() {
    return "text";
  },
  toDriver(value: string): string {
    return encrypt(value);
  },
  fromDriver(value: string): string {
    return decrypt(value);
  },
});
