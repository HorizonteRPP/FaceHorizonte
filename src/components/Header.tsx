import React, { useState } from 'react';
import { User, AdminSession, ThemeMode } from '../types';
import { 
  ShieldAlert, 
  MessageSquare, 
  Store, 
  Home, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X, 
  Users,
  Sun,
  Moon,
  Settings,
  Sparkles,
  Share2,
  Check,
  LogIn,
  Copy
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'feed' | 'marketplace' | 'groups';
  setCurrentTab: (tab: 'feed' | 'marketplace' | 'groups') => void;
  currentUser: User | null;
  adminSession: AdminSession;
  unreadCount: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAdminModal: () => void;
  onExitAdmin: () => void;
  onOpenSosModal: () => void;
  onOpenMessages: (sellerId?: string) => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  adminSession,
  unreadCount,
  theme,
  onToggleTheme,
  onOpenAuth,
  onLogout,
  onOpenAdminModal,
  onExitAdmin,
  onOpenSosModal,
  onOpenMessages,
  onOpenProfile
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const getCleanShareUrl = () => {
    return window.location.href.split('?')[0].split('#')[0];
  };

  const handleShareApp = () => {
    const url = getCleanShareUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
          .then(() => {
            setCopiedShare(true);
            setTimeout(() => setCopiedShare(false), 3500);
          })
          .catch(() => {
            setShareModalOpen(true);
          });
      } else {
        setShareModalOpen(true);
      }
    } catch {
      setShareModalOpen(true);
    }
  };

  const isAdminActive = adminSession.isAdmin1 || adminSession.isAdmin2;
  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors border-b ${
      isLight 
        ? 'bg-white/95 border-gray-200 text-gray-800 shadow-sm' 
        : 'bg-[#15161a]/95 border-[#282a32] text-white shadow-xl'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand & Roblox RP Tag */}
          <div className="flex items-center gap-3">
            <button
              id="header-logo-btn"
              onClick={() => setCurrentTab('feed')}
              className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center font-black text-white text-lg tracking-wider border border-red-500/40 shadow-md group-hover:scale-105 transition-transform">
                FH
              </div>
              <div className="flex flex-col">
                <span className={`text-xl font-black tracking-tight flex items-center gap-1 ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>
                  Face<span className="text-red-600">Horizont</span>
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-widest -mt-1 flex items-center gap-1 ${
                  isLight ? 'text-red-700' : 'text-red-400'
                }`}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  Horizonte RP
                </span>
              </div>
            </button>

            {/* Desktop Navigation Tabs: Inicio, Marketplace, Grupos */}
            <nav className="hidden md:flex items-center ml-6 space-x-1.5">
              <button
                id="nav-tab-feed"
                onClick={() => setCurrentTab('feed')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentTab === 'feed'
                    ? 'bg-red-600 text-white shadow-md'
                    : isLight
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    : 'text-gray-300 hover:text-white hover:bg-[#23252c]'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Inicio</span>
              </button>

              <button
                id="nav-tab-marketplace"
                onClick={() => setCurrentTab('marketplace')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentTab === 'marketplace'
                    ? 'bg-red-600 text-white shadow-md'
                    : isLight
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    : 'text-gray-300 hover:text-white hover:bg-[#23252c]'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Marketplace</span>
              </button>

              <button
                id="nav-tab-groups"
                onClick={() => setCurrentTab('groups')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentTab === 'groups'
                    ? 'bg-red-600 text-white shadow-md'
                    : isLight
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    : 'text-gray-300 hover:text-white hover:bg-[#23252c]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Grupos</span>
              </button>
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* THEME TOGGLE BUTTON: NEGRO / BLANCO INTERFAZ */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              title={isLight ? 'Cambiar a interfaz oscura (Negro/Gris)' : 'Cambiar a interfaz clara (Blanco)'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isLight
                  ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800'
                  : 'bg-[#22242b] hover:bg-[#2c2f38] border-[#363a45] text-gray-200 hover:text-white'
              }`}
            >
              {isLight ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Modo Negro</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Modo Blanco</span>
                </>
              )}
            </button>

            {/* Share Public Link Button for other devices / friends */}
            <button
              id="header-share-btn"
              onClick={handleShareApp}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                copiedShare
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md scale-105'
                  : isLight
                  ? 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
                  : 'bg-[#22242b] hover:bg-[#2c2f38] border-[#363a45] text-gray-300 hover:text-white'
              }`}
              title="Compartir enlace público para que amigos en otra casa o celular vean los mismos autos y publicaciones"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">¡Enlace Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-red-500" />
                  <span className="hidden sm:inline">Compartir</span>
                </>
              )}
            </button>

            {/* Messages Button */}
            <button
              id="header-messages-btn"
              onClick={() => onOpenMessages()}
              className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
                isLight
                  ? 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
                  : 'bg-[#22242b] hover:bg-[#2c2f38] border-[#363a45] text-gray-200 hover:text-white'
              }`}
              title="Mensajes Privados"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-red-600 text-white shadow-md animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Administration Button (🦺) */}
            <button
              id="header-admin-btn"
              onClick={onOpenAdminModal}
              title="Panel Administrativo"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isAdminActive
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-sm'
                  : isLight
                  ? 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
                  : 'bg-[#22242b] hover:bg-[#2c2f38] border-[#363a45] text-gray-300 hover:text-white'
              }`}
            >
              <span>🦺</span>
              <span className="hidden sm:inline">
                {isAdminActive ? 'Admin Activo' : 'Admin'}
              </span>
            </button>

            {/* SOS Button: Appears when Admin 2 enters "SOYGUAPOLOSE" */}
            {adminSession.isAdmin2 && (
              <button
                id="header-sos-btn"
                onClick={onOpenSosModal}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold uppercase shadow-md animate-pulse cursor-pointer"
                title="Menú SOS - Base de Datos Supabase"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>SOS</span>
              </button>
            )}

            {/* Profile / Auth Controls */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="header-profile-dropdown-btn"
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className={`flex items-center gap-2 p-1 pr-2.5 rounded-xl border transition-all cursor-pointer ${
                    isLight
                      ? 'bg-gray-100 hover:bg-gray-200 border-gray-200'
                      : 'bg-[#22242b] hover:bg-[#2c2f38] border-[#363a45]'
                  }`}
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-lg object-cover border border-red-500/50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';
                    }}
                  />
                  <div className="flex items-center gap-1 hidden sm:flex">
                    <span className={`text-xs font-bold max-w-[90px] truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {currentUser.username}
                    </span>
                    {currentUser.isDiscordUser && (
                      <span className="text-[10px] text-[#5865F2]" title="Verificado con Discord">✓</span>
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {profileDropdown && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                    isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#1e2026] border-[#333640] text-white'
                  }`}>
                    <div className={`px-3 py-2 border-b mb-1 ${isLight ? 'border-gray-100' : 'border-[#2d3039]'}`}>
                      <p className="text-xs font-bold truncate flex items-center gap-1">
                        <span>{currentUser.username}</span>
                        {currentUser.isDiscordUser && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#5865F2]/20 text-[#5865F2] font-bold">Discord</span>
                        )}
                      </p>
                      <p className="text-[11px] text-gray-400 capitalize">
                        Rol: {currentUser.role === 'citizen' ? 'Ciudadano RP' : currentUser.role}
                      </p>
                    </div>

                    <button
                      id="dropdown-profile-info-btn"
                      onClick={() => {
                        setProfileDropdown(false);
                        onOpenProfile();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer ${
                        isLight ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-[#282a32] text-gray-200'
                      }`}
                    >
                      <UserIcon className="w-4 h-4 text-red-500" />
                      <span>Ver Mi Perfil</span>
                    </button>

                    <button
                      id="dropdown-switch-account-btn"
                      onClick={() => {
                        setProfileDropdown(false);
                        onOpenAuth();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer ${
                        isLight ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-[#282a32] text-gray-200'
                      }`}
                    >
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>Cambiar de Cuenta</span>
                    </button>

                    {isAdminActive && (
                      <button
                        id="dropdown-exit-admin-btn"
                        onClick={() => {
                          setProfileDropdown(false);
                          onExitAdmin();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-amber-400 hover:bg-amber-500/10 flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Salir de Modo Admin</span>
                      </button>
                    )}

                    <div className={`pt-1 mt-1 border-t ${isLight ? 'border-gray-100' : 'border-[#2d3039]'}`}>
                      <button
                        id="dropdown-logout-btn"
                        onClick={() => {
                          setProfileDropdown(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-500 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Direct Login Button */
              <button
                id="header-login-btn"
                onClick={onOpenAuth}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center gap-2 group"
              >
                <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Ingresar / Conectar</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2 rounded-xl md:hidden border cursor-pointer ${
                isLight ? 'bg-gray-100 border-gray-300 text-gray-700' : 'bg-[#22242b] border-[#363a45] text-gray-300'
              }`}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className={`md:hidden border-t p-4 space-y-2 ${
          isLight ? 'bg-white border-gray-200' : 'bg-[#18191e] border-[#2c2f37]'
        }`}>
          <button
            onClick={() => {
              setCurrentTab('feed');
              setMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
              currentTab === 'feed' ? 'bg-red-600 text-white' : isLight ? 'text-gray-700' : 'text-gray-300'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Inicio</span>
          </button>

          <button
            onClick={() => {
              setCurrentTab('marketplace');
              setMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
              currentTab === 'marketplace' ? 'bg-red-600 text-white' : isLight ? 'text-gray-700' : 'text-gray-300'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Marketplace</span>
          </button>

          <button
            onClick={() => {
              setCurrentTab('groups');
              setMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
              currentTab === 'groups' ? 'bg-red-600 text-white' : isLight ? 'text-gray-700' : 'text-gray-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Grupos</span>
          </button>

          {!currentUser && (
            <button
              id="mobile-login-btn"
              onClick={() => {
                setMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-md cursor-pointer transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Ingresar / Conectar</span>
            </button>
          )}

          <div className="pt-2 border-t border-gray-700/40 flex items-center justify-between">
            <button
              onClick={() => {
                onToggleTheme();
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs font-bold py-1.5 text-gray-300 cursor-pointer"
            >
              {isLight ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span>{isLight ? 'Cambiar a Modo Negro' : 'Cambiar a Modo Blanco'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Share Modal Dialog */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md p-5 rounded-2xl border shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#18191e] border-[#2c2f37] text-white'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm">Compartir FaceHorizont RP</h3>
              </div>
              <button 
                onClick={() => setShareModalOpen(false)}
                className="p-1 rounded-lg opacity-70 hover:opacity-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs opacity-75">
              Copia este enlace para abrir FaceHorizont en otro dispositivo (celular, otra PC o enviárselo a amigos):
            </p>
            <div className={`p-3 rounded-xl border text-xs font-mono break-all select-all flex items-center justify-between gap-2 ${
              isLight ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-[#121316] border-[#313540] text-red-300'
            }`}>
              <span>{getCleanShareUrl()}</span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(getCleanShareUrl());
                  }
                  setCopiedShare(true);
                  setTimeout(() => setCopiedShare(false), 3000);
                  setShareModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Enlace</span>
              </button>
              <button
                onClick={() => setShareModalOpen(false)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                  isLight ? 'bg-gray-100 border-gray-300' : 'bg-[#22242b] border-[#363a45]'
                }`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
