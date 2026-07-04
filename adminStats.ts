import { db } from './db';

export interface AppUser {
  steamId: string;
  username: string;
  avatar: string;
  cardsFarmed: number;
  lastActive: number;
  isAdmin?: boolean;
  isBanned?: boolean;
}

export interface AdminStats {
  totalCardsFarmed: number;
  users: Record<string, AppUser>;
}

export async function loadStats(): Promise<AdminStats> {
  try {
    const doc = await db.collection('app_data').doc('admin_stats').get();
    if (doc.exists) {
      const stats = doc.data() as AdminStats;
      // Ensure the master admin is always set if present
      for (const key in stats.users) {
        if (stats.users[key].username === 'SnoxP718') {
          stats.users[key].isAdmin = true;
          stats.users[key].isBanned = false;
        }
      }
      return stats;
    }
  } catch (err) {
    console.error('Error loading admin stats', err);
  }
  return { totalCardsFarmed: 0, users: {} };
}

export async function saveStats(stats: AdminStats) {
  try {
    await db.collection('app_data').doc('admin_stats').set(stats);
  } catch (err) {
    console.error('Error saving admin stats', err);
  }
}

export async function recordUserActivity(steamId: string, username: string, avatar: string) {
  if (!steamId) return;
  const stats = await loadStats();
  if (!stats.users[steamId]) {
    const isAdmin = username === 'SnoxP718';
    stats.users[steamId] = { steamId, username, avatar, cardsFarmed: 0, lastActive: Date.now(), isAdmin, isBanned: false };
  } else {
    stats.users[steamId].username = username || stats.users[steamId].username;
    stats.users[steamId].avatar = avatar || stats.users[steamId].avatar;
    stats.users[steamId].lastActive = Date.now();
    if (username === 'SnoxP718') {
      stats.users[steamId].isAdmin = true;
      stats.users[steamId].isBanned = false;
    }
  }
  await saveStats(stats);
}

export async function recordCardsDropped(steamId: string, count: number) {
  if (!steamId) return;
  const stats = await loadStats();
  stats.totalCardsFarmed += count;
  if (stats.users[steamId]) {
    stats.users[steamId].cardsFarmed += count;
    stats.users[steamId].lastActive = Date.now();
  }
  await saveStats(stats);
}

export async function updateUserStatus(steamId: string, updates: { isAdmin?: boolean, isBanned?: boolean }) {
  const stats = await loadStats();
  if (stats.users[steamId]) {
    if (updates.isAdmin !== undefined) {
      // SnoxP718 cannot have their admin removed
      if (stats.users[steamId].username !== 'SnoxP718' || updates.isAdmin === true) { 
         stats.users[steamId].isAdmin = updates.isAdmin;
      }
    }
    if (updates.isBanned !== undefined) {
      if (stats.users[steamId].username !== 'SnoxP718' || updates.isBanned === false) { 
         stats.users[steamId].isBanned = updates.isBanned;
      }
    }
    await saveStats(stats);
  }
}
