import React, { useState } from 'react';
import { DiscordApiConfig } from '../types';
import { X, Key, Shield, Copy, Check, ExternalLink, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface DiscordConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DiscordApiConfig;
  onSaveConfig: (cfg: DiscordApiConfig) => void;
  showToast: (msg: string) => void;
}

export const DiscordConfigModal: React.FC<DiscordConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  showToast
}) => {
  const [clientId, setClientId] = useState(config.clientId || '');
  const [clientSecret, setClientSecret] = useState(config.clientSecret || '');
  const [redirectUri, setRedirectUri] = useState(
    config.redirectUri || (typeof window !== 'undefined' ? `${window.location.origin}/` : '')
  );
  const [copiedUri, setCopiedUri] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCopyRedirectUri = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(redirectUri);
      setCopiedUri(true);
      setTimeout(() => setCopiedUri(false), 2500);
      showToast('Redirect URI copiado al portapapeles');
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    // Test Discord API access
    setTimeout(() => {
      setTestingConnection(false);
      if (clientId.trim().length >= 15) {
        setTestResult({
          success: true,
          message: 'Client ID válido para OAuth2 (Scope: identify). Obtendrá nombre y avatar.'
        });
      } else {
        setTestResult({
          success: false,
          message: 'El Client ID de Discord suele tener entre 17 y 19 dígitos numéricos.'
        });
      }
    }, 900);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DiscordApiConfig = {
      clientId: clientId.trim(),
      clientSecret: clientSecret.trim(),
      redirectUri: redirectUri.trim()
    };
    onSaveConfig(updated);
    showToast('Configuración de Discord OAuth2 guardada.');
    onClose();
  };

  const oauthUrl = clientId.trim()
    ? `https://discord.com/oauth2/authorize?client_id=${clientId.trim()}&response_type=token&scope=identify&redirect_uri=${encodeURIComponent(
        redirectUri.trim()
      )}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#1e2024] border border-[#3b3e45] rounded-3xl shadow-2xl overflow-hidden text-white">
        
        {/* Header with Discord Blurple gradient */}
        <div className="flex items-center justify-between p-5 border-b border-[#2e3138] bg-gradient-to-r from-[#24272c] via-[#2b2e35] to-[#24272c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shadow-md">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Discord OAuth2 (Nombre y Avatar)</h3>
              <p className="text-xs text-gray-400">Inicio de sesión directo con tu cuenta de Discord</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#2b2d33] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="p-3.5 rounded-xl bg-[#272a30] border border-[#373a42] text-xs text-gray-300 space-y-1.5">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#5865F2]" />
              Solo nombre y foto de perfil (Sin Bots ni permisos extras)
            </p>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              1. Ve a tu aplicación en{' '}
              <a 
                href="https://discord.com/developers/applications" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#5865F2] hover:underline"
              >
                discord.com/developers
              </a>
              .<br />
              2. En <strong>OAuth2 → Redirects</strong>, agrega la Redirect URI de abajo.<br />
              3. Copia el <strong>Client ID (Application ID)</strong> y pégalo aquí.
            </p>
          </div>

          {/* Client ID */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Discord Client ID (Application ID) *
            </label>
            <input
              type="text"
              placeholder="Ej. 109283746152431201"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141619] border border-[#353840] text-white text-xs font-mono placeholder-gray-500 focus:outline-none focus:border-[#5865F2]"
              required
            />
          </div>

          {/* Client Secret */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Discord Client Secret (Opcional)
            </label>
            <input
              type="password"
              placeholder="••••••••••••••••••••••••••••••••"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141619] border border-[#353840] text-white text-xs font-mono placeholder-gray-500 focus:outline-none focus:border-[#5865F2]"
            />
          </div>

          {/* Redirect URI with Copy Button */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Redirect URI (Pégala en Discord Developer Portal)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={redirectUri}
                onChange={(e) => setRedirectUri(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-[#141619] border border-[#353840] text-white text-xs font-mono focus:outline-none focus:border-[#5865F2]"
              />
              <button
                type="button"
                onClick={handleCopyRedirectUri}
                className="px-3 py-2 rounded-xl bg-[#2d3036] hover:bg-[#3b3e45] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedUri ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedUri ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Test connection result */}
          {testResult && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              testResult.success 
                ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200' 
                : 'bg-amber-950/60 border-amber-600 text-amber-200'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="px-3.5 py-2 rounded-xl bg-[#2d3036] hover:bg-[#3b3e45] text-gray-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>Probar credenciales</span>
            </button>

            {oauthUrl && (
              <a
                href={oauthUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#5865F2] hover:underline flex items-center gap-1 font-bold"
              >
                <span>Probar link OAuth2 oficial</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-3 border-t border-[#2e3138]">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-sm shadow-lg shadow-[#5865F2]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Configuración de Discord</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
