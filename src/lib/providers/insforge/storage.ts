import type { StorageProvider } from "../types";

export class InsForgeStorageProvider implements StorageProvider {
  async uploadFile(path: string, fileData: Buffer): Promise<string> {
    console.log(`[InsForge Storage] uploadFile to bucket: ${path}`);
    return `https://insforge.dev/storage/v1/object/public/uploads/${path}`; // Stub URL
  }

  async downloadFile(path: string): Promise<Buffer> {
    console.log(`[InsForge Storage] downloadFile: ${path}`);
    return Buffer.from(""); // Stub Buffer
  }

  async deleteFile(path: string): Promise<void> {
    console.log(`[InsForge Storage] deleteFile: ${path}`);
  }
}

export const insforgeStorage = new InsForgeStorageProvider();
