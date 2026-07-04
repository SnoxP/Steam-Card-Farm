import re

# Revert to fs for adminStats
content_admin = """import fs from 'fs';
import path from 'path';

const STATS_FILE = path.join(process.cwd(), 'admin-stats.json');

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
    if (fs.existsSync(STATS_FILE)) {
      const data = fs.readFileSync(STATS_FILE, 'utf-8');
      const stats = JSON.parse(data);
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
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
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
"""

with open('adminStats.ts', 'w') as f:
    f.write(content_admin)

# Revert session.ts
content_session = """import fs from 'fs';
import path from 'path';

const SESSION_FILE = path.join(process.cwd(), 'session.json');

export interface SessionData {
  refreshToken: string;
  cardsDropped?: number;
  collectedCardsDetails?: { image: string; title: string; minPrice: string }[];
}

export async function loadSession(): Promise<SessionData> {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading session:', e);
  }
  return { refreshToken: '', cardsDropped: 0, collectedCardsDetails: [] };
}

export async function saveSession(data: SessionData) {
  try {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving session:', e);
  }
}
"""

with open('session.ts', 'w') as f:
    f.write(content_session)
