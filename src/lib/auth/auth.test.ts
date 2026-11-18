// @vitest-environment node
import { describe, expect, it } from "vitest";
import { hashPassword, verifyAgainstNothing, verifyPassword } from "./password.mjs";
import { createSessionToken, needsRenewal, readSessionToken, SESSION_SECONDS } from "./token";

const SECRET = "un-secreto-de-prueba-de-mas-de-treinta-y-dos-caracteres";

describe("passwords", () => {
  it("verifies the right password and rejects others", async () => {
    const hash = await hashPassword("una clave larga y propia");
    expect(hash).toMatch(/^scrypt\$32768\$8\$1\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
    expect(await verifyPassword("una clave larga y propia", hash)).toBe(true);
    expect(await verifyPassword("una clave larga y propiA", hash)).toBe(false);
  });

  it("salts every hash", async () => {
    expect(await hashPassword("misma clave 1234")).not.toBe(await hashPassword("misma clave 1234"));
  });

  it("treats missing or malformed hashes as wrong", async () => {
    expect(await verifyPassword("lo que sea 123", null)).toBe(false);
    expect(await verifyPassword("lo que sea 123", "bcrypt$algo")).toBe(false);
    expect(await verifyAgainstNothing("lo que sea 123")).toBe(false);
  });
});

describe("session tokens", () => {
  const ID = "6f1c0b9e-2a3d-4e5f-8a9b-0c1d2e3f4a5b";

  it("round-trips the account and the login time", () => {
    const payload = readSessionToken(createSessionToken(ID, SECRET, 1_000), SECRET);
    expect(payload).toMatchObject({ sub: ID, auth: 1_000 });
    expect(payload!.exp - Math.floor(Date.now() / 1000)).toBeGreaterThan(SESSION_SECONDS - 5);
  });

  it("rejects tokens signed with another secret or edited", () => {
    const token = createSessionToken(ID, SECRET);
    expect(readSessionToken(token, `${SECRET}-otro`)).toBeNull();
    const [data, signature] = token.split(".");
    const edited = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(data, "base64url").toString()), sub: "otra" })).toString("base64url");
    expect(readSessionToken(`${edited}.${signature}`, SECRET)).toBeNull();
    expect(readSessionToken(`${token}.extra`, SECRET)).toBeNull();
    expect(readSessionToken(undefined, SECRET)).toBeNull();
  });

  it("expires and asks for renewal past half its life", () => {
    const token = createSessionToken(ID, SECRET);
    const payload = readSessionToken(token, SECRET)!;
    expect(readSessionToken(token, SECRET, payload.exp + 1)).toBeNull();
    expect(needsRenewal(payload, payload.exp - SESSION_SECONDS + 60)).toBe(false);
    expect(needsRenewal(payload, payload.exp - SESSION_SECONDS / 2 + 60)).toBe(true);
  });
});
