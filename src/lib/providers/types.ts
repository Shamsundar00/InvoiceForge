// ================================================================
// Provider Interfaces for InvoiceForge
// All backends (Local Prisma, InsForge) must implement these
// ================================================================

export interface DatabaseProvider {
  // === Settings ===
  getSetting(key: string): Promise<any>;
  updateSetting(key: string, value: any, category?: string): Promise<any>;
  getAllSettings(category?: string): Promise<any[]>;

  // === Audit Logs ===
  createAuditLog(data: any): Promise<any>;
  getAuditLogs(limit?: number, offset?: number): Promise<any[]>;
  getAuditLogCount(): Promise<number>;

  // === Sources ===
  deactivateAllSources(): Promise<void>;
  createSource(data: any): Promise<any>;
  getActiveSource(): Promise<any>;
  updateSource(id: string, data: any): Promise<any>;
  deleteSource(id: string): Promise<void>;

  // === Templates ===
  getTemplates(): Promise<any[]>;
  getTemplate(id: string): Promise<any>;
  createTemplate(data: any): Promise<any>;
  updateTemplate(id: string, data: any): Promise<any>;
  deleteTemplate(id: string): Promise<void>;
  getDefaultTemplate(): Promise<any>;

  // === Invoices ===
  createInvoice(data: any): Promise<any>;
  getInvoices(filters?: {
    batchId?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]>;
  getInvoice(id: string): Promise<any>;
  updateInvoice(id: string, data: any): Promise<any>;
  getInvoiceCount(filters?: { batchId?: string; status?: string }): Promise<number>;
  getInvoicesByBatch(batchId: string): Promise<any[]>;

  // === Generation History (Batches) ===
  createBatch(data: any): Promise<any>;
  getBatches(limit?: number, offset?: number): Promise<any[]>;
  getBatch(id: string): Promise<any>;
  getBatchByBatchId(batchId: string): Promise<any>;
  updateBatch(id: string, data: any): Promise<any>;

  // === Backup ===
  createBackup(data: any): Promise<any>;
  getBackups(): Promise<any[]>;
  getBackup(id: string): Promise<any>;
  deleteBackup(id: string): Promise<void>;

  // === Financial Year Config ===
  getFinancialYearConfig(): Promise<any>;
  updateFinancialYearConfig(data: any): Promise<any>;
  getNextInvoiceNumber(): Promise<{ number: number; formatted: string }>;
  incrementInvoiceNumber(): Promise<void>;

  // === Dashboard ===
  getDashboardData(): Promise<any>;

  // === Audit Reports / Analytics ===
  getAuditAnalytics(batchId?: string): Promise<{
    grossRevenue: number;
    totalProfit: number;
    avgMargin: number;
    errorCount: number;
    categoryBreakdown: any[];
    statusBreakdown: any[];
    topInvoices: any[];
    bottomInvoices: any[];
  }>;
}

export interface AuthProvider {
  getSession(): Promise<any>;
}

export interface StorageProvider {
  uploadFile(path: string, file: File | Blob | Buffer): Promise<string>;
  downloadFile(path: string): Promise<Buffer>;
  deleteFile(path: string): Promise<void>;
}

export interface RealtimeProvider {
  subscribe(channel: string, callback: (payload: any) => void): () => void;
  emit(channel: string, event: string, payload: any): Promise<void>;
}

export interface AIProvider {
  generateDescription(prompt: string, context?: any): Promise<string>;
  estimateCost(tokens: number): Promise<number>;
}

// Master interface combining all providers
export interface AppProviders {
  db: DatabaseProvider;
  auth: AuthProvider;
  storage: StorageProvider;
  realtime: RealtimeProvider;
  ai: AIProvider;
}
