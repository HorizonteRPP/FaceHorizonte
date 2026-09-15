import { User, Post, MarketplaceCar, ChatMessage, AdminSession, DatabaseHealth, Group, ThemeMode, DiscordApiConfig, SupabaseApiConfig } from '../types';
import { INITIAL_POSTS, INITIAL_MARKETPLACE, INITIAL_MESSAGES, INITIAL_USERS, INITIAL_GROUPS } from '../mockData';

const KEYS = {
  USER: 'facehorizont_user_v4',
  POSTS: 'facehorizont_posts_v4',
  MARKETPLACE: 'facehorizont_marketplace_v4',
  MESSAGES: 'facehorizont_messages_v4',
  GROUPS: 'facehorizont_groups_v4',
  ADMIN: 'facehorizont_admin_session_v4',
  DB_STATUS: 'facehorizont_db_status_v4',
  REGISTERED_USERS: 'facehorizont_all_users_v4',
  THEME: 'facehorizont_theme_v3',
  DISCORD_CONFIG: 'facehorizont_discord_config_v4',
  SUPABASE_CONFIG: 'facehorizont_supabase_config_v4',
  DATA_PURGED: 'facehorizont_clean_slate_v4'
};

// Check if localStorage is available
const isStorageAvailable = () => {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
};

// Auto-purge all previous mock / legacy data so all users start 100% clean
if (isStorageAvailable()) {
  try {
    if (!localStorage.getItem(KEYS.DATA_PURGED)) {
      // Clean legacy keys
      const legacyKeys = [
        'facehorizont_posts_v1', 'facehorizont_posts_v2', 'facehorizont_posts_v3',
        'facehorizont_marketplace_v1', 'facehorizont_marketplace_v2', 'facehorizont_marketplace_v3',
        'facehorizont_messages_v1', 'facehorizont_messages_v2', 'facehorizont_messages_v3',
        'facehorizont_all_users_v1', 'facehorizont_all_users_v2', 'facehorizont_all_users_v3',
        'facehorizont_groups_v1', 'facehorizont_groups_v2', 'facehorizont_groups_v3'
      ];
      legacyKeys.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem(KEYS.DATA_PURGED, 'true');
    }
  } catch (e) {
    console.warn('Could not auto-purge legacy keys:', e);
  }
}

// Safe setItem helper that handles quota and mobile browser storage restrictions gracefully
export const safeSetItem = (key: string, value: string): void => {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[storage] Could not save key "${key}" to localStorage:`, err);
    try {
      // If quota exceeded, clean up old non-critical caches
      const nonCritical = ['facehorizont_posts_v4', 'facehorizont_clean_slate_v4'];
      nonCritical.forEach((k) => {
        if (k !== key) localStorage.removeItem(k);
      });
      localStorage.setItem(key, value);
    } catch {
      // Safely ignore, app continues in-memory with server sync
    }
  }
};

export const resetAllApplicationData = (): void => {
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(KEYS.POSTS);
    localStorage.removeItem(KEYS.MARKETPLACE);
    localStorage.removeItem(KEYS.MESSAGES);
    localStorage.removeItem(KEYS.GROUPS);
    localStorage.removeItem(KEYS.REGISTERED_USERS);
    safeSetItem(KEYS.POSTS, JSON.stringify([]));
    safeSetItem(KEYS.MARKETPLACE, JSON.stringify([]));
    safeSetItem(KEYS.MESSAGES, JSON.stringify([]));
    safeSetItem(KEYS.GROUPS, JSON.stringify([]));
    safeSetItem(KEYS.REGISTERED_USERS, JSON.stringify([]));
  } catch (e) {
    console.warn('Error resetting data:', e);
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
    safeSetItem(KEYS.USER, JSON.stringify(user));
    // Also add to registered users list
    const registered = getRegisteredUsers();
    const existingIdx = registered.findIndex((u) => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase());
    if (existingIdx >= 0) {
      registered[existingIdx] = { ...registered[existingIdx], ...user };
    } else {
      registered.push(user);
    }
    safeSetItem(KEYS.REGISTERED_USERS, JSON.stringify(registered));
  }
};

export const getRegisteredUsers = (): User[] => {
  if (!isStorageAvailable()) return INITIAL_USERS;
  const raw = localStorage.getItem(KEYS.REGISTERED_USERS);
  if (!raw) {
    safeSetItem(KEYS.REGISTERED_USERS, JSON.stringify(INITIAL_USERS));
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
  safeSetItem(KEYS.REGISTERED_USERS, JSON.stringify(users));
};

export const clearStoredUser = (): void => {
  saveStoredUser(null);
};

export const getPosts = (): Post[] => {
  if (!isStorageAvailable()) return INITIAL_POSTS;
  const raw = localStorage.getItem(KEYS.POSTS);
  if (!raw) {
    safeSetItem(KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
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
  safeSetItem(KEYS.POSTS, JSON.stringify(posts));
};

export const getMarketplaceCars = (): MarketplaceCar[] => {
  if (!isStorageAvailable()) return INITIAL_MARKETPLACE;
  const raw = localStorage.getItem(KEYS.MARKETPLACE);
  if (!raw) {
    safeSetItem(KEYS.MARKETPLACE, JSON.stringify(INITIAL_MARKETPLACE));
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
  safeSetItem(KEYS.MARKETPLACE, JSON.stringify(cars));
};

export const getMessages = (): ChatMessage[] => {
  if (!isStorageAvailable()) return INITIAL_MESSAGES;
  const raw = localStorage.getItem(KEYS.MESSAGES);
  if (!raw) {
    safeSetItem(KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
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
  safeSetItem(KEYS.MESSAGES, JSON.stringify(messages));
};

export const getGroups = (): Group[] => {
  if (!isStorageAvailable()) return INITIAL_GROUPS;
  const raw = localStorage.getItem(KEYS.GROUPS);
  if (!raw) {
    safeSetItem(KEYS.GROUPS, JSON.stringify(INITIAL_GROUPS));
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
  safeSetItem(KEYS.GROUPS, JSON.stringify(groups));
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
  safeSetItem(KEYS.ADMIN, JSON.stringify(session));
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
    safeSetItem(KEYS.DB_STATUS, JSON.stringify(initial));
  }
  return initial;
};

export const saveDatabaseHealth = (health: DatabaseHealth): void => {
  if (!isStorageAvailable()) return;
  safeSetItem(KEYS.DB_STATUS, JSON.stringify(health));
};

// Theme Mode Storage ('charcoal' is the modern dark gray style, 'light' is white/clean)
export const getStoredTheme = (): ThemeMode => {
  if (!isStorageAvailable()) return 'charcoal';
  const raw = localStorage.getItem(KEYS.THEME) as ThemeMode | null;
  return raw === 'light' ? 'light' : 'charcoal';
};

export const saveStoredTheme = (theme: ThemeMode): void => {
  if (!isStorageAvailable()) return;
  safeSetItem(KEYS.THEME, theme);
};

// Discord OAuth2 Config Storage (Only for user name & avatar)
export const getStoredDiscordConfig = (): DiscordApiConfig => {
  const defaultRedirect = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}` 
    : 'https://horizonterpp.github.io/FaceHorizonte/';
  const defaultCfg: DiscordApiConfig = {
    clientId: '1548792649731801139',
    clientSecret: '',
    redirectUri: defaultRedirect
  };

  if (!isStorageAvailable()) return defaultCfg;
  const raw = localStorage.getItem(KEYS.DISCORD_CONFIG);
  if (!raw) return defaultCfg;
  try {
    const parsed = JSON.parse(raw);
    return { ...defaultCfg, ...parsed, clientId: parsed.clientId && parsed.clientId !== '123456789012345678' ? parsed.clientId : '1548792649731801139' };
  } catch {
    return defaultCfg;
  }
};

export const saveStoredDiscordConfig = (config: DiscordApiConfig): void => {
  if (!isStorageAvailable()) return;
  safeSetItem(KEYS.DISCORD_CONFIG, JSON.stringify(config));
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
  safeSetItem(KEYS.SUPABASE_CONFIG, JSON.stringify(config));
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
