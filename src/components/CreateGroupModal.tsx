import React, { useState, useRef } from 'react';
import { Group, User } from '../types';
import { X, Users, Image as ImageIcon, Sparkles, Upload, Link as LinkIcon, Trash2, Tag, ShieldCheck, Lock } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onCreateGroup: (newGroup: Group) => void;
  onOpenAuth: () => void;
}

const CATEGORY_SUGGESTIONS = [
  'Crews & Facciones',
  'Policía & Seguridad',
  'Mecánicos & Carreras',
  'Empresas & Negocios',
  'Banda Callejera',
  'Mafia & Cartel',
  'Familia',
  'Comunidad General'
];

// High quality default dark-red gradient banner fallback if no image is uploaded
const DEFAULT_GROUP_BANNER = 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=1200&auto=format&fit=crop&q=80';

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreateGroup,
  onOpenAuth
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  
  // Image handling: upload file or enter URL
  const [imageMethod, setImageMethod] = useState<'upload' | 'url'>('upload');
  const [coverUrl, setCoverUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle file upload from device
  const handleFileChange = (file?: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('La imagen seleccionada supera los 8MB.');
      return;
    }

    setErrorMsg('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCoverUrl(result);
    };
    reader.onerror = () => {
      setErrorMsg('Error al leer el archivo de imagen.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setCoverUrl('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Por favor ingresa el nombre de tu grupo.');
      return;
    }

    if (!category.trim()) {
      setErrorMsg('Por favor indica la categoría o tipo de grupo.');
      return;
    }

    const finalCover = coverUrl.trim() || DEFAULT_GROUP_BANNER;
    // Derive group icon from cover if available, or default avatar
    const finalIcon = coverUrl.trim() 
      ? coverUrl.trim()
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=991b1b&color=ffffff&bold=true&size=256`;

    const newGroup: Group = {
      id: `group_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      description: description.trim() || 'Comunidad oficial de Roblox Horizonte RP.',
      category: category.trim(),
      privacy,
      coverUrl: finalCover,
      iconUrl: finalIcon,
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
    setCategory('');
    setCoverUrl('');
    setFileName('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#1d0101] border-2 border-red-700/80 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.4)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-red-900/60 bg-gradient-to-r from-red-950 via-[#2e0000] to-red-950">
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/90 border border-red-600 text-red-200 text-xs font-semibold">
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
              placeholder="Ej. Los Diablos MC, División HPD Tránsito, Taller Benny's, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#140000] border border-red-900/80 text-white placeholder-red-400/40 text-sm focus:outline-none focus:border-red-500 transition-colors"
              required
            />
          </div>

          {/* Category (User-defined) & Privacy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-red-200 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-red-400" />
                <span>Categoría del Grupo *</span>
              </label>
              <input
                id="input-group-category"
                type="text"
                list="category-suggestions"
                placeholder="Escribe la categoría..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#140000] border border-red-900/80 text-white placeholder-red-400/40 text-sm focus:outline-none focus:border-red-500 transition-colors"
                required
              />
              <datalist id="category-suggestions">
                {CATEGORY_SUGGESTIONS.map((cat, idx) => (
                  <option key={idx} value={cat} />
                ))}
              </datalist>

              {/* Quick suggestion chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {CATEGORY_SUGGESTIONS.slice(0, 4).map((cat, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-red-950/80 hover:bg-red-900 border border-red-900/60 text-red-300 hover:text-white transition-colors cursor-pointer"
                  >
                    + {cat}
                  </button>
                ))}
              </div>
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
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    privacy === 'public'
                      ? 'bg-red-700 text-white border-red-500 shadow-md'
                      : 'bg-[#140000] text-red-300 border-red-950 hover:bg-red-950'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Público</span>
                </button>
                <button
                  type="button"
                  id="btn-privacy-private"
                  onClick={() => setPrivacy('private')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    privacy === 'private'
                      ? 'bg-red-700 text-white border-red-500 shadow-md'
                      : 'bg-[#140000] text-red-300 border-red-950 hover:bg-red-950'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Privado</span>
                </button>
              </div>
              <p className="text-[10px] text-red-300/60 mt-1.5">
                {privacy === 'public'
                  ? 'Cualquier ciudadano puede ver y unirse.'
                  : 'Solo visible para miembros invitados.'}
              </p>
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
              className="w-full px-4 py-3 rounded-xl bg-[#140000] border border-red-900/80 text-white placeholder-red-400/40 text-sm focus:outline-none focus:border-red-500 resize-none transition-colors"
            />
          </div>

          {/* Group Photo / Cover (Attach file or URL) */}
          <div>
            <label className="block text-xs font-bold text-red-200 mb-2 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-red-400" />
                <span>Foto de Portada del Grupo</span>
              </span>
              <span className="text-[10px] text-red-400/80 font-normal lowercase">(archivo o URL)</span>
            </label>

            {/* Selector: Adjuntar foto vs URL */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setImageMethod('upload')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  imageMethod === 'upload'
                    ? 'bg-red-700 text-white border-red-500 shadow-md'
                    : 'bg-[#140000] text-red-300 border-red-950 hover:bg-red-950/60'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Adjuntar Foto (Dispositivo)</span>
              </button>

              <button
                type="button"
                onClick={() => setImageMethod('url')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  imageMethod === 'url'
                    ? 'bg-red-700 text-white border-red-500 shadow-md'
                    : 'bg-[#140000] text-red-300 border-red-950 hover:bg-red-950/60'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Pegar URL de Imagen</span>
              </button>
            </div>

            {/* Upload Box or URL input */}
            {imageMethod === 'upload' ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                  className="hidden"
                />

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-red-400 bg-red-950/80 scale-[1.01]'
                      : 'border-red-900/80 bg-[#140000] hover:border-red-600 hover:bg-red-950/30'
                  }`}
                >
                  <Upload className="w-7 h-7 text-red-400 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-white">
                    {fileName ? `Archivo: ${fileName}` : 'Haz clic para seleccionar o arrastra una imagen'}
                  </p>
                  <p className="text-[10px] text-red-300/60 mt-0.5">
                    Soporta PNG, JPG o WEBP (hasta 8MB)
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... (pega enlace directo a imagen)"
                  value={coverUrl}
                  onChange={(e) => {
                    setCoverUrl(e.target.value);
                    setFileName('');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#140000] border border-red-900/80 text-white placeholder-red-400/40 text-xs focus:outline-none focus:border-red-500"
                />
              </div>
            )}

            {/* Image Preview with Remove option */}
            {coverUrl && (
              <div className="mt-3 relative rounded-xl overflow-hidden border border-red-700/80 bg-black/40">
                <img
                  src={coverUrl}
                  alt="Vista previa de portada"
                  className="w-full h-28 object-cover"
                  onError={() => setErrorMsg('No se pudo cargar la imagen desde la URL ingresada.')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-2.5">
                  <span className="text-[11px] font-bold text-white drop-shadow truncate max-w-[200px]">
                    {name.trim() || 'Vista previa de portada'}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 rounded-lg bg-red-900/90 hover:bg-red-800 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow"
                    title="Quitar foto"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Quitar</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
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
