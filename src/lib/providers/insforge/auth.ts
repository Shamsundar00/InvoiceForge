import type { AuthProvider } from "../types";

export class InsForgeAuthProvider implements AuthProvider {
  async getSession(): Promise<any> {
    console.log("[InsForge Auth] getSession");
    // Stub implementation for InsForge Auth
    return {
      user: {
        id: "insforge-admin-456",
        name: "Cloud Admin",
        email: "admin@invoiceforge.cloud",
        role: "admin",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  // Future methods: login, logout, register, resetPassword, etc.
}

export const insforgeAuth = new InsForgeAuthProvider();
