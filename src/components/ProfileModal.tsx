import React, { useState, useRef } from 'react';
import { User, Post, MarketplaceCar } from '../types';
import { X, Upload, Link2, Camera, ShieldCheck, User as UserIcon, Car, MessageCircle } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUpdateUser: (updated: User) => void;
  userPosts: Post[];
  userCars: MarketplaceCar[];
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  userPosts,
  userCars
}) => {
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [editingPhoto, setEditingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !currentUser) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      onUpdateUser({ ...currentUser, avatar: res });
      setEditingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBio = () => {
    onUpdateUser({ ...currentUser, bio });
  };

  const handleApplyUrl = () => {
    if (avatarUrl.trim()) {
      onUpdateUser({ ...currentUser, avatar: avatarUrl.trim() });
      setEditingPhoto(false);
      setAvatarUrl('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#200101] border border-red-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Cover Header */}
        <div className="h-28 bg-gradient-to-r from-red-900 via-red-800 to-[#3d0303] relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-6 pt-0 relative space-y-4">
          <div className="flex items-end justify-between -mt-12">
            <div className="relative group">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-[#200101] shadow-xl bg-black"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';
                }}
              />
              <button
                onClick={() => setEditingPhoto(!editingPhoto)}
                className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Cambiar foto de perfil"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>

            <button
              onClick={() => setEditingPhoto(!editingPhoto)}
              className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-xs font-semibold text-red-200 border border-red-800 transition-colors cursor-pointer"
            >
              {editingPhoto ? 'Cancelar' : 'Cambiar Foto'}
            </button>
          </div>

          {/* Change photo controls */}
          {editingPhoto && (
            <div className="p-3.5 rounded-xl bg-[#140101] border border-red-900/80 space-y-2.5 animate-in fade-in">
              <p className="text-xs font-bold text-white">Actualizar Foto de Perfil</p>
              
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Archivo</span>
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="O pega URL de foto..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#0e0000] border border-red-900 text-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-1.5 rounded-lg bg-red-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}

          {/* User Info */}
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>{currentUser.username}</span>
              {currentUser.isDiscordUser && (
                <span className="text-[10px] bg-red-950 border border-red-700 text-red-300 px-2 py-0.5 rounded-full font-bold">
                  {currentUser.discordTag || 'Discord'}
                </span>
              )}
            </h2>
            <p className="text-xs text-red-400 capitalize">
              Rol: {currentUser.role === 'citizen' ? 'Ciudadano de Horizonte RP' : currentUser.role}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#160101] border border-red-950 text-center">
            <div>
              <p className="text-base font-extrabold text-white">{userPosts.length}</p>
              <p className="text-[11px] text-red-300">Publicaciones en Feed</p>
            </div>
            <div>
              <p className="text-base font-extrabold text-white">{userCars.length}</p>
              <p className="text-[11px] text-red-300">Autos en Marketplace</p>
            </div>
          </div>

          {/* Bio input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-red-200">
              Estado / Biografía de Rol
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Escribe tu historia o trabajo en Horizonte RP..."
                className="flex-1 px-3 py-2 rounded-xl bg-[#140101] border border-red-900 text-xs text-white placeholder-red-400/40"
              />
              <button
                onClick={handleSaveBio}
                className="px-3 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
