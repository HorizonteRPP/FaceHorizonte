import { Post, MarketplaceCar, User, ChatMessage, Group } from './types';

export const AVATAR_PRESETS = [
  {
    name: 'Piloto Callejero',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    role: 'citizen' as const
  },
  {
    name: 'Oficial de Policía HPD',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    role: 'police' as const
  },
  {
    name: 'Mecánico de Alto Rendimiento',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    role: 'mechanic' as const
  },
  {
    name: 'Empresario Horizonte',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces',
    role: 'citizen' as const
  }
];

// Completely clean initial data for fresh brand-new start ("nuevito todo")
export const INITIAL_USERS: User[] = [];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_MARKETPLACE: MarketplaceCar[] = [];

export const INITIAL_MESSAGES: ChatMessage[] = [];

export const INITIAL_GROUPS: Group[] = [];
