import { 
  HorizonData, 
  MatrixTask, 
  MatrixData,
  ShoppingItem, 
  AppEvent, 
  FinanceAccount,
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
  FINANCE_ACCOUNTS: 'omni_finance_accounts',
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
  autoBackupEnabled: true,
};

const DEFAULT_HORIZON: HorizonData = {
  today: "",
  tomorrow: "",
  this_week: "",
  this_month: "",
  this_year: "",
};

const DEFAULT_MATRIX_DATA: MatrixData = {
  important_urgent: "(Sample list)\n• Fix critical leaking water pipe\n• Urgent server down issue\n• Submit tax filing before deadline",
  important_not_urgent: "(Sample list)\n• 45 mins gym workout session\n• Learn new investment strategy\n• Read 20 pages of book",
  urgent_not_important: "(Sample list)\n• Reply to promotional emails\n• Quick colleague favors\n• Social media notifications",
  not_important_not_urgent: "(Sample list)\n• Mindless video scrolling\n• Cleaning unnecessary old files\n• Watching random TV reruns",
};

const DEFAULT_SHOPPING: ShoppingItem[] = [];

function getSampleDate(daysOffset: number, hours: number, minutes: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString().slice(0, 16);
}

const DEFAULT_EVENTS: AppEvent[] = [];

const DEFAULT_ACCOUNTS: FinanceAccount[] = [];

const DEFAULT_FINANCE: FinanceRecord[] = [];

const DEFAULT_CATEGORIES: NoteCategory[] = [
  { id: 'cat_work', name: 'Work & Projects', color: '#6366f1', createdAt: new Date().toISOString() },
  { id: 'cat_personal', name: 'Personal & Habits', color: '#10b981', createdAt: new Date().toISOString() },
  { id: 'cat_ideas', name: 'Ideas & Innovation', color: '#f59e0b', createdAt: new Date().toISOString() },
  { id: 'cat_finance', name: 'Finance & Assets', color: '#ec4899', createdAt: new Date().toISOString() },
];

const DEFAULT_NOTES: Note[] = [
  {
    id: 'n_sample',
    title: 'Sample Note',
    content: '<div class="note-title-banner">Extended Keyboard Features</div><div>Tap the toolbar above your keyboard to format notes:</div><div><br></div><div><b>T</b> - Formats line as highlighted Title Banner</div><div><b>B</b> - Toggle <b>bold text</b> styling</div><div><b>U</b> - Toggle <u>underlined text</u> styling</div><div><b>S</b> - Toggle <s>strikethrough text</s> styling</div><div><br></div><div>• <b>Bullet:</b> Standard list for items &amp; thoughts</div><div>&gt; <b>Quote:</b> Highlights quotes, steps &amp; actions</div><div>👉 <b>Point:</b> Focuses on key tips &amp; priorities</div><div>✅ <b>Check:</b> Marks completed tasks &amp; milestones</div><div>⭕ <b>Circle:</b> Tracks open or pending tasks</div>',
    categoryId: 'cat_work',
    isPinned: false,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_NOTEPAD = "Quick Scratchpad\n- Clean workspace for temporary thoughts\n- Automatically saved on every keystroke\n- Accessible anytime from the quick tab";

const DEFAULT_MINDMAPS: MindMap[] = [
  {
    id: 'mm_sample_1',
    title: 'Sample',
    rootNodeId: 'root_1',
    nodes: {
      'root_1': {
        id: 'root_1',
        text: 'Mind Map Guide',
        parentId: null,
        color: '#ff5e1a',
        childrenIds: ['branch_add', 'branch_nav', 'branch_style', 'branch_org'],
      },
      'branch_add': {
        id: 'branch_add',
        text: 'Add & Edit Nodes',
        parentId: 'root_1',
        color: '#8b5cf6',
        childrenIds: ['sub_add_1', 'sub_add_2'],
      },
      'sub_add_1': {
        id: 'sub_add_1',
        text: 'Tap + to add child branch',
        parentId: 'branch_add',
        color: '#8b5cf6',
        childrenIds: [],
      },
      'sub_add_2': {
        id: 'sub_add_2',
        text: 'Tap Edit or double-tap to rename',
        parentId: 'branch_add',
        color: '#8b5cf6',
        childrenIds: [],
      },
      'branch_nav': {
        id: 'branch_nav',
        text: 'Canvas Navigation',
        parentId: 'root_1',
        color: '#3b82f6',
        childrenIds: ['sub_nav_1', 'sub_nav_2'],
      },
      'sub_nav_1': {
        id: 'sub_nav_1',
        text: 'Drag canvas to pan around',
        parentId: 'branch_nav',
        color: '#3b82f6',
        childrenIds: [],
      },
      'sub_nav_2': {
        id: 'sub_nav_2',
        text: 'Pinch or use +/- to zoom',
        parentId: 'branch_nav',
        color: '#3b82f6',
        childrenIds: [],
      },
      'branch_style': {
        id: 'branch_style',
        text: 'Colors & Styling',
        parentId: 'root_1',
        color: '#10b981',
        childrenIds: ['sub_style_1', 'sub_style_2'],
      },
      'sub_style_1': {
        id: 'sub_style_1',
        text: 'Palette button changes node color',
        parentId: 'branch_style',
        color: '#10b981',
        childrenIds: [],
      },
      'sub_style_2': {
        id: 'sub_style_2',
        text: 'Auto-curved connecting branches',
        parentId: 'branch_style',
        color: '#10b981',
        childrenIds: [],
      },
      'branch_org': {
        id: 'branch_org',
        text: 'Organize & Manage',
        parentId: 'root_1',
        color: '#f59e0b',
        childrenIds: ['sub_org_1', 'sub_org_2'],
      },
      'sub_org_1': {
        id: 'sub_org_1',
        text: 'Tap node to select & highlight',
        parentId: 'branch_org',
        color: '#f59e0b',
        childrenIds: [],
      },
      'sub_org_2': {
        id: 'sub_org_2',
        text: 'Trash button deletes node & branch',
        parentId: 'branch_org',
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
        if (val.includes('(Sample list)') || val.includes('Sample list')) {
          // Remove legacy hardcoded sample list so user gets the new hint placeholder
          const cleaned = val
            .replace(/<div>\(Sample list\)<\/div>/gi, '')
            .replace(/\(Sample list\)/gi, '')
            .replace(/<div>• Buy fresh vegetables &amp; milk<\/div>/gi, '')
            .replace(/<div>• Buy fresh vegetables & milk<\/div>/gi, '')
            .replace(/<div>• Call plumber for kitchen sink leak<\/div>/gi, '')
            .replace(/<div>• Pay electricity &amp; wifi bill<\/div>/gi, '')
            .replace(/<div>• Pay electricity & wifi bill<\/div>/gi, '')
            .replace(/<div>• 30 mins evening walk<\/div>/gi, '')
            .replace(/<div>• Car wash &amp; check tire pressure<\/div>/gi, '')
            .replace(/<div>• Car wash & check tire pressure<\/div>/gi, '')
            .replace(/<div>• Book doctor appointment<\/div>/gi, '')
            .replace(/<div>• Pick up dry cleaning<\/div>/gi, '')
            .replace(/<div>• Organize clothes wardrobe<\/div>/gi, '')
            .replace(/<div>• Grocery restock from supermarket<\/div>/gi, '')
            .replace(/<div>• Settle credit card bill<\/div>/gi, '')
            .replace(/<div>• Vehicle servicing &amp; oil change<\/div>/gi, '')
            .replace(/<div>• Vehicle servicing & oil change<\/div>/gi, '')
            .replace(/<div>• Deep clean house &amp; balcony<\/div>/gi, '')
            .replace(/<div>• Deep clean house & balcony<\/div>/gi, '')
            .replace(/<div>• Review monthly family expenses<\/div>/gi, '')
            .replace(/<div>• Family vacation trip<\/div>/gi, '')
            .replace(/<div>• Save emergency fund target<\/div>/gi, '')
            .replace(/<div>• Complete health checkup<\/div>/gi, '');
          const plain = cleaned.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim();
          migrated[k] = plain ? cleaned.trim() : '';
          changed = true;
        } else if (val.includes('\n') && !val.includes('<div>') && !val.includes('<p>')) {
          migrated[k] = val
            .split('\n')
            .filter(line => line.length > 0)
            .map(line => `<div>${line}</div>`)
            .join('');
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
    const list = this.get<AppEvent[]>(STORAGE_KEYS.EVENTS, DEFAULT_EVENTS);
    const cleaned = list.filter(e => 
      e.id !== 'e1' && e.id !== 'e2' && e.id !== 'e3' &&
      !e.title.includes('Client Strategy Review') && 
      !e.title.includes('Vehicle Maintenance Service') && 
      !e.title.includes('Past Project Retrospective')
    );
    if (cleaned.length !== list.length) {
      this.saveEvents(cleaned);
    }
    return cleaned;
  },
  saveEvents(events: AppEvent[]): void {
    this.set(STORAGE_KEYS.EVENTS, events);
  },

  // Finance Accounts
  getFinanceAccounts(): FinanceAccount[] {
    const accounts = this.get<FinanceAccount[]>(STORAGE_KEYS.FINANCE_ACCOUNTS, DEFAULT_ACCOUNTS);
    const cleaned = accounts.filter(a => 
      a.name !== 'Person 1' && a.name !== 'Investment' && a.name !== 'Cash Savings' &&
      a.name !== 'Rahul Sharma' && a.name !== 'Amit Verma' && a.name !== 'Priya Nair'
    );
    if (cleaned.length !== accounts.length) {
      this.saveFinanceAccounts(cleaned);
    }
    return cleaned;
  },
  saveFinanceAccounts(accounts: FinanceAccount[]): void {
    this.set(STORAGE_KEYS.FINANCE_ACCOUNTS, accounts);
  },

  // Finance Transactions
  getFinance(): FinanceRecord[] {
    const list = this.get<FinanceRecord[]>(STORAGE_KEYS.FINANCE, DEFAULT_FINANCE);
    const cleaned = list.filter(item => 
      item.id !== 'f1' && item.id !== 'f2' && item.id !== 'f3' &&
      item.personName !== 'Person 1' && item.personName !== 'Investment' && item.personName !== 'Cash Savings' &&
      item.personName !== 'Rahul Sharma' && item.personName !== 'Amit Verma' && item.personName !== 'Priya Nair' &&
      item.amount > 0
    );
    if (cleaned.length !== list.length) {
      this.saveFinance(cleaned);
    }
    return cleaned;
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
    const list = this.get<Note[]>(STORAGE_KEYS.NOTES, DEFAULT_NOTES);
    const hasOldSamples = list.some(n => n.id === 'n1' || n.id === 'n2' || n.title === 'Product Architecture Outline' || n.title === 'Weekly Focus & Routine');
    if (hasOldSamples) {
      const userNotes = list.filter(n => n.id !== 'n1' && n.id !== 'n2' && n.title !== 'Product Architecture Outline' && n.title !== 'Weekly Focus & Routine');
      const updated = [DEFAULT_NOTES[0], ...userNotes];
      this.saveNotes(updated);
      return updated;
    }
    return list;
  },
  saveNotes(notes: Note[]): void {
    this.set(STORAGE_KEYS.NOTES, notes);
  },

  // Mind Maps
  getMindMaps(): MindMap[] {
    const list = this.get<MindMap[]>(STORAGE_KEYS.MINDMAPS, DEFAULT_MINDMAPS);
    const hasOldSample = list.some(m => m.title === 'Product Strategy & Launch' || m.id === 'mm_sample_1');
    if (hasOldSample) {
      const userMaps = list.filter(m => m.title !== 'Product Strategy & Launch' && m.id !== 'mm_sample_1');
      const updated = [DEFAULT_MINDMAPS[0], ...userMaps];
      this.saveMindMaps(updated);
      return updated;
    }
    return list;
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
    const settings = this.getSettings();
    if (settings.autoBackupEnabled === false) return;

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
