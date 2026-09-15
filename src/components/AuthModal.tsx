import React, { useState } from 'react';
import { User, ThemeMode } from '../types';
import { 
  X, 
  User as UserIcon, 
  Sparkles, 
  LogIn, 
  ShieldCheck, 
  Car,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  registeredUsers?: User[];
  onSelectExistingUser?: (user: User) => void;
  onLoginAsCitizen: (username: string, avatarUrl: string, role: 'citizen' | 'police') => void;
  onStartDiscordOAuth: () => void;
  onLogout: () => void;
  theme?: ThemeMode;
  showToast: (msg: string) => void;
}

const PRESET_AVATARS = [
  {
    id: 'male_1',
    label: 'Conductor RP',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces'
  },
  {
    id: 'male_2',
    label: 'Mecánico',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=faces'
  },
  {
    id: 'female_1',
    label: 'Piloto',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces'
  },
  {
    id: 'female_2',
    label: 'Empresaria',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces'
  },
  {
    id: 'police',
    label: 'Policía HPD',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces'
  },
  {
    id: 'street',
    label: 'Street Racer',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces'
  }
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  registeredUsers = [],
  onSelectExistingUser,
  onLoginAsCitizen,
  onStartDiscordOAuth,
  onLogout,
  theme = 'charcoal',
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'citizen' | 'discord'>('citizen');
  const [characterName, setCharacterName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'police'>('citizen');
  const [customAvatar, setCustomAvatar] = useState('');

  if (!isOpen) return null;

  const existingMatch = characterName.trim()
    ? registeredUsers.find(
        (u) => u.username.toLowerCase() === characterName.trim().toLowerCase()
      )
    : null;

  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = characterName.trim();
    if (!cleanName) {
      showToast('Por favor introduce tu nombre de personaje en Horizonte RP.');
      return;
    }

    if (cleanName.length < 3) {
      showToast('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    // If an existing user matches, prefer their existing avatar if user hasn't customized
    const finalAvatar = customAvatar.trim() || (existingMatch?.avatar ?? selectedAvatar);
    onLoginAsCitizen(cleanName, finalAvatar, selectedRole);
    onClose();
  };

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#18191e] border-[#2c2f37] text-white'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#121316] border-[#252830]'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide">
                {currentUser ? 'Perfil de Ciudadano RP' : 'Ingresar a Horizonte RP'}
              </h2>
              <p className="text-[11px] opacity-70">
                {currentUser ? `Sesión activa como ${currentUser.username}` : 'Elige cómo quieres acceder a la red social'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If user is already logged in */}
        {currentUser ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-950/20 border border-red-600/30">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-red-600"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=991b1b&color=ffffff`;
                }}
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-sm truncate">{currentUser.username}</h3>
                <p className="text-xs text-red-400 capitalize">
                  {currentUser.role === 'admin' ? 'Administrador Oficial' : currentUser.role === 'police' ? 'Policía HPD' : 'Ciudadano RP'}
                </p>
                {currentUser.isDiscordUser && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                    Discord Conectado
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  onLogout();
                  showToast('Sesión cerrada.');
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Cerrar Sesión / Cambiar Ciudadano
              </button>
              <button
                onClick={onClose}
                className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isLight ? 'bg-gray-100 border-gray-300 hover:bg-gray-200' : 'bg-[#22242b] border-[#363a45] hover:bg-[#2b2e38]'
                }`}
              >
                Listo
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Tabs */}
            <div className={`grid grid-cols-2 p-1 rounded-xl border ${
              isLight ? 'bg-gray-100 border-gray-300' : 'bg-[#121316] border-[#252830]'
            }`}>
              <button
                type="button"
                onClick={() => setActiveTab('citizen')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'citizen'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ciudadano RP (Rápido)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('discord')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'discord'
                    ? 'bg-[#5865F2] text-white shadow-md'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
                </svg>
                <span>Discord Oficial</span>
              </button>
            </div>

            {/* Global sync status banner */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-600/40 text-[11px] text-emerald-300 flex items-start gap-2">
              <span className="text-sm">🌐</span>
              <div>
                <p className="font-bold">Base de Datos Central Sincronizada</p>
                <p className="opacity-80 text-[10px]">Tus autos, publicaciones y mensajes se sincronizan en tiempo real entre todos tus dispositivos y cuentas.</p>
              </div>
            </div>

            {/* Citizen Tab Form */}
            {activeTab === 'citizen' && (
              <form onSubmit={handleCitizenSubmit} className="space-y-4">
                {/* Existing Registered Accounts Selector */}
                {registeredUsers.length > 0 && !currentUser && (
                  <div className="p-3 rounded-xl bg-black/20 border border-red-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-red-400">
                        ⚡ Cuentas en el Servidor (Acceso Rápido):
                      </label>
                      <span className="text-[9px] opacity-60">Multidispositivo</span>
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {registeredUsers.map((regUser) => (
                        <button
                          key={regUser.id}
                          type="button"
                          onClick={() => {
                            if (onSelectExistingUser) {
                              onSelectExistingUser(regUser);
                            } else {
                              onLoginAsCitizen(regUser.username, regUser.avatar, regUser.role === 'police' ? 'police' : 'citizen');
                            }
                            onClose();
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-all cursor-pointer ${
                            isLight
                              ? 'bg-white hover:bg-red-50 border-gray-200'
                              : 'bg-[#15161a] hover:bg-[#20222a] border-[#2c2f38]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={regUser.avatar}
                              alt={regUser.username}
                              className="w-7 h-7 rounded-lg object-cover border border-red-600/40"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(regUser.username)}&background=991b1b&color=ffffff`;
                              }}
                            />
                            <div className="truncate">
                              <span className="text-xs font-bold block truncate">{regUser.username}</span>
                              <span className="text-[10px] text-red-400 capitalize">
                                {regUser.role === 'police' ? 'Policía HPD' : 'Ciudadano RP'}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-red-600/20 text-red-400 border border-red-600/40 hover:bg-red-600 hover:text-white transition-all shrink-0">
                            Entrar
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold mb-1 opacity-90">
                    Nombre o Apodo de tu Personaje RP:
                  </label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Ej: Tomas_Gonzales o Nico_RP"
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border outline-none focus:ring-2 focus:ring-red-500 ${
                      isLight ? 'bg-gray-50 border-gray-300 text-gray-900' : 'bg-[#121316] border-[#313540] text-white'
                    }`}
                  />
                  {existingMatch ? (
                    <div className="mt-1.5 p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-[11px] flex items-center gap-1.5 animate-fadeIn">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>¡Cuenta existente detectada! Te conectarás a <b>{existingMatch.username}</b> para acceder a todos tus autos y mensajes en este dispositivo.</span>
                    </div>
                  ) : (
                    <p className="text-[10px] opacity-60 mt-1">
                      Este nombre se mostrará en tus publicaciones, venta de autos y mensajes privados.
                    </p>
                  )}
                </div>

                {/* Role selection */}
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-90">
                    Ocupación / Rol en la ciudad:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('citizen')}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        selectedRole === 'citizen'
                          ? 'bg-red-600/20 border-red-500 text-red-400'
                          : isLight ? 'bg-gray-50 border-gray-200 opacity-70' : 'bg-[#121316] border-[#2c2f37] opacity-70'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Ciudadano</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('police')}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        selectedRole === 'police'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                          : isLight ? 'bg-gray-50 border-gray-200 opacity-70' : 'bg-[#121316] border-[#2c2f37] opacity-70'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Policía HPD</span>
                    </button>
                  </div>
                </div>

                {/* Avatar Presets */}
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-90">
                    Elige tu Avatar RP:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(av.url);
                          setCustomAvatar('');
                        }}
                        className={`relative p-1 rounded-xl border transition-all cursor-pointer ${
                          selectedAvatar === av.url && !customAvatar
                            ? 'border-red-500 ring-2 ring-red-500/50 scale-105'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={av.url}
                          alt={av.label}
                          className="w-full aspect-square rounded-lg object-cover"
                        />
                        {selectedAvatar === av.url && !customAvatar && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-red-500 absolute top-0 right-0 bg-black rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Ingresar a FaceHorizont</span>
                </button>
              </form>
            )}

            {/* Discord Tab */}
            {activeTab === 'discord' && (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 127.14 96.36">
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-black">Conectar con Discord</h3>
                  <p className="text-xs opacity-70 mt-1 max-w-xs mx-auto">
                    Importa tu nombre de usuario, avatar oficial y badge verificado de Discord automáticamente en Horizonte RP.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartDiscordOAuth();
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Autorizar con Discord</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
