import type { DatabaseProvider } from "../types";

// ================================================================
// InsForge Database Provider
// Implements DatabaseProvider using @insforge/sdk
// Currently stubs — replace with real SDK calls when ready
// ================================================================

export class InsForgeDatabaseProvider implements DatabaseProvider {
  // === Settings ===
  async getSetting(key: string) {
    console.log(`[InsForge DB] getSetting: ${key}`);
    return null;
  }
  async updateSetting(key: string, value: any, category: string = "general") {
    console.log(`[InsForge DB] updateSetting: ${key}`);
    return { key, value: JSON.stringify(value), category };
  }
  async getAllSettings(category?: string) {
    console.log(`[InsForge DB] getAllSettings, category: ${category}`);
    return [];
  }

  // === Audit Logs ===
  async createAuditLog(data: any) {
    console.log("[InsForge DB] createAuditLog", data);
    return { id: `audit-${Date.now()}`, ...data, timestamp: new Date() };
  }
  async getAuditLogs(limit = 50, offset = 0) {
    console.log(`[InsForge DB] getAuditLogs limit=${limit} offset=${offset}`);
    return [];
  }
  async getAuditLogCount() {
    return 0;
  }

  // === Sources ===
  async deactivateAllSources() {
    console.log("[InsForge DB] deactivateAllSources");
  }
  async createSource(data: any) {
    console.log("[InsForge DB] createSource", data);
    return { id: `src-${Date.now()}`, ...data, createdAt: new Date() };
  }
  async getActiveSource() {
    console.log("[InsForge DB] getActiveSource");
    return null;
  }
  async updateSource(id: string, data: any) {
    console.log(`[InsForge DB] updateSource ${id}`, data);
    return { id, ...data };
  }
  async deleteSource(id: string) {
    console.log(`[InsForge DB] deleteSource ${id}`);
  }

  // === Templates ===
  async getTemplates() {
    console.log("[InsForge DB] getTemplates");
    return [];
  }
  async getTemplate(id: string) {
    console.log(`[InsForge DB] getTemplate ${id}`);
    return null;
  }
  async createTemplate(data: any) {
    console.log("[InsForge DB] createTemplate", data);
    return { id: `tpl-${Date.now()}`, ...data, createdAt: new Date() };
  }
  async updateTemplate(id: string, data: any) {
    console.log(`[InsForge DB] updateTemplate ${id}`, data);
    return { id, ...data };
  }
  async deleteTemplate(id: string) {
    console.log(`[InsForge DB] deleteTemplate ${id}`);
  }
  async getDefaultTemplate() {
    return null;
  }

  // === Invoices ===
  async createInvoice(data: any) {
    console.log("[InsForge DB] createInvoice");
    return { id: `inv-${Date.now()}`, ...data, createdAt: new Date() };
  }
  async getInvoices(filters?: any) {
    console.log("[InsForge DB] getInvoices", filters);
    return [];
  }
  async getInvoice(id: string) {
    console.log(`[InsForge DB] getInvoice ${id}`);
    return null;
  }
  async updateInvoice(id: string, data: any) {
    console.log(`[InsForge DB] updateInvoice ${id}`);
    return { id, ...data };
  }
  async getInvoiceCount(filters?: any) {
    return 0;
  }
  async getInvoicesByBatch(batchId: string) {
    return [];
  }

  // === Batches ===
  async createBatch(data: any) {
    console.log("[InsForge DB] createBatch");
    return { id: `batch-${Date.now()}`, ...data };
  }
  async getBatches(limit = 20, offset = 0) {
    return [];
  }
  async getBatch(id: string) {
    return null;
  }
  async getBatchByBatchId(batchId: string) {
    return null;
  }
  async updateBatch(id: string, data: any) {
    return { id, ...data };
  }

  // === Backup ===
  async createBackup(data: any) {
    return { id: `bak-${Date.now()}`, ...data };
  }
  async getBackups() {
    return [];
  }
  async getBackup(id: string) {
    return null;
  }
  async deleteBackup(id: string) {
    console.log(`[InsForge DB] deleteBackup ${id}`);
  }

  // === Financial Year Config ===
  async getFinancialYearConfig() {
    return {
      id: "default",
      startMonth: 4,
      currentFyLabel: "2025-26",
      currentSequenceNumber: 1,
      numberingFormat: "{PREFIX}-{FY}-{NUMBER}",
      prefix: "INV",
      zeroPaddingLength: 4,
    };
  }
  async updateFinancialYearConfig(data: any) {
    return { ...data };
  }
  async getNextInvoiceNumber() {
    return { number: 1, formatted: "INV-2025-26-0001" };
  }
  async incrementInvoiceNumber() {
    console.log("[InsForge DB] incrementInvoiceNumber");
  }

  // === Dashboard ===
  async getDashboardData() {
    return {
      stats: {
        totalInvoices: 0,
        totalSources: 0,
        totalTemplates: 0,
        totalRevenue: 0,
        totalProfit: 0,
        avgMargin: 0,
        aiConfigured: false,
        activeSourceName: null,
        activeSourceRows: 0,
      },
      recentBatches: [],
      recentActivity: [],
    };
  }

  // === Audit Analytics ===
  async getAuditAnalytics(_batchId?: string) {
    return {
      grossRevenue: 0,
      totalProfit: 0,
      avgMargin: 0,
      errorCount: 0,
      categoryBreakdown: [],
      statusBreakdown: [],
      topInvoices: [],
      bottomInvoices: [],
    };
  }
}

export const insforgeDb = new InsForgeDatabaseProvider();
