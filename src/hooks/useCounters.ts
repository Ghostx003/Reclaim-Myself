import { useLiveQuery } from 'dexie-react-hooks';
import { counterRepository } from '../db/repositories/counterRepository';
import { CounterEvent, CustomCounter } from '../types';

export function useCounters(goalId?: string) {
  const counters = useLiveQuery(
    async () => {
      if (goalId) {
        return await counterRepository.getCountersByGoal(goalId);
      }
      return await counterRepository.getAllCounters();
    },
    [goalId]
  );

  const counterEvents = useLiveQuery(async () => {
    return await counterRepository.getAllCounterEvents();
  });

  const createCounter = async (data: {
    goalId?: string;
    name: string;
    unit: string;
    incrementValue: number;
    initialValue?: number;
  }): Promise<CustomCounter> => {
    return await counterRepository.createCounter(data);
  };

  const updateDelta = async (
    counterId: string,
    delta: number,
    note?: string
  ): Promise<{ counter: CustomCounter; event: CounterEvent } | null> => {
    return await counterRepository.updateCounterDelta(counterId, delta, note);
  };

  const deleteCounter = async (id: string): Promise<void> => {
    await counterRepository.deleteCounter(id);
  };

  return {
    counters: counters || [],
    counterEvents: counterEvents || [],
    isLoading: counters === undefined,
    createCounter,
    updateDelta,
    deleteCounter,
  };
}
