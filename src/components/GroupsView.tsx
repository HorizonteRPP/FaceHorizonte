import React, { useState, useMemo } from 'react';
import { Group, GroupMember, GroupPost, GroupMessage, User, AdminSession, ThemeMode } from '../types';
import { 
  Users, 
  Plus, 
  Search, 
  Lock, 
  Globe, 
  MessageSquare, 
  ShieldCheck, 
  ShieldAlert, 
  Send, 
  Heart, 
  Flame, 
  Smile, 
  ArrowLeft, 
  UserMinus, 
  MicOff, 
  Mic, 
  Edit3, 
  Ban, 
  CheckCircle2, 
  Sparkles, 
  Image as ImageIcon,
  Share2
} from 'lucide-react';

interface GroupsViewProps {
  groups: Group[];
  currentUser: User | null;
  adminSession: AdminSession;
  theme?: ThemeMode;
  onOpenAuth: () => void;
  onOpenCreateGroup: () => void;
  onJoinGroup: (groupId: string) => void;
  onLeaveGroup: (groupId: string) => void;
  onAddGroupPost: (groupId: string, post: GroupPost) => void;
  onToggleGroupPostReaction: (groupId: string, postId: string, type: 'heart' | 'fire' | 'clap') => void;
  onAddGroupPostComment: (groupId: string, postId: string, commentText: string) => void;
  onSendGroupMessage: (groupId: string, message: GroupMessage) => void;
  onUpdateMemberPermission: (
    groupId: string, 
    userId: string, 
    updates: { canPost?: boolean; canChat?: boolean; role?: GroupMember['role']; removeMember?: boolean }
  ) => void;
  showToast: (msg: string) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  groups,
  currentUser,
  adminSession,
  onOpenAuth,
  onOpenCreateGroup,
  onJoinGroup,
  onLeaveGroup,
  onAddGroupPost,
  onToggleGroupPostReaction,
  onAddGroupPostComment,
  onSendGroupMessage,
  onUpdateMemberPermission,
  showToast
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [activeGroupTab, setActiveGroupTab] = useState<'wall' | 'chat' | 'members'>('wall');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterMyGroups, setFilterMyGroups] = useState(false);

  // Dynamic categories from created groups
  const availableCategories = useMemo(() => {
    const defaultCats = ['Crews & Facciones', 'Policía & Seguridad', 'Mecánicos & Carreras', 'Empresas & Negocios'];
    const cats = new Set<string>();
    groups.forEach((g) => {
      if (g.category?.trim()) cats.add(g.category.trim());
    });
    // Combine existing categories with defaults if empty
    defaultCats.forEach((dc) => {
      if (cats.size < 4) cats.add(dc);
    });
    return Array.from(cats);
  }, [groups]);

  // Group Wall composer state
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  // Group Chat state
  const [chatMessageText, setChatMessageText] = useState('');

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const activeGroup = groups.find((g) => g.id === selectedGroupId) || null;

  // Check current user's membership & permissions in active group
  const currentMember = activeGroup?.members.find((m) => m.userId === currentUser?.id);
  const isMember = !!currentMember;
  const isLeader = currentMember?.role === 'owner';
  const isAdmin = currentMember?.role === 'admin' || adminSession.isAdmin1 || adminSession.isAdmin2;
  const isMod = currentMember?.role === 'moderator';
  const canManagePermissions = isLeader || isAdmin;

  // Permissions of current user in active group
  const canUserPost = isMember && currentMember?.canPost !== false;
  const canUserChat = isMember && currentMember?.canChat !== false;

  // Filter groups
  const filteredGroups = groups.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory;

    const matchesMyGroups = !filterMyGroups || (currentUser && g.members.some((m) => m.userId === currentUser.id));

    return matchesSearch && matchesCategory && matchesMyGroups;
  });

  // Handle Wall Post submit
  const handlePublishWallPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!activeGroup) return;

    if (!isMember) {
      showToast('Debes unirte al grupo para publicar en el muro.');
      return;
    }

    if (!canUserPost) {
      showToast('Tus permisos de publicación han sido revocados en este grupo.');
      return;
    }

    if (!postContent.trim()) return;

    const newPost: GroupPost = {
      id: `gp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      groupId: activeGroup.id,
      authorId: currentUser.id,
      authorName: currentUser.username,
      authorAvatar: currentUser.avatar,
      content: postContent.trim(),
      imageUrl: postImageUrl.trim() || undefined,
      timestamp: Date.now(),
      likes: 0,
      likedBy: [],
      reactions: { heart: 0, fire: 0, clap: 0 },
      comments: []
    };

    onAddGroupPost(activeGroup.id, newPost);
    setPostContent('');
    setPostImageUrl('');
    setShowImageInput(false);
    showToast('Publicación compartida en el muro del grupo.');
  };

  // Handle Chat Message submit
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!activeGroup) return;

    if (!isMember) {
      showToast('Únete al grupo para participar en el chat.');
      return;
    }

    if (!canUserChat) {
      showToast('Has sido silenciado en el chat de este grupo.');
      return;
    }

    if (!chatMessageText.trim()) return;

    const newMsg: GroupMessage = {
      id: `gm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      groupId: activeGroup.id,
      senderId: currentUser.id,
      senderName: currentUser.username,
      senderAvatar: currentUser.avatar,
      senderRole: currentMember?.role || 'member',
      text: chatMessageText.trim(),
      timestamp: Date.now()
    };

    onSendGroupMessage(activeGroup.id, newMsg);
    setChatMessageText('');
  };

  // Handle Comment submit
  const handleSendComment = (postId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!activeGroup) return;

    const text = commentInputs[postId]?.trim();
    if (!text) return;

    onAddGroupPostComment(activeGroup.id, postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    showToast('Comentario agregado.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* If No Group is Selected: Show Facebook-like Explore Screen with Horizonte RP styling */}
      {!activeGroup ? (
        <div className="space-y-6">
          
          {/* Hero Banner (matching Image 3 specification) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2c0000] via-[#450101] to-[#250000] border-2 border-red-800/80 p-6 sm:p-8 shadow-[0_0_35px_rgba(185,28,28,0.3)]">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-black tracking-wider uppercase">
                  <span>COMUNIDAD</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Grupos de Horizonte
                </h1>
                <p className="text-sm text-red-200/90 leading-relaxed font-medium">
                  Creá espacios para tu crew, compartí publicaciones y decidí quién puede participar.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="btn-create-group-hero"
                  onClick={() => {
                    if (!currentUser) onOpenAuth();
                    else onOpenCreateGroup();
                  }}
                  className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  <span>+ Crear grupo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#1c0101] border border-red-900/60 shadow-lg">
            
            {/* Search Box */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
              <input
                id="groups-search-input"
                type="text"
                placeholder="Buscar grupos de RP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#140000] border border-red-950 text-white placeholder-red-400/40 text-xs focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                id="filter-all-groups"
                onClick={() => {
                  setFilterMyGroups(false);
                  setSelectedCategory('all');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  !filterMyGroups && selectedCategory === 'all'
                    ? 'bg-red-700 text-white shadow-md'
                    : 'bg-[#140000] text-red-300 hover:bg-red-950/60'
                }`}
              >
                Todos los Grupos
              </button>

              {currentUser && (
                <button
                  id="filter-my-groups"
                  onClick={() => setFilterMyGroups(!filterMyGroups)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    filterMyGroups
                      ? 'bg-red-700 text-white shadow-md'
                      : 'bg-[#140000] text-red-300 hover:bg-red-950/60'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Mis Grupos</span>
                </button>
              )}

              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-red-700 text-white shadow-md'
                      : 'bg-[#140000] text-red-300 hover:bg-red-950/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Groups Grid */}
          {filteredGroups.length === 0 ? (
            <div className="text-center py-16 px-6 rounded-2xl bg-[#1c0101] border border-red-900/60 shadow-lg">
              <Users className="w-12 h-12 text-red-500/50 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No hay grupos creados aún</h3>
              <p className="text-xs text-red-300/80 mt-1 max-w-md mx-auto">
                Sé el primer ciudadano de Horizonte RP en fundar una facción, taller mecánico o crew.
              </p>
              <button
                onClick={() => {
                  if (!currentUser) onOpenAuth();
                  else onOpenCreateGroup();
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md cursor-pointer transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Crear el primer grupo</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGroups.map((grp) => {
              const isUserInGroup = currentUser && grp.members.some((m) => m.userId === currentUser.id);
              const userMemberRole = grp.members.find((m) => m.userId === currentUser?.id)?.role;

              return (
                <div
                  key={grp.id}
                  id={`card-group-${grp.id}`}
                  className="group relative rounded-2xl bg-[#1e0101] border border-red-900/70 overflow-hidden shadow-lg hover:border-red-600 transition-all hover:shadow-[0_0_25px_rgba(185,28,28,0.35)] flex flex-col"
                >
                  {/* Cover Header */}
                  <div className="relative h-36 w-full overflow-hidden bg-red-950">
                    <img
                      src={grp.coverUrl}
                      alt={grp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e0101] via-transparent to-black/40"></div>

                    {/* Category & Privacy Pill */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-red-200 text-[10px] font-bold border border-red-800/40">
                        {grp.category}
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-gray-200 text-[10px] font-bold border border-white/10 flex items-center gap-1">
                        {grp.privacy === 'private' ? <Lock className="w-3 h-3 text-amber-400" /> : <Globe className="w-3 h-3 text-emerald-400" />}
                        <span>{grp.privacy === 'private' ? 'Privado' : 'Público'}</span>
                      </span>
                    </div>

                    {/* Member status pill */}
                    {isUserInGroup && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white text-[10px] font-extrabold shadow-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{userMemberRole === 'owner' ? 'Líder' : userMemberRole === 'admin' ? 'Admin' : 'Miembro'}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-extrabold text-white group-hover:text-red-300 transition-colors line-clamp-1">
                        {grp.name}
                      </h3>
                      <p className="text-xs text-red-200/70 line-clamp-2 leading-relaxed">
                        {grp.description}
                      </p>
                    </div>

                    {/* Stats & Actions */}
                    <div className="pt-2 border-t border-red-950/80 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-red-300/80 font-semibold">
                        <Users className="w-3.5 h-3.5 text-red-500" />
                        <span>{grp.members.length} miembros</span>
                        <span>•</span>
                        <span>{grp.posts?.length || 0} posts</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          id={`btn-open-group-${grp.id}`}
                          onClick={() => {
                            setSelectedGroupId(grp.id);
                            setActiveGroupTab('wall');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                        >
                          Ver grupo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      ) : (
        /* DETAIL VIEW OF A SELECTED GROUP */
        <div className="space-y-6">
          
          {/* Back Button */}
          <button
            id="btn-back-to-groups"
            onClick={() => setSelectedGroupId(null)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1e0101] hover:bg-red-950/60 border border-red-900/60 text-xs font-bold text-red-200 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Explorar Grupos</span>
          </button>

          {/* Group Header Banner */}
          <div className="relative rounded-3xl bg-[#1c0101] border-2 border-red-900/80 overflow-hidden shadow-2xl">
            <div className="relative h-48 sm:h-64 w-full">
              <img
                src={activeGroup.coverUrl}
                alt={activeGroup.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c0101] via-black/40 to-black/20"></div>

              {/* Group Quick Info in Banner */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-950 border-2 border-red-600 overflow-hidden shadow-xl flex-shrink-0">
                    <img src={activeGroup.iconUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-red-600/80 text-[10px] font-extrabold text-white">
                        {activeGroup.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-bold text-gray-200 flex items-center gap-1">
                        {activeGroup.privacy === 'private' ? <Lock className="w-3 h-3 text-amber-400" /> : <Globe className="w-3 h-3 text-emerald-400" />}
                        <span>{activeGroup.privacy === 'private' ? 'Grupo Privado' : 'Grupo Público'}</span>
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1 drop-shadow">
                      {activeGroup.name}
                    </h2>
                    <p className="text-xs text-red-200/90 drop-shadow">
                      {activeGroup.members.length} miembros • Creado por {activeGroup.creatorName}
                    </p>
                  </div>
                </div>

                {/* Join / Leave / Member Action */}
                <div className="flex items-center gap-2">
                  {!isMember ? (
                    <button
                      id="btn-join-group-action"
                      onClick={() => {
                        if (!currentUser) onOpenAuth();
                        else {
                          onJoinGroup(activeGroup.id);
                          showToast(`Te has unido a ${activeGroup.name}`);
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Unirme al Grupo</span>
                    </button>
                  ) : (
                    <button
                      id="btn-leave-group-action"
                      onClick={() => {
                        if (isLeader) {
                          showToast('Como líder, no puedes abandonar el grupo sin transferir el liderazgo.');
                          return;
                        }
                        onLeaveGroup(activeGroup.id);
                        showToast(`Has salido de ${activeGroup.name}`);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-red-950/70 hover:bg-red-900/80 text-red-300 hover:text-white border border-red-800/40 text-xs font-bold transition-all cursor-pointer"
                    >
                      {isLeader ? 'Eres el Líder' : 'Salir del grupo'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Subtabs inside the Group */}
            <div className="flex border-t border-red-950 bg-[#160000] px-4">
              <button
                id="group-tab-wall"
                onClick={() => setActiveGroupTab('wall')}
                className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  activeGroupTab === 'wall'
                    ? 'border-red-500 text-white bg-red-950/40'
                    : 'border-transparent text-red-300/70 hover:text-white'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Muro del Grupo</span>
              </button>

              <button
                id="group-tab-chat"
                onClick={() => setActiveGroupTab('chat')}
                className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  activeGroupTab === 'chat'
                    ? 'border-red-500 text-white bg-red-950/40'
                    : 'border-transparent text-red-300/70 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat Grupal</span>
                {activeGroup.messages && activeGroup.messages.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-[10px] text-white">
                    {activeGroup.messages.length}
                  </span>
                )}
              </button>

              <button
                id="group-tab-members"
                onClick={() => setActiveGroupTab('members')}
                className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  activeGroupTab === 'members'
                    ? 'border-red-500 text-white bg-red-950/40'
                    : 'border-transparent text-red-300/70 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Miembros y Permisos</span>
                <span className="px-1.5 py-0.5 rounded-full bg-red-950 border border-red-800 text-[10px] text-red-300">
                  {activeGroup.members.length}
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1: WALL / PUBLICACIONES */}
          {activeGroupTab === 'wall' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Post Composer & Posts Timeline */}
              <div className="lg:col-span-2 space-y-5">
                
                {/* Wall Composer */}
                {isMember ? (
                  canUserPost ? (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#1e0101] border border-red-900/70 shadow-lg space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentUser?.avatar}
                          alt={currentUser?.username}
                          className="w-10 h-10 rounded-full object-cover border border-red-500"
                        />
                        <div className="flex-1">
                          <textarea
                            id="group-post-content-input"
                            rows={2}
                            placeholder={`Comparte algo con el grupo ${activeGroup.name}...`}
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-[#140000] border border-red-950 text-white placeholder-red-400/40 text-xs focus:outline-none focus:border-red-500 resize-none"
                          />
                        </div>
                      </div>

                      {showImageInput && (
                        <div className="pt-2">
                          <input
                            type="url"
                            placeholder="URL de foto o captura de rol..."
                            value={postImageUrl}
                            onChange={(e) => setPostImageUrl(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl bg-[#140000] border border-red-950 text-white text-xs placeholder-red-400/40 focus:outline-none focus:border-red-500"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setShowImageInput(!showImageInput)}
                          className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span>Adjuntar foto</span>
                        </button>

                        <button
                          id="btn-publish-group-post"
                          onClick={handlePublishWallPost}
                          disabled={!postContent.trim()}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Publicar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Notice when permissions revoked ("sacar permisos") */
                    <div className="p-4 rounded-2xl bg-red-950/90 border border-red-600/80 text-red-200 text-xs flex items-center gap-3 shadow-lg">
                      <Ban className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <div>
                        <span className="font-bold">Permisos de publicación revocados: </span>
                        <span>Un administrador del grupo ha desactivado tu capacidad para crear posts en este muro.</span>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="p-4 rounded-2xl bg-[#1e0101] border border-red-900/50 text-center space-y-2">
                    <p className="text-xs text-red-200">
                      Únete a este grupo para poder publicar y comentar en el muro.
                    </p>
                    <button
                      onClick={() => onJoinGroup(activeGroup.id)}
                      className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                    >
                      Unirme ahora
                    </button>
                  </div>
                )}

                {/* Posts Timeline */}
                {activeGroup.posts && activeGroup.posts.length > 0 ? (
                  activeGroup.posts.map((post) => (
                    <div
                      key={post.id}
                      className="p-5 rounded-2xl bg-[#1e0101] border border-red-900/60 shadow-lg space-y-3"
                    >
                      {/* Post Header */}
                      <div className="flex items-center gap-3">
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-10 h-10 rounded-full object-cover border border-red-800"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white">{post.authorName}</h4>
                          <span className="text-[10px] text-red-300/70">
                            {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Muro del Grupo
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-xs text-red-100 whitespace-pre-line leading-relaxed">
                        {post.content}
                      </p>

                      {/* Post Image */}
                      {post.imageUrl && (
                        <div className="rounded-xl overflow-hidden max-h-96 border border-red-950">
                          <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Reactions Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-red-950/80">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onToggleGroupPostReaction(activeGroup.id, post.id, 'heart')}
                            className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-200 text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Heart className="w-3.5 h-3.5 text-red-400" />
                            <span>{post.reactions?.heart || 0}</span>
                          </button>
                          <button
                            onClick={() => onToggleGroupPostReaction(activeGroup.id, post.id, 'fire')}
                            className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-200 text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Flame className="w-3.5 h-3.5 text-amber-400" />
                            <span>{post.reactions?.fire || 0}</span>
                          </button>
                        </div>

                        <span className="text-[11px] text-red-300/70 font-medium">
                          {post.comments?.length || 0} comentarios
                        </span>
                      </div>

                      {/* Comments section */}
                      <div className="pt-2 space-y-2">
                        {post.comments?.map((c) => (
                          <div key={c.id} className="flex items-start gap-2 text-xs bg-[#160000] p-2.5 rounded-xl">
                            <img src={c.authorAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                            <div className="flex-1">
                              <span className="font-bold text-red-300">{c.authorName}: </span>
                              <span className="text-gray-200">{c.text}</span>
                            </div>
                          </div>
                        ))}

                        {/* Comment input */}
                        {isMember && (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Escribe un comentario en este grupo..."
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendComment(post.id)}
                              className="flex-1 px-3 py-1.5 rounded-xl bg-[#140000] border border-red-950 text-xs text-white placeholder-red-400/40 focus:outline-none focus:border-red-500"
                            />
                            <button
                              onClick={() => handleSendComment(post.id)}
                              className="p-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-[#1e0101] border border-red-900/50 space-y-2">
                    <p className="text-xs text-red-300 font-semibold">
                      Aún no hay publicaciones en el muro de este grupo.
                    </p>
                    <p className="text-[11px] text-red-400/60">
                      Sé el primero en compartir algo para los miembros de Horizonte RP.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Group Information Sidebar */}
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-[#1e0101] border border-red-900/60 shadow-lg space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Información del Grupo
                  </h4>

                  <p className="text-xs text-red-200/80 leading-relaxed">
                    {activeGroup.description}
                  </p>

                  <div className="pt-2 border-t border-red-950/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-red-300/80">
                      <span>Categoría:</span>
                      <span className="font-bold text-white">{activeGroup.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-red-300/80">
                      <span>Privacidad:</span>
                      <span className="font-bold text-white capitalize">{activeGroup.privacy === 'public' ? 'Público' : 'Privado'}</span>
                    </div>
                    <div className="flex items-center justify-between text-red-300/80">
                      <span>Miembros totales:</span>
                      <span className="font-bold text-white">{activeGroup.members.length}</span>
                    </div>
                  </div>
                </div>

                {/* Member Preview Card */}
                <div className="p-5 rounded-2xl bg-[#1e0101] border border-red-900/60 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Miembros ({activeGroup.members.length})
                    </h4>
                    <button
                      onClick={() => setActiveGroupTab('members')}
                      className="text-[11px] text-red-400 hover:text-red-300 font-bold cursor-pointer"
                    >
                      Gestionar
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {activeGroup.members.slice(0, 8).map((m) => (
                      <div key={m.userId} className="text-center" title={`${m.username} (${m.role})`}>
                        <img
                          src={m.avatar}
                          alt={m.username}
                          className="w-10 h-10 rounded-full mx-auto object-cover border border-red-700"
                        />
                        <span className="block text-[10px] text-red-300 truncate mt-1">
                          {m.username}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHAT GRUPAL ("hablar etc") */}
          {activeGroupTab === 'chat' && (
            <div className="rounded-2xl bg-[#1a0101] border-2 border-red-900/70 shadow-2xl overflow-hidden flex flex-col h-[600px]">
              
              {/* Chat Header */}
              <div className="p-4 bg-[#250101] border-b border-red-950 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Canal de Voz y Radio de Grupo</h3>
                    <p className="text-[10px] text-red-300">Coordinación de rol y actividades en vivo</p>
                  </div>
                </div>

                <div className="text-xs text-red-300 font-bold">
                  {activeGroup.members.length} conectados
                </div>
              </div>

              {/* Chat Messages Feed */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#120000]">
                {activeGroup.messages && activeGroup.messages.length > 0 ? (
                  activeGroup.messages.map((msg) => {
                    const isOwnMessage = msg.senderId === currentUser?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                      >
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="w-8 h-8 rounded-full object-cover border border-red-800 flex-shrink-0"
                        />
                        <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[11px] font-bold text-red-200">{msg.senderName}</span>
                            {msg.senderRole && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-900/60 uppercase">
                                {msg.senderRole}
                              </span>
                            )}
                            <span className="text-[9px] text-red-400/60">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div
                            className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                              isOwnMessage
                                ? 'bg-red-700 text-white rounded-tr-none shadow-md'
                                : 'bg-[#220101] text-red-100 rounded-tl-none border border-red-950 shadow-sm'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-8 text-red-400/60 text-xs">
                    El canal de chat grupal está listo. Inicia la conversación con tu crew.
                  </div>
                )}
              </div>

              {/* Chat Composer */}
              <div className="p-4 bg-[#200101] border-t border-red-950">
                {isMember ? (
                  canUserChat ? (
                    <form onSubmit={handleSendChatMessage} className="flex items-center gap-2">
                      <input
                        id="input-group-chat"
                        type="text"
                        placeholder="Escribe un mensaje al grupo de RP..."
                        value={chatMessageText}
                        onChange={(e) => setChatMessageText(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl bg-[#140000] border border-red-950 text-white text-xs placeholder-red-400/40 focus:outline-none focus:border-red-500"
                      />
                      <button
                        id="btn-send-group-chat"
                        type="submit"
                        disabled={!chatMessageText.trim()}
                        className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Send className="w-4 h-4" />
                        <span>Enviar</span>
                      </button>
                    </form>
                  ) : (
                    /* Notice when muted ("sacar permisos") */
                    <div className="p-3 rounded-xl bg-red-950/80 border border-red-600 text-red-200 text-xs flex items-center gap-2">
                      <MicOff className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span>Has sido silenciado en este chat grupal por un administrador.</span>
                    </div>
                  )
                ) : (
                  <div className="text-center">
                    <button
                      onClick={() => onJoinGroup(activeGroup.id)}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                    >
                      Unirme al grupo para chatear
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MEMBERS & PERMISSION MANAGEMENT ("sacar permisos") */}
          {activeGroupTab === 'members' && (
            <div className="space-y-5">
              
              {/* Leader / Admin Info Banner */}
              <div className="p-5 rounded-2xl bg-[#1e0101] border border-red-900/70 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-red-500" />
                    <h3 className="text-sm font-extrabold text-white">
                      Rango y Panel de Permisos del Grupo
                    </h3>
                  </div>
                  <p className="text-xs text-red-200/80">
                    {canManagePermissions 
                      ? 'Como líder o administrador, puedes sacar permisos de publicación, silenciar miembros en el chat o expulsar participantes.'
                      : 'Lista oficial de participantes y moderadores de este grupo de Horizonte RP.'}
                  </p>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-red-950 border border-red-800 text-xs font-bold text-red-200">
                  {canManagePermissions ? '👑 Modo Moderación Activo' : '👤 Modo Vista'}
                </div>
              </div>

              {/* Members Roster List */}
              <div className="rounded-2xl bg-[#1c0101] border border-red-900/70 overflow-hidden shadow-xl">
                <div className="p-4 bg-[#250101] border-b border-red-950 flex items-center justify-between text-xs font-bold text-red-300 uppercase tracking-wider">
                  <span>Usuario y Rol</span>
                  <span>Permisos Actuales & Acciones</span>
                </div>

                <div className="divide-y divide-red-950/80">
                  {activeGroup.members.map((member) => {
                    const isSelf = member.userId === currentUser?.id;
                    const isMemberOwner = member.role === 'owner';
                    const canEditThisMember = canManagePermissions && !isMemberOwner && !isSelf;

                    return (
                      <div
                        key={member.userId}
                        id={`member-row-${member.userId}`}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-red-950/20 transition-colors"
                      >
                        {/* Member Identity */}
                        <div className="flex items-center gap-3.5">
                          <div className="relative">
                            <img
                              src={member.avatar}
                              alt={member.username}
                              className="w-11 h-11 rounded-full object-cover border-2 border-red-700"
                            />
                            {member.role === 'owner' && (
                              <span className="absolute -top-1 -right-1 text-xs">👑</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-extrabold text-white">
                                {member.username}
                              </span>
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 border border-red-800 text-red-200">
                                  Tú
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-red-300/80 font-bold capitalize">
                                {member.role === 'owner' ? 'Líder / Creador' : member.role === 'admin' ? 'Administrador' : member.role === 'moderator' ? 'Moderador' : 'Miembro Oficial'}
                              </span>
                              <span className="text-[10px] text-red-500">•</span>
                              <span className="text-[10px] text-red-400/60">
                                Unido hace {Math.max(1, Math.floor((Date.now() - member.joinedAt) / 86400000))} días
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Permissions Badges & Moderator Actions ("sacar permisos") */}
                        <div className="flex flex-wrap items-center gap-2">
                          
                          {/* Current Status Pills */}
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${
                            member.canPost !== false
                              ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300'
                              : 'bg-red-950 border-red-600 text-red-200'
                          }`}>
                            {member.canPost !== false ? '✍️ Puede publicar' : '🚫 Sin permiso de publicar'}
                          </span>

                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${
                            member.canChat !== false
                              ? 'bg-blue-950/60 border-blue-600/60 text-blue-300'
                              : 'bg-amber-950/80 border-amber-600 text-amber-200'
                          }`}>
                            {member.canChat !== false ? '💬 Puede chatear' : '🔇 Silenciado'}
                          </span>

                          {/* ACTION BUTTONS IF CURRENT USER IS ADMIN/OWNER */}
                          {canEditThisMember && (
                            <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
                              
                              {/* Toggle Post Permission ("sacar permisos de publicación") */}
                              <button
                                id={`btn-toggle-post-${member.userId}`}
                                onClick={() => {
                                  const nextState = member.canPost === false ? true : false;
                                  onUpdateMemberPermission(activeGroup.id, member.userId, { canPost: nextState });
                                  showToast(
                                    nextState 
                                      ? `Permisos de publicación RESTAURADOS para ${member.username}`
                                      : `Se han SACADO los permisos de publicación a ${member.username}`
                                  );
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  member.canPost !== false
                                    ? 'bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200'
                                    : 'bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600 text-white'
                                }`}
                                title={member.canPost !== false ? 'Sacar permisos de publicación' : 'Devolver permisos de publicación'}
                              >
                                {member.canPost !== false ? 'Sacar permiso muro' : 'Restaurar muro'}
                              </button>

                              {/* Toggle Chat Permission ("silenciar en chat") */}
                              <button
                                id={`btn-toggle-chat-${member.userId}`}
                                onClick={() => {
                                  const nextState = member.canChat === false ? true : false;
                                  onUpdateMemberPermission(activeGroup.id, member.userId, { canChat: nextState });
                                  showToast(
                                    nextState 
                                      ? `Voz restaurada en chat para ${member.username}`
                                      : `${member.username} ha sido SILENCIADO en el chat grupal`
                                  );
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  member.canChat !== false
                                    ? 'bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-amber-200'
                                    : 'bg-blue-900/80 hover:bg-blue-800 border border-blue-600 text-white'
                                }`}
                                title={member.canChat !== false ? 'Silenciar en chat' : 'Permitir hablar'}
                              >
                                {member.canChat !== false ? 'Silenciar' : 'Desilenciar'}
                              </button>

                              {/* Kick from group */}
                              <button
                                id={`btn-kick-${member.userId}`}
                                onClick={() => {
                                  onUpdateMemberPermission(activeGroup.id, member.userId, { removeMember: true });
                                  showToast(`${member.username} ha sido expulsado del grupo`);
                                }}
                                className="p-1 rounded-lg bg-red-950 hover:bg-red-900 text-red-400 hover:text-white border border-red-800/60 cursor-pointer"
                                title="Expulsar del grupo"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
