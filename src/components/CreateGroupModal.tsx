import React, { useState } from 'react';
import { Group, User } from '../types';
import { X, Users, Image, Shield, Sparkles, Check } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onCreateGroup: (newGroup: Group) => void;
  onOpenAuth: () => void;
}

const COVER_PRESETS = [
  {
    name: 'Policía HPD Operativo',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Taller Deportivo & Tuning',
    url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Callejero & Corredores Nocturnos',
    url: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=1200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Rascacielos & Negocios',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80'
  }
];

const ICON_PRESETS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces'
];

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreateGroup,
  onOpenAuth
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Group['category']>('Crews & Facciones');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [selectedCover, setSelectedCover] = useState(COVER_PRESETS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICON_PRESETS[0]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Por favor ingresa un nombre para el grupo.');
      return;
    }

    const finalCover = customCoverUrl.trim() || selectedCover;

    const newGroup: Group = {
      id: `group_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      description: description.trim() || 'Comunidad oficial de Roblox Horizonte RP.',
      category,
      privacy,
      coverUrl: finalCover,
      iconUrl: selectedIcon,
      createdBy: currentUser.id,
      creatorName: currentUser.username,
      createdAt: Date.now(),
      members: [
        {
          userId: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
          role: 'owner',
          joinedAt: Date.now(),
          canPost: true,
          canChat: true
        }
      ],
      posts: [],
      messages: []
    };

    onCreateGroup(newGroup);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#220101] border-2 border-red-700/80 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.4)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-red-900/60 bg-gradient-to-r from-red-950 via-[#360000] to-red-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Crear Nuevo Grupo</h3>
              <p className="text-[11px] text-red-300">Comunidad de Roblox Horizonte RP</p>
            </div>
          </div>

          <button
            id="create-group-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-red-300 hover:text-white hover:bg-red-900/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950 border border-red-600 text-red-200 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Group Name */}
          <div>
            <label className="block text-xs font-bold text-red-200 mb-1.5 uppercase tracking-wider">
              Nombre del Grupo *
            </label>
            <input
              id="input-group-name"
              type="text"
              placeholder="Ej. Los Diablos MC, División HPD Tránsito, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#160000] border border-red-900/80 text-white placeholder-red-400/40 text-sm focus:outline-none focus:border-red-500 transition-colors"
              required
            />
          </div>

          {/* Category & Privacy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-red-200 mb-1.5 uppercase tracking-wider">
                Categoría
              </label>
              <select
                id="select-group-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Group['category'])}
                className="w-full px-4 py-3 rounded-xl bg-[#160000] border border-red-900/80 text-white text-sm focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="Crews & Facciones">Crews & Facciones</option>
                <option value="Policía HPD & Seguridad">Policía HPD & Seguridad</option>
                <option value="Mecánicos & Carreras">Mecánicos & Carreras</option>
                <option value="Empresas & Negocios">Empresas & Negocios</option>
                <option value="Comunidad General">Comunidad General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-red-200 mb-1.5 uppercase tracking-wider">
                Privacidad
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-privacy-public"
                  onClick={() => setPrivacy('public')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    privacy === 'public'
                      ? 'bg-red-700 text-white border-red-500 shadow-md'
                      : 'bg-[#160000] text-red-300 border-red-950 hover:bg-red-950'
                  }`}
                >
                  Público
                </button>
                <button
                  type="button"
                  id="btn-privacy-private"
                  onClick={() => setPrivacy('private')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    privacy === 'private'
                      ? 'bg-red-700 text-white border-red-500 shadow-md'
                      : 'bg-[#160000] text-red-300 border-red-950 hover:bg-red-950'
                  }`}
                >
                  Privado
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-red-200 mb-1.5 uppercase tracking-wider">
              Descripción y Reglas del Grupo
            </label>
            <textarea
              id="textarea-group-desc"
              rows={3}
              placeholder="Explica de qué trata tu grupo, requisitos de rol y actividades..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#160000] border border-red-900/80 text-white placeholder-red-400/40 text-sm focus:outline-none focus:border-red-500 resize-none transition-colors"
            />
          </div>

          {/* Cover Selector */}
          <div>
            <label className="block text-xs font-bold text-red-200 mb-2 uppercase tracking-wider">
              Portada del Grupo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {COVER_PRESETS.map((cov, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedCover(cov.url);
                    setCustomCoverUrl('');
                  }}
                  className={`relative h-18 rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                    selectedCover === cov.url && !customCoverUrl
                      ? 'border-red-500 ring-2 ring-red-500/50 scale-[1.02]'
                      : 'border-red-950 hover:border-red-800'
                  }`}
                >
                  <img src={cov.url} alt={cov.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  {selectedCover === cov.url && !customCoverUrl && (
                    <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center text-white">
                      <Check className="w-5 h-5 drop-shadow" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <input
              type="url"
              placeholder="O pega una URL de imagen personalizada..."
              value={customCoverUrl}
              onChange={(e) => setCustomCoverUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#160000] border border-red-900/80 text-white placeholder-red-400/40 text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              id="btn-create-group-submit"
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Crear Grupo en Horizonte RP</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
