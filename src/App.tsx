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
  SupabaseApiConfig
} from './types';
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
  saveStoredSupabaseConfig
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
import { DiscordConfigModal } from './components/DiscordConfigModal';
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

  // Modals Visibility
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [discordConfigModalOpen, setDiscordConfigModalOpen] = useState(false);

  // Private Chat Drawer State
  const [messengerOpen, setMessengerOpen] = useState(false);
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [carChatContext, setCarChatContext] = useState<MarketplaceCar | null>(null);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Quick 1-click Demo Login for testing before setting up Discord bot
  const handleQuickDemoLogin = () => {
    const demoUser: User = {
      id: `user_${Date.now().toString(36)}`,
      username: 'Ciudadano_RP',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
      role: 'citizen',
      bio: 'Ciudadano activo de Horizonte RP explorando la ciudad.',
      createdAt: Date.now()
    };
    handleRegisterSuccess(demoUser);
    showToast(`¡Bienvenido/a, ${demoUser.username}!`);
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

  // Direct Official Discord OAuth2 authorization trigger
  const handleStartDiscordOAuth = () => {
    const activeClientId = (
      (import.meta as any).env?.VITE_DISCORD_CLIENT_ID ||
      discordConfig?.clientId ||
      ''
    ).trim();

    // If no real Client ID has been provided yet, open config modal with guidance
    if (!activeClientId || activeClientId === '123456789012345678' || activeClientId.length < 15) {
      setDiscordConfigModalOpen(true);
      showToast('ℹ️ Ingresa tu Client ID de Discord para conectar tu bot oficial o usa el modo rápido.');
      return;
    }

    const currentRedirect = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : 'http://localhost:3000/auth/callback';

    showToast('🚀 Conectando con autorización oficial de Discord.com...');
    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(
      activeClientId
    )}&response_type=token&scope=identify&redirect_uri=${encodeURIComponent(currentRedirect)}`;

    const popupWidth = 580;
    const popupHeight = 720;
    const left = typeof window !== 'undefined' ? window.screenX + (window.outerWidth - popupWidth) / 2 : 100;
    const top = typeof window !== 'undefined' ? window.screenY + (window.outerHeight - popupHeight) / 2 : 100;

    const popup = window.open(
      discordAuthUrl,
      'discord_oauth_popup',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,status=yes`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      try {
        if (window.top && window.top !== window) {
          window.top.location.href = discordAuthUrl;
          return;
        }
      } catch {
        // Cross-origin fallback
      }
      window.location.href = discordAuthUrl;
    }
  };

  // Sync with server API if reachable
  useEffect(() => {
    const syncWithServer = async () => {
      try {
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

        const resPosts = await fetch('/api/posts');
        if (resPosts.ok) {
          const serverPosts = await resPosts.json();
          if (Array.isArray(serverPosts) && serverPosts.length > 0) {
            setPosts(serverPosts);
            savePosts(serverPosts);
          }
        }
      } catch {
        // Run locally with localStorage fallback
      }
    };
    syncWithServer();
  }, []);

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
    } catch {
      // Saved locally
    }
  };

  const handleDeletePost = (postId: string) => {
    const updated = posts.filter((p) => p.id !== postId);
    setPosts(updated);
    savePosts(updated);
    showToast('Publicación eliminada.');

    fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser?.id, isAdmin: !!adminSession.isAdmin1 || !!adminSession.isAdmin2 })
    }).catch(() => {});
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
    }).catch(() => {});
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
    }).catch(() => {});
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
    } catch {
      // Saved locally
    }
  };

  const handleDeleteCar = (carId: string) => {
    const updated = cars.filter((c) => c.id !== carId);
    setCars(updated);
    saveMarketplaceCars(updated);
    showToast('Vehículo retirado del marketplace.');

    fetch(`/api/marketplace/${carId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId: currentUser?.id, isAdmin: !!adminSession.isAdmin1 || !!adminSession.isAdmin2 })
    }).catch(() => {});
  };

  const handleContactSeller = (car: MarketplaceCar) => {
    if (!currentUser) {
      handleStartDiscordOAuth();
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
    const targetName = targetUser ? targetUser.username : 'Vendedor Horizonte RP';
    const targetAvatar = targetUser
      ? targetUser.avatar
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';

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

    // Auto-respond simulation from recipient after 1.2s
    setTimeout(() => {
      const replies = carRef
        ? [
            `¡Hola ${currentUser.username}! Sí, el ${carRef.title} aún está disponible por ${carRef.currency} ${carRef.price.toLocaleString()}. ¿Nos vemos en el concesionario de Horizonte RP?`,
            `Buenas, ¿te interesa permutar o solo compras en efectivo RP$?`
          ]
        : [
            `¡Qué tal ${currentUser.username}! Te leo fuerte y claro en Horizonte RP.`,
            `Hola, ¿en qué punto de la ciudad te encuentras ahora mismo?`
          ];

      const replyMsg: ChatMessage = {
        id: `msg_reply_${Date.now()}`,
        senderId: recipientId,
        senderName: targetName,
        senderAvatar: targetAvatar,
        recipientId: currentUser.id,
        recipientName: currentUser.username,
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: Date.now(),
        isRead: false
      };

      setMessages((prev) => {
        const next = [...prev, replyMsg];
        saveMessages(next);
        return next;
      });
    }, 1200);
  };

  const handleSendChatMessage = (msg: ChatMessage) => {
    const updated = [...messages, msg];
    setMessages(updated);
    saveMessages(updated);
  };

  const handleOpenMessages = (targetUserId?: string) => {
    if (!currentUser) {
      handleStartDiscordOAuth();
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
    showToast(`Grupo "${newGroup.name}" creado con éxito.`);
  };

  const handleJoinGroup = (groupId: string) => {
    if (!currentUser) {
      handleStartDiscordOAuth();
      return;
    }

    const updated = groups.map((g) => {
      if (g.id !== groupId) return g;
      const alreadyMember = g.members.some((m) => m.userId === currentUser.id);
      if (alreadyMember) return g;

      const newMember: GroupMember = {
        userId: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
        role: 'member',
        joinedAt: Date.now(),
        canPost: true,
        canChat: true
      };

      return {
        ...g,
        members: [...g.members, newMember]
      };
    });

    setGroups(updated);
    saveGroups(updated);
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
    showToast('Publicación compartida en el muro del grupo.');
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
    const registered = getRegisteredUsers();
    setRegisteredUsers(registered);
    showToast(`¡Bienvenido/a a FaceHorizont, ${user.username}!`);
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
    localStorage.clear();
    setPosts(getPosts());
    setCars(getMarketplaceCars());
    setMessages(getMessages());
    setGroups(getGroups());
    setRegisteredUsers(getRegisteredUsers());
    showToast('Base de datos y caché local restaurados.');
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
    <div className="min-h-screen flex flex-col selection:bg-red-600 selection:text-white transition-colors duration-200">
      
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
        onOpenAuth={handleStartDiscordOAuth}
        onLogout={handleLogout}
        onOpenAdminModal={() => setAdminModalOpen(true)}
        onExitAdmin={handleExitAdmin}
        onOpenSosModal={() => setSosModalOpen(true)}
        onOpenMessages={handleOpenMessages}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenDiscordConfig={() => setDiscordConfigModalOpen(true)}
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
            onOpenAuth={handleStartDiscordOAuth}
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
            onOpenAuth={handleStartDiscordOAuth}
            onAddCar={handleAddCar}
            onDeleteCar={handleDeleteCar}
            onContactSeller={handleContactSeller}
          />
        ) : (
          <GroupsView
            groups={groups}
            currentUser={currentUser}
            adminSession={adminSession}
            theme={theme}
            onOpenAuth={handleStartDiscordOAuth}
            onOpenCreateGroup={() => setCreateGroupModalOpen(true)}
            onJoinGroup={handleJoinGroup}
            onLeaveGroup={handleLeaveGroup}
            onAddGroupPost={handleAddGroupPost}
            onToggleGroupPostReaction={handleToggleGroupPostReaction}
            onAddGroupPostComment={handleAddGroupPostComment}
            onSendGroupMessage={handleSendGroupMessage}
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
        activeTargetUserId={activeChatUserId}
        setActiveTargetUserId={setActiveChatUserId}
        allMessages={messages}
        onSendMessage={handleSendChatMessage}
        onOpenAuth={handleStartDiscordOAuth}
        carContext={carChatContext}
      />

      {/* Discord API Configuration Modal */}
      <DiscordConfigModal
        isOpen={discordConfigModalOpen}
        onClose={() => setDiscordConfigModalOpen(false)}
        config={discordConfig}
        onSaveConfig={handleSaveDiscordConfig}
        showToast={showToast}
        onDemoLogin={handleQuickDemoLogin}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={createGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
        currentUser={currentUser}
        onCreateGroup={handleCreateGroup}
        onOpenAuth={handleStartDiscordOAuth}
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
    </div>
  );
}
