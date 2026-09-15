import React, { useState, useRef } from 'react';
import { MarketplaceCar, User, AdminSession, ThemeMode } from '../types';
import { 
  Car, 
  Plus, 
  Search, 
  MapPin, 
  MessageSquare, 
  Trash2, 
  Upload, 
  Link2, 
  X, 
  Sparkles,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

interface MarketplaceViewProps {
  cars: MarketplaceCar[];
  currentUser: User | null;
  adminSession: AdminSession;
  theme?: ThemeMode;
  onOpenAuth: () => void;
  onAddCar: (car: Omit<MarketplaceCar, 'id' | 'createdAt'>) => void;
  onDeleteCar: (carId: string) => void;
  onContactSeller: (car: MarketplaceCar) => void;
  onManualSync?: () => void;
  isSyncing?: boolean;
}

const CATEGORIES = [
  'Todos',
  'Deportivo',
  'Sedán',
  'Camioneta & SUV',
  'Moto',
  'Blindado & Policía'
] as const;

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  cars,
  currentUser,
  adminSession,
  theme = 'charcoal',
  onOpenAuth,
  onAddCar,
  onDeleteCar,
  onContactSeller,
  onManualSync,
  isSyncing = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<MarketplaceCar['category']>('Deportivo');
  const [condition, setCondition] = useState<MarketplaceCar['condition']>('Excelente');
  const [location, setLocation] = useState('Concesionario Horizonte RP');
  const [description, setDescription] = useState('');
  const [photoMethod, setPhotoMethod] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdminActive = adminSession.isAdmin1 || adminSession.isAdmin2;
  const isLight = theme === 'light';

  // Theme classes
  const cardBg = isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#1c1d22] border-[#2c2e36] shadow-xl';
  const subCardBg = isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#141519] border-[#262830]';
  const textPrimary = isLight ? 'text-gray-900' : 'text-gray-100';
  const textSecondary = isLight ? 'text-gray-500' : 'text-gray-400';
  const inputBg = isLight
    ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'
    : 'bg-[#131417] border-[#2c2e36] text-white placeholder-gray-500 focus:border-red-600';

  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setFormError('La foto no debe superar los 15MB.');
      return;
    }

    try {
      setIsCompressingPhoto(true);
      setFormError('');
      const compressed = await compressImage(file, 1000, 700, 0.82);
      setImagePreview(compressed);
      setImageUrl(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        setImagePreview(res);
        setImageUrl(res);
        setFormError('');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const cleanTitle = title.trim();
    const cleanPrice = parseFloat(price.replace(/[^0-9.]/g, ''));

    if (!cleanTitle) {
      setFormError('Introduce el nombre del vehículo.');
      return;
    }
    if (!cleanPrice || cleanPrice <= 0) {
      setFormError('Introduce un precio válido en RP$.');
      return;
    }

    let finalPhoto =
      imagePreview ||
      imageUrl.trim() ||
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80';

    if (finalPhoto.startsWith('data:image')) {
      try {
        finalPhoto = await compressImage(finalPhoto, 1000, 700, 0.82);
      } catch {
        // use as is
      }
    }

    onAddCar({
      sellerId: currentUser.id,
      sellerName: currentUser.username,
      sellerAvatar: currentUser.avatar,
      title: cleanTitle,
      price: cleanPrice,
      currency: 'RP$',
      description: description.trim() || 'Vehículo en venta en Horizonte RP.',
      imageUrl: finalPhoto,
      category,
      condition,
      location: location.trim() || 'Horizonte RP'
    });

    // Reset & close
    setTitle('');
    setPrice('');
    setDescription('');
    setImagePreview(null);
    setImageUrl('');
    setFormError('');
    setIsPublishModalOpen(false);
  };

  const filteredCars = cars.filter((car) => {
    const matchesCategory = selectedCategory === 'Todos' || car.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      car.title.toLowerCase().includes(query) ||
      car.description.toLowerCase().includes(query) ||
      car.sellerName.toLowerCase().includes(query) ||
      car.location.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Marketplace Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-600 text-white shadow-md">
              <Car className="w-5 h-5" />
            </span>
            <h1 className={`text-xl font-black tracking-tight ${textPrimary}`}>
              Marketplace de Autos <span className="text-red-600">Horizonte RP</span>
            </h1>
          </div>
          <p className={`text-xs mt-1 ${textSecondary}`}>
            Compra, vende y negocia vehículos con otros ciudadanos de Roblox Roleplay.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-stretch md:self-auto">
          {onManualSync && (
            <button
              id="btn-sync-marketplace"
              type="button"
              onClick={onManualSync}
              disabled={isSyncing}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isLight 
                  ? 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300' 
                  : 'bg-[#202229] hover:bg-[#2a2d36] text-gray-200 border-[#323642]'
              }`}
              title="Sincronizar autos con PC y móviles"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-red-500 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sincronizar</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-600/20 text-red-400 font-extrabold border border-red-500/30">
                {cars.length}
              </span>
            </button>
          )}

          <button
            id="btn-open-publish-car"
            onClick={() => {
              if (!currentUser) {
                onOpenAuth();
              } else {
                setIsPublishModalOpen(true);
              }
            }}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Auto en Venta</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <input
            id="marketplace-search-input"
            type="text"
            placeholder="Buscar por marca, modelo o vendedor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${inputBg}`}
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white shadow-sm'
                  : isLight
                  ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  : 'bg-[#1e2025] text-gray-300 hover:text-white border border-[#2e3138]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid or Pristine Empty State */}
      {filteredCars.length === 0 ? (
        <div className={`text-center py-16 px-6 rounded-2xl border ${cardBg}`}>
          <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mb-3 shadow-inner">
            <Car className="w-7 h-7" />
          </div>
          <h3 className={`text-base font-extrabold ${textPrimary}`}>
            Marketplace libre de vehículos (0 autos)
          </h3>
          <p className={`text-xs max-w-sm mx-auto mt-1 ${textSecondary}`}>
            Actualmente no hay autos publicados. Sé el primer ciudadano de Horizonte RP en publicar una nave para la venta o permuta.
          </p>
          <button
            onClick={() => {
              if (!currentUser) {
                onOpenAuth();
              } else {
                setIsPublishModalOpen(true);
              }
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md cursor-pointer transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar mi primer auto</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredCars.map((car) => {
            const isSeller = currentUser?.id === car.sellerId;
            const canDelete = isSeller || isAdminActive;

            return (
              <div
                key={car.id}
                id={`marketplace-card-${car.id}`}
                className={`group rounded-2xl border overflow-hidden transition-all flex flex-col ${cardBg} hover:border-red-500/60`}
              >
                {/* Car Image with Badges */}
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={car.imageUrl}
                    alt={car.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  
                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-red-500/80 text-white font-extrabold text-xs shadow-lg">
                    {car.currency} {car.price.toLocaleString()}
                  </div>

                  {/* Condition Tag */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-bold text-red-300 border border-red-900/60">
                    {car.condition}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className={`text-sm font-extrabold line-clamp-1 group-hover:text-red-500 transition-colors ${textPrimary}`}>
                      {car.title}
                    </h3>

                    <div className={`flex items-center gap-1.5 text-[11px] mt-1 ${textSecondary}`}>
                      <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <span className="truncate">{car.location}</span>
                    </div>

                    <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${textSecondary}`}>
                      {car.description}
                    </p>
                  </div>

                  {/* Seller info & Actions */}
                  <div className={`pt-3 border-t space-y-2.5 ${isLight ? 'border-gray-100' : 'border-[#282a32]'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={car.sellerAvatar}
                          alt={car.sellerName}
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-md object-cover border border-red-500/40"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';
                          }}
                        />
                        <span className={`text-xs font-semibold truncate max-w-[110px] ${textPrimary}`}>
                          {car.sellerName}
                        </span>
                      </div>

                      {canDelete && (
                        <button
                          id={`btn-delete-car-${car.id}`}
                          onClick={() => {
                            if (window.confirm(`¿Eliminar vehículo "${car.title}"?`)) {
                              onDeleteCar(car.id);
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Eliminar vehículo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      id={`btn-contact-seller-${car.id}`}
                      onClick={() => onContactSeller(car)}
                      className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Contactar Vendedor</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PUBLISH CAR MODAL */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${cardBg}`}>
            
            <div className={`flex items-center justify-between p-5 border-b ${
              isLight ? 'border-gray-200 bg-gray-50' : 'border-[#2a2c34] bg-[#18191e]'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-red-600 text-white">
                  <Car className="w-4 h-4" />
                </span>
                <div>
                  <h3 className={`text-base font-extrabold ${textPrimary}`}>Publicar Auto en Marketplace</h3>
                  <p className={`text-xs ${textSecondary}`}>Roblox Horizonte RP</p>
                </div>
              </div>

              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500 text-red-400 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className={`block text-xs font-bold mb-1 ${textPrimary}`}>
                  Nombre del Vehículo (Marca y Modelo) *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Nissan Skyline GT-R R34 V-Spec"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${inputBg}`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${textPrimary}`}>
                    Precio en RP$ *
                  </label>
                  <input
                    type="number"
                    placeholder="Ej. 145000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${inputBg}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${textPrimary}`}>
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MarketplaceCar['category'])}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${inputBg}`}
                  >
                    <option value="Deportivo">Deportivo</option>
                    <option value="Sedán">Sedán</option>
                    <option value="Camioneta & SUV">Camioneta & SUV</option>
                    <option value="Moto">Moto</option>
                    <option value="Blindado & Policía">Blindado & Policía</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${textPrimary}`}>
                  Ubicación en la Ciudad
                </label>
                <input
                  type="text"
                  placeholder="Ej. Concesionario Central o Gasolinera Norte"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${textPrimary}`}>
                  Descripción del Vehículo
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles técnicos, modificaciones, kilometraje..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none resize-none ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${textPrimary}`}>
                  Foto del Vehículo
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setPhotoMethod('upload')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      photoMethod === 'upload' ? 'bg-red-600 text-white border-red-500' : 'text-gray-400 border-gray-700'
                    }`}
                  >
                    Subir archivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoMethod('url')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      photoMethod === 'url' ? 'bg-red-600 text-white border-red-500' : 'text-gray-400 border-gray-700'
                    }`}
                  >
                    URL de imagen
                  </button>
                </div>

                {photoMethod === 'upload' ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
                  />
                ) : (
                  <input
                    type="url"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${inputBg}`}
                  />
                )}
              </div>

              <div className={`pt-3 border-t flex justify-end gap-2 ${isLight ? 'border-gray-100' : 'border-[#2a2c34]'}`}>
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                    isLight ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 hover:bg-[#252730]'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Publicar Ahora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
