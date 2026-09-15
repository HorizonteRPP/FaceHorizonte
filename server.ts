import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "server_db.json");

function saveDbToDisk() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const payload = {
      serverPosts,
      serverCars,
      serverMessages,
      serverUsers,
      serverGroups,
      serverAuditLogs
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), "utf-8");
  } catch (err) {
    console.error("[DB PERSISTENCE] Error saving to disk:", err);
  }
}

function loadDbFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data.serverPosts)) serverPosts = data.serverPosts;
      if (Array.isArray(data.serverCars)) serverCars = data.serverCars;
      if (Array.isArray(data.serverMessages)) serverMessages = data.serverMessages;
      if (Array.isArray(data.serverUsers)) serverUsers = data.serverUsers;
      if (Array.isArray(data.serverGroups)) serverGroups = data.serverGroups;
      if (Array.isArray(data.serverAuditLogs)) serverAuditLogs = data.serverAuditLogs;
      console.log(`[DB PERSISTENCE] State loaded: ${serverCars.length} autos, ${serverPosts.length} posts, ${serverMessages.length} chats.`);
    } else {
      // First boot: create file
      saveDbToDisk();
    }
  } catch (err) {
    console.warn("[DB PERSISTENCE] Using default state, error reading cache:", err);
  }
}

interface PostItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  timestamp: number;
  likes: number;
  likedBy: string[];
  reactions: { heart: number; fire: number; clap: number };
  comments: Array<{
    id: string;
    postId: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    text: string;
    timestamp: number;
  }>;
  tag?: string;
}

interface CarItem {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  title: string;
  price: number;
  currency: string;
  description: string;
  imageUrl: string;
  category: string;
  condition: string;
  location: string;
  createdAt: number;
}

interface ChatItem {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  recipientName: string;
  text: string;
  timestamp: number;
  isRead: boolean;
  carContext?: {
    id: string;
    title: string;
    price: number;
  };
}

// In-memory persistent database for multi-user online experience
let serverPosts: PostItem[] = [
  {
    id: 'post_1',
    authorId: 'user_destving',
    authorName: 'Destving',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
    content: '🎉 ¡Bienvenidos oficialmente a FaceHorizont! La red social exclusiva de los ciudadanos de Horizonte RP. Ya pueden publicar sus anécdotas, comprar y vender vehículos en el Marketplace y contactar a otros ciudadanos por mensaje privado. ¡Nos vemos en las calles de Roblox!',
    imageUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1000&auto=format&fit=crop&q=80',
    timestamp: Date.now() - 1000 * 60 * 45,
    likes: 28,
    likedBy: ['user_pepito'],
    reactions: { heart: 18, fire: 14, clap: 8 },
    tag: 'Aviso Oficial RP',
    comments: [
      {
        id: 'c_1',
        postId: 'post_1',
        authorId: 'user_pepito',
        authorName: 'Pepito',
        authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=faces',
        text: '¡Quedó brutal la red social! Ya subí unos autos picantes al Marketplace 🔥',
        timestamp: Date.now() - 1000 * 60 * 30
      }
    ]
  },
  {
    id: 'post_2',
    authorId: 'user_pepito',
    authorName: 'Pepito',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=faces',
    content: 'Acabo de traer esta joya importada directa a Horizonte RP: Nissan Skyline GT-R R34 con motor forjado etapa 3 y escape titanio. Lo tengo publicado en el Marketplace, manden mensaje directo si les interesa negociar 🏁',
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1000&auto=format&fit=crop&q=80',
    timestamp: Date.now() - 1000 * 60 * 120,
    likes: 42,
    likedBy: ['user_destving'],
    reactions: { heart: 22, fire: 31, clap: 5 },
    tag: 'Venta de Autos',
    comments: []
  }
];

let serverCars: CarItem[] = [
  {
    id: 'car_1',
    sellerId: 'user_pepito',
    sellerName: 'Pepito',
    sellerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=faces',
    title: 'Nissan Skyline GT-R R34 V-Spec II',
    price: 145000,
    currency: 'RP$',
    description: 'Motor RB26DETT twin-turbo forjado, suspensión regulable Nismo, rines Volk TE37 bronce y pintura Bayside Blue impecable. Sin multas en la comisaría.',
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
    category: 'Deportivo',
    condition: 'Modificado RP',
    location: 'Concesionario Norte - Horizonte RP',
    createdAt: Date.now() - 1000 * 60 * 180
  },
  {
    id: 'car_2',
    sellerId: 'user_destving',
    sellerName: 'Destving',
    sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
    title: 'Lamborghini Huracán STO Rosso Corsa',
    price: 320000,
    currency: 'RP$',
    description: 'Edición de lujo exclusiva de Horizonte RP. Motor V10 atmosférico con sonido brutal, alerón aerodinámico de fibra de carbono. Ideal para eventos de alta sociedad.',
    imageUrl: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=800&auto=format&fit=crop&q=80',
    category: 'Deportivo',
    condition: 'Nuevo (0km)',
    location: 'Distrito Financiero - Horizonte RP',
    createdAt: Date.now() - 1000 * 60 * 360
  },
  {
    id: 'car_3',
    sellerId: 'user_santi_mecanico',
    sellerName: 'Santi Mecánico',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    title: 'Toyota Supra MK4 Turbo 1000HP',
    price: 160000,
    currency: 'RP$',
    description: 'Proyecto de carreras callejeras terminado en Taller Central. Computadora programable, nitro listo, embrague cerámico y llantas semi-slick.',
    imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80',
    category: 'Deportivo',
    condition: 'Modificado RP',
    location: 'Taller Central - Zona Industrial',
    createdAt: Date.now() - 1000 * 60 * 500
  }
];

let serverMessages: ChatItem[] = [
  {
    id: 'm_1',
    senderId: 'user_destving',
    senderName: 'Destving',
    senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
    recipientId: 'guest_or_current',
    recipientName: 'Ciudadano',
    text: '¡Hola! Bienvenido a FaceHorizont. Si necesitas ayuda con el servidor de Roleplay, permisos o eventos, no dudes en escribirme por aquí.',
    timestamp: Date.now() - 1000 * 60 * 60,
    isRead: false
  }
];

interface GroupMemberItem {
  userId: string;
  username: string;
  avatar: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joinedAt: number;
  canPost: boolean;
  canChat: boolean;
}

interface GroupPostItem {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  timestamp: number;
  likes: number;
  likedBy: string[];
  reactions: { heart: number; fire: number; clap: number };
  comments: Array<{
    id: string;
    postId: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    text: string;
    timestamp: number;
  }>;
}

interface GroupMessageItem {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole?: 'owner' | 'admin' | 'moderator' | 'member';
  text: string;
  timestamp: number;
}

interface GroupItem {
  id: string;
  name: string;
  description: string;
  category: string;
  privacy: 'public' | 'private';
  coverUrl: string;
  iconUrl: string;
  createdBy: string;
  creatorName: string;
  createdAt: number;
  members: GroupMemberItem[];
  posts: GroupPostItem[];
  messages: GroupMessageItem[];
}

interface UserItem {
  id: string;
  username: string;
  avatar: string;
  role: string;
  isDiscordUser?: boolean;
  discordTag?: string;
  bio?: string;
  createdAt: number;
  lastActive?: number;
}

interface AuditLogItem {
  id: string;
  type: 'post_created' | 'post_deleted' | 'car_created' | 'car_deleted' | 'message_sent' | 'reaction' | 'comment' | 'user_login' | 'group_created' | 'system';
  actionText: string;
  userName: string;
  userId: string;
  userAvatar?: string;
  details: string;
  timestamp: number;
}

let serverUsers: UserItem[] = [
  {
    id: 'user_destving',
    username: 'Destving',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
    role: 'admin',
    isDiscordUser: true,
    discordTag: 'Destving#0001',
    bio: 'Fundador y Director de Horizonte RP.',
    createdAt: Date.now() - 86400000 * 30,
    lastActive: Date.now() - 1000 * 60 * 5
  },
  {
    id: 'user_pepito',
    username: 'Pepito',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=faces',
    role: 'citizen',
    isDiscordUser: true,
    discordTag: 'PepitoRP#1234',
    bio: 'Vendedor de autos deportivos importados en Horizonte RP.',
    createdAt: Date.now() - 86400000 * 15,
    lastActive: Date.now() - 1000 * 60 * 12
  }
];

let serverAuditLogs: AuditLogItem[] = [
  {
    id: 'log_init',
    type: 'system',
    actionText: 'Servidor Horizonte RP en línea',
    userName: 'Sistema',
    userId: 'system',
    details: 'Servidor y sincronización multidispositivo en tiempo real activos.',
    timestamp: Date.now() - 1000 * 60 * 15
  }
];

function addAuditLog(
  type: AuditLogItem['type'],
  userName: string,
  userId: string,
  actionText: string,
  details: string,
  userAvatar?: string
) {
  const log: AuditLogItem = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    userName: userName || 'Usuario',
    userId: userId || 'unknown',
    userAvatar: userAvatar || '',
    actionText,
    details,
    timestamp: Date.now()
  };
  serverAuditLogs.unshift(log);
  if (serverAuditLogs.length > 500) {
    serverAuditLogs = serverAuditLogs.slice(0, 500);
  }
  saveDbToDisk();
}

function upsertServerUser(userData: Partial<UserItem> & { id: string; username: string }) {
  const existing = serverUsers.find(
    (u) => u.id === userData.id || u.username.toLowerCase() === userData.username.toLowerCase()
  );
  const now = Date.now();
  if (existing) {
    if (userData.id && !existing.id) existing.id = userData.id;
    existing.username = userData.username || existing.username;
    if (userData.avatar) existing.avatar = userData.avatar;
    if (userData.role) existing.role = userData.role;
    if (userData.discordTag) existing.discordTag = userData.discordTag;
    if (userData.isDiscordUser !== undefined) existing.isDiscordUser = userData.isDiscordUser;
    existing.lastActive = now;
    saveDbToDisk();
    return existing;
  } else {
    const newUser: UserItem = {
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=991b1b&color=ffffff`,
      role: userData.role || 'citizen',
      isDiscordUser: !!userData.isDiscordUser,
      discordTag: userData.discordTag || userData.username,
      bio: userData.bio || 'Ciudadano de Horizonte RP',
      createdAt: userData.createdAt || now,
      lastActive: now
    };
    serverUsers.unshift(newUser);
    saveDbToDisk();
    return newUser;
  }
}

let serverGroups: GroupItem[] = [
  {
    id: 'group_hpd',
    name: 'Policía HPD - Departamento Central',
    description: 'Comunidad oficial del Horizonte Police Department. Reportes de patrullas, comunicados oficiales, avisos a la ciudadanía y coordinación de operativos.',
    category: 'Policía HPD & Seguridad',
    privacy: 'public',
    coverUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    iconUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    createdBy: 'user_oficial_ramos',
    creatorName: 'Oficial Ramos',
    createdAt: Date.now() - 86400000 * 10,
    members: [
      {
        userId: 'user_oficial_ramos',
        username: 'Oficial Ramos',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
        role: 'owner',
        joinedAt: Date.now() - 86400000 * 10,
        canPost: true,
        canChat: true
      },
      {
        userId: 'user_destving',
        username: 'Destving',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
        role: 'admin',
        joinedAt: Date.now() - 86400000 * 8,
        canPost: true,
        canChat: true
      },
      {
        userId: 'user_pepito',
        username: 'Pepito',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=faces',
        role: 'member',
        joinedAt: Date.now() - 86400000 * 4,
        canPost: true,
        canChat: true
      }
    ],
    posts: [
      {
        id: 'gp_1',
        groupId: 'group_hpd',
        authorId: 'user_oficial_ramos',
        authorName: 'Oficial Ramos',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
        content: '🚨 Recordatorio a toda la fuerza de oficiales de Horizonte: Los patrullajes nocturnos por la zona sur deben realizarse en binomios obligatorios. Respeten los protocolos de persecución.',
        imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1000&auto=format&fit=crop&q=80',
        timestamp: Date.now() - 1000 * 60 * 180,
        likes: 14,
        likedBy: ['user_destving'],
        reactions: { heart: 8, fire: 3, clap: 3 },
        comments: [
          {
            id: 'gpc_1',
            postId: 'gp_1',
            authorId: 'user_destving',
            authorName: 'Destving',
            authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
            text: 'Excelente coordinación oficial. El centro de control SOS está monitoreando la actividad.',
            timestamp: Date.now() - 1000 * 60 * 120
          }
        ]
      }
    ],
    messages: [
      {
        id: 'gm_1',
        groupId: 'group_hpd',
        senderId: 'user_oficial_ramos',
        senderName: 'Oficial Ramos',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
        senderRole: 'owner',
        text: 'Oficiales en servicio, reporten posición en frecuencia de radio RP.',
        timestamp: Date.now() - 1000 * 60 * 45
      },
      {
        id: 'gm_2',
        groupId: 'group_hpd',
        senderId: 'user_destving',
        senderName: 'Destving',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
        senderRole: 'admin',
        text: 'Comisaría Central despejada y cámaras del servidor sincronizadas.',
        timestamp: Date.now() - 1000 * 60 * 20
      }
    ]
  },
  {
    id: 'group_mechanics',
    name: 'Taller Central & Tuning Club',
    description: 'Espacio para apasionados de las tuercas, carreras clandestinas, reprogramación de computadoras y personalización de deportivos en Roblox Horizonte RP.',
    category: 'Mecánicos & Carreras',
    privacy: 'public',
    coverUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80',
    iconUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    createdBy: 'user_santi_mecanico',
    creatorName: 'Santi Mecánico',
    createdAt: Date.now() - 86400000 * 15,
    members: [
      {
        userId: 'user_santi_mecanico',
        username: 'Santi Mecánico',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
        role: 'owner',
        joinedAt: Date.now() - 86400000 * 15,
        canPost: true,
        canChat: true
      },
      {
        userId: 'user_pepito',
        username: 'Pepito',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=faces',
        role: 'moderator',
        joinedAt: Date.now() - 86400000 * 12,
        canPost: true,
        canChat: true
      }
    ],
    posts: [
      {
        id: 'gp_2',
        groupId: 'group_mechanics',
        authorId: 'user_santi_mecanico',
        authorName: 'Santi Mecánico',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
        content: '🔧 Lote nuevo de turbocompresores Garret y suspensiones neumáticas importadas al taller. Traigan sus proyectos esta tarde para testearlos en el banco de pruebas de rol.',
        imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1000&auto=format&fit=crop&q=80',
        timestamp: Date.now() - 1000 * 60 * 240,
        likes: 21,
        likedBy: ['user_pepito'],
        reactions: { heart: 11, fire: 9, clap: 1 },
        comments: []
      }
    ],
    messages: [
      {
        id: 'gm_3',
        groupId: 'group_mechanics',
        senderId: 'user_pepito',
        senderName: 'Pepito',
        senderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=faces',
        senderRole: 'moderator',
        text: '¿A qué hora abres el taller hoy Santi? Tengo que revisar la transmisión del Skyline.',
        timestamp: Date.now() - 1000 * 60 * 35
      }
    ]
  },
  {
    id: 'group_syndicate',
    name: 'Syndicate RP - Crew Callejero',
    description: 'La hermandad callejera más activa de Horizonte. Negocios discretos, rutas nocturnas y lealtad entre miembros.',
    category: 'Crews & Facciones',
    privacy: 'private',
    coverUrl: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=1200&auto=format&fit=crop&q=80',
    iconUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    createdBy: 'user_pepito',
    creatorName: 'Pepito',
    createdAt: Date.now() - 86400000 * 7,
    members: [
      {
        userId: 'user_pepito',
        username: 'Pepito',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=faces',
        role: 'owner',
        joinedAt: Date.now() - 86400000 * 7,
        canPost: true,
        canChat: true
      }
    ],
    posts: [],
    messages: []
  }
];

let supabaseConnected = true;
let mongodbConnected = true;

async function startServer() {
  loadDbFromDisk();
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  // CORS middleware for cross-device, external browser, and PWA compatibility
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      serverOnline: true,
      supabaseConnected,
      mongodbConnected,
      pingMs: Math.floor(Math.random() * 15) + 12,
      totalPosts: serverPosts.length,
      totalCars: serverCars.length,
      totalMessages: serverMessages.length,
      totalGroups: serverGroups.length,
      timestamp: Date.now()
    });
  });

  // Admin verification
  app.post("/api/admin/verify", (req, res) => {
    const { password, name } = req.body || {};
    if (password === "LeonardoHorizonteRP") {
      return res.json({
        success: true,
        isAdmin1: true,
        isAdmin2: false,
        adminName: name || "Leonardo (Admin)",
        message: "Acceso concedido a Administración Horizonte RP"
      });
    }
    if (password === "SOYGUAPOLOSE") {
      return res.json({
        success: true,
        isAdmin1: true,
        isAdmin2: true,
        adminName: name || "SuperAdmin SOS (DB Master)",
        message: "Acceso concedido a SOS Base de Datos"
      });
    }
    return res.status(401).json({
      success: false,
      message: "Contraseña administrativa incorrecta."
    });
  });

  // SOS actions
  app.post("/api/admin/sos-toggle-supabase", (_req, res) => {
    supabaseConnected = !supabaseConnected;
    res.json({ success: true, supabaseConnected });
  });

  app.post("/api/admin/sos-toggle-mongodb", (_req, res) => {
    mongodbConnected = !mongodbConnected;
    res.json({ success: true, mongodbConnected });
  });

  app.post("/api/admin/sos-reset", (_req, res) => {
    serverPosts = serverPosts.slice(0, 2);
    serverCars = serverCars.slice(0, 3);
    saveDbToDisk();
    res.json({ success: true, message: "Base de datos restablecida a valores iniciales de Horizonte RP." });
  });

  // Posts endpoints
  app.get("/api/posts", (_req, res) => {
    res.json(serverPosts);
  });

  app.post("/api/posts", (req, res) => {
    const newPost: PostItem = req.body;
    if (!newPost || !newPost.content) {
      return res.status(400).json({ error: "Contenido requerido" });
    }
    serverPosts.unshift(newPost);
    if (newPost.authorId && newPost.authorName) {
      upsertServerUser({
        id: newPost.authorId,
        username: newPost.authorName,
        avatar: newPost.authorAvatar
      });
    }
    addAuditLog(
      'post_created',
      newPost.authorName,
      newPost.authorId,
      'Publicación creada en el Muro',
      `"${newPost.content.substring(0, 60)}${newPost.content.length > 60 ? '...' : ''}"`,
      newPost.authorAvatar
    );
    saveDbToDisk();
    res.status(201).json(newPost);
  });

  app.delete("/api/posts/:id", (req, res) => {
    const { id } = req.params;
    const userId = (req.query.userId as string) || req.body?.userId;
    const isAdmin = req.query.isAdmin === "true" || req.body?.isAdmin === true;
    const postIndex = serverPosts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ error: "Publicación no encontrada" });
    }
    const post = serverPosts[postIndex];
    const isAuthor = (userId && (post.authorId === userId || post.authorName?.toLowerCase() === req.body?.authorName?.toLowerCase())) ||
                     (!post.authorId);
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: "No tienes permiso para eliminar esta publicación." });
    }
    const deleted = serverPosts.splice(postIndex, 1)[0];
    addAuditLog(
      'post_deleted',
      isAdmin ? 'Administrador' : post.authorName,
      userId || post.authorId,
      'Publicación eliminada',
      `ID: ${id} - "${deleted.content.substring(0, 40)}..."`,
      post.authorAvatar
    );
    saveDbToDisk();
    res.json({ success: true, id });
  });

  app.post("/api/posts/:id/react", (req, res) => {
    const { id } = req.params;
    const { userId, type } = req.body;
    const post = serverPosts.find((p) => p.id === id);
    if (!post) return res.status(404).json({ error: "Publicación no encontrada" });

    if (!post.likedBy.includes(userId)) {
      post.likedBy.push(userId);
      post.likes += 1;
      if (type === "fire") post.reactions.fire += 1;
      else if (type === "clap") post.reactions.clap += 1;
      else post.reactions.heart += 1;
      addAuditLog('reaction', 'Usuario', userId, 'Reacción añadida', `Reaccionó con ${type || 'me gusta'} a post de ${post.authorName}`);
    } else {
      post.likedBy = post.likedBy.filter((u) => u !== userId);
      post.likes = Math.max(0, post.likes - 1);
      if (type === "fire") post.reactions.fire = Math.max(0, post.reactions.fire - 1);
      else if (type === "clap") post.reactions.clap = Math.max(0, post.reactions.clap - 1);
      else post.reactions.heart = Math.max(0, post.reactions.heart - 1);
    }
    saveDbToDisk();
    res.json(post);
  });

  app.post("/api/posts/:id/comment", (req, res) => {
    const { id } = req.params;
    const comment = req.body;
    const post = serverPosts.find((p) => p.id === id);
    if (!post) return res.status(404).json({ error: "Publicación no encontrada" });

    post.comments.push(comment);
    if (comment.authorId && comment.authorName) {
      upsertServerUser({
        id: comment.authorId,
        username: comment.authorName,
        avatar: comment.authorAvatar
      });
    }
    addAuditLog(
      'comment',
      comment.authorName,
      comment.authorId,
      `Comentario en post de ${post.authorName}`,
      `"${comment.text?.substring(0, 50)}"`,
      comment.authorAvatar
    );
    saveDbToDisk();
    res.json(post);
  });

  // Marketplace endpoints
  app.get("/api/marketplace", (_req, res) => {
    res.json(serverCars);
  });

  app.post("/api/marketplace", (req, res) => {
    const newCar: CarItem = req.body;
    if (!newCar || !newCar.title || !newCar.price) {
      return res.status(400).json({ error: "Datos del auto incompletos" });
    }
    serverCars.unshift(newCar);
    if (newCar.sellerId && newCar.sellerName) {
      upsertServerUser({
        id: newCar.sellerId,
        username: newCar.sellerName,
        avatar: newCar.sellerAvatar
      });
    }
    addAuditLog(
      'car_created',
      newCar.sellerName,
      newCar.sellerId,
      'Vehículo publicado en Marketplace',
      `${newCar.title} por ${newCar.currency || 'RP$'} ${newCar.price.toLocaleString()}`,
      newCar.sellerAvatar
    );
    saveDbToDisk();
    res.status(201).json(newCar);
  });

  app.delete("/api/marketplace/:id", (req, res) => {
    const { id } = req.params;
    const sellerId = (req.query.sellerId as string) || req.body?.sellerId;
    const isAdmin = req.query.isAdmin === "true" || req.body?.isAdmin === true;
    const carIndex = serverCars.findIndex((c) => c.id === id);
    if (carIndex === -1) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }
    const car = serverCars[carIndex];
    const isSeller = (sellerId && (car.sellerId === sellerId || car.sellerName?.toLowerCase() === req.body?.sellerName?.toLowerCase())) ||
                     (!car.sellerId);
    if (!isSeller && !isAdmin) {
      return res.status(403).json({ error: "No tienes permiso para eliminar este vehículo." });
    }
    const removed = serverCars.splice(carIndex, 1)[0];
    addAuditLog(
      'car_deleted',
      isAdmin ? 'Administrador' : car.sellerName,
      sellerId || car.sellerId,
      'Vehículo retirado de venta',
      `${removed.title} (ID: ${id})`,
      car.sellerAvatar
    );
    saveDbToDisk();
    res.json({ success: true, id });
  });

  // Messages endpoints (Individual 1-on-1 private messaging)
  app.get("/api/messages", (req, res) => {
    const { userId } = req.query;
    if (!userId) {
      return res.json(serverMessages);
    }
    const userMsgs = serverMessages.filter(
      (m) => m.senderId === userId || m.recipientId === userId || m.recipientId === "guest_or_current"
    );
    res.json(userMsgs);
  });

  app.post("/api/messages", (req, res) => {
    const newMsg: ChatItem = req.body;
    if (!newMsg || !newMsg.text) {
      return res.status(400).json({ error: "Mensaje vacío" });
    }
    serverMessages.push(newMsg);

    // Register sender and recipient
    if (newMsg.senderId && newMsg.senderName) {
      upsertServerUser({
        id: newMsg.senderId,
        username: newMsg.senderName,
        avatar: newMsg.senderAvatar
      });
    }
    if (newMsg.recipientId && newMsg.recipientName && newMsg.recipientId !== 'guest_or_current') {
      upsertServerUser({
        id: newMsg.recipientId,
        username: newMsg.recipientName
      });
    }

    addAuditLog(
      'message_sent',
      newMsg.senderName,
      newMsg.senderId,
      `Mensaje privado enviado a ${newMsg.recipientName}`,
      `"${newMsg.text.substring(0, 60)}${newMsg.text.length > 60 ? '...' : ''}"${newMsg.carContext ? ` [Sobre: ${newMsg.carContext.title}]` : ''}`,
      newMsg.senderAvatar
    );

    saveDbToDisk();
    res.status(201).json(newMsg);
  });

  app.delete("/api/messages/:id", (req, res) => {
    const { id } = req.params;
    const idx = serverMessages.findIndex((m) => m.id === id);
    if (idx !== -1) {
      const removed = serverMessages.splice(idx, 1)[0];
      addAuditLog(
        'system',
        'Administrador',
        'admin',
        'Mensaje privado eliminado por moderación',
        `De ${removed.senderName} a ${removed.recipientName} (ID: ${id})`
      );
      saveDbToDisk();
      return res.json({ success: true, id });
    }
    res.status(404).json({ error: "Mensaje no encontrado" });
  });

  // Delete all messages in a conversation between two users
  app.delete("/api/messages/conversation/:userId/:contactId", (req, res) => {
    const { userId, contactId } = req.params;
    const initialCount = serverMessages.length;
    serverMessages = serverMessages.filter(
      (m) =>
        !(
          (m.senderId === userId && m.recipientId === contactId) ||
          (m.senderId === contactId && m.recipientId === userId)
        )
    );
    const deletedCount = initialCount - serverMessages.length;
    saveDbToDisk();
    addAuditLog(
      'system',
      'Administrador',
      'admin',
      'Conversación vaciada',
      `Se eliminaron ${deletedCount} mensajes de la conversación`
    );
    res.json({ success: true, deletedCount });
  });

  // Delete all messages entirely (admin cleanup)
  app.delete("/api/messages", (_req, res) => {
    const count = serverMessages.length;
    serverMessages = [];
    saveDbToDisk();
    addAuditLog('system', 'Administrador', 'admin', 'Todos los mensajes privados eliminados', `Total eliminados: ${count}`);
    res.json({ success: true, count });
  });

  // Delete a specific group message
  app.delete("/api/groups/:id/messages/:msgId", (req, res) => {
    const group = serverGroups.find((g) => g.id === req.params.id);
    if (!group) return res.status(404).json({ error: "Grupo no encontrado" });
    const { msgId } = req.params;
    if (group.messages) {
      const idx = group.messages.findIndex((m) => m.id === msgId);
      if (idx !== -1) {
        group.messages.splice(idx, 1);
        saveDbToDisk();
        return res.json({ success: true, msgId });
      }
    }
    res.status(404).json({ error: "Mensaje no encontrado en el grupo" });
  });

  // Delete a specific group post
  app.delete("/api/groups/:id/posts/:postId", (req, res) => {
    const group = serverGroups.find((g) => g.id === req.params.id);
    if (!group) return res.status(404).json({ error: "Grupo no encontrado" });
    const { postId } = req.params;
    if (group.posts) {
      const idx = group.posts.findIndex((p) => p.id === postId);
      if (idx !== -1) {
        group.posts.splice(idx, 1);
        saveDbToDisk();
        return res.json({ success: true, postId });
      }
    }
    res.status(404).json({ error: "Publicación no encontrada en el grupo" });
  });

  // Users Management & Activity Stats API
  app.get("/api/users", (_req, res) => {
    const usersWithStats = serverUsers.map((user) => {
      const postsCount = serverPosts.filter((p) => p.authorId === user.id).length;
      const carsCount = serverCars.filter((c) => c.sellerId === user.id).length;
      const messagesSentCount = serverMessages.filter((m) => m.senderId === user.id).length;
      const commentsCount = serverPosts.reduce((acc, p) => {
        return acc + (p.comments?.filter((c) => c.authorId === user.id).length || 0);
      }, 0);

      return {
        ...user,
        postsCount,
        carsCount,
        messagesSentCount,
        commentsCount,
        lastActive: user.lastActive || user.createdAt
      };
    });
    res.json(usersWithStats);
  });

  app.post("/api/users", (req, res) => {
    const user = req.body;
    if (!user || !user.id || !user.username) {
      return res.status(400).json({ error: "Datos de usuario requeridos" });
    }
    const saved = upsertServerUser(user);
    res.json(saved);
  });

  app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const idx = serverUsers.findIndex((u) => u.id === id);
    if (idx !== -1) {
      const removed = serverUsers.splice(idx, 1)[0];
      addAuditLog('system', 'Administrador', 'admin', 'Usuario expulsado/eliminado', `Usuario ${removed.username} (${removed.id})`);
      return res.json({ success: true, id });
    }
    res.status(404).json({ error: "Usuario no encontrado" });
  });

  // Audit Logs API (Public community activity with exact timestamps, strictly omitting passwords & secrets)
  app.get("/api/logs", (_req, res) => {
    res.json(serverAuditLogs);
  });

  // Supabase Configuration Sync API
  let serverSupabaseUrl = '';
  let serverSupabaseKey = '';

  app.get("/api/admin/config/supabase", (_req, res) => {
    res.json({
      projectUrl: serverSupabaseUrl,
      hasKey: !!serverSupabaseKey
    });
  });

  app.post("/api/admin/config/supabase", (req, res) => {
    const { projectUrl, anonKey } = req.body || {};
    if (projectUrl) serverSupabaseUrl = projectUrl.trim();
    if (anonKey) serverSupabaseKey = anonKey.trim();
    addAuditLog('system', 'Administrador', 'admin', 'Conexión a Supabase configurada', `URL de proyecto vinculada: ${serverSupabaseUrl.substring(0, 30)}...`);
    res.json({ success: true, projectUrl: serverSupabaseUrl, hasKey: !!serverSupabaseKey });
  });

  // Groups Endpoints
  app.get("/api/groups", (_req, res) => {
    res.json(serverGroups);
  });

  app.post("/api/groups", (req, res) => {
    const newGroup: GroupItem = req.body;
    if (!newGroup || !newGroup.name) {
      return res.status(400).json({ error: "Nombre de grupo requerido" });
    }
    serverGroups.unshift(newGroup);
    saveDbToDisk();
    res.status(201).json(newGroup);
  });

  app.get("/api/groups/:id", (req, res) => {
    const group = serverGroups.find((g) => g.id === req.params.id);
    if (!group) return res.status(404).json({ error: "Grupo no encontrado" });
    res.json(group);
  });

  app.post("/api/groups/:id/join", (req, res) => {
    const group = serverGroups.find((g) => g.id === req.params.id);
    if (!group) return res.status(404).json({ error: "Grupo no encontrado" });
    const { user } = req.body;
    if (!user || !user.id) return res.status(400).json({ error: "Usuario requerido" });

    const exists = group.members.some((m) => m.userId === user.id);
    if (!exists) {
      group.members.push({
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        role: 'member',
        joinedAt: Date.now(),
        canPost: true,
        canChat: true
      });
      saveDbToDisk();
    }
    res.json(group);
  });

  app.post("/api/groups/:id/leave", (req, res) => {
    const group = serverGroups.find((g) => g.id === req.params.id);
    if (!group) return res.status(404).json({ error: "Grupo no encontrado" });
    const { userId } = req.body;
    group.members = group.members.filter((m) => m.userId !== userId);
    saveDbToDisk();
    res.json(group);
  });

  app.post("/api/groups/:id/posts", (req, res) => {
    const group = serverGroups.find((g) => g.id === req.params.id);
    if (!group) return res.status(404).json({ error: "Grupo no encontrado" });
    const post: GroupPostItem = req.body;
    if (!post || !post.content) return res.status(400).json({ error: "Contenido requerido" });

    // Check member permissions
    const member = group.members.find((m) => m.userId === post.authorId);
    if (member && member.canPost === false) {
      return res.status(403).json({ error: "Tus permisos de publicación han sido revocados en este grupo." });
    }

    if (!group.posts) group.posts = [];
    group.posts.unshift(post);
    saveDbToDisk();
    res.status(201).json(post);
  });

  app.post("/api/groups/:id/posts/:postId/react", (req, res) => {
    const group = serverGroups.find((g) => g.id === req.params.id);
    if (!group) return res.status(404).json({ error: "Grupo no encontrado" });
    const post = group.posts.find((p) => p.id === req.params.postId);
    if (!post) return res.status(404).json({ error: "Publicación no encontrada" });

    const { userId, type } = req.body;
    if (!post.likedBy.includes(userId)) {
      post.likedBy.push(userId);
      post.likes += 1;
      if (type === "fire") post.reactions.fire += 1;
      else if (type === "clap") post.reactions.clap += 1;
      else post.reactions.heart += 1;
    } else {
      post.likedBy = post.likedBy.filter((u) => u !== userId);
      post.likes = Math.max(0, post.likes - 1);
      if (type === "fire") post.reactions.fire = Math.max(0, post.reactions.fire - 1);
      else if (type === "clap") post.reactions.clap = Math.max(0, post.reactions.clap - 1);
      else post.reactions.heart = Math.max(0, post.reactions.heart - 1);
    }
    saveDbToDisk();
    res.json(post);
  });

  app.post("/api/groups/:id/posts/:postId/comment", (req, res) => {
    const group = serverGroups.find((g) => g.id === req.params.id);
    if (!group) return res.status(404).json({ error: "Grupo no encontrado" });
    const post = group.posts.find((p) => p.id === req.params.postId);
    if (!post) return res.status(404).json({ error: "Publicación no encontrada" });

    const comment = req.body;
    if (!post.comments) post.comments = [];
    post.comments.push(comment);
    saveDbToDisk();
    res.json(post);
  });

  app.post("/api/groups/:id/messages", (req, res) => {
    const group = serverGroups.find((g) => g.id === req.params.id);
    if (!group) return res.status(404).json({ error: "Grupo no encontrado" });
    const msg: GroupMessageItem = req.body;
    if (!msg || !msg.text) return res.status(400).json({ error: "Mensaje vacío" });

    // Check member permissions
    const member = group.members.find((m) => m.userId === msg.senderId);
    if (member && member.canChat === false) {
      return res.status(403).json({ error: "Has sido silenciado en este chat grupal." });
    }

    if (!group.messages) group.messages = [];
    group.messages.push(msg);
    saveDbToDisk();
    res.status(201).json(msg);
  });

  // Manage Member Permissions in Group ("sacar permisos")
  app.patch("/api/groups/:id/members/:userId", (req, res) => {
    const group = serverGroups.find((g) => g.id === req.params.id);
    if (!group) return res.status(404).json({ error: "Grupo no encontrado" });
    const targetUserId = req.params.userId;
    const { canPost, canChat, role, removeMember, actionBy } = req.body;

    if (removeMember) {
      group.members = group.members.filter((m) => m.userId !== targetUserId);
      saveDbToDisk();
      return res.json({ success: true, message: "Miembro expulsado del grupo", group });
    }

    const member = group.members.find((m) => m.userId === targetUserId);
    if (!member) return res.status(404).json({ error: "Miembro no encontrado en el grupo" });

    if (typeof canPost === 'boolean') member.canPost = canPost;
    if (typeof canChat === 'boolean') member.canChat = canChat;
    if (role) member.role = role;

    saveDbToDisk();
    res.json({ success: true, member, group });
  });

  // Discord OAuth Verify endpoint
  app.post("/api/auth/discord-verify", async (req, res) => {
    const { token, profile } = req.body || {};
    if (profile) {
      const user = {
        id: profile.id ? `discord_${profile.id}` : `user_${Date.now()}`,
        username: profile.username || "RobloxPlayer",
        avatar: profile.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
        role: "citizen",
        isDiscordUser: true,
        discordTag: profile.discriminator ? `${profile.username}#${profile.discriminator}` : profile.username,
        bio: `Cuenta oficial verificada en Discord de Horizonte RP.`,
        createdAt: Date.now()
      };
      upsertServerUser(user);
      addAuditLog(
        'user_login',
        user.username,
        user.id,
        'Inicio de sesión exitoso con Discord',
        `Discord Tag: ${user.discordTag}`,
        user.avatar
      );
      return res.json({
        success: true,
        user
      });
    }
    return res.status(400).json({ error: "Datos de perfil no provistos" });
  });

  // OAuth Callback Route: Supports popups and direct redirects
  app.get("/auth/callback", (_req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Verificando Discord...</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #111215; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: #1e2025; padding: 28px 36px; border-radius: 20px; border: 1px solid #333642; text-align: center; max-width: 380px; box-shadow: 0 12px 30px rgba(0,0,0,0.6); }
    .spin { width: 36px; height: 36px; border: 3.5px solid #5865F2; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { font-size: 17px; margin: 0 0 8px; font-weight: 700; }
    p { font-size: 13px; color: #949ba4; margin: 0; line-height: 1.4; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spin"></div>
    <h2>Verificando con Discord...</h2>
    <p>Esta ventana se cerrará automáticamente en unos segundos.</p>
  </div>
  <script>
    (function() {
      var hash = window.location.hash || '';
      var search = window.location.search || '';
      var payload = { type: 'DISCORD_OAUTH_PAYLOAD', hash: hash, search: search };
      if (window.opener) {
        try {
          window.opener.postMessage(payload, '*');
          setTimeout(function() { window.close(); }, 600);
          return;
        } catch (err) {
          console.error(err);
        }
      }
      // If not opened in popup, redirect back to main app
      window.location.href = '/' + (hash || search);
    })();
  </script>
</body>
</html>`);
  });

  // Vite middleware in development vs static dist in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FaceHorizont server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
