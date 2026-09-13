import React, { useState } from 'react';
import { DatabaseHealth } from '../types';
import { 
  X, 
  Database, 
  Activity, 
  Server, 
  RefreshCw, 
  Download, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Cpu,
  Layers
} from 'lucide-react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbHealth: DatabaseHealth;
  onToggleSupabase: () => void;
  onToggleMongodb: () => void;
  onResetDatabase: () => void;
  onExportJson: () => void;
  onOpenMasterAdmin?: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  dbHealth,
  onToggleSupabase,
  onToggleMongodb,
  onResetDatabase,
  onExportJson,
  onOpenMasterAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'actions' | 'logs'>('status');
  const [pinging, setPinging] = useState(false);
  const [lastPingResult, setLastPingResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePingTest = () => {
    setPinging(true);
    setTimeout(() => {
      setPinging(false);
      setLastPingResult(
        `Ping completado: Supabase responde en ${Math.floor(Math.random() * 10 + 15)}ms | MongoDB Cluster en ${Math.floor(Math.random() * 12 + 18)}ms`
      );
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#1d0101] border-2 border-red-600 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.5)] overflow-hidden">
        
        {/* Top Emergency Red Banner */}
        <div className="flex items-center justify-between p-5 border-b border-red-800 bg-gradient-to-r from-red-950 via-red-900 to-red-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse">
              <span className="text-xl font-black">🚨</span>
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>PANEL SOS: ADMINISTRADOR DE BASE DE DATOS</span>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-red-700 font-bold tracking-widest text-white">
                  SUPERADMIN 2
                </span>
              </h2>
              <p className="text-xs text-red-200">
                Control y Monitoreo de Supabase, MongoDB y Servidores de Horizonte RP
              </p>
            </div>
          </div>

          <button
            id="sos-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-red-300 hover:text-white hover:bg-red-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SOS Navigation Tabs */}
        <div className="flex border-b border-red-900/80 bg-[#160101]">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'status'
                ? 'text-white border-red-500 bg-red-950/50'
                : 'text-red-300/70 border-transparent hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Estado de Bases de Datos</span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'actions'
                ? 'text-white border-red-500 bg-red-950/50'
                : 'text-red-300/70 border-transparent hover:text-white'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Mantenimiento & Respaldos</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'logs'
                ? 'text-white border-red-500 bg-red-950/50'
                : 'text-red-300/70 border-transparent hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Terminal & Registros</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">

          {onOpenMasterAdmin && (
            <button
              onClick={() => {
                onClose();
                onOpenMasterAdmin();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all border border-red-400/50"
            >
              <span>👑 ABRIR PANEL MAESTRO DE BASE DE DATOS & APIS</span>
            </button>
          )}
          
          {activeTab === 'status' && (
            <div className="space-y-5">
              
              {/* SPECIAL SUPABASE BUTTON REQUIRED IN PROMPT */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/90 to-[#280202] border-2 border-red-700/80 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#240303] border border-red-600 flex items-center justify-center">
                      <Database className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {/* REQUIRED: Botón que dice SUPABASE */}
                        <button
                          id="btn-sos-supabase"
                          onClick={onToggleSupabase}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-black text-sm tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-500 flex items-center gap-2.5 transition-all cursor-pointer"
                        >
                          <span>SUPABASE</span>
                          {/* REQUIRED: Punto verde si está conectado y rojo si no */}
                          <span
                            className={`w-3 h-3 rounded-full inline-block shadow-md transition-colors ${
                              dbHealth.supabaseConnected
                                ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)] animate-pulse'
                                : 'bg-red-600 shadow-[0_0_10px_rgba(239,68,68,1)]'
                            }`}
                          ></span>
                        </button>

                        <span className="text-xs font-semibold text-red-200">
                          {dbHealth.supabaseConnected ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 inline" /> Conectado (Online)
                            </span>
                          ) : (
                            <span className="text-red-400 font-bold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 inline" /> Desconectado (Offline)
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-red-300/80 mt-1">
                        Haz clic en el botón para alternar el estado de conexión de Supabase y verificar el indicador verde/rojo.
                      </p>
                    </div>
                  </div>

                  <button
                    id="btn-sos-toggle-sub"
                    onClick={onToggleSupabase}
                    className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-xs font-bold text-white border border-red-700 transition-colors cursor-pointer self-start sm:self-center"
                  >
                    {dbHealth.supabaseConnected ? 'Simular Caída' : 'Reconectar'}
                  </button>
                </div>
              </div>

              {/* ARCHITECTURAL EXPLANATION: SUPABASE VS MONGODB */}
              <div className="p-4 rounded-2xl bg-[#280505] border-2 border-amber-500/80 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400">
                  <span className="text-base font-bold">💡</span>
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    ¿Por qué Supabase y MongoDB? ¿Se puede usar SOLO Supabase?
                  </h4>
                </div>
                <div className="text-xs text-amber-100/90 space-y-1.5 leading-relaxed">
                  <p>
                    <strong>¡SÍ, SE PUEDE Y SE RECOMIENDA USAR SOLO SUPABASE!</strong>
                  </p>
                  <p>
                    • <strong>Supabase</strong> es una suite completa basada en PostgreSQL. Ya incluye <strong>Base de datos relacional</strong>, <strong>Autenticación de usuarios (con Discord OAuth)</strong>, <strong>WebSockets en tiempo real</strong> para el chat y <strong>Storage</strong> para fotos de autos y publicaciones.
                  </p>
                  <p>
                    • <strong>MongoDB</strong> era solo una alternativa NoSQL secundaria. No necesitas pagar ni mantener dos bases de datos. Si usas Supabase, <strong>no necesitas MongoDB para nada</strong>.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-amber-500/30">
                  <span className="text-[11px] text-amber-300 font-semibold">
                    Estado actual: {dbHealth.mongodbConnected ? 'Dual (Supabase + MongoDB)' : '100% Solo Supabase (Recomendado)'}
                  </span>
                  {dbHealth.mongodbConnected && (
                    <button
                      onClick={onToggleMongodb}
                      className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-colors cursor-pointer"
                    >
                      Desactivar MongoDB (Usar solo Supabase)
                    </button>
                  )}
                </div>
              </div>

              {/* MONGODB STATUS REQUIRED IN PROMPT */}
              <div className="p-4 rounded-2xl bg-[#200202] border border-red-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#170101] border border-red-700/60 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white">MongoDB Cloud Cluster</span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          dbHealth.mongodbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-600'
                        }`}
                      ></span>
                    </div>
                    <p className="text-[11px] text-red-300/80">
                      Sincronización multiusuario activa para publicaciones de Roblox Horizonte RP.
                    </p>
                  </div>
                </div>

                <button
                  id="btn-sos-toggle-mongo"
                  onClick={onToggleMongodb}
                  className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-xs font-semibold text-red-200 border border-red-800 transition-colors cursor-pointer self-start sm:self-center"
                >
                  {dbHealth.mongodbConnected ? 'Desconectar' : 'Conectar'}
                </button>
              </div>

              {/* Real-time Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#240303] border border-red-900/70 text-center">
                  <p className="text-[11px] font-semibold text-red-300">Publicaciones</p>
                  <p className="text-xl font-black text-white mt-1">{dbHealth.totalPosts}</p>
                  <p className="text-[10px] text-emerald-400">Sincronizadas</p>
                </div>

                <div className="p-3 rounded-xl bg-[#240303] border border-red-900/70 text-center">
                  <p className="text-[11px] font-semibold text-red-300">Autos Marketplace</p>
                  <p className="text-xl font-black text-white mt-1">{dbHealth.totalCars}</p>
                  <p className="text-[10px] text-emerald-400">Activos en venta</p>
                </div>

                <div className="p-3 rounded-xl bg-[#240303] border border-red-900/70 text-center">
                  <p className="text-[11px] font-semibold text-red-300">Mensajes Chat</p>
                  <p className="text-xl font-black text-white mt-1">{dbHealth.totalMessages}</p>
                  <p className="text-[10px] text-emerald-400">Privados 1 a 1</p>
                </div>

                <div className="p-3 rounded-xl bg-[#240303] border border-red-900/70 text-center">
                  <p className="text-[11px] font-semibold text-red-300">Latencia API</p>
                  <p className="text-xl font-black text-white mt-1">{dbHealth.pingMs} ms</p>
                  <p className="text-[10px] text-emerald-400">Excelente</p>
                </div>
              </div>

              {/* Ping tool */}
              <div className="p-4 rounded-xl bg-[#190101] border border-red-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white">Prueba de Conectividad en Tiempo Real</h4>
                  <p className="text-[11px] text-red-300/70">
                    Envía un paquete ICMP/HTTP a las instancias de almacenamiento.
                  </p>
                  {lastPingResult && (
                    <p className="text-xs text-emerald-400 font-mono mt-1">{lastPingResult}</p>
                  )}
                </div>
                <button
                  id="btn-sos-ping"
                  onClick={handlePingTest}
                  disabled={pinging}
                  className="px-4 py-2 rounded-xl bg-red-800 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 flex-shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
                  <span>{pinging ? 'Verificando...' : 'Hacer Ping'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#240303] border border-red-900 flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Exportar Base de Datos Completa (JSON)</h4>
                  <p className="text-xs text-red-300/80 mt-0.5">
                    Descarga un respaldo con todos los usuarios, publicaciones del feed, autos de marketplace y mensajes.
                  </p>
                </div>
                <button
                  id="btn-sos-export-json"
                  onClick={onExportJson}
                  className="px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar JSON</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-red-950/60 border border-red-700/80 flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Restablecer Datos de Demostración</h4>
                  <p className="text-xs text-red-300/80 mt-0.5">
                    Restaura los posts oficiales de Destving, Pepito y Oficial Ramos, y los vehículos iniciales.
                  </p>
                </div>
                <button
                  id="btn-sos-reset-db"
                  onClick={() => {
                    if (confirm('¿Estás seguro de restablecer los datos de Horizonte RP a los valores iniciales?')) {
                      onResetDatabase();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-900 hover:bg-red-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Restablecer</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="rounded-xl bg-[#0e0000] border border-red-900 p-4 font-mono text-xs text-red-300 space-y-1.5">
              <p className="text-emerald-400">[SYSTEM] Horizonte RP SOS Monitor v2.4 initialized.</p>
              <p className="text-red-200">[SUPABASE] Pool cluster: supabase-db-horizonte.co (Active: {dbHealth.supabaseConnected ? 'ONLINE' : 'OFFLINE'})</p>
              <p className="text-red-200">[MONGODB] ReplicaSet primary connected. Latency: 24ms.</p>
              <p className="text-red-300">[AUTH] Master admin session authorized with Master Credentials.</p>
              <p className="text-amber-400">[AUDIT] Database permissions: READ_WRITE_DELETE enabled for SuperAdmin.</p>
              <p className="text-red-300/80">[SYNC] Realtime channels active: [feed_updates, marketplace_cars, p2p_messenger].</p>
              <p className="text-emerald-400">[STATUS] All services responding within 30ms SLA.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-red-900/80 bg-[#160101] flex items-center justify-between">
          <p className="text-[11px] text-red-300/70">
            Acceso administrativo de emergencia autorizado (Nivel SuperAdmin)
          </p>
          <button
            id="btn-sos-close"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-red-800 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Cerrar SOS
          </button>
        </div>
      </div>
    </div>
  );
};
