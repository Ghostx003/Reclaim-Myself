import Dexie, { type EntityTable } from 'dexie';
import {
  Award,
  CounterEvent,
  CustomCounter,
  DailyAudit,
  Goal,
  Milestone,
  UserProfile,
} from '../types';
import { DB_NAME } from '../constants';

export class ReclaimDatabase extends Dexie {
  users!: EntityTable<UserProfile, 'id'>;
  goals!: EntityTable<Goal, 'id'>;
  audits!: EntityTable<DailyAudit, 'id'>;
  counters!: EntityTable<CustomCounter, 'id'>;
  counterEvents!: EntityTable<CounterEvent, 'id'>;
  milestones!: EntityTable<Milestone, 'id'>;
  awards!: EntityTable<Award, 'id'>;

  constructor() {
    super(DB_NAME);

    // Schema version 1
    this.version(1).stores({
      users: 'id, updatedAt',
      goals: 'id, isArchived, polarity, category, createdAt',
      audits: 'id, date, starRating, completedAt',
      counters: 'id, goalId, createdAt',
      counterEvents: 'id, counterId, date, timestamp',
      milestones: 'id, goalId, status, targetValue',
      awards: 'id, goalId, milestoneId, achievedAt',
    });
  }
}

export const db = new ReclaimDatabase();
