import { db } from '../database';
import { DailyAudit } from '../../types';

export const auditRepository = {
  async getAuditByDate(date: string): Promise<DailyAudit | null> {
    const audit = await db.audits.get(date);
    return audit || null;
  },

  async getAllAudits(): Promise<DailyAudit[]> {
    return await db.audits.toArray();
  },

  async getAuditsByDateRange(startDate: string, endDate: string): Promise<DailyAudit[]> {
    return await db.audits
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  },

  async saveDailyAudit(audit: DailyAudit): Promise<DailyAudit> {
    await db.audits.put(audit);
    return audit;
  },

  async deleteAudit(date: string): Promise<void> {
    await db.audits.delete(date);
  },
};
