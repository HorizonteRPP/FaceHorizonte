import { Post, MarketplaceCar, ChatMessage, User, SupabaseApiConfig } from '../types';

export interface SupabaseSyncResult {
  success: boolean;
  message: string;
  syncedPosts?: number;
  syncedCars?: number;
  syncedMessages?: number;
  syncedUsers?: number;
  error?: string;
}

/**
 * Normalizes Supabase Project URL to prevent trailing slash errors
 */
export function cleanSupabaseUrl(url: string): string {
  if (!url) return '';
  let clean = url.trim();
  if (clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  return clean;
}

/**
 * Verifies Supabase connection using PostgREST headers
 */
export async function testSupabaseConnection(config: SupabaseApiConfig): Promise<boolean> {
  const url = cleanSupabaseUrl(config.projectUrl);
  const key = config.anonKey.trim();

  if (!url || !key) return false;

  try {
    const res = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    });
    return res.status === 200 || res.status === 404 || res.status === 401 ? res.status === 200 : false;
  } catch (err) {
    console.warn('Supabase ping check failed:', err);
    return false;
  }
}

/**
 * Direct sync for messages with Supabase table `messages`
 */
export async function syncMessagesWithSupabase(
  config: SupabaseApiConfig,
  localMessages: ChatMessage[]
): Promise<ChatMessage[]> {
  const url = cleanSupabaseUrl(config.projectUrl);
  const key = config.anonKey.trim();
  if (!url || !key) return localMessages;

  try {
    // 1. Fetch remote messages
    const res = await fetch(`${url}/rest/v1/messages?select=*&order=timestamp.asc`, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });

    let remoteMsgs: any[] = [];
    if (res.ok) {
      remoteMsgs = await res.json();
    }

    // Merge remote and local by id
    const map = new Map<string, ChatMessage>();
    localMessages.forEach((m) => map.set(m.id, m));
    if (Array.isArray(remoteMsgs)) {
      remoteMsgs.forEach((rm) => {
        map.set(rm.id, {
          id: rm.id,
          senderId: rm.sender_id || rm.senderId,
          senderName: rm.sender_name || rm.senderName,
          senderAvatar: rm.sender_avatar || rm.senderAvatar,
          recipientId: rm.recipient_id || rm.recipientId,
          recipientName: rm.recipient_name || rm.recipientName,
          text: rm.text,
          timestamp: Number(rm.timestamp) || Date.now(),
          isRead: Boolean(rm.is_read ?? rm.isRead),
          carContext: rm.car_context || rm.carContext
        });
      });
    }

    const merged = Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);

    // 2. Upload latest local messages not in remote
    const existingIds = new Set(remoteMsgs.map((rm) => rm.id));
    const toUpload = localMessages
      .filter((m) => !existingIds.has(m.id))
      .map((m) => ({
        id: m.id,
        sender_id: m.senderId,
        sender_name: m.senderName,
        sender_avatar: m.senderAvatar,
        recipient_id: m.recipientId,
        recipient_name: m.recipientName,
        text: m.text,
        timestamp: m.timestamp,
        is_read: m.isRead,
        car_context: m.carContext || null
      }));

    if (toUpload.length > 0) {
      await fetch(`${url}/rest/v1/messages`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify(toUpload)
      });
    }

    return merged;
  } catch (e) {
    console.warn('Sync messages with Supabase error:', e);
    return localMessages;
  }
}

/**
 * Direct sync for posts with Supabase table `posts`
 */
export async function syncPostsWithSupabase(
  config: SupabaseApiConfig,
  localPosts: Post[]
): Promise<Post[]> {
  const url = cleanSupabaseUrl(config.projectUrl);
  const key = config.anonKey.trim();
  if (!url || !key) return localPosts;

  try {
    const res = await fetch(`${url}/rest/v1/posts?select=*&order=timestamp.desc`, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });

    let remotePosts: any[] = [];
    if (res.ok) {
      remotePosts = await res.json();
    }

    const map = new Map<string, Post>();
    localPosts.forEach((p) => map.set(p.id, p));
    if (Array.isArray(remotePosts)) {
      remotePosts.forEach((rp) => {
        map.set(rp.id, {
          id: rp.id,
          authorId: rp.author_id || rp.authorId,
          authorName: rp.author_name || rp.authorName,
          authorAvatar: rp.author_avatar || rp.authorAvatar,
          content: rp.content,
          imageUrl: rp.image_url || rp.imageUrl,
          timestamp: Number(rp.timestamp) || Date.now(),
          likes: Number(rp.likes) || 0,
          likedBy: Array.isArray(rp.liked_by) ? rp.liked_by : (rp.likedBy || []),
          reactions: rp.reactions || { heart: 0, fire: 0, clap: 0 },
          comments: rp.comments || [],
          tag: rp.tag
        });
      });
    }

    const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);

    const existingIds = new Set(remotePosts.map((rp) => rp.id));
    const toUpload = localPosts
      .filter((p) => !existingIds.has(p.id))
      .map((p) => ({
        id: p.id,
        author_id: p.authorId,
        author_name: p.authorName,
        author_avatar: p.authorAvatar,
        content: p.content,
        image_url: p.imageUrl || null,
        timestamp: p.timestamp,
        likes: p.likes,
        liked_by: p.likedBy || [],
        reactions: p.reactions || {},
        comments: p.comments || [],
        tag: p.tag || 'General'
      }));

    if (toUpload.length > 0) {
      await fetch(`${url}/rest/v1/posts`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify(toUpload)
      });
    }

    return merged;
  } catch (e) {
    console.warn('Sync posts with Supabase error:', e);
    return localPosts;
  }
}

/**
 * Direct sync for marketplace cars with Supabase table `marketplace`
 */
export async function syncCarsWithSupabase(
  config: SupabaseApiConfig,
  localCars: MarketplaceCar[]
): Promise<MarketplaceCar[]> {
  const url = cleanSupabaseUrl(config.projectUrl);
  const key = config.anonKey.trim();
  if (!url || !key) return localCars;

  try {
    const res = await fetch(`${url}/rest/v1/marketplace?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });

    let remoteCars: any[] = [];
    if (res.ok) {
      remoteCars = await res.json();
    }

    const map = new Map<string, MarketplaceCar>();
    localCars.forEach((c) => map.set(c.id, c));
    if (Array.isArray(remoteCars)) {
      remoteCars.forEach((rc) => {
        map.set(rc.id, {
          id: rc.id,
          title: rc.title,
          price: Number(rc.price) || 0,
          currency: rc.currency || 'RP$',
          category: rc.category || 'Deportivo',
          condition: rc.condition || 'Excelente',
          imageUrl: rc.image_url || rc.imageUrl,
          sellerName: rc.seller_name || rc.sellerName,
          sellerAvatar: rc.seller_avatar || rc.sellerAvatar,
          sellerId: rc.seller_id || rc.sellerId,
          description: rc.description || '',
          location: rc.location || 'Horizonte RP',
          createdAt: Number(rc.created_at || rc.createdAt) || Date.now()
        });
      });
    }

    const merged = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);

    const existingIds = new Set(remoteCars.map((rc) => rc.id));
    const toUpload = localCars
      .filter((c) => !existingIds.has(c.id))
      .map((c) => ({
        id: c.id,
        title: c.title,
        price: c.price,
        currency: c.currency,
        category: c.category,
        condition: c.condition,
        image_url: c.imageUrl,
        seller_name: c.sellerName,
        seller_avatar: c.sellerAvatar,
        seller_id: c.sellerId,
        description: c.description,
        location: c.location,
        created_at: c.createdAt
      }));

    if (toUpload.length > 0) {
      await fetch(`${url}/rest/v1/marketplace`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify(toUpload)
      });
    }

    return merged;
  } catch (e) {
    console.warn('Sync marketplace cars with Supabase error:', e);
    return localCars;
  }
}

