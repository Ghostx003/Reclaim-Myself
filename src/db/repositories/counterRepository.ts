import { db } from '../database';
import { CounterEvent, CustomCounter } from '../../types';
import { formatDateKey } from '../../services/date/dateService';

export const counterRepository = {
  async getAllCounters(): Promise<CustomCounter[]> {
    return await db.counters.toArray();
  },

  async getCountersByGoal(goalId: string): Promise<CustomCounter[]> {
    return await db.counters.where('goalId').equals(goalId).toArray();
  },

  async getCounterById(id: string): Promise<CustomCounter | null> {
    const counter = await db.counters.get(id);
    return counter || null;
  },

  async createCounter(data: {
    goalId?: string;
    name: string;
    unit: string;
    incrementValue: number;
    initialValue?: number;
  }): Promise<CustomCounter> {
    const id = `counter_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();
    const initialVal = data.initialValue || 0;

    const counter: CustomCounter = {
      id,
      goalId: data.goalId,
      name: data.name.trim(),
      unit: data.unit.trim() || 'units',
      incrementValue: data.incrementValue || 1,
      currentValue: initialVal,
      createdAt: now,
      updatedAt: now,
    };

    await db.counters.add(counter);

    if (initialVal !== 0) {
      // Record initial event
      await db.counterEvents.add({
        id: `ce_${Date.now()}`,
        counterId: id,
        delta: initialVal,
        valueAfter: initialVal,
        date: formatDateKey(),
        timestamp: now,
        note: 'Initial value',
      });
    }

    return counter;
  },

  async updateCounterDelta(
    counterId: string,
    delta: number,
    note?: string
  ): Promise<{ counter: CustomCounter; event: CounterEvent } | null> {
    return await db.transaction('rw', [db.counters, db.counterEvents], async () => {
      const counter = await db.counters.get(counterId);
      if (!counter) return null;

      const newValue = (counter.currentValue || 0) + delta;
      const now = new Date().toISOString();
      const dateKey = formatDateKey();

      counter.currentValue = newValue;
      counter.updatedAt = now;
      await db.counters.put(counter);

      const event: CounterEvent = {
        id: `ce_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        counterId,
        delta,
        valueAfter: newValue,
        date: dateKey,
        timestamp: now,
        note,
      };

      await db.counterEvents.add(event);

      return { counter, event };
    });
  },

  async getCounterEvents(counterId: string): Promise<CounterEvent[]> {
    return await db.counterEvents.where('counterId').equals(counterId).toArray();
  },

  async getAllCounterEvents(): Promise<CounterEvent[]> {
    return await db.counterEvents.toArray();
  },

  async deleteCounter(id: string): Promise<void> {
    await db.transaction('rw', [db.counters, db.counterEvents], async () => {
      await db.counters.delete(id);
      await db.counterEvents.where('counterId').equals(id).delete();
    });
  },
};
