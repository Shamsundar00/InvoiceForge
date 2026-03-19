import type { AuthProvider } from "../types";

export class LocalAuthProvider implements AuthProvider {
  async getSession(): Promise<any> {
    // Stub implementation for Local Auth (would use NextAuth.js in the future)
    return {
      user: {
        id: "local-admin-123",
        name: "Local Admin",
        email: "admin@invoiceforge.local",
        role: "admin",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  // Future methods: login, logout, register, resetPassword, etc.
}

export const localAuth = new LocalAuthProvider();
