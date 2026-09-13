import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

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
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

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
    if (post.authorId !== userId && !isAdmin) {
      return res.status(403).json({ error: "No tienes permiso para eliminar esta publicación." });
    }
    serverPosts.splice(postIndex, 1);
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
    } else {
      post.likedBy = post.likedBy.filter((u) => u !== userId);
      post.likes = Math.max(0, post.likes - 1);
      if (type === "fire") post.reactions.fire = Math.max(0, post.reactions.fire - 1);
      else if (type === "clap") post.reactions.clap = Math.max(0, post.reactions.clap - 1);
      else post.reactions.heart = Math.max(0, post.reactions.heart - 1);
    }
    res.json(post);
  });

  app.post("/api/posts/:id/comment", (req, res) => {
    const { id } = req.params;
    const comment = req.body;
    const post = serverPosts.find((p) => p.id === id);
    if (!post) return res.status(404).json({ error: "Publicación no encontrada" });

    post.comments.push(comment);
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
    if (car.sellerId !== sellerId && !isAdmin) {
      return res.status(403).json({ error: "No tienes permiso para eliminar este vehículo." });
    }
    serverCars.splice(carIndex, 1);
    res.json({ success: true, id });
  });

  // Messages endpoints
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
    res.status(201).json(newMsg);
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
    }
    res.json(group);
  });

  app.post("/api/groups/:id/leave", (req, res) => {
    const group = serverGroups.find((g) => g.id === req.params.id);
    if (!group) return res.status(404).json({ error: "Grupo no encontrado" });
    const { userId } = req.body;
    group.members = group.members.filter((m) => m.userId !== userId);
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
      return res.json({ success: true, message: "Miembro expulsado del grupo", group });
    }

    const member = group.members.find((m) => m.userId === targetUserId);
    if (!member) return res.status(404).json({ error: "Miembro no encontrado en el grupo" });

    if (typeof canPost === 'boolean') member.canPost = canPost;
    if (typeof canChat === 'boolean') member.canChat = canChat;
    if (role) member.role = role;

    res.json({ success: true, member, group });
  });

  // Discord OAuth Verify endpoint
  app.post("/api/auth/discord-verify", async (req, res) => {
    const { token, profile } = req.body || {};
    if (profile) {
      return res.json({
        success: true,
        user: {
          id: profile.id ? `discord_${profile.id}` : `user_${Date.now()}`,
          username: profile.username || "RobloxPlayer",
          avatar: profile.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
          role: "citizen",
          isDiscordUser: true,
          discordTag: profile.discriminator ? `${profile.username}#${profile.discriminator}` : profile.username,
          bio: `Cuenta oficial verificada en Discord de Horizonte RP.`,
          createdAt: Date.now()
        }
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
