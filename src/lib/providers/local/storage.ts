import fs from "fs";
import path from "path";
import type { StorageProvider } from "../types";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export class LocalStorageProvider implements StorageProvider {
  async uploadFile(filename: string, fileData: Buffer): Promise<string> {
    const filePath = path.join(UPLOAD_DIR, filename);
    await fs.promises.writeFile(filePath, fileData);
    return filePath;
  }

  async downloadFile(filePath: string): Promise<Buffer> {
    return await fs.promises.readFile(filePath);
  }

  async deleteFile(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
}

export const localStorage = new LocalStorageProvider();
