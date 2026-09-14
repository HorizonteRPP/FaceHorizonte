import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChatMessage, User, MarketplaceCar } from '../types';
import { 
  X, 
  Send, 
  MessageSquare, 
  Car, 
  Minimize2, 
  Maximize2, 
  User as UserIcon,
  ShieldCheck,
  Search
} from 'lucide-react';

interface MessengerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  registeredUsers: User[];
  activeTargetUserId: string | null;
  setActiveTargetUserId: (userId: string | null) => void;
  allMessages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
  onOpenAuth: () => void;
  carContext?: MarketplaceCar | null;
}

interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  role: string;
  isDiscord?: boolean;
}

export const MessengerDrawer: React.FC<MessengerDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  registeredUsers = [],
  activeTargetUserId,
  setActiveTargetUserId,
  allMessages,
  onSendMessage,
  onOpenAuth,
  carContext
}) => {
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = currentUser?.id || 'guest_user';

  // Build real contacts list:
  // 1. carContext seller if active
  // 2. Users from allMessages
  // 3. Registered real users (except currentUser)
  const contacts = useMemo(() => {
    const list: ChatContact[] = [];
    const seenIds = new Set<string>();

    if (currentUser) {
      seenIds.add(currentUser.id);
    }

    // 1. If opened with a car context, add the seller first
    if (carContext && carContext.sellerId && !seenIds.has(carContext.sellerId)) {
      seenIds.add(carContext.sellerId);
      list.push({
        id: carContext.sellerId,
        name: carContext.sellerName,
        avatar: carContext.sellerAvatar,
        role: 'Vendedor Marketplace'
      });
    }

    // 2. Users who have exchanged messages with currentUser
    allMessages.forEach((msg) => {
      const otherId = msg.senderId === currentUserId ? msg.recipientId : msg.senderId;
      const otherName = msg.senderId === currentUserId ? msg.recipientName : msg.senderName;
      const otherAvatar = msg.senderId === currentUserId ? '' : msg.senderAvatar;

      if (otherId && otherId !== currentUserId && !seenIds.has(otherId)) {
        seenIds.add(otherId);
        // Look up in registered users for avatar & details
        const reg = registeredUsers.find((u) => u.id === otherId);
        list.push({
          id: otherId,
          name: reg?.username || otherName || 'Usuario de Horizonte',
          avatar: reg?.avatar || otherAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherName || 'U')}&background=991b1b&color=ffffff`,
          role: reg?.role === 'admin' ? 'Administrador' : reg?.role === 'police' ? 'Policía HPD' : 'Ciudadano RP',
          isDiscord: reg?.isDiscordUser
        });
      }
    });

    // 3. All other real registered users in the platform
    registeredUsers.forEach((user) => {
      if (user.id !== currentUserId && !seenIds.has(user.id)) {
        seenIds.add(user.id);
        list.push({
          id: user.id,
          name: user.username,
          avatar: user.avatar,
          role: user.role === 'admin' ? 'Administrador' : user.role === 'police' ? 'Policía HPD' : 'Ciudadano RP',
          isDiscord: user.isDiscordUser
        });
      }
    });

    return list;
  }, [carContext, allMessages, registeredUsers, currentUserId, currentUser]);

  // Determine active contact
  const activeContact = useMemo(() => {
    if (!contacts.length) return null;
    return contacts.find((c) => c.id === activeTargetUserId) || contacts[0];
  }, [contacts, activeTargetUserId]);

  // Keep active target in sync if changed
  useEffect(() => {
    if (activeContact && activeContact.id !== activeTargetUserId) {
      setActiveTargetUserId(activeContact.id);
    }
  }, [activeContact, activeTargetUserId, setActiveTargetUserId]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, activeContact?.id]);

  if (!isOpen) return null;

  // Filter messages between current user and active contact
  const threadMessages = activeContact
    ? allMessages.filter(
        (m) =>
          (m.senderId === currentUserId && m.recipientId === activeContact.id) ||
          (m.senderId === activeContact.id && m.recipientId === currentUserId)
      )
    : [];

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!activeContact) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: currentUser.id,
      senderName: currentUser.username,
      senderAvatar: currentUser.avatar,
      recipientId: activeContact.id,
      recipientName: activeContact.name,
      text,
      timestamp: Date.now(),
      isRead: true,
      carContext: carContext
        ? {
            id: carContext.id,
            title: carContext.title,
            price: carContext.price
          }
        : undefined
    };

    onSendMessage(newMsg);
    setInputText('');
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed bottom-4 right-4 sm:right-6 z-50 w-[94vw] sm:w-[480px] max-w-[520px] bg-[#1e0202] border-2 border-red-800 rounded-2xl shadow-[0_0_40px_rgba(220,38,38,0.4)] overflow-hidden flex flex-col transition-all">
      
      {/* Messenger Header */}
      <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-red-950 via-[#330000] to-red-950 border-b border-red-900/80">
        <div className="flex items-center gap-2.5">
          {activeContact ? (
            <>
              <div className="relative">
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-lg object-cover border border-red-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeContact.name)}&background=991b1b&color=ffffff`;
                  }}
                />
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 ring-1 ring-black animate-pulse"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white">{activeContact.name}</h3>
                  {activeContact.isDiscord && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                      Discord
                    </span>
                  )}
                  <span className="text-[10px] text-emerald-400 font-semibold">• En línea</span>
                </div>
                <p className="text-[10px] text-red-300/80">{activeContact.role}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-900/50 flex items-center justify-center text-red-300">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Chat Privado Horizonte RP</h3>
                <p className="text-[10px] text-red-300/70">Mensajería 1 a 1 entre ciudadanos</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 text-red-300">
          <button
            id="messenger-btn-minimize"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:text-white hover:bg-red-900/50 rounded-lg cursor-pointer"
            title={isMinimized ? 'Maximizar' : 'Minimizar'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            id="messenger-btn-close"
            onClick={onClose}
            className="p-1.5 hover:text-white hover:bg-red-900/50 rounded-lg cursor-pointer"
            title="Cerrar Messenger"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Contact Selector Tabs if there are multiple contacts */}
          {contacts.length > 1 && (
            <div className="flex items-center gap-1.5 p-2 bg-[#170101] border-b border-red-950 overflow-x-auto">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  id={`chat-contact-${contact.id}`}
                  onClick={() => setActiveTargetUserId(contact.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeContact?.id === contact.id
                      ? 'bg-red-700 text-white shadow-sm'
                      : 'bg-red-950/60 text-red-300 hover:text-white hover:bg-red-900/60'
                  }`}
                >
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-4 h-4 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=991b1b&color=ffffff`;
                    }}
                  />
                  <span>{contact.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Car context banner if opened from Marketplace */}
          {carContext && activeContact && carContext.sellerId === activeContact.id && (
            <div className="p-2.5 bg-red-950/70 border-b border-red-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Car className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-200 truncate">
                  <span className="font-bold text-white">{carContext.title}</span> • {carContext.currency}{' '}
                  {carContext.price.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() =>
                  handleSend(`Hola ${activeContact.name}, vi tu ${carContext.title} en el Marketplace. ¿Sigue disponible?`)
                }
                className="text-[10px] bg-red-700 hover:bg-red-600 text-white px-2 py-1 rounded-lg font-bold flex-shrink-0 cursor-pointer"
              >
                Preguntar si está disponible
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div className="p-4 h-64 overflow-y-auto space-y-3 bg-[#130101]">
            {!activeContact ? (
              <div className="text-center py-10 text-xs text-red-300/60 space-y-2">
                <MessageSquare className="w-9 h-9 text-red-500/40 mx-auto" />
                <p className="font-bold text-white text-sm">Sin chats activos todavía</p>
                <p className="text-[11px] text-red-300/70 max-w-xs mx-auto">
                  Aún no hay otros usuarios registrados en el chat. Puedes contactar a vendedores en el Marketplace de autos o esperar a que otros ciudadanos se registren con Discord para chatear en tiempo real.
                </p>
              </div>
            ) : threadMessages.length === 0 ? (
              <div className="text-center py-8 text-xs text-red-300/60 space-y-2">
                <MessageSquare className="w-8 h-8 text-red-500/40 mx-auto" />
                <p className="font-semibold text-white">Inicia una conversación con {activeContact.name}.</p>
                <p className="text-[11px] text-red-400/80">
                  Escríbele para coordinar compras de vehículos, roles o eventos en Horizonte RP.
                </p>
              </div>
            ) : (
              threadMessages.map((msg) => {
                const isMe = msg.senderId === currentUserId;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-6 h-6 rounded-full object-cover border border-red-800 flex-shrink-0 mb-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=991b1b&color=ffffff`;
                        }}
                      />
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow ${
                        isMe
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-br-none'
                          : 'bg-[#280303] text-red-100 border border-red-900 rounded-bl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[9px] text-white/50 block text-right mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions pills if talking to someone */}
          {activeContact && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#170101] border-t border-red-950 overflow-x-auto">
              <button
                type="button"
                onClick={() => handleSend('¿Sigue disponible para probarlo hoy en la ciudad?')}
                className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-red-300 hover:text-white border border-red-900 whitespace-nowrap cursor-pointer"
              >
                ¿Sigue disponible?
              </button>
              <button
                type="button"
                onClick={() => handleSend('¿El precio es negociable en efectivo RP$?')}
                className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-red-300 hover:text-white border border-red-900 whitespace-nowrap cursor-pointer"
              >
                ¿Aceptas ofertas?
              </button>
              <button
                type="button"
                onClick={() => handleSend('¿Dónde nos vemos en Roblox Horizonte RP?')}
                className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-red-300 hover:text-white border border-red-900 whitespace-nowrap cursor-pointer"
              >
                ¿Dónde nos encontramos?
              </button>
            </div>
          )}

          {/* Input Bar */}
          {activeContact ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-[#1e0202] border-t border-red-900 flex items-center gap-2"
            >
              <input
                id="messenger-input-field"
                type="text"
                placeholder={`Escribe a ${activeContact.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#120101] border border-red-900 text-white placeholder-red-400/40 text-xs focus:outline-none focus:border-red-500"
              />
              <button
                id="messenger-btn-send"
                type="submit"
                className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-md cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="p-3 bg-[#1e0202] border-t border-red-900 text-center">
              <p className="text-[11px] text-red-300/70">
                Selecciona un contacto o escribe a un vendedor desde el Marketplace.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
