import { describe, it, expect, beforeEach, vi } from "vitest";
import { headers } from "next/headers";
import { requireAdmin as requireAdminSession, requireCustomer, getCurrentSession } from "@/lib/auth/session";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { createProduct } from "@/lib/admin/products/actions";
import { resetDb } from "./helpers/db";
import { createUserWithSession } from "./helpers/auth";

vi.mock("next/headers", () => ({ headers: vi.fn() }));

function mockSignedOut() {
  vi.mocked(headers).mockResolvedValue(new Headers() as never);
}
function mockSignedInAs(cookie: string) {
  vi.mocked(headers).mockResolvedValue(new Headers({ cookie }) as never);
}

describe("authorization", () => {
  beforeEach(async () => {
    await resetDb();
    mockSignedOut();
  });

  it("an unauthenticated request has no session at all", async () => {
    expect(await getCurrentSession()).toBeNull();
    await expect(requireCustomer()).rejects.toThrow();
    await expect(requireAdminSession()).rejects.toThrow();
  });

  it("a CUSTOMER-role session is rejected by the admin check — role is checked, not just presence of a session", async () => {
    const customer = await createUserWithSession({ role: "CUSTOMER" });
    mockSignedInAs(customer.cookie);

    expect(await isAdminAuthenticated()).toBe(false);
    await expect(requireAdminSession()).rejects.toThrow();
    // The customer session is still a perfectly valid customer session, though:
    await expect(requireCustomer()).resolves.toBeTruthy();
  });

  it("an ADMIN-role session passes the admin check", async () => {
    const admin = await createUserWithSession({ role: "ADMIN" });
    mockSignedInAs(admin.cookie);

    expect(await isAdminAuthenticated()).toBe(true);
    await expect(requireAdminSession()).resolves.toBeTruthy();
  });

  it("an admin server action itself rejects a customer session — not just the dashboard layout redirect", async () => {
    const customer = await createUserWithSession({ role: "CUSTOMER" });
    mockSignedInAs(customer.cookie);

    // Garbage input on purpose: requireAdmin() runs before input
    // validation in createProduct, so this proves the authorization
    // check itself is what rejects the call, independent of any page.
    await expect(createProduct({})).rejects.toThrow(/not authorized/i);
  });

  it("an admin server action rejects an unauthenticated call the same way", async () => {
    await expect(createProduct({})).rejects.toThrow(/not authorized/i);
  });

  it("an admin server action succeeds authorization for an ADMIN session (fails later on the garbage input instead)", async () => {
    const admin = await createUserWithSession({ role: "ADMIN" });
    mockSignedInAs(admin.cookie);

    const result = await createProduct({});
    // Got past the authorization check; input validation now expectedly
    // reports errors instead of an authorization failure.
    expect(result.ok).toBe(false);
  });
});
