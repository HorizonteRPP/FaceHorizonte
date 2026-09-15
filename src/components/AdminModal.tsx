import React, { useState, useEffect } from 'react';
import { 
  AdminSession, 
  DatabaseHealth, 
  DiscordApiConfig, 
  SupabaseApiConfig, 
  User, 
  Post, 
  MarketplaceCar, 
  ChatMessage, 
  Group, 
  ThemeMode,
  ServerAuditLog
} from '../types';
import { 
  X, 
  Shield, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Database, 
  Server, 
  Cpu, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Copy, 
  ExternalLink, 
  Settings, 
  Layers, 
  Users, 
  FileText, 
  Car, 
  MessageSquare, 
  Check, 
  Key, 
  Activity,
  LogOut,
  Sparkles,
  Search,
  Filter,
  Clock,
  ArrowRight,
  UserCheck,
  Send,
  Eye,
  Radio,
  Terminal,
  Smartphone,
  Laptop
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminSession: AdminSession;
  onAdminLoginSuccess: (session: AdminSession) => void;
  onAdminLogout: () => void;
  theme?: ThemeMode;
  registeredUsers?: User[];
  posts?: Post[];
  cars?: MarketplaceCar[];
  messages?: ChatMessage[];
  groups?: Group[];
  auditLogs?: ServerAuditLog[];
  dbHealth: DatabaseHealth;
  onToggleSupabase: () => void;
  onToggleMongodb: () => void;
  onResetDatabase: () => void;
  onExportJson: () => void;
  onImportJson?: (data: any) => void;
  // Deletions / Moderation
  onDeletePost?: (id: string) => void;
  onDeleteCar?: (id: string) => void;
  onDeleteMessage?: (id: string) => void;
  onDeleteUser?: (id: string) => void;
  onDeleteGroup?: (id: string) => void;
  onClearTable?: (table: 'users' | 'posts' | 'cars' | 'messages' | 'groups') => void;
  // API Configurations
  discordConfig: DiscordApiConfig;
  onSaveDiscordConfig: (cfg: DiscordApiConfig) => void;
  supabaseConfig: SupabaseApiConfig;
  onSaveSupabaseConfig: (cfg: SupabaseApiConfig) => void;
  showToast?: (msg: string) => void;
  onRefreshData?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  adminSession,
  onAdminLoginSuccess,
  onAdminLogout,
  theme = 'charcoal',
  registeredUsers = [],
  posts = [],
  cars = [],
  messages = [],
  groups = [],
  auditLogs = [],
  dbHealth,
  onToggleSupabase,
  onToggleMongodb,
  onResetDatabase,
  onExportJson,
  onImportJson,
  onDeletePost,
  onDeleteCar,
  onDeleteMessage,
  onDeleteUser,
  onDeleteGroup,
  onClearTable,
  discordConfig,
  onSaveDiscordConfig,
  supabaseConfig,
  onSaveSupabaseConfig,
  showToast,
  onRefreshData
}) => {
  // Login State
  const [adminName, setAdminName] = useState('admin');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tab State
  // 'messages' | 'users' | 'activity_log' | 'moderation' | 'sync' | 'tables' | 'apis' | 'backups'
  const [activeTab, setActiveTab] = useState<string>('messages');

  // Search & Filter States
  const [messageSearch, setMessageSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'post' | 'car' | 'message' | 'user' | 'system'>('all');
  const [modTab, setModTab] = useState<'posts' | 'cars'>('posts');
  const [tableSearch, setTableSearch] = useState('');
  const [selectedTable, setSelectedTable] = useState<'users' | 'posts' | 'cars' | 'messages' | 'groups'>('posts');

  // API Form States
  const [supabaseForm, setSupabaseForm] = useState<SupabaseApiConfig>(supabaseConfig);
  const [discordForm, setDiscordForm] = useState<DiscordApiConfig>(discordConfig);
  const [copiedRedirect, setCopiedRedirect] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync state with props
  useEffect(() => {
    setSupabaseForm(supabaseConfig);
  }, [supabaseConfig]);

  useEffect(() => {
    setDiscordForm(discordConfig);
  }, [discordConfig]);

  if (!isOpen) return null;

  const isLight = theme === 'light';
  const isSuperAdmin2 = adminSession.isAdmin2; // SOYGUAPOLOSE active
  const isLeonardoAdmin = adminSession.isAdmin1; // LeonardoHorizonteRP active

  // Helper for Exact Timestamp display
  const formatExactTime = (timestamp?: number) => {
    if (!timestamp) return 'Hora no registrada';
    const d = new Date(timestamp);
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Handle Login Attempt
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanPwd = password.trim();

    if (cleanPwd === 'LeonardoHorizonteRP') {
      const session: AdminSession = {
        isAdmin1: true,
        isAdmin2: false,
        adminName: adminName.trim() || 'Administrador',
        activatedAt: Date.now()
      };
      setSuccessMsg('¡Acceso verificado! Bienvenido al panel.');
      setTimeout(() => {
        onAdminLoginSuccess(session);
        setActiveTab('messages');
      }, 500);
      return;
    }

    if (cleanPwd === 'SOYGUAPOLOSE') {
      const session: AdminSession = {
        isAdmin1: true,
        isAdmin2: true,
        adminName: adminName.trim() || 'SuperAdmin SOS (DB Master)',
        activatedAt: Date.now()
      };
      setSuccessMsg('🚨 ¡Acceso Total SuperAdmin activado! Tablas, BD y APIs desbloqueadas.');
      setTimeout(() => {
        onAdminLoginSuccess(session);
        setActiveTab('messages');
      }, 500);
      return;
    }

    setErrorMsg('Contraseña incorrecta. Acceso restringido.');
  };

  const handleCopyRedirect = () => {
    navigator.clipboard.writeText(discordForm.redirectUri);
    setCopiedRedirect(true);
    if (showToast) showToast('Redirect URI copiado al portapapeles.');
    setTimeout(() => setCopiedRedirect(false), 2000);
  };

  const handleCopySupabaseSql = () => {
    const sql = `-- Tablas de sincronización para Horizonte RP
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  tag TEXT DEFAULT 'General',
  timestamp BIGINT NOT NULL,
  likes INT DEFAULT 0,
  liked_by JSONB DEFAULT '[]'::jsonb,
  reactions JSONB DEFAULT '{"heart":0,"fire":0,"clap":0}'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  recipient_id TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  car_context JSONB
);

CREATE TABLE IF NOT EXISTS public.cars (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_avatar TEXT,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'RP$',
  description TEXT,
  image_url TEXT,
  category TEXT,
  condition TEXT,
  location TEXT,
  created_at BIGINT NOT NULL
);

-- Habilitar RLS permisivo para pruebas
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update posts" ON public.posts FOR ALL USING (true);
CREATE POLICY "Allow public select messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update messages" ON public.messages FOR ALL USING (true);
CREATE POLICY "Allow public select cars" ON public.cars FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update cars" ON public.cars FOR ALL USING (true);`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    if (showToast) showToast('Script SQL copiado al portapapeles.');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    if (onRefreshData) onRefreshData();
    if (showToast) showToast('Sincronizando mensajes y publicaciones con el servidor...');
    setTimeout(() => {
      setIsSyncing(false);
      if (showToast) showToast('✅ Sincronización completada con éxito.');
    }, 1200);
  };

  // Filter messages for search
  const filteredMessages = messages.filter((m) => {
    if (!messageSearch.trim()) return true;
    const q = messageSearch.toLowerCase();
    return (
      m.text.toLowerCase().includes(q) ||
      m.senderName.toLowerCase().includes(q) ||
      m.recipientName.toLowerCase().includes(q) ||
      m.senderId.toLowerCase().includes(q) ||
      m.recipientId.toLowerCase().includes(q) ||
      (m.carContext && m.carContext.title.toLowerCase().includes(q))
    );
  });

  // Calculate stats for each user
  const userStatsList = registeredUsers.map((u) => {
    const userPosts = posts.filter((p) => p.authorId === u.id);
    const userCars = cars.filter((c) => c.sellerId === u.id);
    const userMessagesSent = messages.filter((m) => m.senderId === u.id);
    const userComments = posts.reduce((acc, p) => {
      return acc + (p.comments?.filter((c) => c.authorId === u.id).length || 0);
    }, 0);

    return {
      user: u,
      postsCount: userPosts.length,
      carsCount: userCars.length,
      messagesSentCount: userMessagesSent.length,
      commentsCount: userComments,
      lastActive: u.createdAt || Date.now()
    };
  });

  // Filter users by search
  const filteredUsers = userStatsList.filter((item) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      item.user.username.toLowerCase().includes(q) ||
      (item.user.discordTag && item.user.discordTag.toLowerCase().includes(q)) ||
      item.user.id.toLowerCase().includes(q) ||
      item.user.role.toLowerCase().includes(q)
    );
  });

  // Filter audit logs
  const filteredLogs = auditLogs.filter((l) => {
    if (logFilter === 'all') return true;
    if (logFilter === 'post') return l.type === 'post_created' || l.type === 'post_deleted';
    if (logFilter === 'car') return l.type === 'car_created' || l.type === 'car_deleted';
    if (logFilter === 'message') return l.type === 'message_sent';
    if (logFilter === 'user') return l.type === 'user_login';
    if (logFilter === 'system') return l.type === 'system';
    return true;
  });

  const cardBg = isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#181a20] border-[#292c36]';
  const inputBg = isLight ? 'bg-gray-50 border-gray-300 text-gray-900' : 'bg-[#121316] border-[#2d303a] text-white';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className={`w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] ${
        isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-[#14151a] border-[#292c36] text-white'
      }`}>
        
        {/* MODAL HEADER */}
        <div className={`p-4 border-b flex items-center justify-between flex-shrink-0 ${
          isLight ? 'bg-white border-gray-200' : 'bg-[#181920] border-[#252834]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
              isSuperAdmin2 
                ? 'bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500' 
                : isLeonardoAdmin 
                ? 'bg-gradient-to-tr from-amber-600 to-red-600'
                : 'bg-red-700'
            }`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">
                  {isSuperAdmin2
                    ? 'Panel SuperAdmin SOS (DB Master)'
                    : isLeonardoAdmin
                    ? 'Panel de Administración'
                    : 'Portal de Acceso Administrativo'}
                </h2>
                {isLeonardoAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold">
                    Admin Oficial
                  </span>
                )}
                {isSuperAdmin2 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold">
                    SuperAdmin DB
                  </span>
                )}
              </div>
              <p className="text-xs opacity-70">
                {isLeonardoAdmin
                  ? `Sesión activa: ${adminSession.adminName} • Auditoría, mensajes y control de comunidad`
                  : 'Gestión oficial de la comunidad de Horizonte RP'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLeonardoAdmin && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                title="Sincronizar datos con el servidor y Supabase"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
                <span className="hidden sm:inline">Sincronizar</span>
              </button>
            )}

            {isLeonardoAdmin && (
              <button
                onClick={() => {
                  onAdminLogout();
                  setActiveTab('messages');
                }}
                className="px-3 py-1.5 rounded-xl bg-red-900/60 hover:bg-red-800 border border-red-700/50 text-red-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Cerrar sesión de administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY CONTAINER */}
        {!isLeonardoAdmin && !isSuperAdmin2 ? (
          /* =========================================================================
             LOGIN FORM
             ========================================================================= */
          <div className="p-6 max-w-lg mx-auto w-full my-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/60 flex items-start gap-3 text-xs text-red-200">
                <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white">Ingreso Administrativo Exclusivo</p>
                  <p className="text-[11px] text-red-300/80 leading-relaxed">
                    Ingresa con tu clave de administrador para desbloquear las herramientas de auditoría, estadísticas de usuarios y sincronización.
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-900/60 border border-red-500 text-xs text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1.5 opacity-80">
                  Nombre de Administrador
                </label>
                <input
                  type="text"
                  placeholder="admin"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none ${inputBg}`}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold opacity-80">
                    Contraseña Administrativa
                  </label>
                  <span className="text-[10px] text-amber-400 font-semibold">Clave Privada</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Escribe la clave administrativa..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none pr-10 ${inputBg}`}
                    required
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white text-sm font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-3"
              >
                <Shield className="w-4 h-4" />
                <span>Ingresar al Panel</span>
              </button>
            </form>
          </div>
        ) : (
          /* =========================================================================
             ADMINISTRATOR SUITE (LEONARDO & SUPERADMIN)
             ========================================================================= */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* TABS NAVIGATION */}
            <div className={`flex border-b overflow-x-auto text-xs font-bold flex-shrink-0 ${
              isLight ? 'bg-gray-100 border-gray-200' : 'bg-[#121316] border-[#262832]'
            }`}>
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === 'messages'
                    ? 'border-red-500 text-red-500 bg-red-500/10'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Mensajería & Quiénes lo Mandaron</span>
                <span className="px-1.5 py-0.2 rounded-full bg-red-600/30 text-red-400 text-[10px]">
                  {messages.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === 'users'
                    ? 'border-red-500 text-red-500 bg-red-500/10'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Stats de Cada User & Horas Exactas</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-600/30 text-amber-400 text-[10px]">
                  {registeredUsers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('activity_log')}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === 'activity_log'
                    ? 'border-red-500 text-red-500 bg-red-500/10'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Log Total de Actividad (Sin Secretos)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-600/30 text-emerald-400 text-[10px]">
                  {auditLogs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('moderation')}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === 'moderation'
                    ? 'border-red-500 text-red-500 bg-red-500/10'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Muro & Marketplace</span>
              </button>

              <button
                onClick={() => setActiveTab('sync')}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === 'sync'
                    ? 'border-red-500 text-red-500 bg-red-500/10'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>Sincronización PC & Celular</span>
              </button>

              {/* Extra SuperAdmin tabs if SOYGUAPOLOSE */}
              {isSuperAdmin2 && (
                <>
                  <button
                    onClick={() => setActiveTab('tables')}
                    className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                      activeTab === 'tables'
                        ? 'border-red-500 text-red-500 bg-red-500/10'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    <Database className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300">Tablas Raw SOS</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('backups')}
                    className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                      activeTab === 'backups'
                        ? 'border-red-500 text-red-500 bg-red-500/10'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    <Download className="w-4 h-4 text-indigo-400" />
                    <span className="text-indigo-300">Dump JSON</span>
                  </button>
                </>
              )}
            </div>

            {/* TAB CONTENTS */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
              
              {/* =========================================================================
                  TAB 1: MENSAJERÍA & AUDITORÍA DE CHATS (QUIÉNES MANDARON, MENSAJES, ETC.)
                  ========================================================================= */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  {/* Top explanation */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-[#1e141a] to-amber-950/30 border border-red-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-red-400" />
                        <span>Auditoría de Mensajería: Ver Quiénes lo Mandaron y Mensajes</span>
                      </h3>
                      <p className="text-xs text-gray-300 mt-1">
                        Revisa todos los mensajes enviados entre ciudadanos de Horizonte RP con su remitente, destinatario, auto relacionado y hora exacta con segundos.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
                        {messages.length} mensajes en total
                      </span>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Buscar por texto, remitente, destinatario o ID de usuario..."
                        value={messageSearch}
                        onChange={(e) => setMessageSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs focus:outline-none ${inputBg}`}
                      />
                    </div>
                    {messageSearch && (
                      <button
                        onClick={() => setMessageSearch('')}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-300 cursor-pointer"
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                  </div>

                  {/* Messages List */}
                  {filteredMessages.length === 0 ? (
                    <div className={`p-8 rounded-2xl border text-center space-y-2 ${cardBg}`}>
                      <MessageSquare className="w-10 h-10 text-gray-500 mx-auto opacity-40" />
                      <p className="text-sm font-bold text-gray-300">No hay mensajes registrados</p>
                      <p className="text-xs text-gray-500 max-w-md mx-auto">
                        Cuando los ciudadanos chateen desde su PC o celular, aquí verás al instante quién lo mandó, a quién, qué dijeron y la hora exacta.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredMessages.map((msg) => (
                        <div 
                          key={msg.id}
                          className={`p-4 rounded-xl border transition-all ${cardBg} hover:border-red-500/40`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/5">
                            {/* SENDER & RECIPIENT */}
                            <div className="flex items-center gap-2.5 flex-wrap">
                              {/* Sender */}
                              <div className="flex items-center gap-2">
                                <img
                                  src={msg.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                                  alt={msg.senderName}
                                  className="w-7 h-7 rounded-full object-cover border border-amber-500/40"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black text-amber-300">{msg.senderName}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                                      Remitente
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-gray-400 font-mono">ID: {msg.senderId}</span>
                                </div>
                              </div>

                              <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0" />

                              {/* Recipient */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-indigo-300">
                                  {msg.recipientName || 'Usuario'}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                                  Destinatario
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">ID: {msg.recipientId}</span>
                              </div>
                            </div>

                            {/* EXACT TIME BADGE */}
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-emerald-300 font-mono text-[11px] flex items-center gap-1.5 shadow-inner">
                                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{formatExactTime(msg.timestamp)}</span>
                              </span>

                              {onDeleteMessage && (
                                <button
                                  onClick={() => {
                                    if (confirm('¿Eliminar este mensaje de la conversación por moderación?')) {
                                      onDeleteMessage(msg.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 text-xs transition-colors cursor-pointer"
                                  title="Eliminar mensaje"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* VEHICLE CONTEXT (IF ANY) */}
                          {msg.carContext && (
                            <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
                              <Car className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                              <span>
                                Contexto Marketplace: <strong>{msg.carContext.title}</strong> — RP$ {msg.carContext.price.toLocaleString()}
                              </span>
                            </div>
                          )}

                          {/* MESSAGE CONTENT */}
                          <div className="p-3 rounded-lg bg-black/30 border border-white/5 text-xs text-gray-200 leading-relaxed font-sans select-text">
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  TAB 2: STATS DE CADA USER & HORA EXACTA
                  ========================================================================= */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  {/* Top Stats Overview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className={`p-4 rounded-xl border ${cardBg}`}>
                      <span className="text-[11px] text-gray-400 uppercase font-bold">Total Usuarios</span>
                      <p className="text-2xl font-black text-white mt-1">{registeredUsers.length}</p>
                      <span className="text-[10px] text-emerald-400">Registrados en el sistema</span>
                    </div>

                    <div className={`p-4 rounded-xl border ${cardBg}`}>
                      <span className="text-[11px] text-gray-400 uppercase font-bold">Publicaciones Muro</span>
                      <p className="text-2xl font-black text-amber-400 mt-1">{posts.length}</p>
                      <span className="text-[10px] text-gray-400">En Horizonte RP</span>
                    </div>

                    <div className={`p-4 rounded-xl border ${cardBg}`}>
                      <span className="text-[11px] text-gray-400 uppercase font-bold">Autos Marketplace</span>
                      <p className="text-2xl font-black text-indigo-400 mt-1">{cars.length}</p>
                      <span className="text-[10px] text-gray-400">Vehículos en venta</span>
                    </div>

                    <div className={`p-4 rounded-xl border ${cardBg}`}>
                      <span className="text-[11px] text-gray-400 uppercase font-bold">Mensajes Privados</span>
                      <p className="text-2xl font-black text-emerald-400 mt-1">{messages.length}</p>
                      <span className="text-[10px] text-gray-400">Intercambios entre usuarios</span>
                    </div>
                  </div>

                  {/* Search users */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Buscar usuario por nombre, Discord Tag o ID..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs focus:outline-none ${inputBg}`}
                      />
                    </div>
                  </div>

                  {/* Users Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filteredUsers.map((item) => (
                      <div 
                        key={item.user.id} 
                        className={`p-4 rounded-xl border transition-all ${cardBg} hover:border-amber-500/40 flex flex-col justify-between gap-3`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop'}
                              alt={item.user.username}
                              className="w-12 h-12 rounded-xl object-cover border border-white/10"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black text-white">{item.user.username}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  item.user.role === 'admin' 
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : item.user.role === 'police'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : item.user.role === 'mechanic'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                }`}>
                                  {item.user.role}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-400 font-mono">
                                {item.user.discordTag || item.user.id}
                              </p>
                            </div>
                          </div>

                          {onDeleteUser && (
                            <button
                              onClick={() => {
                                if (confirm(`¿Expulsar o eliminar al usuario "${item.user.username}" del sistema?`)) {
                                  onDeleteUser(item.user.id);
                                }
                              }}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors cursor-pointer"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* EXACT TIMESTAMPS */}
                        <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1.5 text-[11px] font-mono">
                          <div className="flex items-center justify-between text-gray-300">
                            <span className="flex items-center gap-1.5 text-gray-400">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Hora exacta de registro:</span>
                            </span>
                            <span className="text-amber-300 font-semibold">{formatExactTime(item.user.createdAt)}</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-300">
                            <span className="flex items-center gap-1.5 text-gray-400">
                              <Activity className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Última actividad:</span>
                            </span>
                            <span className="text-emerald-300 font-semibold">{formatExactTime(item.lastActive)}</span>
                          </div>
                        </div>

                        {/* STATS BREAKDOWN */}
                        <div className="grid grid-cols-4 gap-2 text-center pt-1 border-t border-white/5">
                          <div className="p-2 rounded-lg bg-white/5">
                            <span className="text-[10px] text-gray-400 block">Posts</span>
                            <span className="text-xs font-bold text-amber-300">{item.postsCount}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-white/5">
                            <span className="text-[10px] text-gray-400 block">Coments</span>
                            <span className="text-xs font-bold text-indigo-300">{item.commentsCount}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-white/5">
                            <span className="text-[10px] text-gray-400 block">Autos</span>
                            <span className="text-xs font-bold text-purple-300">{item.carsCount}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-white/5">
                            <span className="text-[10px] text-gray-400 block">Mensajes</span>
                            <span className="text-xs font-bold text-emerald-300">{item.messagesSentCount}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 3: LOG TOTAL DE ACTIVIDAD (SIN BASE DE DATOS NI SECRETOS)
                  ========================================================================= */}
              {activeTab === 'activity_log' && (
                <div className="space-y-4">
                  {/* Privacy Banner */}
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/40 flex items-start gap-3 text-xs text-emerald-200">
                    <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <span>Log Total de Actividad Comunitaria (Estrictamente Seguro)</span>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500 text-black font-extrabold uppercase">
                          Sin secretos
                        </span>
                      </h4>
                      <p className="text-[11px] text-emerald-300/80 mt-1 leading-relaxed">
                        Este registro muestra en tiempo real todas las acciones realizadas en la comunidad (publicaciones, autos, mensajes privados, comentarios, logins de Discord) con su hora exacta. Para tu máxima tranquilidad, no se almacenan ni muestran contraseñas, tokens de API ni credenciales de base de datos.
                      </p>
                    </div>
                  </div>

                  {/* Filter Chips */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                      <Filter className="w-3.5 h-3.5" /> Filtrar:
                    </span>
                    {(['all', 'post', 'car', 'message', 'user', 'system'] as const).map((filterType) => (
                      <button
                        key={filterType}
                        onClick={() => setLogFilter(filterType)}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          logFilter === filterType
                            ? 'bg-amber-500 text-black font-bold'
                            : 'bg-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        {filterType === 'all' && 'Todos los eventos'}
                        {filterType === 'post' && 'Publicaciones'}
                        {filterType === 'car' && 'Marketplace'}
                        {filterType === 'message' && 'Mensajes'}
                        {filterType === 'user' && 'Logins de Usuario'}
                        {filterType === 'system' && 'Sistema'}
                      </button>
                    ))}
                  </div>

                  {/* Log Items List */}
                  {filteredLogs.length === 0 ? (
                    <div className={`p-8 rounded-2xl border text-center space-y-2 ${cardBg}`}>
                      <Activity className="w-10 h-10 text-gray-500 mx-auto opacity-40" />
                      <p className="text-sm font-bold text-gray-300">No hay registros aún</p>
                      <p className="text-xs text-gray-500">
                        A medida que los usuarios publiquen o manden mensajes, aparecerán en este registro con hora exacta.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 font-mono text-xs">
                      {filteredLogs.map((log) => (
                        <div 
                          key={log.id}
                          className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${cardBg} hover:border-emerald-500/30`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              log.type === 'post_created' || log.type === 'post_deleted'
                                ? 'bg-amber-500/20 text-amber-400'
                                : log.type === 'car_created' || log.type === 'car_deleted'
                                ? 'bg-indigo-500/20 text-indigo-400'
                                : log.type === 'message_sent'
                                ? 'bg-purple-500/20 text-purple-400'
                                : log.type === 'user_login'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-gray-500/20 text-gray-300'
                            }`}>
                              {log.type.includes('post') && <FileText className="w-4 h-4" />}
                              {log.type.includes('car') && <Car className="w-4 h-4" />}
                              {log.type.includes('message') && <Send className="w-4 h-4" />}
                              {log.type.includes('user') && <UserCheck className="w-4 h-4" />}
                              {log.type === 'system' && <Server className="w-4 h-4" />}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white">{log.actionText}</span>
                                <span className="text-[10px] px-2 py-0.2 rounded bg-white/10 text-gray-300">
                                  Por: <strong className="text-amber-300">{log.userName}</strong>
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                                {log.details}
                              </p>
                            </div>
                          </div>

                          {/* EXACT TIME BADGE */}
                          <div className="flex-shrink-0 self-end sm:self-center">
                            <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-emerald-300 font-mono text-[11px] flex items-center gap-1.5 shadow-inner">
                              <Clock className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{formatExactTime(log.timestamp)}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  TAB 4: MURO & MARKETPLACE (MODERACIÓN DIRECTA)
                  ========================================================================= */}
              {activeTab === 'moderation' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setModTab('posts')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        modTab === 'posts' ? 'bg-red-600 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      Publicaciones del Muro ({posts.length})
                    </button>
                    <button
                      onClick={() => setModTab('cars')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        modTab === 'cars' ? 'bg-red-600 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      Vehículos en Marketplace ({cars.length})
                    </button>
                  </div>

                  {modTab === 'posts' ? (
                    <div className="space-y-3">
                      {posts.map((post) => (
                        <div key={post.id} className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${cardBg}`}>
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <img src={post.authorAvatar} alt={post.authorName} className="w-6 h-6 rounded-full" />
                              <span className="text-xs font-bold text-white">{post.authorName}</span>
                              <span className="text-[10px] px-2 py-0.2 rounded bg-white/10 text-gray-400">
                                {post.tag || 'General'}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatExactTime(post.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-300">{post.content}</p>
                            {post.imageUrl && (
                              <img src={post.imageUrl} alt="Adjunto" className="w-24 h-16 object-cover rounded-lg mt-1 border border-white/10" />
                            )}
                          </div>
                          {onDeletePost && (
                            <button
                              onClick={() => onDeletePost(post.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                            >
                              Eliminar Post
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cars.map((car) => (
                        <div key={car.id} className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${cardBg}`}>
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{car.title}</span>
                              <span className="text-xs font-bold text-amber-400">{car.currency} {car.price.toLocaleString()}</span>
                              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatExactTime(car.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">Vendedor: {car.sellerName} • {car.category} • {car.condition}</p>
                          </div>
                          {onDeleteCar && (
                            <button
                              onClick={() => onDeleteCar(car.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                            >
                              Retirar Auto
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  TAB 5: SINCRONIZACIÓN MULTIDISPOSITIVO (PC & CELULAR)
                  ========================================================================= */}
              {activeTab === 'sync' && (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-[#131b26] to-indigo-950/40 border border-blue-600/40 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-black text-white flex items-center gap-2">
                          <Radio className="w-4 h-4 text-blue-400" />
                          <span>Sincronización en Tiempo Real Multidispositivo</span>
                        </h4>
                        <p className="text-xs text-blue-200/80 mt-1">
                          Conexión simultánea activa para que lo que publiques o envíes en tu PC se vea al instante en tu celular, y viceversa.
                        </p>
                      </div>
                      <button
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>Probar Sincronización Ahora</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10 font-mono text-xs">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Laptop className="w-4 h-4 text-amber-400" />
                        <span>Dispositivo PC: Sincronizado vía Node.js Server</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span>Dispositivo Celular: Sincronizado vía Node.js Server</span>
                      </div>
                    </div>
                  </div>

                  {/* Supabase Configuration & Credentials Form */}
                  <div className={`p-5 rounded-xl border space-y-4 ${cardBg}`}>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-400" />
                        <span>Configurar Conexión Real con Supabase (Opcional para Nube Persistente)</span>
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Si deseas almacenar todos los datos directamente en tu propio proyecto gratuito de Supabase, coloca tus credenciales aquí:
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Supabase Project URL
                        </label>
                        <input
                          type="text"
                          placeholder="https://xyzcompany.supabase.co"
                          value={supabaseForm.projectUrl}
                          onChange={(e) => setSupabaseForm({ ...supabaseForm, projectUrl: e.target.value })}
                          className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${inputBg}`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Supabase Anon Key (Public Key)
                        </label>
                        <input
                          type="password"
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          value={supabaseForm.anonKey}
                          onChange={(e) => setSupabaseForm({ ...supabaseForm, anonKey: e.target.value })}
                          className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${inputBg}`}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSaveSupabaseConfig(supabaseForm);
                            if (showToast) showToast('Credenciales de Supabase guardadas y sincronizadas.');
                          }}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Guardar Credenciales de Supabase</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleCopySupabaseSql}
                          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          <span>{copiedSql ? '¡SQL Copiado!' : 'Copiar Script SQL para Supabase'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  SUPERADMIN ONLY TABS (SOYGUAPOLOSE)
                  ========================================================================= */}
              {isSuperAdmin2 && activeTab === 'tables' && (
                <div className="space-y-4">
                  <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto text-xs">
                    {(['posts', 'messages', 'cars', 'users', 'groups'] as const).map((tbl) => (
                      <button
                        key={tbl}
                        onClick={() => setSelectedTable(tbl)}
                        className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                          selectedTable === tbl ? 'bg-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        Tabla: {tbl}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-xl bg-black/50 p-4 border border-white/10 font-mono text-xs overflow-x-auto max-h-96">
                    <pre className="text-gray-300">
                      {JSON.stringify(
                        selectedTable === 'posts' ? posts :
                        selectedTable === 'messages' ? messages :
                        selectedTable === 'cars' ? cars :
                        selectedTable === 'users' ? registeredUsers : groups,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              )}

              {isSuperAdmin2 && activeTab === 'backups' && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${cardBg}`}>
                    <div>
                      <h4 className="text-sm font-bold text-white">Exportar Dump Completo en JSON</h4>
                      <p className="text-xs text-gray-400 mt-1">Descarga toda la base de datos a un archivo .json</p>
                    </div>
                    <button
                      onClick={onExportJson}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar JSON</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className={`p-3.5 border-t flex items-center justify-between text-xs flex-shrink-0 ${
              isLight ? 'bg-gray-100 border-gray-200 text-gray-600' : 'bg-[#121316] border-[#252834] text-gray-400'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  {isLeonardoAdmin ? 'Admin Horizonte RP • Auditoría Completa Activa' : 'Sistema en línea'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
