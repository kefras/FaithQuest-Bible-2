import { Testament, GameMode, Level } from '../types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: {
    type: 'score' | 'correctCount' | 'category' | 'mode' | 'streak' | 'level';
    value: any;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_quest',
    title: 'First Disciple',
    description: 'Complete your first scripture quest.',
    icon: 'Scroll',
    requirement: { type: 'score', value: 0 }
  },
  {
    id: 'perfect_standard',
    title: 'Divine Perfection',
    description: 'Get a perfect score in Standard Mode.',
    icon: 'Sun',
    requirement: { type: 'correctCount', value: 10 }
  },
  {
    id: 'genesis_master',
    title: 'Master of Origins',
    description: 'Master the book of Genesis with 100% accuracy.',
    icon: 'Leaf',
    requirement: { type: 'category', value: 'Genesis' }
  },
  {
    id: 'daily_champion',
    title: 'Daily Champion',
    description: 'Complete a Daily Challenge with a high score.',
    icon: 'Crown',
    requirement: { type: 'mode', value: 'Daily' }
  },
  {
    id: 'advanced_scholar',
    title: 'Biblical Scholar',
    description: 'Master the Advance difficulty level.',
    icon: 'Book',
    requirement: { type: 'level', value: 'Advance' }
  }
];
