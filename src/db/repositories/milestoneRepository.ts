import { db } from '../database';
import { Award, Goal, Milestone, MilestoneType } from '../../types';

export const milestoneRepository = {
  async getMilestonesByGoal(goalId: string): Promise<Milestone[]> {
    return await db.milestones.where('goalId').equals(goalId).toArray();
  },

  async getAllMilestones(): Promise<Milestone[]> {
    return await db.milestones.toArray();
  },

  async createMilestone(
    goalId: string,
    targetValue: number,
    type: MilestoneType = 'streak'
  ): Promise<Milestone> {
    const id = `ms_${goalId}_${Date.now()}_${targetValue}`;
    const milestone: Milestone = {
      id,
      goalId,
      targetValue,
      type,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await db.milestones.add(milestone);
    return milestone;
  },

  async getAllAwards(): Promise<Award[]> {
    return await db.awards.reverse().sortBy('achievedAt');
  },

  /**
   * Evaluates pending milestones for a goal and permanently awards achievements.
   * If a streak later breaks, already earned awards remain permanently in the trophy case.
   */
  async evaluateMilestonesForGoal(
    goal: Goal,
    currentStreak: number,
    totalSuccessfulDays: number
  ): Promise<Award[]> {
    const milestones = await this.getMilestonesByGoal(goal.id);
    const newAwards: Award[] = [];
    const now = new Date().toISOString();

    for (const ms of milestones) {
      if (ms.status === 'achieved') continue;

      const reached =
        ms.type === 'streak'
          ? currentStreak >= ms.targetValue
          : totalSuccessfulDays >= ms.targetValue;

      if (reached) {
        ms.status = 'achieved';
        ms.achievedAt = now;
        await db.milestones.put(ms);

        const badgeIcon =
          ms.targetValue >= 90
            ? 'Crown'
            : ms.targetValue >= 60
            ? 'Shield'
            : ms.targetValue >= 30
            ? 'Trophy'
            : 'Flame';

        const award: Award = {
          id: `award_${ms.id}`,
          goalId: goal.id,
          milestoneId: ms.id,
          goalTitle: goal.title,
          milestoneValue: ms.targetValue,
          title: `${ms.targetValue}-Day Streak Mastery`,
          description: `Forged a monumental ${ms.targetValue}-day streak on "${goal.title}".`,
          badgeIcon,
          achievedAt: now,
        };

        await db.awards.put(award);
        newAwards.push(award);
      }
    }

    return newAwards;
  },

  async deleteMilestone(id: string): Promise<void> {
    await db.milestones.delete(id);
  },
};
