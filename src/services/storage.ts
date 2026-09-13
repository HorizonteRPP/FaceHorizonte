import { User, Post, MarketplaceCar, ChatMessage, AdminSession, DatabaseHealth, Group, ThemeMode, DiscordApiConfig, SupabaseApiConfig } from '../types';
import { INITIAL_POSTS, INITIAL_MARKETPLACE, INITIAL_MESSAGES, INITIAL_USERS, INITIAL_GROUPS } from '../mockData';

const KEYS = {
  USER: 'facehorizont_user_v3',
  POSTS: 'facehorizont_posts_v3',
  MARKETPLACE: 'facehorizont_marketplace_v3',
  MESSAGES: 'facehorizont_messages_v3',
  GROUPS: 'facehorizont_groups_v3',
  ADMIN: 'facehorizont_admin_session_v3',
  DB_STATUS: 'facehorizont_db_status_v3',
  REGISTERED_USERS: 'facehorizont_all_users_v3',
  THEME: 'facehorizont_theme_v3',
  DISCORD_CONFIG: 'facehorizont_discord_config_v3',
  SUPABASE_CONFIG: 'facehorizont_supabase_config_v3'
};

// Check if localStorage is available
const isStorageAvailable = () => {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
};

export const getStoredUser = (): User | null => {
  if (!isStorageAvailable()) return null;
  const raw = localStorage.getItem(KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveStoredUser = (user: User | null): void => {
  if (!isStorageAvailable()) return;
  if (!user) {
    localStorage.removeItem(KEYS.USER);
  } else {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    // Also add to registered users list
    const registered = getRegisteredUsers();
    const existingIdx = registered.findIndex((u) => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase());
    if (existingIdx >= 0) {
      registered[existingIdx] = { ...registered[existingIdx], ...user };
    } else {
      registered.push(user);
    }
    localStorage.setItem(KEYS.REGISTERED_USERS, JSON.stringify(registered));
  }
};

export const getRegisteredUsers = (): User[] => {
  if (!isStorageAvailable()) return INITIAL_USERS;
  const raw = localStorage.getItem(KEYS.REGISTERED_USERS);
  if (!raw) {
    localStorage.setItem(KEYS.REGISTERED_USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
};

export const saveRegisteredUsers = (users: User[]): void => {
  if (!isStorageAvailable()) return;
  localStorage.setItem(KEYS.REGISTERED_USERS, JSON.stringify(users));
};

export const clearStoredUser = (): void => {
  saveStoredUser(null);
};

export const getPosts = (): Post[] => {
  if (!isStorageAvailable()) return INITIAL_POSTS;
  const raw = localStorage.getItem(KEYS.POSTS);
  if (!raw) {
    localStorage.setItem(KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
    return INITIAL_POSTS;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_POSTS;
  } catch {
    return INITIAL_POSTS;
  }
};

export const savePosts = (posts: Post[]): void => {
  if (!isStorageAvailable()) return;
  localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
};

export const getMarketplaceCars = (): MarketplaceCar[] => {
  if (!isStorageAvailable()) return INITIAL_MARKETPLACE;
  const raw = localStorage.getItem(KEYS.MARKETPLACE);
  if (!raw) {
    localStorage.setItem(KEYS.MARKETPLACE, JSON.stringify(INITIAL_MARKETPLACE));
    return INITIAL_MARKETPLACE;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MARKETPLACE;
  } catch {
    return INITIAL_MARKETPLACE;
  }
};

export const saveMarketplaceCars = (cars: MarketplaceCar[]): void => {
  if (!isStorageAvailable()) return;
  localStorage.setItem(KEYS.MARKETPLACE, JSON.stringify(cars));
};

export const getMessages = (): ChatMessage[] => {
  if (!isStorageAvailable()) return INITIAL_MESSAGES;
  const raw = localStorage.getItem(KEYS.MESSAGES);
  if (!raw) {
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    return INITIAL_MESSAGES;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MESSAGES;
  } catch {
    return INITIAL_MESSAGES;
  }
};

export const saveMessages = (messages: ChatMessage[]): void => {
  if (!isStorageAvailable()) return;
  localStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
};

export const getGroups = (): Group[] => {
  if (!isStorageAvailable()) return INITIAL_GROUPS;
  const raw = localStorage.getItem(KEYS.GROUPS);
  if (!raw) {
    localStorage.setItem(KEYS.GROUPS, JSON.stringify(INITIAL_GROUPS));
    return INITIAL_GROUPS;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_GROUPS;
  } catch {
    return INITIAL_GROUPS;
  }
};

export const saveGroups = (groups: Group[]): void => {
  if (!isStorageAvailable()) return;
  localStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
};

export const getAdminSession = (): AdminSession => {
  const defaultSession: AdminSession = {
    isAdmin1: false,
    isAdmin2: false,
    adminName: ''
  };

  if (!isStorageAvailable()) return defaultSession;
  const raw = localStorage.getItem(KEYS.ADMIN);
  if (!raw) return defaultSession;
  try {
    return JSON.parse(raw);
  } catch {
    return defaultSession;
  }
};

export const saveAdminSession = (session: AdminSession): void => {
  if (!isStorageAvailable()) return;
  localStorage.setItem(KEYS.ADMIN, JSON.stringify(session));
};

export const getDatabaseHealth = (): DatabaseHealth => {
  const posts = getPosts();
  const cars = getMarketplaceCars();
  const msgs = getMessages();
  const users = getRegisteredUsers();
  const groups = getGroups();

  if (isStorageAvailable()) {
    const raw = localStorage.getItem(KEYS.DB_STATUS);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return {
          ...parsed,
          totalPosts: posts.length,
          totalCars: cars.length,
          totalMessages: msgs.length,
          totalUsers: users.length,
          totalGroups: groups.length,
          lastSyncTime: Date.now()
        };
      } catch {
        // ignore
      }
    }
  }

  const initial: DatabaseHealth = {
    supabaseConnected: true,
    mongodbConnected: false, // Recommended Supabase as single source
    serverOnline: true,
    pingMs: 22,
    activeSockets: 0,
    totalUsers: users.length,
    totalPosts: posts.length,
    totalCars: cars.length,
    totalMessages: msgs.length,
    totalGroups: groups.length,
    lastSyncTime: Date.now()
  };
  if (isStorageAvailable()) {
    localStorage.setItem(KEYS.DB_STATUS, JSON.stringify(initial));
  }
  return initial;
};

export const saveDatabaseHealth = (health: DatabaseHealth): void => {
  if (!isStorageAvailable()) return;
  localStorage.setItem(KEYS.DB_STATUS, JSON.stringify(health));
};

// Theme Mode Storage ('charcoal' is the modern dark gray style, 'light' is white/clean)
export const getStoredTheme = (): ThemeMode => {
  if (!isStorageAvailable()) return 'charcoal';
  const raw = localStorage.getItem(KEYS.THEME) as ThemeMode | null;
  return raw === 'light' ? 'light' : 'charcoal';
};

export const saveStoredTheme = (theme: ThemeMode): void => {
  if (!isStorageAvailable()) return;
  localStorage.setItem(KEYS.THEME, theme);
};

// Discord OAuth2 Config Storage (Only for user name & avatar)
export const getStoredDiscordConfig = (): DiscordApiConfig => {
  const defaultRedirect = typeof window !== 'undefined' ? `${window.location.origin}/` : 'http://localhost:3000/';
  const defaultCfg: DiscordApiConfig = {
    clientId: '123456789012345678',
    clientSecret: '',
    redirectUri: defaultRedirect
  };

  if (!isStorageAvailable()) return defaultCfg;
  const raw = localStorage.getItem(KEYS.DISCORD_CONFIG);
  if (!raw) return defaultCfg;
  try {
    const parsed = JSON.parse(raw);
    return { ...defaultCfg, ...parsed };
  } catch {
    return defaultCfg;
  }
};

export const saveStoredDiscordConfig = (config: DiscordApiConfig): void => {
  if (!isStorageAvailable()) return;
  localStorage.setItem(KEYS.DISCORD_CONFIG, JSON.stringify(config));
};

// Supabase API Config Storage
export const getStoredSupabaseConfig = (): SupabaseApiConfig => {
  const defaultCfg: SupabaseApiConfig = {
    projectUrl: 'https://facehorizont-rp.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2Vob3Jpem9udC1ycCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjIwMDAwMDAwMDB9.sampleKeyForHorizonteRpLiveDemoOnlyNotRealSecret',
    serviceRoleKey: '',
    dbMode: 'supabase_only'
  };

  if (!isStorageAvailable()) return defaultCfg;
  const raw = localStorage.getItem(KEYS.SUPABASE_CONFIG);
  if (!raw) return defaultCfg;
  try {
    const parsed = JSON.parse(raw);
    return { ...defaultCfg, ...parsed };
  } catch {
    return defaultCfg;
  }
};

export const saveStoredSupabaseConfig = (config: SupabaseApiConfig): void => {
  if (!isStorageAvailable()) return;
  localStorage.setItem(KEYS.SUPABASE_CONFIG, JSON.stringify(config));
};

export const generateRpSellerReply = (sellerName: string, userMessage: string, carTitle?: string): string => {
  const lower = userMessage.toLowerCase();
  if (carTitle) {
    if (lower.includes('precio') || lower.includes('cuanto') || lower.includes('rebaja') || lower.includes('descuento')) {
      return `¡Buenas! El ${carTitle} está al precio publicado, pero puedo hacerte una pequeña rebaja si pagas en efectivo en Horizonte RP. ¿Te interesa verlo?`;
    }
    return `¡Hola! Sí, el ${carTitle} todavía está en mi garage. Podemos encontrarnos en la plaza o en el taller para que lo pruebes.`;
  }
  if (lower.includes('hola') || lower.includes('buenas') || lower.includes('que tal')) {
    return `¡Qué tal! ¿Cómo estás en la ciudad de Horizonte RP? Cuéntame en qué te puedo ayudar.`;
  }
  return `Entendido. Te aviso cuando esté libre en la ciudad de Horizonte RP para coordinar.`;
};
