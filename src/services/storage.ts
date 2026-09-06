import { 
  HorizonData, 
  MatrixTask, 
  MatrixData,
  ShoppingItem, 
  AppEvent, 
  FinanceRecord, 
  NoteCategory, 
  Note, 
  MindMap,
  AppSettings 
} from '../types';

const STORAGE_KEYS = {
  HORIZON_TODO: 'omni_horizon_todo_v3',
  MATRIX_TASKS: 'omni_matrix_tasks_v2',
  SHOPPING_ITEMS: 'omni_shopping_items_v3',
  EVENTS: 'omni_events',
  FINANCE: 'omni_finance',
  CATEGORIES: 'omni_categories',
  NOTES: 'omni_notes',
  NOTEPAD: 'omni_notepad',
  MINDMAPS: 'omni_mindmaps',
  SETTINGS: 'omni_settings',
  DAILY_BACKUP: 'omni_daily_backup_snapshot',
  LAST_BACKUP_DATE: 'omni_last_daily_backup_date',
  SHOPPING_HISTORY: 'omni_shopping_recent_history_v1',
};

export function getDeviceCurrency(): string {
  try {
    // 1. Check Indian timezones directly
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (timeZone.includes('Calcutta') || timeZone.includes('Kolkata') || timeZone.includes('India')) {
      return '₹';
    }

    // 2. Check all navigator languages
    const languages = navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language || 'en-IN'];

    for (const lang of languages) {
      const region = lang.split('-')[1]?.toUpperCase();
      if (region === 'IN' || lang.toLowerCase() === 'hi' || lang.toLowerCase().startsWith('ta') || lang.toLowerCase().startsWith('te') || lang.toLowerCase().startsWith('kn') || lang.toLowerCase().startsWith('ml')) {
        return '₹';
      }
      if (region === 'US') return '$';
      if (region === 'GB') return '£';
      if (region === 'EU' || region === 'DE' || region === 'FR' || region === 'IT' || region === 'ES') return '€';
      if (region === 'AE') return 'AED ';
      if (region === 'SA') return 'SAR ';
      if (region === 'JP') return '¥';
      if (region === 'CA') return 'CA$';
      if (region === 'AU') return 'A$';
      if (region === 'SG') return 'S$';
    }

    // 3. Fallback to ₹ as primary default currency
    return '₹';
  } catch {
    return '₹';
  }
}

const DEFAULT_SETTINGS: AppSettings = {
  enabledModules: {
    horizon_todo: true,
    eisenhower: false,
    shopping: true,
    events: true,
    finance: true,
    notes: true,
    mindmap: true,
  },
  theme: 'system',
  currencySymbol: getDeviceCurrency(),
  todayReminder: {
    enabled: false,
    time: '20:00',
  },
  eventAlarmsEnabled: true,
  hapticsEnabled: true,
  soundEnabled: true,
  alarmSound: 'multi_alarm',
  todoAlertSound: 'multi_alarm',
};

const DEFAULT_HORIZON: HorizonData = {
  today: "<div>(Sample list)</div><div>• Buy fresh vegetables & milk</div><div>• Call plumber for kitchen sink leak</div><div>• Pay electricity & wifi bill</div><div>• 30 mins evening walk</div>",
  tomorrow: "<div>(Sample list)</div><div>• Car wash & check tire pressure</div><div>• Book doctor appointment</div><div>• Pick up dry cleaning</div>",
  this_week: "<div>(Sample list)</div><div>• Organize clothes wardrobe</div><div>• Grocery restock from supermarket</div><div>• Settle credit card bill</div>",
  this_month: "<div>(Sample list)</div><div>• Vehicle servicing & oil change</div><div>• Deep clean house & balcony</div><div>• Review monthly family expenses</div>",
  this_year: "<div>(Sample list)</div><div>• Family vacation trip</div><div>• Save emergency fund target</div><div>• Complete health checkup</div>",
};

const DEFAULT_MATRIX_DATA: MatrixData = {
  important_urgent: "(Sample list)\n• Fix critical leaking water pipe\n• Urgent server down issue\n• Submit tax filing before deadline",
  important_not_urgent: "(Sample list)\n• 45 mins gym workout session\n• Learn new investment strategy\n• Read 20 pages of book",
  urgent_not_important: "(Sample list)\n• Reply to promotional emails\n• Quick colleague favors\n• Social media notifications",
  not_important_not_urgent: "(Sample list)\n• Mindless video scrolling\n• Cleaning unnecessary old files\n• Watching random TV reruns",
};

const DEFAULT_SHOPPING: ShoppingItem[] = [
  // Local Market
  { id: 's1', name: 'Milk', quantity: 500, unit: 'ml', market: 'local', completed: false, createdAt: new Date().toISOString() },
  { id: 's2', name: 'Egg', quantity: 5, unit: 'nos', market: 'local', completed: false, createdAt: new Date().toISOString() },
  { id: 's3', name: 'Tomato', quantity: 2, unit: 'kg', market: 'local', completed: false, createdAt: new Date().toISOString() },

  // City Market
  { id: 's4', name: 'Washing machine', quantity: 1, unit: 'nos', market: 'city', completed: false, createdAt: new Date().toISOString() },
  { id: 's5', name: 'Fry pan', quantity: 1, unit: 'nos', market: 'city', completed: false, createdAt: new Date().toISOString() },

  // Others Market
  { id: 's6', name: 'Laptop', quantity: 1, unit: 'nos', market: 'other', completed: false, createdAt: new Date().toISOString() },
];

function getSampleDate(daysOffset: number, hours: number, minutes: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString().slice(0, 16);
}

const DEFAULT_EVENTS: AppEvent[] = [
  {
    id: 'e1',
    title: 'Client Strategy Review',
    dateTime: getSampleDate(1, 14, 30),
    category: 'Work',
    location: 'Conference Room B / Video Call',
    reminderMinutesBefore: 30,
    notes: 'Bring updated performance charts',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e2',
    title: 'Vehicle Maintenance Service',
    dateTime: getSampleDate(3, 10, 0),
    category: 'Personal',
    location: 'Central Auto Care',
    reminderMinutesBefore: 60,
    notes: 'Check tire alignment and oil replacement',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e3',
    title: 'Past Project Retrospective',
    dateTime: getSampleDate(-2, 16, 0),
    category: 'Work',
    location: 'Main Hall',
    reminderMinutesBefore: 15,
    notes: 'Completed session feedback logged',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_FINANCE: FinanceRecord[] = [
  {
    id: 'f1',
    personName: 'Person 1',
    amount: 2000,
    direction: 'received',
    date: new Date().toISOString().slice(0, 10),
    dueDate: getSampleDate(7, 0, 0).slice(0, 10),
    status: 'pending',
    notes: 'Emergency fund',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'f2',
    personName: 'Investment',
    amount: 100000,
    direction: 'gave',
    date: getSampleDate(-3, 0, 0).slice(0, 10),
    status: 'pending',
    notes: 'Mutual fund returns',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'f3',
    personName: 'Cash Savings',
    amount: 20000,
    direction: 'gave',
    date: getSampleDate(-10, 0, 0).slice(0, 10),
    status: 'pending',
    notes: 'Monthly salary',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_CATEGORIES: NoteCategory[] = [
  { id: 'cat_work', name: 'Work & Projects', color: '#6366f1', createdAt: new Date().toISOString() },
  { id: 'cat_personal', name: 'Personal & Habits', color: '#10b981', createdAt: new Date().toISOString() },
  { id: 'cat_ideas', name: 'Ideas & Innovation', color: '#f59e0b', createdAt: new Date().toISOString() },
  { id: 'cat_finance', name: 'Finance & Assets', color: '#ec4899', createdAt: new Date().toISOString() },
];

const DEFAULT_NOTES: Note[] = [
  {
    id: 'n1',
    title: 'Product Architecture Outline',
    content: "Key principles for clean, high-performance applications:\n- Modular UI components with decoupled state\n- Zero layout shift and instant local persistence\n- Clean typography and distraction-free dark interface\n- Offline-first execution capability",
    categoryId: 'cat_work',
    isPinned: true,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n2',
    title: 'Weekly Focus & Routine',
    content: "Morning: Deep focus block (2 hours)\nAfternoon: Team communications and task reviews\nEvening: Quick wrap-up and planning for tomorrow",
    categoryId: 'cat_personal',
    isPinned: false,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_NOTEPAD = "Quick Scratchpad\n- Clean workspace for temporary thoughts\n- Automatically saved on every keystroke\n- Accessible anytime from the quick tab";

const DEFAULT_MINDMAPS: MindMap[] = [
  {
    id: 'mm_sample_1',
    title: 'Product Strategy & Launch',
    rootNodeId: 'root_1',
    nodes: {
      'root_1': {
        id: 'root_1',
        text: 'Product Strategy',
        parentId: null,
        color: '#ff5e1a',
        childrenIds: ['branch_1', 'branch_2', 'branch_3', 'branch_4'],
      },
      'branch_1': {
        id: 'branch_1',
        text: 'Design & UX',
        parentId: 'root_1',
        color: '#8b5cf6',
        childrenIds: ['sub_1_1', 'sub_1_2'],
      },
      'sub_1_1': {
        id: 'sub_1_1',
        text: 'Neo-minimalist UI',
        parentId: 'branch_1',
        color: '#8b5cf6',
        childrenIds: [],
      },
      'sub_1_2': {
        id: 'sub_1_2',
        text: 'Mobile Ergonomics',
        parentId: 'branch_1',
        color: '#8b5cf6',
        childrenIds: [],
      },
      'branch_2': {
        id: 'branch_2',
        text: 'Engineering',
        parentId: 'root_1',
        color: '#3b82f6',
        childrenIds: ['sub_2_1', 'sub_2_2'],
      },
      'sub_2_1': {
        id: 'sub_2_1',
        text: 'Offline-first Storage',
        parentId: 'branch_2',
        color: '#3b82f6',
        childrenIds: [],
      },
      'sub_2_2': {
        id: 'sub_2_2',
        text: 'Capacitor Android Core',
        parentId: 'branch_2',
        color: '#3b82f6',
        childrenIds: [],
      },
      'branch_3': {
        id: 'branch_3',
        text: 'Marketing',
        parentId: 'root_1',
        color: '#10b981',
        childrenIds: ['sub_3_1'],
      },
      'sub_3_1': {
        id: 'sub_3_1',
        text: 'App Store Optimization',
        parentId: 'branch_3',
        color: '#10b981',
        childrenIds: [],
      },
      'branch_4': {
        id: 'branch_4',
        text: 'Key Milestones',
        parentId: 'root_1',
        color: '#f59e0b',
        childrenIds: ['sub_4_1'],
      },
      'sub_4_1': {
        id: 'sub_4_1',
        text: 'Beta Release v1.0',
        parentId: 'branch_4',
        color: '#f59e0b',
        childrenIds: [],
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const StorageService = {
  // Generic helper
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Failed to save storage key: ${key}`, err);
    }
  },

  // Horizons
  getHorizons(): HorizonData {
    const data = this.get<HorizonData>(STORAGE_KEYS.HORIZON_TODO, DEFAULT_HORIZON);
    const keys: (keyof HorizonData)[] = ['today', 'tomorrow', 'this_week', 'this_month', 'this_year'];
    let changed = false;
    const migrated: HorizonData = { ...data };

    for (const k of keys) {
      const val = migrated[k];
      if (val && typeof val === 'string') {
        if (val.includes('\n') && !val.includes('<div>') && !val.includes('<p>')) {
          migrated[k] = val
            .split('\n')
            .filter(line => line.length > 0)
            .map(line => `<div>${line}</div>`)
            .join('');
          changed = true;
        } else if (!val.includes('<div>') && !val.includes('<p>') && val.includes('•') && val.includes('(Sample list)')) {
          // If sample list is squashed into single line
          const lines = val.replace('(Sample list)', '').split('•').map(s => s.trim()).filter(Boolean);
          migrated[k] = `<div>(Sample list)</div>` + lines.map(line => `<div>• ${line}</div>`).join('');
          changed = true;
        }
      }
    }

    if (changed) {
      this.saveHorizons(migrated);
    }
    return migrated;
  },
  saveHorizons(data: HorizonData): void {
    this.set(STORAGE_KEYS.HORIZON_TODO, data);
  },

  // Eisenhower Matrix
  getMatrix(): MatrixData {
    return this.get<MatrixData>(STORAGE_KEYS.MATRIX_TASKS, DEFAULT_MATRIX_DATA);
  },
  saveMatrix(data: MatrixData): void {
    this.set(STORAGE_KEYS.MATRIX_TASKS, data);
  },

  // Shopping
  getShopping(): ShoppingItem[] {
    return this.get<ShoppingItem[]>(STORAGE_KEYS.SHOPPING_ITEMS, DEFAULT_SHOPPING);
  },
  saveShopping(items: ShoppingItem[]): void {
    this.set(STORAGE_KEYS.SHOPPING_ITEMS, items);
  },

  // Save item usage history (remembers last quantity, unit, and recent items)
  recordShoppingHistory(name: string, quantity: number, unit?: string): void {
    if (!name || !name.trim()) return;
    const history = this.getRecentShoppingItems();
    const cleanName = name.trim();
    // Remove if existing, prepend to front
    const filtered = history.filter(h => h.name.toLowerCase() !== cleanName.toLowerCase());
    const updated = [{ 
      name: cleanName, 
      quantity: Number(quantity) || 1, 
      unit: unit && unit !== 'none' ? unit : undefined, 
      lastUsed: Date.now() 
    }, ...filtered].slice(0, 30);
    this.set(STORAGE_KEYS.SHOPPING_HISTORY, updated);
  },

  // Get recent shopping items
  getRecentShoppingItems(): { name: string; quantity: number; unit?: string; lastUsed: number }[] {
    return this.get<{ name: string; quantity: number; unit?: string; lastUsed: number }[]>(STORAGE_KEYS.SHOPPING_HISTORY, []);
  },

  // Events
  getEvents(): AppEvent[] {
    return this.get<AppEvent[]>(STORAGE_KEYS.EVENTS, DEFAULT_EVENTS);
  },
  saveEvents(events: AppEvent[]): void {
    this.set(STORAGE_KEYS.EVENTS, events);
  },

  // Finance
  getFinance(): FinanceRecord[] {
    const list = this.get<FinanceRecord[]>(STORAGE_KEYS.FINANCE, DEFAULT_FINANCE);
    // Migrate legacy demo names & values if still present
    let modified = false;
    const migrated = list.map(item => {
      if (item.personName === 'Rahul Sharma' || (item.personName === 'Person 1' && item.amount === 2500)) {
        modified = true;
        return {
          ...item,
          personName: 'Person 1',
          amount: 2000,
          direction: 'received' as const,
          notes: 'Emergency fund',
        };
      }
      if (item.personName === 'Amit Verma' || (item.personName === 'Investment' && item.amount === 1200)) {
        modified = true;
        return {
          ...item,
          personName: 'Investment',
          amount: 100000,
          direction: 'gave' as const,
          notes: 'Mutual fund returns',
        };
      }
      if (item.personName === 'Priya Nair' || (item.personName === 'Cash Savings' && item.amount === 800)) {
        modified = true;
        return {
          ...item,
          personName: 'Cash Savings',
          amount: 20000,
          direction: 'gave' as const,
          status: 'pending' as const,
          notes: 'Monthly salary',
        };
      }
      return item;
    });
    if (modified) {
      this.saveFinance(migrated);
      return migrated;
    }
    return list;
  },
  saveFinance(records: FinanceRecord[]): void {
    this.set(STORAGE_KEYS.FINANCE, records);
  },

  // Categories & Notes
  getCategories(): NoteCategory[] {
    return this.get<NoteCategory[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  },
  saveCategories(categories: NoteCategory[]): void {
    this.set(STORAGE_KEYS.CATEGORIES, categories);
  },

  getNotes(): Note[] {
    return this.get<Note[]>(STORAGE_KEYS.NOTES, DEFAULT_NOTES);
  },
  saveNotes(notes: Note[]): void {
    this.set(STORAGE_KEYS.NOTES, notes);
  },

  // Mind Maps
  getMindMaps(): MindMap[] {
    return this.get<MindMap[]>(STORAGE_KEYS.MINDMAPS, DEFAULT_MINDMAPS);
  },
  saveMindMaps(mindmaps: MindMap[]): void {
    this.set(STORAGE_KEYS.MINDMAPS, mindmaps);
  },

  // Quick Notepad
  getNotepad(): string {
    const val = localStorage.getItem(STORAGE_KEYS.NOTEPAD);
    return val !== null ? val : DEFAULT_NOTEPAD;
  },
  saveNotepad(content: string): void {
    localStorage.setItem(STORAGE_KEYS.NOTEPAD, content);
  },

  // Settings
  getSettings(): AppSettings {
    const s = this.get<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    // If currency is unset or set to stale old euro from earlier bug, auto-correct it
    if (!s.currencySymbol || s.currencySymbol === 'EUR' || s.currencySymbol === '€') {
      s.currencySymbol = getDeviceCurrency();
      this.saveSettings(s);
    }
    if (!s.alarmSound || (s.alarmSound as any) === 'default' || (s.alarmSound as any) === 'long_siren') {
      s.alarmSound = 'multi_alarm';
      this.saveSettings(s);
    }
    if (!s.todoAlertSound || (s.todoAlertSound as any) === 'default' || (s.todoAlertSound as any) === 'long_siren') {
      s.todoAlertSound = 'multi_alarm';
      this.saveSettings(s);
    }
    return s;
  },
  saveSettings(settings: AppSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  },

  // Export full JSON backup
  exportBackup(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      horizons: this.getHorizons(),
      matrix: this.getMatrix(),
      shopping: this.getShopping(),
      shoppingHistory: this.getRecentShoppingItems(),
      events: this.getEvents(),
      finance: this.getFinance(),
      categories: this.getCategories(),
      notes: this.getNotes(),
      mindmaps: this.getMindMaps(),
      notepad: this.getNotepad(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Import full JSON backup
  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.horizons) this.saveHorizons(data.horizons);
      if (data.matrix) this.saveMatrix(data.matrix);
      if (data.shopping) this.saveShopping(data.shopping);
      if (Array.isArray(data.shoppingHistory)) this.set(STORAGE_KEYS.SHOPPING_HISTORY, data.shoppingHistory);
      if (data.events) this.saveEvents(data.events);
      if (data.finance) this.saveFinance(data.finance);
      if (data.categories) this.saveCategories(data.categories);
      if (data.notes) this.saveNotes(data.notes);
      if (data.mindmaps) this.saveMindMaps(data.mindmaps);
      if (typeof data.notepad === 'string') this.saveNotepad(data.notepad);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch {
      return false;
    }
  },

  // Check and create daily backup snapshot on app open (if not taken today)
  checkAndPerformDailyBackup(): void {
    const today = new Date().toISOString().slice(0, 10);
    const lastBackupDate = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP_DATE);

    if (lastBackupDate !== today) {
      const snapshot = this.exportBackup();
      localStorage.setItem(STORAGE_KEYS.DAILY_BACKUP, snapshot);
      localStorage.setItem(STORAGE_KEYS.LAST_BACKUP_DATE, today);
    }
  },

  // Manual snapshot creation
  createManualBackup(): string {
    const snapshot = this.exportBackup();
    localStorage.setItem(STORAGE_KEYS.DAILY_BACKUP, snapshot);
    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP_DATE, new Date().toISOString().slice(0, 10));
    return snapshot;
  },

  // Get current local snapshot info
  getLocalBackupInfo(): { exists: boolean; date: string | null; time?: string } {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_BACKUP);
    const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP_DATE);
    if (!raw) return { exists: false, date: null };
    try {
      const data = JSON.parse(raw);
      return { 
        exists: true, 
        date: lastDate,
        time: data.exportedAt ? new Date(data.exportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
      };
    } catch {
      return { exists: !!raw, date: lastDate };
    }
  },

  // Restore the saved local backup snapshot
  restoreDailyBackup(): boolean {
    const snapshot = localStorage.getItem(STORAGE_KEYS.DAILY_BACKUP);
    if (!snapshot) return false;
    return this.importBackup(snapshot);
  },

  // Reset to default data
  resetAll(): void {
    localStorage.clear();
  }
};
