import React, { useState, useRef } from 'react';
import { Post, User, AdminSession, ThemeMode } from '../types';
import { 
  Heart, 
  Flame, 
  MessageCircle, 
  Trash2, 
  Image as ImageIcon, 
  Send, 
  Share2, 
  Upload, 
  Link2, 
  X, 
  Sparkles,
  Users,
  Car,
  Radio,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface FeedViewProps {
  posts: Post[];
  currentUser: User | null;
  adminSession: AdminSession;
  theme: ThemeMode;
  registeredUsers: User[];
  onOpenAuth: () => void;
  onAddPost: (content: string, imageUrl?: string, tag?: string) => void;
  onDeletePost: (postId: string) => void;
  onToggleReaction: (postId: string, type: 'heart' | 'fire' | 'clap') => void;
  onAddComment: (postId: string, text: string) => void;
  onNavigateMarketplace: () => void;
  onOpenMessages: (userId?: string) => void;
}

const RP_TAGS = [
  'General',
  'Anécdota RP',
  'Venta de Autos',
  'Carreras Nocturnas',
  'Taller Mecánico',
  'Comisaría HPD',
  'Aviso Oficial RP'
];

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  currentUser,
  adminSession,
  theme,
  registeredUsers,
  onOpenAuth,
  onAddPost,
  onDeletePost,
  onToggleReaction,
  onAddComment,
  onNavigateMarketplace,
  onOpenMessages
}) => {
  const [postContent, setPostContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('General');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [imageUploadMethod, setImageUploadMethod] = useState<'none' | 'upload' | 'url'>('none');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdminActive = adminSession.isAdmin1 || adminSession.isAdmin2;
  const isLight = theme === 'light';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('La imagen no debe superar los 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setPostImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!postContent.trim() && !imagePreview && !postImageUrl.trim()) {
      return;
    }

    const finalImage = imagePreview || (postImageUrl.trim() ? postImageUrl.trim() : undefined);
    const effectiveTag = (!isAdminActive && selectedTag === 'Aviso Oficial RP') ? 'General' : selectedTag;
    onAddPost(postContent.trim(), finalImage, effectiveTag);

    // Reset form
    setPostContent('');
    setImagePreview(null);
    setPostImageUrl('');
    setImageUploadMethod('none');
  };

  const handleSendComment = (postId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  const formatTimeAgo = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'Hace un momento';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return `Hace ${Math.floor(diffHours / 24)} d`;
  };

  // Theme styling helpers
  const cardBg = isLight 
    ? 'bg-white border-gray-200 shadow-sm' 
    : 'bg-[#1c1d22] border-[#2c2e36] shadow-xl';
  const subCardBg = isLight 
    ? 'bg-gray-50 border-gray-200' 
    : 'bg-[#141519] border-[#262830]';
  const textPrimary = isLight ? 'text-gray-900' : 'text-gray-100';
  const textSecondary = isLight ? 'text-gray-500' : 'text-gray-400';
  const inputBg = isLight
    ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:bg-white'
    : 'bg-[#131417] border-[#2c2e36] text-white placeholder-gray-500 focus:border-red-600 focus:bg-[#16171b]';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT SIDEBAR: PROFILE & SHORTCUTS */}
        <aside className="lg:col-span-3 space-y-4">
          
          {/* User Profile Mini-Card */}
          <div className={`rounded-2xl border p-4 ${cardBg}`}>
            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border-2 border-red-600 shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className={`text-sm font-bold truncate ${textPrimary}`}>
                        {currentUser.username}
                      </h3>
                      {currentUser.isDiscordUser && (
                        <span className="text-[10px] text-[#5865F2] font-bold" title="Discord Verificado">✓</span>
                      )}
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600/10 text-red-500 border border-red-500/20 mt-0.5">
                      {currentUser.role === 'citizen' ? 'Ciudadano RP' : currentUser.role}
                    </span>
                  </div>
                </div>

                {currentUser.bio && (
                  <p className={`text-xs italic leading-relaxed pt-1 border-t ${
                    isLight ? 'border-gray-100 text-gray-600' : 'border-[#262830] text-gray-400'
                  }`}>
                    "{currentUser.bio}"
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-3 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${textPrimary}`}>Únete a FaceHorizont</h4>
                  <p className={`text-[11px] ${textSecondary}`}>
                    Verifícate con Discord para interactuar con la comunidad.
                  </p>
                </div>
                <button
                  id="feed-sidebar-login-btn"
                  onClick={onOpenAuth}
                  className="w-full py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 127.14 96.36">
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
                  </svg>
                  <span>Verificar con Discord</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick RP Navigation */}
          <div className={`rounded-2xl border p-3.5 space-y-1.5 ${cardBg}`}>
            <p className={`text-[11px] uppercase font-bold tracking-wider px-2 py-1 ${
              isLight ? 'text-red-700' : 'text-red-400'
            }`}>
              Atajos de la Ciudad
            </p>

            <button
              onClick={onNavigateMarketplace}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isLight ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-[#252730] text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Car className="w-4 h-4 text-red-500" />
                <span>Marketplace de Autos</span>
              </div>
              <span className="text-[10px] bg-red-600/15 text-red-500 font-bold px-1.5 py-0.5 rounded">
                RP
              </span>
            </button>

            <button
              onClick={() => onOpenMessages()}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isLight ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-[#252730] text-gray-300'
              }`}
            >
              <MessageCircle className="w-4 h-4 text-red-500" />
              <span>Mensajería Privada</span>
            </button>

            <div className={`pt-2 border-t mt-2 ${isLight ? 'border-gray-100' : 'border-[#262830]'}`}>
              <div className={`p-2.5 rounded-xl text-[11px] ${subCardBg}`}>
                <p className={`font-bold flex items-center gap-1.5 ${textPrimary}`}>
                  <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  Frecuencia Central RP
                </p>
                <p className={`mt-0.5 text-[11px] ${textSecondary}`}>
                  Canal activo para novedades de la comunidad y eventos.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER FEED: CREATE POST & TIMELINE */}
        <main className="lg:col-span-6 space-y-5">
          
          {/* CREATE POST CARD */}
          <div className={`rounded-2xl border p-4 sm:p-5 ${cardBg}`}>
            <form onSubmit={handleCreatePostSubmit} className="space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={
                    currentUser
                      ? currentUser.avatar
                      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
                  }
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover border border-red-500/50 shadow"
                />
                <div className="flex-1">
                  <textarea
                    id="feed-create-post-textarea"
                    rows={3}
                    placeholder={
                      currentUser
                        ? `¿Qué está pasando en Horizonte RP, ${currentUser.username}?`
                        : 'Verifícate con Discord para publicar en FaceHorizont...'
                    }
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors resize-none ${inputBg}`}
                  />
                </div>
              </div>

              {/* Tag selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className={`text-[11px] font-semibold whitespace-nowrap ${textSecondary}`}>
                  Categoría:
                </span>
                {(isAdminActive ? RP_TAGS : RP_TAGS.filter((t) => t !== 'Aviso Oficial RP')).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer text-[11px] ${
                      selectedTag === tag
                        ? 'bg-red-600 text-white shadow-sm'
                        : isLight
                        ? 'bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200'
                        : 'bg-[#15161a] text-gray-400 hover:text-white border border-[#2b2d35]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Image preview */}
              {imagePreview && (
                <div className="relative rounded-xl overflow-hidden border border-red-600/50 max-h-60 bg-black">
                  <img
                    src={imagePreview}
                    alt="Previsualización"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setPostImageUrl('');
                    }}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-black/80 text-white hover:bg-red-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Image Input Options */}
              {imageUploadMethod === 'url' && (
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Pega la URL de la imagen..."
                    value={postImageUrl}
                    onChange={(e) => {
                      setPostImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    className={`flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${inputBg}`}
                  />
                  <button
                    type="button"
                    onClick={() => setImageUploadMethod('none')}
                    className="p-1.5 text-gray-400 hover:text-gray-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Action Buttons */}
              <div className={`flex items-center justify-between pt-2 border-t ${
                isLight ? 'border-gray-100' : 'border-[#262830]'
              }`}>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isLight ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-[#252730] text-gray-300'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5 text-red-500" />
                    <span>Subir Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setImageUploadMethod(imageUploadMethod === 'url' ? 'none' : 'url')
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isLight ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-[#252730] text-gray-300'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5 text-red-500" />
                    <span>URL Foto</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!currentUser && !postContent.trim()}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar</span>
                </button>
              </div>
            </form>
          </div>

          {/* POSTS LIST OR FRESH EMPTY STATE */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className={`text-center py-16 px-6 rounded-2xl border ${cardBg}`}>
                <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mb-3 shadow-inner">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className={`text-base font-extrabold ${textPrimary}`}>
                  ¡Muro completamente limpio!
                </h3>
                <p className={`text-xs max-w-sm mx-auto mt-1 ${textSecondary}`}>
                  Aún no hay publicaciones en FaceHorizont. Sé el primer ciudadano de Horizonte RP en inaugurar el muro compartiendo un aviso o anécdota.
                </p>
                {currentUser ? (
                  <button
                    onClick={() => {
                      const el = document.getElementById('feed-create-post-textarea');
                      el?.focus();
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md cursor-pointer transition-all inline-flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Escribir la primera publicación</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs shadow-md cursor-pointer transition-all inline-flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Verificarme con Discord para publicar</span>
                  </button>
                )}
              </div>
            ) : (
              posts.map((post) => {
                const isAuthor = currentUser?.id === post.authorId;
                const canDelete = isAuthor || isAdminActive;
                const showComments = expandedComments[post.id];

                return (
                  <article
                    key={post.id}
                    id={`post-card-${post.id}`}
                    className={`rounded-2xl border overflow-hidden transition-all ${cardBg}`}
                  >
                    {/* Post Header */}
                    <div className="p-4 sm:p-5 pb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover border border-red-500/50 shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${textPrimary}`}>
                              {post.authorName}
                            </span>
                            {post.tag && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600/10 text-red-500 border border-red-500/20">
                                {post.tag}
                              </span>
                            )}
                          </div>
                          <span className={`text-[11px] flex items-center gap-1 ${textSecondary}`}>
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(post.timestamp)}</span>
                          </span>
                        </div>
                      </div>

                      {canDelete && (
                        <button
                          id={`btn-delete-post-${post.id}`}
                          onClick={() => onDeletePost(post.id)}
                          title="Eliminar publicación"
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="px-4 sm:px-5 pb-3">
                      <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${textPrimary}`}>
                        {post.content}
                      </p>
                    </div>

                    {/* Post Image */}
                    {post.imageUrl && (
                      <div className="relative aspect-video w-full overflow-hidden bg-black">
                        <img
                          src={post.imageUrl}
                          alt="Imagen de publicación"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Reactions Bar */}
                    <div className={`px-4 sm:px-5 py-2.5 flex items-center justify-between border-t border-b text-xs ${
                      isLight ? 'border-gray-100 bg-gray-50/50' : 'border-[#262830] bg-[#16171b]/50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleReaction(post.id, 'heart')}
                          className={`flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                            post.reactions.userReaction === 'heart' ? 'text-red-500' : textSecondary
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${post.reactions.userReaction === 'heart' ? 'fill-current text-red-500' : ''}`} />
                          <span>{post.reactions.heart}</span>
                        </button>

                        <button
                          onClick={() => onToggleReaction(post.id, 'fire')}
                          className={`flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                            post.reactions.userReaction === 'fire' ? 'text-amber-500' : textSecondary
                          }`}
                        >
                          <Flame className={`w-3.5 h-3.5 ${post.reactions.userReaction === 'fire' ? 'fill-current text-amber-500' : ''}`} />
                          <span>{post.reactions.fire}</span>
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                        }
                        className={`text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${textSecondary} hover:text-red-500`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{post.comments?.length || 0} comentarios</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {showComments && (
                      <div className={`p-4 border-t space-y-3 ${
                        isLight ? 'border-gray-100 bg-gray-50' : 'border-[#262830] bg-[#141519]'
                      }`}>
                        {post.comments && post.comments.length > 0 ? (
                          <div className="space-y-2">
                            {post.comments.map((c) => (
                              <div key={c.id} className="flex items-start gap-2.5">
                                <img
                                  src={c.authorAvatar}
                                  alt={c.authorName}
                                  className="w-7 h-7 rounded-lg object-cover border border-red-500/40"
                                />
                                <div className={`flex-1 p-2 rounded-xl text-xs ${
                                  isLight ? 'bg-white border border-gray-200' : 'bg-[#1c1d22] border border-[#2b2d35]'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <span className={`font-bold ${textPrimary}`}>{c.authorName}</span>
                                    <span className={`text-[10px] ${textSecondary}`}>{formatTimeAgo(c.timestamp)}</span>
                                  </div>
                                  <p className={`mt-0.5 ${textPrimary}`}>{c.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={`text-xs text-center py-1 ${textSecondary}`}>
                            No hay comentarios aún. ¡Sé el primero en comentar!
                          </p>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Escribe un comentario..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSendComment(post.id);
                              }
                            }}
                            className={`flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${inputBg}`}
                          />
                          <button
                            onClick={() => handleSendComment(post.id)}
                            className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR: REAL CITIZENS & RP EVENTS */}
        <aside className="lg:col-span-3 space-y-4">
          
          {/* Active RP Events */}
          <div className={`rounded-2xl border p-4 space-y-3 ${cardBg}`}>
            <h4 className={`text-xs uppercase font-extrabold tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-red-700' : 'text-red-400'
            }`}>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>Eventos en Horizonte RP</span>
            </h4>

            <div className="space-y-2">
              <div className={`p-2.5 rounded-xl border ${subCardBg}`}>
                <span className="text-[10px] font-bold uppercase text-amber-500 tracking-wider">
                  PRÓXIMO ENCUENTRO
                </span>
                <p className={`text-xs font-bold mt-0.5 ${textPrimary}`}>Quedada de Autos en el Puerto</p>
                <p className={`text-[11px] mt-0.5 ${textSecondary}`}>
                  Exhibición de naves modificadas y carreras de rol.
                </p>
              </div>

              <div className={`p-2.5 rounded-xl border ${subCardBg}`}>
                <span className="text-[10px] font-bold uppercase text-red-500 tracking-wider">
                  ALERTA POLICIAL
                </span>
                <p className={`text-xs font-bold mt-0.5 ${textPrimary}`}>Controles HPD en Autopista</p>
                <p className={`text-[11px] mt-0.5 ${textSecondary}`}>
                  Revisión de licencias y límites de velocidad.
                </p>
              </div>
            </div>
          </div>

          {/* REAL REGISTERED CITIZENS WIDGET ("Ciudadanos Destacados 0") */}
          <div className={`rounded-2xl border p-4 space-y-3 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <h4 className={`text-xs uppercase font-extrabold tracking-wider ${
                isLight ? 'text-red-700' : 'text-red-400'
              }`}>
                Ciudadanos Registrados
              </h4>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-600/10 text-red-500">
                {registeredUsers.length}
              </span>
            </div>

            {registeredUsers.length === 0 ? (
              <div className="text-center py-4 space-y-1.5">
                <Users className={`w-8 h-8 mx-auto ${textSecondary}`} />
                <p className={`text-xs font-bold ${textPrimary}`}>0 ciudadanos registrados</p>
                <p className={`text-[11px] ${textSecondary}`}>
                  Nuevito todo. ¡Inicia sesión con Discord para ser el primero en figurar aquí!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {registeredUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                      isLight ? 'hover:bg-gray-100' : 'hover:bg-[#252730]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-8 h-8 rounded-xl object-cover border border-red-500/40"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';
                          }}
                        />
                        <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-1 ring-black"></span>
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${textPrimary}`}>{user.username}</p>
                        <p className={`text-[10px] capitalize ${textSecondary}`}>{user.role}</p>
                      </div>
                    </div>
                    {currentUser?.id !== user.id && (
                      <button
                        onClick={() => onOpenMessages(user.id)}
                        className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-[10px] font-bold text-white transition-colors cursor-pointer"
                      >
                        Mensaje
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
