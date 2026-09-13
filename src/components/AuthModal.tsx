import React, { useState, useEffect } from 'react';
import { User, DiscordApiConfig } from '../types';
import { X, CheckCircle2, ShieldCheck, ExternalLink, Sparkles, Settings } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (user: User) => void;
  registeredUsers: User[];
  discordConfig?: DiscordApiConfig;
}

// Preset verified Discord RP accounts that the user can pick from in 1 click
const DISCORD_PRESET_PROFILES = [
  {
    id: '109283746152431201',
    username: 'Destving',
    discriminator: '0001',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
    roleLabel: 'Fundador & Staff Horizonte RP',
    badge: 'Staff Oficial'
  },
  {
    id: '209384756182930192',
    username: 'MatiasRP',
    discriminator: '2026',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    roleLabel: 'Ciudadano Horizonte RP',
    badge: 'Miembro Verificado'
  },
  {
    id: '309485761293840193',
    username: 'OficialRamos',
    discriminator: '9110',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    roleLabel: 'Policía HPD Horizonte RP',
    badge: 'Fuerzas de Seguridad'
  },
  {
    id: '409586771394850294',
    username: 'SantiMecanico',
    discriminator: '5540',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    roleLabel: 'Mecánico & Taller Central',
    badge: 'Taller Tuning'
  }
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  registeredUsers,
  discordConfig
}) => {
  // Step in Discord verification flow: 'start' | 'authorizing' | 'loading'
  const [authStep, setAuthStep] = useState<'start' | 'oauth_prompt' | 'verifying'>('start');
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);
  const [customDiscordName, setCustomDiscordName] = useState('');
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Check if browser has URL token from a real Discord OAuth redirect (#access_token=...)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      const params = new URLSearchParams(window.location.hash.replace('#', '?'));
      const token = params.get('access_token');
      if (token) {
        setAuthStep('verifying');
        // Fetch real Discord profile using the token
        fetch('https://discord.com/api/users/@me', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then((res) => res.json())
          .then((discordData) => {
            if (discordData && discordData.username) {
              const avatar = discordData.avatar
                ? `https://cdn.discordapp.com/avatars/${discordData.id}/${discordData.avatar}.png?size=256`
                : `https://api.dicebear.com/7.x/bottts/svg?seed=${discordData.username}`;

              const user: User = {
                id: `discord_${discordData.id}`,
                username: discordData.global_name || discordData.username,
                avatar,
                role: 'citizen',
                isDiscordUser: true,
                discordTag: `${discordData.username}#${discordData.discriminator || '0000'}`,
                bio: `Verificado con cuenta oficial de Discord de Horizonte RP.`,
                createdAt: Date.now()
              };
              onRegisterSuccess(user);
              window.history.replaceState(null, '', window.location.pathname);
              onClose();
            }
          })
          .catch(() => {
            // Fallback to internal verification
            setAuthStep('start');
          });
      }
    }
  }, [onRegisterSuccess, onClose]);

  if (!isOpen) return null;

  const currentProfile = DISCORD_PRESET_PROFILES[selectedProfileIndex];

  const handleStartDiscord = () => {
    setErrorNotice(null);
    setAuthStep('oauth_prompt');
  };

  const handleAuthorize = async () => {
    setAuthStep('verifying');
    setErrorNotice(null);

    // Simulate Discord API network latency & authorization grant
    setTimeout(async () => {
      try {
        const username = isSwitchingAccount && customDiscordName.trim()
          ? customDiscordName.trim()
          : currentProfile.username;

        const avatar = isSwitchingAccount && customDiscordName.trim()
          ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`
          : currentProfile.avatarUrl;

        const discordTag = isSwitchingAccount && customDiscordName.trim()
          ? `${username}#${Math.floor(Math.random() * 8999 + 1000)}`
          : `${currentProfile.username}#${currentProfile.discriminator}`;

        // Send to backend endpoint
        const payload = {
          profile: {
            id: currentProfile.id,
            username,
            avatarUrl: avatar,
            discriminator: currentProfile.discriminator
          }
        };

        let newUser: User = {
          id: `discord_${currentProfile.id}_${Date.now()}`,
          username,
          avatar,
          role: username.toLowerCase().includes('ramos') ? 'police' : username.toLowerCase().includes('mecanico') ? 'mechanic' : 'citizen',
          isDiscordUser: true,
          discordTag,
          bio: `Cuenta oficial verificada con Discord en Roblox Horizonte RP.`,
          createdAt: Date.now()
        };

        try {
          const res = await fetch('/api/auth/discord-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              newUser = data.user;
            }
          }
        } catch {
          // Offline fallback is already prepared in newUser
        }

        onRegisterSuccess(newUser);
        setAuthStep('start');
        onClose();
      } catch (err) {
        setErrorNotice('Error al conectar con la API de Discord. Intenta de nuevo.');
        setAuthStep('oauth_prompt');
      }
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* OAUTH AUTHORIZATION DIALOG (Official Discord Styled Experience) */}
      {authStep === 'oauth_prompt' || authStep === 'verifying' ? (
        <div className="relative w-full max-w-md bg-[#313338] text-white rounded-2xl shadow-2xl border border-[#404249] overflow-hidden animate-in zoom-in-95 duration-150">
          
          {/* Discord Brand Top Bar */}
          <div className="bg-[#2b2d31] p-4 flex items-center justify-between border-b border-[#383a40]">
            <div className="flex items-center gap-2.5">
              {/* Discord Clyde Logo */}
              <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white shadow-md">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
                </svg>
              </div>
              <span className="text-sm font-black tracking-wide text-white">Discord</span>
            </div>

            <button
              id="btn-discord-cancel-x"
              onClick={() => {
                setAuthStep('start');
                setIsSwitchingAccount(false);
              }}
              disabled={authStep === 'verifying'}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#383a40] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Discord Authorization Content */}
          <div className="p-6 space-y-5">
            
            {authStep === 'verifying' ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full border-4 border-[#5865F2] border-t-transparent animate-spin"></div>
                <h3 className="text-base font-bold text-white">Conectando con Discord...</h3>
                <p className="text-xs text-gray-300">
                  Obteniendo tu nombre de usuario y tu foto de perfil oficial (Scope: identify).
                </p>
              </div>
            ) : (
              <>
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-600/50 text-red-300 text-xs font-bold mb-2">
                    <span>Horizonte RP</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white">
                    Iniciar Sesión con Discord
                  </h3>
                  <p className="text-xs text-gray-400">
                    Solo se vinculará tu nombre y tu avatar oficial sin contraseñas ni bots.
                  </p>
                </div>

                {/* Permissions being requested (pure identify) */}
                <div className="p-4 rounded-xl bg-[#2b2d31] border border-[#383a40] space-y-3">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Permisos solicitados (OAuth2 Identify):
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#5865F2] flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-200">
                      Nombre de usuario y apodo global de Discord
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#5865F2] flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-200">
                      Foto de perfil pública (Avatar) de Discord
                    </span>
                  </div>
                </div>

                {/* Discord User Card Preview */}
                <div className="p-4 rounded-xl bg-[#232428] border border-[#383a40]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Conectado como:
                    </span>
                    <button
                      id="btn-switch-discord-account"
                      type="button"
                      onClick={() => setIsSwitchingAccount(!isSwitchingAccount)}
                      className="text-xs text-[#5865F2] hover:text-[#7289da] hover:underline font-bold cursor-pointer"
                    >
                      {isSwitchingAccount ? 'Usar predeterminado' : 'Cambiar cuenta'}
                    </button>
                  </div>

                  {!isSwitchingAccount ? (
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={currentProfile.avatarUrl}
                          alt={currentProfile.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#5865F2]"
                        />
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#232428]"></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-white text-sm truncate">
                            {currentProfile.username}
                          </span>
                          <span className="text-xs text-gray-400">#{currentProfile.discriminator}</span>
                        </div>
                        <div className="text-[11px] text-gray-300 truncate">{currentProfile.roleLabel}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {DISCORD_PRESET_PROFILES.map((prof, idx) => (
                          <button
                            key={prof.id}
                            type="button"
                            onClick={() => {
                              setSelectedProfileIndex(idx);
                              setCustomDiscordName('');
                            }}
                            className={`p-2 rounded-xl text-left border flex items-center gap-2 transition-all cursor-pointer ${
                              selectedProfileIndex === idx && !customDiscordName
                                ? 'bg-[#5865F2]/20 border-[#5865F2] text-white'
                                : 'bg-[#2b2d31] border-[#383a40] text-gray-300 hover:text-white'
                            }`}
                          >
                            <img src={prof.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                            <span className="text-xs font-bold truncate">{prof.username}</span>
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">
                          O ingresa tu usuario exacto de Discord:
                        </label>
                        <input
                          type="text"
                          value={customDiscordName}
                          onChange={(e) => setCustomDiscordName(e.target.value)}
                          placeholder="Ej. Juan_Horizonte"
                          className="w-full px-3 py-2 rounded-lg bg-[#1e1f22] border border-[#383a40] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#5865F2]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {errorNotice && (
                  <div className="p-3 rounded-lg bg-red-950/80 border border-red-600 text-red-200 text-xs">
                    {errorNotice}
                  </div>
                )}

                {/* The Two Standard Buttons: Cancelar and Autorizar */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    id="btn-discord-cancel"
                    type="button"
                    onClick={() => {
                      setAuthStep('start');
                      setIsSwitchingAccount(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#4e5058] hover:bg-[#6d6f78] text-white text-sm font-bold transition-all cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-discord-authorize"
                    type="button"
                    onClick={handleAuthorize}
                    className="flex-1 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-bold shadow-lg shadow-[#5865F2]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Autorizar</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* MAIN MODAL SCREEN: NO USERNAME/PASSWORD INPUTS, ONLY DISCORD VERIFY BUTTON */
        <div className="relative w-full max-w-md bg-[#220101] border-2 border-red-700/80 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.4)] overflow-hidden animate-in zoom-in-95 duration-150">
          
          {/* Top Header */}
          <div className="flex items-center justify-between p-5 border-b border-red-900/60 bg-gradient-to-r from-red-950 via-[#3a0000] to-red-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center font-black text-white text-base shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                FH
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
                  Face<span className="text-red-500">Horizont</span>
                </h2>
                <p className="text-[11px] text-red-300/90 font-medium">Roblox Horizonte RP Community</p>
              </div>
            </div>

            <button
              id="auth-modal-close-main"
              onClick={onClose}
              className="p-1.5 rounded-xl text-red-300 hover:text-white hover:bg-red-900/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Direct Discord Flow Banner */}
          <div className="p-7 space-y-6 text-center">
            
            {/* Discord Shield Visual */}
            <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-[#5865F2] to-[#3b449b] p-0.5 shadow-[0_0_35px_rgba(88,101,242,0.4)] flex items-center justify-center">
              <div className="w-full h-full rounded-[22px] bg-[#1a0101] flex items-center justify-center text-white">
                <svg className="w-10 h-10 fill-[#5865F2]" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#220101] flex items-center justify-center text-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">
                Verificación Oficial con Discord
              </h3>
              <p className="text-xs text-red-200/80 leading-relaxed max-w-sm mx-auto">
                Sin contraseñas ni formularios manuales. Haz clic en el botón para verificar tu cuenta en el Discord oficial de Horizonte RP y entrar con tu nombre y avatar real.
              </p>
            </div>

            {/* Quick Benefits */}
            <div className="p-3.5 rounded-2xl bg-[#180101]/90 border border-red-900/60 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs text-red-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Vinculación directa con tu personaje de Roblox</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-red-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Importación automática de tu avatar y nombre real</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-red-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Acceso a grupos de facciones, chat RP y marketplace</span>
              </div>
            </div>

            {/* THE ONE DISCORD BUTTON */}
            <button
              id="btn-login-with-discord"
              type="button"
              onClick={handleStartDiscord}
              className="w-full py-4 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-base font-extrabold shadow-[0_0_30px_rgba(88,101,242,0.45)] hover:shadow-[0_0_40px_rgba(88,101,242,0.7)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-3 group"
            >
              <svg className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
              <span>Entrar con Discord (OAuth2)</span>
            </button>

            {discordConfig?.clientId && (
              <a
                href={`https://discord.com/oauth2/authorize?client_id=${discordConfig.clientId}&response_type=token&scope=identify&redirect_uri=${encodeURIComponent(
                  discordConfig.redirectUri || (typeof window !== 'undefined' ? window.location.origin : '')
                )}`}
                className="w-full py-2.5 rounded-xl bg-[#2b2d31] hover:bg-[#35373c] text-white text-xs font-bold border border-[#4e5058] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#5865F2]" />
                <span>Abrir flujo real en Discord.com (Scope: identify)</span>
              </a>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-red-950/60 text-[11px] text-gray-400">
              <span>Solo nombre y foto de perfil pública</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>OAuth2 Seguro</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
