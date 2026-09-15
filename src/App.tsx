import React, { useState, useEffect } from 'react';
import { 
  User, 
  Post, 
  MarketplaceCar, 
  ChatMessage, 
  AdminSession, 
  DatabaseHealth,
  Group,
  GroupPost,
  GroupMessage,
  GroupMember,
  ThemeMode,
  DiscordApiConfig,
  SupabaseApiConfig,
  ServerAuditLog
} from './types';
import { 
  syncMessagesWithSupabase, 
  syncPostsWithSupabase,
  syncCarsWithSupabase
} from './services/supabaseSync';
import { 
  Home, 
  Store, 
  Users, 
  MessageSquare, 
  Shield, 
  RefreshCw 
} from 'lucide-react';
import { 
  getStoredUser, 
  saveStoredUser, 
  clearStoredUser, 
  getRegisteredUsers, 
  saveRegisteredUsers, 
  getPosts, 
  savePosts, 
  getMarketplaceCars, 
  saveMarketplaceCars, 
  getMessages, 
  saveMessages, 
  getAdminSession, 
  saveAdminSession, 
  getDatabaseHealth, 
  saveDatabaseHealth,
  getGroups,
  saveGroups,
  getStoredTheme,
  saveStoredTheme,
  getStoredDiscordConfig,
  saveStoredDiscordConfig,
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  resetAllApplicationData
} from './services/storage';

import { Header } from './components/Header';
import { FeedView } from './components/FeedView';
import { MarketplaceView } from './components/MarketplaceView';
import { GroupsView } from './components/GroupsView';
import { CreateGroupModal } from './components/CreateGroupModal';
import { MessengerDrawer } from './components/MessengerDrawer';
import { AdminModal } from './components/AdminModal';
import { SosModal } from './components/SosModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';

export default function App() {
  // Navigation & User State
  const [currentTab, setCurrentTab] = useState<'feed' | 'marketplace' | 'groups'>('feed');
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => getRegisteredUsers());

  // Theme Mode: 'charcoal' (Dark Slate/Gray Discord style) or 'light' (Clean White)
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());

  // Discord API Configuration
  const [discordConfig, setDiscordConfig] = useState<DiscordApiConfig>(() => getStoredDiscordConfig());

  // Supabase API Configuration
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseApiConfig>(() => getStoredSupabaseConfig());

  // Data Collections (Starting completely fresh and empty)
  const [posts, setPosts] = useState<Post[]>(() => getPosts());
  const [cars, setCars] = useState<MarketplaceCar[]>(() => getMarketplaceCars());
  const [messages, setMessages] = useState<ChatMessage[]>(() => getMessages());
  const [groups, setGroups] = useState<Group[]>(() => getGroups());

  // Administrative Sessions
  const [adminSession, setAdminSession] = useState<AdminSession>(() => getAdminSession());
  const [dbHealth, setDbHealth] = useState<DatabaseHealth>(() => getDatabaseHealth());

  // Real-time community audit logs
  const [auditLogs, setAuditLogs] = useState<ServerAuditLog[]>([]);

  // Modals Visibility
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Private Chat Drawer State
  const [messengerOpen, setMessengerOpen] = useState(false);
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [carChatContext, setCarChatContext] = useState<MarketplaceCar | null>(null);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Helper to verify Discord access token and log in
  const verifyDiscordToken = async (token: string) => {
    showToast('🔄 Verificando cuenta de Discord oficial...');
    try {
      const res = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch Discord user');
      const discordData = await res.json();
      if (discordData && (discordData.username || discordData.id)) {
        const avatar = discordData.avatar
          ? `https://cdn.discordapp.com/avatars/${discordData.id}/${discordData.avatar}.png?size=256`
          : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(discordData.username || 'discord')}`;

        const discTag =
          discordData.discriminator && discordData.discriminator !== '0'
            ? `${discordData.username}#${discordData.discriminator}`
            : `@${discordData.username}`;

        const user: User = {
          id: `discord_${discordData.id}`,
          username: discordData.global_name || discordData.username,
          avatar,
          role: 'citizen',
          isDiscordUser: true,
          discordTag: discTag,
          bio: `Cuenta oficial verificada con Discord en Roblox Horizonte RP.`,
          createdAt: Date.now()
        };

        handleRegisterSuccess(user);
        showToast(`🎉 ¡Bienvenido/a, ${user.username}! Conectado con tu cuenta real de Discord.`);
      }
    } catch (err) {
      console.error('Error fetching Discord profile:', err);
      showToast('⚠️ No se pudo obtener el perfil de Discord. Verifica tu conexión.');
    } finally {
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  };

  // Listen for Discord OAuth2 token redirect in URL hash or cross-window postMessage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Direct Hash Check
    const hash = window.location.hash;
    const search = window.location.search;

    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const token = params.get('access_token');
      if (token) {
        verifyDiscordToken(token);
      }
    } else if (hash.includes('error=') || search.includes('error=')) {
      const params = new URLSearchParams(hash ? hash.replace('#', '?') : search);
      const errDesc = params.get('error_description') || params.get('error') || 'Autorización cancelada';
      showToast(`⚠️ Discord: ${decodeURIComponent(errDesc.replace(/\+/g, ' '))}`);
      window.history.replaceState(null, '', window.location.pathname);
    }

    // 2. PostMessage listener for popup or /auth/callback
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'DISCORD_OAUTH_PAYLOAD') {
        const payload = event.data;
        if (payload.hash && payload.hash.includes('access_token=')) {
          const params = new URLSearchParams(payload.hash.replace('#', '?'));
          const token = params.get('access_token');
          if (token) {
            verifyDiscordToken(token);
          }
        } else if (payload.hash?.includes('error=') || payload.search?.includes('error=')) {
          const params = new URLSearchParams(payload.hash ? payload.hash.replace('#', '?') : payload.search);
          const errDesc = params.get('error_description') || params.get('error');
          if (errDesc) {
            showToast(`⚠️ Discord: ${decodeURIComponent(errDesc.replace(/\+/g, ' '))}`);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Sync body theme class with state
  useEffect(() => {
    document.body.className = theme === 'light' ? 'theme-light' : 'theme-charcoal';
  }, [theme]);

  // Toggle theme mode
  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'charcoal' ? 'light' : 'charcoal';
    setTheme(nextTheme);
    saveStoredTheme(nextTheme);
    showToast(nextTheme === 'light' ? '☀️ Interfaz en Modo Blanco activada' : '🌙 Interfaz en Modo Negro/Gris activada');
  };

  // Save Discord API configuration
  const handleSaveDiscordConfig = (newCfg: DiscordApiConfig) => {
    setDiscordConfig(newCfg);
    saveStoredDiscordConfig(newCfg);
    showToast('Configuración de Discord API guardada.');
  };

  // Direct Official Discord OAuth2 authorization trigger - DIRECT TO DISCORD WEB
  const handleStartDiscordOAuth = () => {
    const activeClientId = (
      (import.meta as any).env?.VITE_DISCORD_CLIENT_ID ||
      discordConfig?.clientId ||
      ''
    ).trim() || '1548792649731801139';

    // Normalize Redirect URI to clean GitHub Pages or current origin
    let currentRedirect = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://horizonterpp.github.io/FaceHorizonte/';

    // Ensure proper trailing slash for directory URLs if on GitHub Pages
    if (currentRedirect.includes('horizonterpp.github.io') && !currentRedirect.endsWith('/')) {
      currentRedirect += '/';
    }

    showToast('🚀 Redirigiendo a autorización oficial de Discord...');
    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(
      activeClientId
    )}&response_type=token&scope=identify&redirect_uri=${encodeURIComponent(currentRedirect)}`;

    try {
      if (window.top && window.top !== window) {
        window.top.location.href = discordAuthUrl;
        return;
      }
    } catch {
      // In case of cross-origin iframe security restriction:
      window.open(discordAuthUrl, '_blank');
      return;
    }
    window.location.href = discordAuthUrl;
  };

  // Real-time synchronization engine with Server API and Supabase (for PC and Mobile devices)
  const syncWithServerAndSupabase = async () => {
    setIsSyncing(true);
    try {
      // 1. Health check & Server Status
      const resHealth = await fetch('/api/health');
      if (resHealth.ok) {
        const healthData = await resHealth.json();
        setDbHealth((prev) => ({
          ...prev,
          serverOnline: true,
          supabaseConnected: healthData.supabaseConnected ?? prev.supabaseConnected,
          mongodbConnected: healthData.mongodbConnected ?? prev.mongodbConnected,
          pingMs: healthData.pingMs ?? prev.pingMs
        }));
      }

      // 2. Fetch posts from server
      const resPosts = await fetch('/api/posts');
      if (resPosts.ok) {
        const serverPosts: Post[] = await resPosts.json();
        if (Array.isArray(serverPosts)) {
          setPosts(serverPosts);
          savePosts(serverPosts);
        }
      }

      // 3. Fetch marketplace cars from server (Cross-device PC <-> Mobile sync)
      const resCars = await fetch('/api/marketplace');
      if (resCars.ok) {
        const serverCars: MarketplaceCar[] = await resCars.json();
        if (Array.isArray(serverCars)) {
          setCars(serverCars);
          saveMarketplaceCars(serverCars);
        }
      }

      // 4. Fetch private messages from server (Cross-device PC <-> Mobile sync)
      const resMessages = await fetch('/api/messages');
      if (resMessages.ok) {
        const serverMsgs: ChatMessage[] = await resMessages.json();
        if (Array.isArray(serverMsgs)) {
          setMessages(serverMsgs);
          saveMessages(serverMsgs);
        }
      }

      // 4.5 Fetch groups from server (Cross-device PC <-> Mobile sync)
      const resGroups = await fetch('/api/groups');
      if (resGroups.ok) {
        const serverGroups: Group[] = await resGroups.json();
        if (Array.isArray(serverGroups)) {
          setGroups(serverGroups);
          saveGroups(serverGroups);
        }
      }

      // 5. Fetch registered users from server
      const resUsers = await fetch('/api/users');
      if (resUsers.ok) {
        const serverUsersData = await resUsers.json();
        if (Array.isArray(serverUsersData)) {
          const formattedUsers: User[] = serverUsersData.map((u: any) => ({
            id: u.id,
            username: u.username,
            avatar: u.avatar,
            role: u.role || 'citizen',
            discordTag: u.discordTag,
            isDiscordUser: u.isDiscordUser,
            bio: u.bio,
            createdAt: u.createdAt
          }));
          setRegisteredUsers((current) => {
            const map = new Map<string, User>();
            formattedUsers.forEach((u) => map.set(u.id, u));
            current.forEach((u) => {
              if (!map.has(u.id)) map.set(u.id, u);
            });
            const merged = Array.from(map.values());
            saveRegisteredUsers(merged);
            return merged;
          });
        }
      }

      // 6. Fetch activity audit logs
      const resLogs = await fetch('/api/logs');
      if (resLogs.ok) {
        const serverLogsData = await resLogs.json();
        if (Array.isArray(serverLogsData)) {
          setAuditLogs(serverLogsData);
        }
      }

      // 7. Supabase cloud sync if configured and enabled
      if (
        supabaseConfig?.enabled &&
        supabaseConfig?.projectUrl &&
        supabaseConfig?.anonKey &&
        !supabaseConfig.projectUrl.includes('facehorizont-rp.supabase.co')
      ) {
        syncPostsWithSupabase(supabaseConfig, posts).then((supaPosts) => {
          if (supaPosts && supaPosts.length > 0) {
            setPosts(supaPosts);
            savePosts(supaPosts);
          }
        }).catch(() => {});

        syncCarsWithSupabase(supabaseConfig, cars).then((supaCars) => {
          if (supaCars && supaCars.length > 0) {
            setCars(supaCars);
            saveMarketplaceCars(supaCars);
          }
        }).catch(() => {});

        syncMessagesWithSupabase(supabaseConfig, messages).then((supaMsgs) => {
          if (supaMsgs && supaMsgs.length > 0) {
            setMessages(supaMsgs);
            saveMessages(supaMsgs);
          }
        }).catch(() => {});
      }
    } catch {
      // Local fallback
    } finally {
      setIsSyncing(false);
    }
  };

  // Periodic multi-device polling every 2.5s and on window focus/visibility
  useEffect(() => {
    syncWithServerAndSupabase();

    const interval = setInterval(() => {
      syncWithServerAndSupabase();
    }, 2500);

    const handleFocus = () => {
      syncWithServerAndSupabase();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncWithServerAndSupabase();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [supabaseConfig]);

  // Handlers for Posts
  const handleAddPost = async (content: string, imageUrl?: string, tag?: string) => {
    if (!currentUser) return;

    const newPost: Post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      authorId: currentUser.id,
      authorName: currentUser.username,
      authorAvatar: currentUser.avatar,
      content,
      imageUrl,
      tag: tag || 'General',
      timestamp: Date.now(),
      likes: 0,
      likedBy: [],
      reactions: {
        heart: 0,
        fire: 0,
        clap: 0
      },
      comments: []
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    savePosts(updated);
    showToast('Publicación compartida en el muro.');

    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      syncWithServerAndSupabase();
      if (supabaseConfig?.projectUrl && supabaseConfig?.anonKey) {
        syncPostsWithSupabase(supabaseConfig, updated).catch(() => {});
      }
    } catch {
      // Saved locally
    }
  };

  const handleDeletePost = (postId: string) => {
    const updated = posts.filter((p) => p.id !== postId);
    setPosts(updated);
    savePosts(updated);
    showToast('Publicación eliminada.');

    const uId = encodeURIComponent(currentUser?.id || '');
    const isAdm = Boolean(adminSession.isAdmin1 || adminSession.isAdmin2);
    fetch(`/api/posts/${postId}?userId=${uId}&isAdmin=${isAdm}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: currentUser?.id, 
        authorName: currentUser?.username,
        isAdmin: isAdm 
      })
    })
      .then(() => syncWithServerAndSupabase())
      .catch(() => {});
  };

  const handleToggleReaction = (postId: string, type: 'heart' | 'fire' | 'clap') => {
    const updated = posts.map((post) => {
      if (post.id !== postId) return post;

      const currentReactions = { ...post.reactions };
      const previousReaction = currentReactions.userReaction;

      if (previousReaction === type) {
        currentReactions[type] = Math.max(0, currentReactions[type] - 1);
        currentReactions.userReaction = undefined;
      } else {
        if (previousReaction) {
          currentReactions[previousReaction] = Math.max(0, currentReactions[previousReaction] - 1);
        }
        currentReactions[type] += 1;
        currentReactions.userReaction = type;
      }

      return { ...post, reactions: currentReactions };
    });

    setPosts(updated);
    savePosts(updated);

    fetch(`/api/posts/${postId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, userId: currentUser?.id || 'guest' })
    })
      .then(() => syncWithServerAndSupabase())
      .catch(() => {});
  };

  const handleAddComment = (postId: string, text: string) => {
    if (!currentUser) return;

    const newComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      postId,
      authorId: currentUser.id,
      authorName: currentUser.username,
      authorAvatar: currentUser.avatar,
      text,
      timestamp: Date.now()
    };

    const updated = posts.map((p) => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: [...(p.comments || []), newComment]
      };
    });

    setPosts(updated);
    savePosts(updated);

    fetch(`/api/posts/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComment)
    })
      .then(() => syncWithServerAndSupabase())
      .catch(() => {});
  };

  // Handlers for Marketplace
  const handleAddCar = async (carData: Omit<MarketplaceCar, 'id' | 'createdAt'>) => {
    const newCar: MarketplaceCar = {
      ...carData,
      id: `car_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now()
    };

    const updated = [newCar, ...cars];
    setCars(updated);
    saveMarketplaceCars(updated);
    showToast(`Vehículo "${newCar.title}" publicado con éxito.`);

    try {
      await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCar)
      });
      syncWithServerAndSupabase();
    } catch {
      // Saved locally
    }
  };

  const handleDeleteCar = (carId: string) => {
    const updated = cars.filter((c) => c.id !== carId);
    setCars(updated);
    saveMarketplaceCars(updated);
    showToast('Vehículo retirado del marketplace.');

    const sId = encodeURIComponent(currentUser?.id || '');
    const isAdm = Boolean(adminSession.isAdmin1 || adminSession.isAdmin2);
    fetch(`/api/marketplace/${carId}?sellerId=${sId}&isAdmin=${isAdm}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sellerId: currentUser?.id,
        sellerName: currentUser?.username,
        isAdmin: isAdm 
      })
    })
      .then(() => syncWithServerAndSupabase())
      .catch(() => {});
  };

  const handleContactSeller = (car: MarketplaceCar) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setActiveChatUserId(car.sellerId);
    setCarChatContext(car);
    setMessengerOpen(true);
  };

  // Handlers for Messages
  const handleSendMessage = (text: string, recipientId: string, carRef?: MarketplaceCar) => {
    if (!currentUser) return;

    const targetUser = registeredUsers.find((u) => u.id === recipientId);
    const targetName = targetUser ? targetUser.username : 'Ciudadano Horizonte RP';

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      senderId: currentUser.id,
      senderName: currentUser.username,
      senderAvatar: currentUser.avatar,
      recipientId,
      recipientName: targetName,
      text,
      timestamp: Date.now(),
      isRead: false,
      carContext: carRef
        ? {
            id: carRef.id,
            title: carRef.title,
            price: carRef.price
          }
        : undefined
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    saveMessages(updated);

    // Send immediately to Server API for cross-device synchronization
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg)
    })
      .then(() => syncWithServerAndSupabase())
      .catch((err) => console.warn('Message sync err:', err));

    if (supabaseConfig?.enabled && supabaseConfig?.projectUrl && supabaseConfig?.anonKey && !supabaseConfig.projectUrl.includes('facehorizont-rp.supabase.co')) {
      syncMessagesWithSupabase(supabaseConfig, updated).catch(() => {});
    }
  };

  const handleSendChatMessage = (msg: ChatMessage) => {
    const updated = [...messages, msg];
    setMessages(updated);
    saveMessages(updated);

    // Send immediately to Server API for cross-device synchronization
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    })
      .then(() => syncWithServerAndSupabase())
      .catch((err) => console.warn('Chat message sync err:', err));

    if (supabaseConfig?.enabled && supabaseConfig?.projectUrl && supabaseConfig?.anonKey && !supabaseConfig.projectUrl.includes('facehorizont-rp.supabase.co')) {
      syncMessagesWithSupabase(supabaseConfig, updated).catch(() => {});
    }
  };

  const handleClearConversation = (contactId: string) => {
    const myId = currentUser?.id || 'guest_user';
    const updated = messages.filter(
      (m) =>
        !(
          (m.senderId === myId && m.recipientId === contactId) ||
          (m.senderId === contactId && m.recipientId === myId)
        )
    );
    setMessages(updated);
    saveMessages(updated);
    showToast('Conversación vaciada.');

    fetch(`/api/messages/conversation/${myId}/${contactId}`, {
      method: 'DELETE'
    })
      .then(() => syncWithServerAndSupabase())
      .catch((err) => console.warn('Clear conversation err:', err));
  };

  const handleOpenMessages = (targetUserId?: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    if (targetUserId) {
      setActiveChatUserId(targetUserId);
    } else if (!activeChatUserId && registeredUsers.length > 0) {
      const other = registeredUsers.find((u) => u.id !== currentUser.id);
      if (other) setActiveChatUserId(other.id);
    }
    setMessengerOpen(true);
  };

  // Handlers for Groups
  const handleCreateGroup = (groupData: Omit<Group, 'id' | 'createdAt' | 'posts' | 'messages'>) => {
    if (!currentUser) return;

    const newGroup: Group = {
      ...groupData,
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
      posts: [],
      messages: []
    };

    const updated = [newGroup, ...groups];
    setGroups(updated);
    saveGroups(updated);

    fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGroup)
    })
      .then(() => syncWithServerAndSupabase())
      .catch(() => {});

    showToast(`Grupo "${newGroup.name}" creado con éxito.`);
  };

  const handleJoinGroup = (groupId: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    const targetGroup = groups.find((g) => g.id === groupId);
    if (!targetGroup) return;
    const alreadyMember = targetGroup.members.some((m) => m.userId === currentUser.id);
    if (alreadyMember) return;

    const newMember: GroupMember = {
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      role: 'member',
      joinedAt: Date.now(),
      canPost: true,
      canChat: true
    };

    const updated = groups.map((g) => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        members: [...g.members, newMember]
      };
    });

    setGroups(updated);
    saveGroups(updated);

    fetch(`/api/groups/${groupId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMember)
    })
      .then(() => syncWithServerAndSupabase())
      .catch(() => {});

    showToast('Te has unido al grupo.');
  };

  const handleLeaveGroup = (groupId: string) => {
    if (!currentUser) return;

    const updated = groups.map((g) => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        members: g.members.filter((m) => m.userId !== currentUser.id)
      };
    });

    setGroups(updated);
    saveGroups(updated);

    fetch(`/api/groups/${groupId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    })
      .then(() => syncWithServerAndSupabase())
      .catch(() => {});

    showToast('Has salido del grupo.');
  };

  const handleAddGroupPost = (groupId: string, post: GroupPost) => {
    const updated = groups.map((g) => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        posts: [post, ...(g.posts || [])]
      };
    });
    setGroups(updated);
    saveGroups(updated);

    fetch(`/api/groups/${groupId}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    })
      .then(() => syncWithServerAndSupabase())
      .catch(() => {});

    showToast('Publicación compartida en el muro del grupo.');
  };

  const handleDeleteGroupPost = (groupId: string, postId: string) => {
    const updated = groups.map((g) => {
      if (g.id !== groupId) return g;
      return { ...g, posts: (g.posts || []).filter((p) => p.id !== postId) };
    });
    setGroups(updated);
    saveGroups(updated);

    fetch(`/api/groups/${groupId}/posts/${postId}`, {
      method: 'DELETE'
    })
      .then(() => syncWithServerAndSupabase())
      .catch(() => {});

    showToast('Publicación del grupo eliminada.');
  };

  const handleDeleteGroupMessage = (groupId: string, msgId: string) => {
    const updated = groups.map((g) => {
      if (g.id !== groupId) return g;
      return { ...g, messages: (g.messages || []).filter((m) => m.id !== msgId) };
    });
    setGroups(updated);
    saveGroups(updated);

    fetch(`/api/groups/${groupId}/messages/${msgId}`, {
      method: 'DELETE'
    })
      .then(() => syncWithServerAndSupabase())
      .catch(() => {});

    showToast('Mensaje del grupo eliminado.');
  };

  const handleToggleGroupPostReaction = (groupId: string, postId: string, type: 'heart' | 'fire' | 'clap') => {
    const updated = groups.map((g) => {
      if (g.id !== groupId) return g;
      const updatedPosts = (g.posts || []).map((p) => {
        if (p.id !== postId) return p;
        const currentReactions = { ...p.reactions };
        const prev = currentReactions.userReaction;
        if (prev === type) {
          currentReactions[type] = Math.max(0, currentReactions[type] - 1);
          currentReactions.userReaction = undefined;
        } else {
          if (prev) currentReactions[prev] = Math.max(0, currentReactions[prev] - 1);
          currentReactions[type] += 1;
          currentReactions.userReaction = type;
        }
        return { ...p, reactions: currentReactions };
      });
      return { ...g, posts: updatedPosts };
    });
    setGroups(updated);
    saveGroups(updated);
  };

  const handleAddGroupPostComment = (groupId: string, postId: string, commentText: string) => {
    if (!currentUser) return;
    const newComment = {
      id: `gc_${Date.now()}`,
      postId,
      authorId: currentUser.id,
      authorName: currentUser.username,
      authorAvatar: currentUser.avatar,
      text: commentText,
      timestamp: Date.now()
    };
    const updated = groups.map((g) => {
      if (g.id !== groupId) return g;
      const updatedPosts = (g.posts || []).map((p) => {
        if (p.id !== postId) return p;
        return { ...p, comments: [...(p.comments || []), newComment] };
      });
      return { ...g, posts: updatedPosts };
    });
    setGroups(updated);
    saveGroups(updated);
  };

  const handleSendGroupMessage = (groupId: string, message: GroupMessage) => {
    const updated = groups.map((g) => {
      if (g.id !== groupId) return g;
      return { ...g, messages: [...(g.messages || []), message] };
    });
    setGroups(updated);
    saveGroups(updated);

    fetch(`/api/groups/${groupId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    })
      .then(() => syncWithServerAndSupabase())
      .catch(() => {});
  };

  const handleUpdateMemberPermission = (
    groupId: string,
    userId: string,
    updates: { canPost?: boolean; canChat?: boolean; role?: GroupMember['role']; removeMember?: boolean }
  ) => {
    const updated = groups.map((g) => {
      if (g.id !== groupId) return g;
      if (updates.removeMember) {
        return {
          ...g,
          members: g.members.filter((m) => m.userId !== userId)
        };
      }
      const updatedMembers = g.members.map((m) => {
        if (m.userId !== userId) return m;
        return {
          ...m,
          role: updates.role ?? m.role,
          canPost: updates.canPost ?? m.canPost,
          canChat: updates.canChat ?? m.canChat
        };
      });
      return { ...g, members: updatedMembers };
    });
    setGroups(updated);
    saveGroups(updated);
  };

  // Auth & Profile Callbacks
  const handleRegisterSuccess = (user: User) => {
    setCurrentUser(user);
    saveStoredUser(user);
    setRegisteredUsers((prev) => {
      const filtered = prev.filter((u) => u.id !== user.id);
      const updated = [user, ...filtered];
      saveRegisteredUsers(updated);
      return updated;
    });

    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
      .then(() => syncWithServerAndSupabase())
      .catch(() => {});

    showToast(`¡Bienvenido/a a FaceHorizont, ${user.username}!`);
  };

  const handleLoginAsCitizen = (username: string, avatarUrl: string, role: 'citizen' | 'police') => {
    const cleanName = username.trim();
    const existing = registeredUsers.find(
      (u) => u.username.toLowerCase() === cleanName.toLowerCase()
    );

    let userToLogin: User;
    if (existing) {
      userToLogin = {
        ...existing,
        avatar: avatarUrl || existing.avatar,
        role: role || existing.role
      };
    } else {
      const safeId = `user_${cleanName.toLowerCase().replace(/[^a-z0-9_]/g, '')}`;
      userToLogin = {
        id: safeId,
        username: cleanName,
        avatar: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=991b1b&color=ffffff`,
        role,
        isDiscordUser: false,
        discordTag: `@${cleanName}`,
        bio: `Ciudadano activo de Horizonte RP.`,
        createdAt: Date.now()
      };
    }

    handleRegisterSuccess(userToLogin);
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    clearStoredUser();
    showToast('Sesión cerrada correctamente.');
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    saveStoredUser(updatedUser);
    showToast('Perfil actualizado correctamente.');
  };

  // Admin Session Callbacks
  const handleAdminLoginSuccess = (session: AdminSession) => {
    setAdminSession(session);
    saveAdminSession(session);
    if (session.isAdmin1 && !session.isAdmin2) {
      showToast('🛡️ Modo Moderador de Horizonte RP Activado');
    }
    if (session.isAdmin2) {
      showToast('🚨 Modo SuperAdmin Activado - Menú de BD disponible');
    }
  };

  const handleExitAdmin = () => {
    const emptySession: AdminSession = {
      isAdmin1: false,
      isAdmin2: false,
      adminName: ''
    };
    setAdminSession(emptySession);
    saveAdminSession(emptySession);
    showToast('Modo administración desactivado.');
  };

  // Database SOS actions
  const handleToggleSupabase = () => {
    const nextState = !dbHealth.supabaseConnected;
    const updatedHealth: DatabaseHealth = {
      ...dbHealth,
      supabaseConnected: nextState
    };
    setDbHealth(updatedHealth);
    saveDatabaseHealth(updatedHealth);
    showToast(`Supabase ${nextState ? 'conectado (Online)' : 'desconectado (Offline)'}.`);
  };

  const handleToggleMongodb = () => {
    const nextState = !dbHealth.mongodbConnected;
    const updatedHealth: DatabaseHealth = {
      ...dbHealth,
      mongodbConnected: nextState
    };
    setDbHealth(updatedHealth);
    saveDatabaseHealth(updatedHealth);
    showToast(`MongoDB ${nextState ? 'conectado' : 'desconectado (Operando 100% con Supabase)'}.`);
  };

  const handleResetDatabase = async () => {
    resetAllApplicationData();
    setPosts([]);
    setCars([]);
    setMessages([]);
    setGroups([]);
    setRegisteredUsers([]);
    setActiveChatUserId(null);
    showToast('🧹 Base de datos purgada por completo. Cero publicaciones, cero chats, cero vehículos.');
  };

  const handleExportJson = () => {
    const data = {
      users: registeredUsers,
      posts,
      marketplace: cars,
      messages,
      groups,
      theme,
      discordConfig,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facehorizont_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Copia de seguridad JSON descargada.');
  };

  // Master Database & APIs Handlers for SOYGUAPOLOSE
  const handleSaveSupabaseConfig = (newCfg: SupabaseApiConfig) => {
    setSupabaseConfig(newCfg);
    saveStoredSupabaseConfig(newCfg);
    showToast('Configuración de Supabase API guardada.');

    fetch('/api/admin/config/supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: newCfg.projectUrl,
        key: newCfg.anonKey,
        enabled: newCfg.enabled
      })
    }).catch(() => {});
  };

  const handleClearTable = (table: 'users' | 'posts' | 'cars' | 'messages' | 'groups') => {
    if (table === 'posts') {
      setPosts([]);
      savePosts([]);
    } else if (table === 'cars') {
      setCars([]);
      saveMarketplaceCars([]);
    } else if (table === 'messages') {
      setMessages([]);
      saveMessages([]);
    } else if (table === 'users') {
      setRegisteredUsers([]);
      saveRegisteredUsers([]);
    } else if (table === 'groups') {
      setGroups([]);
      saveGroups([]);
    }
    showToast(`Tabla ${table} vaciada en la base de datos.`);
  };

  const handleImportJson = (dump: any) => {
    if (!dump) return;
    if (Array.isArray(dump.posts)) {
      setPosts(dump.posts);
      savePosts(dump.posts);
    }
    if (Array.isArray(dump.marketplace) || Array.isArray(dump.cars)) {
      const c = dump.marketplace || dump.cars;
      setCars(c);
      saveMarketplaceCars(c);
    }
    if (Array.isArray(dump.messages)) {
      setMessages(dump.messages);
      saveMessages(dump.messages);
    }
    if (Array.isArray(dump.users) || Array.isArray(dump.registeredUsers)) {
      const u = dump.users || dump.registeredUsers;
      setRegisteredUsers(u);
      saveRegisteredUsers(u);
    }
    if (Array.isArray(dump.groups)) {
      setGroups(dump.groups);
      saveGroups(dump.groups);
    }
    showToast('Copia de seguridad importada exitosamente.');
  };

  const handleDeleteMessage = (msgId: string) => {
    const updated = messages.filter((m) => m.id !== msgId);
    setMessages(updated);
    saveMessages(updated);
    showToast('Mensaje eliminado.');

    fetch(`/api/messages/${msgId}`, {
      method: 'DELETE'
    }).catch(() => {});
  };

  const handleDeleteUser = (userId: string) => {
    const updated = registeredUsers.filter((u) => u.id !== userId);
    setRegisteredUsers(updated);
    saveRegisteredUsers(updated);
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      clearStoredUser();
    }
    showToast('Usuario eliminado de la base de datos.');

    fetch(`/api/users/${userId}`, {
      method: 'DELETE'
    }).catch(() => {});
  };

  const handleDeleteGroup = (groupId: string) => {
    const updated = groups.filter((g) => g.id !== groupId);
    setGroups(updated);
    saveGroups(updated);
    showToast('Grupo eliminado.');
  };

  // Count unread messages
  const unreadMessagesCount = messages.filter(
    (m) => !m.isRead && (m.recipientId === currentUser?.id || m.recipientId === 'guest_or_current')
  ).length;

  return (
    <div className="min-h-screen flex flex-col selection:bg-red-600 selection:text-white transition-colors duration-200 pb-16 md:pb-0">
      
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 p-3.5 rounded-2xl bg-[#282a32] border border-red-500 shadow-2xl text-white text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        adminSession={adminSession}
        unreadCount={unreadMessagesCount}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenAdminModal={() => setAdminModalOpen(true)}
        onExitAdmin={handleExitAdmin}
        onOpenSosModal={() => setSosModalOpen(true)}
        onOpenMessages={handleOpenMessages}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* Main Views */}
      <div className="flex-1">
        {currentTab === 'feed' ? (
          <FeedView
            posts={posts}
            currentUser={currentUser}
            adminSession={adminSession}
            theme={theme}
            registeredUsers={registeredUsers}
            onOpenAuth={() => setAuthModalOpen(true)}
            onAddPost={handleAddPost}
            onDeletePost={handleDeletePost}
            onToggleReaction={handleToggleReaction}
            onAddComment={handleAddComment}
            onNavigateMarketplace={() => setCurrentTab('marketplace')}
            onOpenMessages={handleOpenMessages}
          />
        ) : currentTab === 'marketplace' ? (
          <MarketplaceView
            cars={cars}
            currentUser={currentUser}
            adminSession={adminSession}
            theme={theme}
            onOpenAuth={() => setAuthModalOpen(true)}
            onAddCar={handleAddCar}
            onDeleteCar={handleDeleteCar}
            onContactSeller={handleContactSeller}
            onManualSync={syncWithServerAndSupabase}
            isSyncing={isSyncing}
          />
        ) : (
          <GroupsView
            groups={groups}
            currentUser={currentUser}
            adminSession={adminSession}
            theme={theme}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenCreateGroup={() => setCreateGroupModalOpen(true)}
            onJoinGroup={handleJoinGroup}
            onLeaveGroup={handleLeaveGroup}
            onAddGroupPost={handleAddGroupPost}
            onDeleteGroupPost={handleDeleteGroupPost}
            onToggleGroupPostReaction={handleToggleGroupPostReaction}
            onAddGroupPostComment={handleAddGroupPostComment}
            onSendGroupMessage={handleSendGroupMessage}
            onDeleteGroupMessage={handleDeleteGroupMessage}
            onUpdateMemberPermission={handleUpdateMemberPermission}
            showToast={showToast}
          />
        )}
      </div>

      {/* Floating Private 1-to-1 Messenger Drawer */}
      <MessengerDrawer
        isOpen={messengerOpen}
        onClose={() => setMessengerOpen(false)}
        currentUser={currentUser}
        registeredUsers={registeredUsers}
        activeTargetUserId={activeChatUserId}
        setActiveTargetUserId={setActiveChatUserId}
        allMessages={messages}
        onSendMessage={handleSendChatMessage}
        onDeleteMessage={handleDeleteMessage}
        onClearConversation={handleClearConversation}
        isAdmin={Boolean(adminSession.isAdmin1 || adminSession.isAdmin2)}
        onOpenAuth={() => setAuthModalOpen(true)}
        carContext={carChatContext}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={createGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
        currentUser={currentUser}
        onCreateGroup={handleCreateGroup}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Citizen / Discord Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        registeredUsers={registeredUsers}
        onSelectExistingUser={(user) => {
          handleRegisterSuccess(user);
          setAuthModalOpen(false);
        }}
        onLoginAsCitizen={handleLoginAsCitizen}
        onStartDiscordOAuth={handleStartDiscordOAuth}
        onLogout={handleLogout}
        theme={theme}
        showToast={showToast}
      />

      {/* Admin / SuperAdmin Master Modal */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        adminSession={adminSession}
        onAdminLoginSuccess={handleAdminLoginSuccess}
        onAdminLogout={handleExitAdmin}
        theme={theme}
        registeredUsers={registeredUsers}
        posts={posts}
        cars={cars}
        messages={messages}
        groups={groups}
        auditLogs={auditLogs}
        dbHealth={dbHealth}
        onToggleSupabase={handleToggleSupabase}
        onToggleMongodb={handleToggleMongodb}
        onResetDatabase={handleResetDatabase}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onDeletePost={handleDeletePost}
        onDeleteCar={handleDeleteCar}
        onDeleteMessage={handleDeleteMessage}
        onDeleteUser={handleDeleteUser}
        onDeleteGroup={handleDeleteGroup}
        onClearTable={handleClearTable}
        discordConfig={discordConfig}
        onSaveDiscordConfig={handleSaveDiscordConfig}
        supabaseConfig={supabaseConfig}
        onSaveSupabaseConfig={handleSaveSupabaseConfig}
        showToast={showToast}
        onRefreshData={syncWithServerAndSupabase}
      />

      {/* SOS Database Modal */}
      <SosModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        dbHealth={dbHealth}
        onToggleSupabase={handleToggleSupabase}
        onToggleMongodb={handleToggleMongodb}
        onResetDatabase={handleResetDatabase}
        onExportJson={handleExportJson}
        onOpenMasterAdmin={() => setAdminModalOpen(true)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateProfile}
        userPosts={posts.filter((p) => p.authorId === currentUser?.id)}
        userCars={cars.filter((c) => c.sellerId === currentUser?.id)}
      />

      {/* Footer */}
      <Footer
        showSosTrigger={adminSession.isAdmin2}
        onOpenSos={() => setSosModalOpen(true)}
      />

      {/* Mobile Bottom Navigation Bar for Smart Devices */}
      <nav 
        id="mobile-bottom-nav"
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg px-2 py-1 flex items-center justify-around transition-colors ${
          theme === 'light'
            ? 'bg-white/95 border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] text-gray-700'
            : 'bg-[#121316]/95 border-[#282a32] shadow-[0_-4px_25px_rgba(0,0,0,0.5)] text-gray-300'
        }`}
      >
        <button
          id="mobile-nav-feed"
          onClick={() => setCurrentTab('feed')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-all cursor-pointer ${
            currentTab === 'feed'
              ? 'text-red-500 font-extrabold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Inicio</span>
        </button>

        <button
          id="mobile-nav-marketplace"
          onClick={() => setCurrentTab('marketplace')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-all cursor-pointer ${
            currentTab === 'marketplace'
              ? 'text-red-500 font-extrabold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span>Autos</span>
          {cars.length > 0 && (
            <span className="absolute top-0 right-3 px-1.5 py-0.2 rounded-full text-[9px] bg-red-600 text-white font-extrabold shadow-sm">
              {cars.length}
            </span>
          )}
        </button>

        <button
          id="mobile-nav-groups"
          onClick={() => setCurrentTab('groups')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-all cursor-pointer ${
            currentTab === 'groups'
              ? 'text-red-500 font-extrabold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Grupos</span>
        </button>

        <button
          id="mobile-nav-messages"
          onClick={() => {
            if (!currentUser) {
              handleStartDiscordOAuth();
            } else {
              setMessengerOpen(!messengerOpen);
            }
          }}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-all cursor-pointer ${
            messengerOpen
              ? 'text-red-500 font-extrabold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span>Mensajes</span>
          {unreadMessagesCount > 0 && (
            <span className="absolute top-0 right-3 px-1.5 py-0.2 rounded-full text-[9px] bg-red-600 text-white font-extrabold shadow-sm animate-pulse">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {(adminSession.isAdmin1 || adminSession.isAdmin2) ? (
          <button
            id="mobile-nav-admin"
            onClick={() => setAdminModalOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-all cursor-pointer"
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span>Admin</span>
          </button>
        ) : (
          <button
            id="mobile-nav-sync"
            onClick={syncWithServerAndSupabase}
            disabled={isSyncing}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold text-gray-400 hover:text-gray-200 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-5 h-5 mb-0.5 ${isSyncing ? 'animate-spin text-red-500' : ''}`} />
            <span>Sync</span>
          </button>
        )}
      </nav>
    </div>
  );
}
