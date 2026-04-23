import fs from 'fs';
import path from 'path';
import { AppData } from './types';

const DATA_FILE = path.join(process.cwd(), 'data.json');

export function readData(): AppData {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as AppData;
  } catch {
    return getDefaultData();
  }
}

export function writeData(data: AppData): void {
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

// Initialize data.json if not exists
if (!fs.existsSync(DATA_FILE)) {
  writeData(getDefaultData());
}
