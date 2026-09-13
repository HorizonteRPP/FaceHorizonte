import React from 'react';
import { ShieldCheck, Heart, Radio } from 'lucide-react';

interface FooterProps {
  onOpenSos?: () => void;
  showSosTrigger?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSos, showSosTrigger }) => {
  return (
    <footer className="mt-16 border-t border-red-950/80 bg-[#190101] py-8 text-center text-xs text-red-300/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Brand signature */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-red-700 flex items-center justify-center font-bold text-white text-xs">
            FH
          </div>
          <span className="font-extrabold text-white text-sm">FaceHorizont</span>
          <span className="text-red-500 font-bold">•</span>
          <span className="text-red-400 font-semibold">Roblox Roleplay</span>
        </div>

        {/* REQUIRED FOOTER TEXT EXACTLY AS REQUESTED */}
        <p className="text-xs font-semibold text-red-200">
          Derechos © Registrado para Horizonte RP
        </p>

        <p className="text-[11px] text-red-400/60 max-w-lg mx-auto">
          Plataforma comunitaria no oficial para servidores de Roleplay en Roblox. Todos los nombres de vehículos, marcas y facciones corresponden a dinámicas de rol dentro del juego.
        </p>

        <div className="flex items-center justify-center gap-4 text-[11px] text-red-400/70 pt-2 border-t border-red-950/60">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Servidor Horizonte RP: En línea
          </span>
          <span>•</span>
          <span>Versión FaceHorizont v2.4</span>
          
          {showSosTrigger && (
            <>
              <span>•</span>
              <button
                onClick={onOpenSos}
                className="text-red-400 hover:text-white font-bold cursor-pointer underline"
              >
                Panel SOS
              </button>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};
