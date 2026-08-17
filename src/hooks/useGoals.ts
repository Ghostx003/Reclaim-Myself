import { useLiveQuery } from 'dexie-react-hooks';
import { goalRepository } from '../db/repositories/goalRepository';
import { Goal } from '../types';

export function useGoals(includeArchived: boolean = false) {
  const goals = useLiveQuery(
    async () => {
      return await goalRepository.getAllGoals(includeArchived);
    },
    [includeArchived]
  );

  const createGoal = async (
    data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>
  ): Promise<Goal> => {
    return await goalRepository.createGoal(data);
  };

  const updateGoal = async (id: string, updates: Partial<Goal>): Promise<Goal | null> => {
    return await goalRepository.updateGoal(id, updates);
  };

  const deleteGoal = async (id: string): Promise<void> => {
    await goalRepository.deleteGoal(id);
  };

  const archiveGoal = async (id: string): Promise<void> => {
    await goalRepository.archiveGoal(id);
  };

  return {
    goals: goals || [],
    isLoading: goals === undefined,
    createGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
  };
}
