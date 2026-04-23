import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';
import { AppData } from './types';

const DATA_FILE = path.join(process.cwd(), 'data.json');
const KV_KEY = 'bnb:data';

// Detect Upstash Redis env (auto-injected by Vercel when integrated)
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

let redis: Redis | null = null;
if (useRedis) {
  redis = new Redis({
    url: UPSTASH_URL!,
    token: UPSTASH_TOKEN!,
  });
}

export async function readData(): Promise<AppData> {
  if (redis) {
    const data = await redis.get<AppData>(KV_KEY);
    if (!data) {
      const defaultData = getDefaultData();
      await redis.set(KV_KEY, defaultData);
      return defaultData;
    }
    return data as AppData;
  }

  // Fallback: local file system (development)
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as AppData;
  } catch {
    return getDefaultData();
  }
}

export async function writeData(data: AppData): Promise<void> {
  if (redis) {
    await redis.set(KV_KEY, data);
  } else {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }
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
if (!useRedis && !fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(getDefaultData(), null, 2), 'utf-8');
}
