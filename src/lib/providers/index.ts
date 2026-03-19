import { localDb } from "./local/database";
import { insforgeDb } from "./insforge/database";
import { localStorage } from "./local/storage";
import { insforgeStorage } from "./insforge/storage";
import { localAuth } from "./local/auth";
import { insforgeAuth } from "./insforge/auth";
import type { DatabaseProvider, StorageProvider, AuthProvider } from "./types";

// Determine deployment mode (default is local)
const DEPLOYMENT_MODE = process.env.DEPLOYMENT_MODE || "local";

// Database Provider Factory
export const getDbProvider = (): DatabaseProvider => {
  if (DEPLOYMENT_MODE === "insforge") {
    return insforgeDb;
  }
  return localDb;
};

// Storage Provider Factory
export const getStorageProvider = (): StorageProvider => {
  if (DEPLOYMENT_MODE === "insforge") {
    return insforgeStorage;
  }
  return localStorage;
};

// Auth Provider Factory
export const getAuthProvider = (): AuthProvider => {
  if (DEPLOYMENT_MODE === "insforge") {
    return insforgeAuth;
  }
  return localAuth;
};

// Quick access to the configured provider instances
export const db = getDbProvider();
export const storage = getStorageProvider();
export const auth = getAuthProvider();
