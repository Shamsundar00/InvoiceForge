import { prisma } from "@/lib/prisma";
import type { DatabaseProvider } from "../types";

export class LocalDatabaseProvider implements DatabaseProvider {
  // ================================================================
  // SETTINGS
  // ================================================================
  async getSetting(key: string) {
    return prisma.settings.findUnique({ where: { key } });
  }

  async updateSetting(key: string, value: any, category: string = "general") {
    const strValue = typeof value === "string" ? value : JSON.stringify(value);
    return prisma.settings.upsert({
      where: { key },
      update: { value: strValue, category },
      create: { key, value: strValue, category },
    });
  }

  async getAllSettings(category?: string) {
    const where = category ? { category } : {};
    return prisma.settings.findMany({ where, orderBy: { key: "asc" } });
  }

  // ================================================================
  // AUDIT LOGS
  // ================================================================
  async createAuditLog(data: any) {
    return prisma.auditLog.create({ data });
  }

  async getAuditLogs(limit = 50, offset = 0) {
    return prisma.auditLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { timestamp: "desc" },
    });
  }

  async getAuditLogCount() {
    return prisma.auditLog.count();
  }

  // ================================================================
  // SOURCES
  // ================================================================
  async deactivateAllSources() {
    await prisma.source.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  async createSource(data: any) {
    return prisma.source.create({ data });
  }

  async getActiveSource() {
    return prisma.source.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateSource(id: string, data: any) {
    return prisma.source.update({ where: { id }, data });
  }

  async deleteSource(id: string) {
    await prisma.source.update({ where: { id }, data: { isActive: false } });
  }

  // ================================================================
  // TEMPLATES
  // ================================================================
  async getTemplates() {
    return prisma.template.findMany({ orderBy: { createdAt: "desc" } });
  }

  async getTemplate(id: string) {
    return prisma.template.findUnique({ where: { id } });
  }

  async createTemplate(data: any) {
    return prisma.template.create({ data });
  }

  async updateTemplate(id: string, data: any) {
    return prisma.template.update({ where: { id }, data });
  }

  async deleteTemplate(id: string) {
    await prisma.template.delete({ where: { id } });
  }

  async getDefaultTemplate() {
    return prisma.template.findFirst({
      where: { isPreset: true },
      orderBy: { createdAt: "asc" },
    });
  }

  // ================================================================
  // INVOICES
  // ================================================================
  async createInvoice(data: any) {
    return prisma.invoice.create({ data });
  }

  async getInvoices(filters?: {
    batchId?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { isCurrentVersion: true };
    if (filters?.batchId) where.batchId = filters.batchId;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [
        { invoiceNumber: { contains: filters.search } },
        { customerFirstName: { contains: filters.search } },
        { customerLastName: { contains: filters.search } },
        { category: { contains: filters.search } },
      ];
    }
    return prisma.invoice.findMany({
      where,
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
      orderBy: { generatedDate: "desc" },
      include: { template: true },
    });
  }

  async getInvoice(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        template: true,
        source: true,
        childRevisions: { orderBy: { revisionNumber: "desc" } },
        parentInvoice: true,
      },
    });
  }

  async updateInvoice(id: string, data: any) {
    return prisma.invoice.update({ where: { id }, data });
  }

  async getInvoiceCount(filters?: { batchId?: string; status?: string }) {
    const where: any = { isCurrentVersion: true };
    if (filters?.batchId) where.batchId = filters.batchId;
    if (filters?.status) where.status = filters.status;
    return prisma.invoice.count({ where });
  }

  async getInvoicesByBatch(batchId: string) {
    return prisma.invoice.findMany({
      where: { batchId, isCurrentVersion: true },
      orderBy: { invoiceNumber: "asc" },
    });
  }

  // ================================================================
  // GENERATION HISTORY (BATCHES)
  // ================================================================
  async createBatch(data: any) {
    return prisma.generationHistory.create({ data });
  }

  async getBatches(limit = 20, offset = 0) {
    return prisma.generationHistory.findMany({
      take: limit,
      skip: offset,
      orderBy: { generationDate: "desc" },
      include: { source: true, template: true },
    });
  }

  async getBatch(id: string) {
    return prisma.generationHistory.findUnique({
      where: { id },
      include: { source: true, template: true },
    });
  }

  async getBatchByBatchId(batchId: string) {
    return prisma.generationHistory.findUnique({
      where: { batchId },
      include: { source: true, template: true },
    });
  }

  async updateBatch(id: string, data: any) {
    return prisma.generationHistory.update({ where: { id }, data });
  }

  // ================================================================
  // BACKUP
  // ================================================================
  async createBackup(data: any) {
    return prisma.backup.create({ data });
  }

  async getBackups() {
    return prisma.backup.findMany({ orderBy: { createdDate: "desc" } });
  }

  async getBackup(id: string) {
    return prisma.backup.findUnique({ where: { id } });
  }

  async deleteBackup(id: string) {
    await prisma.backup.delete({ where: { id } });
  }

  // ================================================================
  // FINANCIAL YEAR CONFIG
  // ================================================================
  async getFinancialYearConfig() {
    let config = await prisma.financialYearConfig.findFirst();
    if (!config) {
      config = await prisma.financialYearConfig.create({ data: {} });
    }
    return config;
  }

  async updateFinancialYearConfig(data: any) {
    const existing = await this.getFinancialYearConfig();
    return prisma.financialYearConfig.update({
      where: { id: existing.id },
      data,
    });
  }

  async getNextInvoiceNumber(): Promise<{ number: number; formatted: string }> {
    const config = await this.getFinancialYearConfig();
    const num = config.currentSequenceNumber;
    const padded = String(num).padStart(config.zeroPaddingLength, "0");

    let formatted: string;
    const format = config.numberingFormat;
    if (format.includes("{FY}")) {
      formatted = format
        .replace("{PREFIX}", config.prefix)
        .replace("{FY}", config.currentFyLabel)
        .replace("{NUMBER}", padded);
    } else if (format.includes("{YEAR}")) {
      const year = new Date().getFullYear().toString();
      formatted = format
        .replace("{PREFIX}", config.prefix)
        .replace("{YEAR}", year)
        .replace("{NUMBER}", padded);
    } else {
      formatted = format
        .replace("{PREFIX}", config.prefix)
        .replace("{NUMBER}", padded);
    }

    return { number: num, formatted };
  }

  async incrementInvoiceNumber() {
    const config = await this.getFinancialYearConfig();
    await prisma.financialYearConfig.update({
      where: { id: config.id },
      data: { currentSequenceNumber: config.currentSequenceNumber + 1 },
    });
  }

  // ================================================================
  // DASHBOARD
  // ================================================================
  async getDashboardData() {
    const [
      totalInvoices,
      totalSources,
      totalTemplates,
      activeSource,
      recentBatches,
      recentActivity,
    ] = await Promise.all([
      prisma.invoice.count({ where: { isCurrentVersion: true } }),
      prisma.source.count(),
      prisma.template.count(),
      prisma.source.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.generationHistory.findMany({
        take: 5,
        orderBy: { generationDate: "desc" },
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { timestamp: "desc" },
      }),
    ]);

    const invoiceStats = await prisma.invoice.aggregate({
      where: { isCurrentVersion: true, status: "generated" },
      _sum: { totalAmount: true, marginAmount: true },
      _avg: { marginPercentage: true },
      _count: true,
    });

    const aiKeySetting = await prisma.settings.findUnique({
      where: { key: "gemini_api_key" },
    });
    const aiConfigured = !!(aiKeySetting && aiKeySetting.value);

    return {
      stats: {
        totalInvoices,
        totalSources,
        totalTemplates,
        totalRevenue: invoiceStats._sum.totalAmount || 0,
        totalProfit: invoiceStats._sum.marginAmount || 0,
        avgMargin: invoiceStats._avg.marginPercentage || 0,
        aiConfigured,
        activeSourceName: activeSource?.fileName || null,
        activeSourceRows: activeSource?.rowCount || 0,
      },
      recentBatches: recentBatches.map((b: any) => ({
        id: b.id,
        batchId: b.batchId,
        totalInvoices: b.totalInvoices,
        successfulCount: b.successfulCount,
        errorCount: b.errorCount,
        totalRevenue: b.totalRevenue,
        generationDate: b.generationDate,
      })),
      recentActivity: recentActivity.map((a: any) => ({
        id: a.id,
        actionType: a.actionType,
        actionDetail: a.actionDetail,
        timestamp: a.timestamp,
      })),
    };
  }

  // ================================================================
  // AUDIT ANALYTICS
  // ================================================================
  async getAuditAnalytics(batchId?: string) {
    const where: any = { isCurrentVersion: true, status: "generated" };
    if (batchId) where.batchId = batchId;

    const invoices = await prisma.invoice.findMany({ where });

    const grossRevenue = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
    const totalProfit = invoices.reduce((s, i) => s + (i.marginAmount || 0), 0);
    const avgMargin =
      invoices.length > 0
        ? invoices.reduce((s, i) => s + (i.marginPercentage || 0), 0) /
          invoices.length
        : 0;
    const errorCount = await prisma.invoice.count({
      where: { ...(batchId ? { batchId } : {}), status: "error" },
    });

    // Category breakdown
    const catMap = new Map<
      string,
      { count: number; revenue: number; profit: number }
    >();
    for (const inv of invoices) {
      const cat = inv.category || "Uncategorized";
      const existing = catMap.get(cat) || { count: 0, revenue: 0, profit: 0 };
      existing.count++;
      existing.revenue += inv.totalAmount || 0;
      existing.profit += inv.marginAmount || 0;
      catMap.set(cat, existing);
    }
    const categoryBreakdown = Array.from(catMap.entries()).map(
      ([name, data]) => ({
        name,
        ...data,
        margin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0,
      })
    );

    // Status breakdown
    const statusCounts = await prisma.invoice.groupBy({
      by: ["status"],
      _count: true,
      where: batchId ? { batchId } : undefined,
    });
    const statusBreakdown = statusCounts.map((s) => ({
      status: s.status,
      count: s._count,
    }));

    // Top/bottom invoices by profit
    const sorted = [...invoices]
      .filter((i) => i.marginAmount != null)
      .sort((a, b) => (b.marginAmount || 0) - (a.marginAmount || 0));
    const topInvoices = sorted.slice(0, 5).map((i) => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      customerName: `${i.customerFirstName || ""} ${i.customerLastName || ""}`.trim(),
      totalAmount: i.totalAmount,
      marginAmount: i.marginAmount,
      category: i.category,
    }));
    const bottomInvoices = sorted
      .slice(-5)
      .reverse()
      .map((i) => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        customerName: `${i.customerFirstName || ""} ${i.customerLastName || ""}`.trim(),
        totalAmount: i.totalAmount,
        marginAmount: i.marginAmount,
        category: i.category,
      }));

    return {
      grossRevenue,
      totalProfit,
      avgMargin,
      errorCount,
      categoryBreakdown,
      statusBreakdown,
      topInvoices,
      bottomInvoices,
    };
  }
}

export const localDb = new LocalDatabaseProvider();
