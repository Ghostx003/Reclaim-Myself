import { db } from '../database';
import { Goal } from '../../types';

export const goalRepository = {
  async getAllGoals(includeArchived: boolean = false): Promise<Goal[]> {
    if (includeArchived) {
      return await db.goals.toArray();
    }
    return await db.goals.filter((g) => !g.isArchived).toArray();
  },

  async getGoalById(id: string): Promise<Goal | null> {
    const goal = await db.goals.get(id);
    return goal || null;
  },

  async createGoal(
    goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>
  ): Promise<Goal> {
    const id = `goal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    const goal: Goal = {
      ...goalData,
      id,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.goals.add(goal);

    // Auto-create default milestones (e.g. 7 days, 21 days, 30 days)
    const defaultMilestones = [7, 21, 30, 60, 90];
    for (const val of defaultMilestones) {
      await db.milestones.add({
        id: `ms_${id}_${val}`,
        goalId: id,
        targetValue: val,
        type: 'streak',
        status: 'pending',
        createdAt: now,
      });
    }

    return goal;
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | null> {
    const goal = await this.getGoalById(id);
    if (!goal) return null;

    const updated: Goal = {
      ...goal,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.goals.put(updated);
    return updated;
  },

  async archiveGoal(id: string): Promise<void> {
    await this.updateGoal(id, { isArchived: true });
  },

  async deleteGoal(id: string): Promise<void> {
    // Delete goal from database and its milestones/counters
    await db.transaction('rw', [db.goals, db.milestones, db.counters], async () => {
      await db.goals.delete(id);
      await db.milestones.where('goalId').equals(id).delete();
      await db.counters.where('goalId').equals(id).delete();
    });
  },
};
