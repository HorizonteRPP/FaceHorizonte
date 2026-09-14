export type UserRole = 'citizen' | 'police' | 'mechanic' | 'admin' | 'superadmin';

export interface User {
  id: string;
  username: string;
  avatar: string;
  password?: string;
  role: UserRole;
  isDiscordUser?: boolean;
  discordTag?: string;
  bio?: string;
  createdAt: number;
}

export interface PostReaction {
  heart: number;
  fire: number;
  clap: number;
  userReaction?: 'heart' | 'fire' | 'clap';
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  timestamp: number;
  likes: number;
  likedBy: string[];
  reactions: PostReaction;
  comments: Comment[];
  tag?: string;
}

export interface MarketplaceCar {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  title: string;
  price: number;
  currency: string;
  description: string;
  imageUrl: string;
  category: 'Deportivo' | 'Sedán' | 'Camioneta & SUV' | 'Moto' | 'Blindado & Policía';
  condition: 'Nuevo (0km)' | 'Excelente' | 'Modificado RP' | 'Usado';
  location: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  recipientName: string;
  text: string;
  timestamp: number;
  isRead: boolean;
  carContext?: {
    id: string;
    title: string;
    price: number;
  };
}

export interface ChatThread {
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastTimestamp: number;
  unreadCount: number;
  carContext?: {
    id: string;
    title: string;
    price: number;
  };
}

export interface AdminSession {
  isAdmin1: boolean; // LeonardoHorizonteRP
  isAdmin2: boolean; // SOYGUAPOLOSE (SOS)
  adminName: string;
  activatedAt?: number;
}

export interface DatabaseHealth {
  supabaseConnected: boolean;
  mongodbConnected: boolean;
  serverOnline: boolean;
  pingMs: number;
  activeSockets: number;
  totalUsers: number;
  totalPosts: number;
  totalCars: number;
  totalMessages: number;
  totalGroups?: number;
  lastSyncTime: number;
}

export type GroupRole = 'owner' | 'admin' | 'moderator' | 'member';

export interface GroupMember {
  userId: string;
  username: string;
  avatar: string;
  role: GroupRole;
  joinedAt: number;
  canPost: boolean;
  canChat: boolean;
}

export interface GroupPost {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  timestamp: number;
  likes: number;
  likedBy: string[];
  reactions: PostReaction;
  comments: Comment[];
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole?: GroupRole;
  text: string;
  timestamp: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  privacy: 'public' | 'private';
  coverUrl: string;
  iconUrl: string;
  createdBy: string;
  creatorName: string;
  createdAt: number;
  members: GroupMember[];
  posts: GroupPost[];
  messages: GroupMessage[];
}

export type ThemeMode = 'charcoal' | 'light';

export interface DiscordApiConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
}

export interface SupabaseApiConfig {
  projectUrl: string;
  anonKey: string;
  serviceRoleKey?: string;
  dbMode: 'supabase_only' | 'dual' | 'local';
}


