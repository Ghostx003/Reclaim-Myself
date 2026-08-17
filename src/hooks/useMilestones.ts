import { useLiveQuery } from 'dexie-react-hooks';
import { milestoneRepository } from '../db/repositories/milestoneRepository';
import { Milestone, MilestoneType } from '../types';

export function useMilestones(goalId?: string) {
  const milestones = useLiveQuery(
    async () => {
      if (goalId) {
        return await milestoneRepository.getMilestonesByGoal(goalId);
      }
      return await milestoneRepository.getAllMilestones();
    },
    [goalId]
  );

  const awards = useLiveQuery(async () => {
    return await milestoneRepository.getAllAwards();
  });

  const createMilestone = async (
    targetGoalId: string,
    targetValue: number,
    type: MilestoneType = 'streak'
  ): Promise<Milestone> => {
    return await milestoneRepository.createMilestone(targetGoalId, targetValue, type);
  };

  const deleteMilestone = async (id: string): Promise<void> => {
    await milestoneRepository.deleteMilestone(id);
  };

  return {
    milestones: milestones || [],
    awards: awards || [],
    isLoading: milestones === undefined || awards === undefined,
    createMilestone,
    deleteMilestone,
  };
}
