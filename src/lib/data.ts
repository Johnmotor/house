import fs from 'fs';
import path from 'path';
import { AppData } from './types';

const DATA_FILE = path.join(process.cwd(), 'data.json');
const KV_KEY = 'bnb:data';

// Detect Redis integration type
// 1. Vercel Redis (TCP): REDIS_URL
// 2. Upstash Redis (HTTP REST): UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// 3. Vercel KV (legacy): KV_REST_API_URL + KV_REST_API_TOKEN
const REDIS_URL = process.env.REDIS_URL || '';
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';

export async function readData(): Promise<AppData> {
  // 1. Try Vercel Redis (TCP)
  if (REDIS_URL) {
    try {
      const { createClient } = await import('redis');
      const client = createClient({ url: REDIS_URL });
      await client.connect();
      try {
        const raw = await client.get(KV_KEY);
        if (!raw) {
          const defaultData = getDefaultData();
          await client.set(KV_KEY, JSON.stringify(defaultData));
          return defaultData;
        }
        return JSON.parse(raw) as AppData;
      } finally {
        await client.disconnect();
      }
    } catch (err) {
      console.error('[Redis TCP read error]', err);
    }
  }

  // 2. Try Upstash Redis (HTTP REST)
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
      const data = await redis.get<AppData>(KV_KEY);
      if (!data) {
        const defaultData = getDefaultData();
        await redis.set(KV_KEY, defaultData);
        return defaultData;
      }
      return data as AppData;
    } catch (err) {
      console.error('[Upstash Redis read error]', err);
    }
  }

  // 3. Fallback: local file system (development)
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as AppData;
  } catch {
    return getDefaultData();
  }
}

export async function writeData(data: AppData): Promise<void> {
  // 1. Try Vercel Redis (TCP)
  if (REDIS_URL) {
    try {
      const { createClient } = await import('redis');
      const client = createClient({ url: REDIS_URL });
      await client.connect();
      try {
        await client.set(KV_KEY, JSON.stringify(data));
        return;
      } finally {
        await client.disconnect();
      }
    } catch (err) {
      console.error('[Redis TCP write error]', err);
    }
  }

  // 2. Try Upstash Redis (HTTP REST)
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
      await redis.set(KV_KEY, data);
      return;
    } catch (err) {
      console.error('[Upstash Redis write error]', err);
    }
  }

  // 3. Fallback
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function getDefaultData(): AppData {
  return {
    rooms: [
      { id: 'r1', number: '101', type: 'suite', status: 'idle' },
      { id: 'r2', number: '102', type: 'suite', status: 'idle' },
      { id: 'r3', number: '103', type: 'suite', status: 'idle' },
      { id: 'r4', number: '104', type: 'suite', status: 'idle' },
      { id: 'r5', number: '105', type: 'suite', status: 'idle' },
      { id: 'r6', number: '106', type: 'suite', status: 'idle' },
      { id: 'r7', number: '107', type: 'suite', status: 'idle' },
    ],
    bookings: [],
    linens: [
      { id: 'l1', name: '床单', category: 'bedding', quantity: 50, threshold: 15, unit: '套', standardUsage: { single: 1, double: 1, suite: 1 } },
      { id: 'l2', name: '被套', category: 'bedding', quantity: 45, threshold: 12, unit: '套', standardUsage: { single: 1, double: 1, suite: 1 } },
      { id: 'l3', name: '枕套', category: 'bedding', quantity: 80, threshold: 24, unit: '个', standardUsage: { single: 2, double: 2, suite: 2 } },
      { id: 'l4', name: '毛巾', category: 'towel', quantity: 60, threshold: 20, unit: '条', standardUsage: { single: 0, double: 0, suite: 0 } },
      { id: 'l5', name: '浴巾', category: 'towel', quantity: 35, threshold: 10, unit: '条', standardUsage: { single: 0, double: 0, suite: 0 } },
      { id: 'l6', name: '地巾', category: 'towel', quantity: 30, threshold: 10, unit: '条', standardUsage: { single: 0, double: 0, suite: 0 } },
    ],
    linenUsage: [],
    cleaningTasks: [],
  };
}

// Initialize local data.json if not exists (dev only)
if (!REDIS_URL && !(UPSTASH_URL && UPSTASH_TOKEN) && !fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(getDefaultData(), null, 2), 'utf-8');
}
