export type HorizonType = 'today' | 'tomorrow' | 'this_week' | 'this_month' | 'this_year';

export interface HorizonEntry {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface HorizonData {
  today: string;
  tomorrow: string;
  this_week: string;
  this_month: string;
  this_year: string;
}

export type MatrixQuadrant = 
  | 'important_urgent'       // Quadrant 1: Do First
  | 'important_not_urgent'   // Quadrant 2: Schedule
  | 'urgent_not_important'   // Quadrant 3: Delegate
  | 'not_important_not_urgent'; // Quadrant 4: Eliminate

export interface MatrixData {
  important_urgent: string;
  important_not_urgent: string;
  urgent_not_important: string;
  not_important_not_urgent: string;
}

export interface MatrixTask {
  id: string;
  title: string;
  quadrant: MatrixQuadrant;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  notes?: string;
}

export type MarketType = 'local' | 'city' | 'other';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  market: 'local' | 'city' | 'other';
  completed: boolean;
  createdAt: string;
  estimatedPrice?: number;
  category?: string;
}

export type ReminderOption = 'prev_night_9pm' | 'morning_7am' | '1hr_before' | '30min_before' | 'on_time';
export type EventRepeatType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface AppEvent {
  id: string;
  title: string;
  dateTime: string; // ISO format: YYYY-MM-DDTHH:mm
  category: string;
  location?: string;
  reminderMinutesBefore: number; // legacy support
  reminders?: ReminderOption[]; // multi-select reminders: prev_night_9pm, morning_7am, 1hr_before, 30min_before, on_time
  repeat?: EventRepeatType; // 'none' | 'daily' | 'weekly' | 'monthly'
  notes?: string;
  createdAt: string;
}

export type FinanceDirection = 'gave' | 'received'; // 'gave' = Lent (To Receive), 'received' = Borrowed (To Pay)

export interface FinanceAccount {
  id: string;
  name: string;
  contact?: string;
  notes?: string;
  createdAt: string;
}

export interface FinanceRecord {
  id: string;
  personName: string;
  amount: number;
  direction: FinanceDirection;
  date: string;
  dueDate?: string;
  status: 'pending' | 'settled';
  notes?: string;
  createdAt: string;
  settledAt?: string;
}

export interface NoteCategory {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  categoryId: string; // 'general' or custom category ID
  isPinned: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface MindMapNode {
  id: string;
  text: string;
  parentId: string | null;
  color?: string; // e.g. '#ff5e1a', '#8b5cf6', '#3b82f6', '#10b981', '#f43f5e', '#f59e0b'
  childrenIds: string[];
}

export interface MindMap {
  id: string;
  title: string;
  rootNodeId: string;
  nodes: Record<string, MindMapNode>;
  createdAt: string;
  updatedAt: string;
}

export type ModuleKey = 
  | 'horizon_todo' 
  | 'eisenhower' 
  | 'shopping' 
  | 'events' 
  | 'finance' 
  | 'notes'
  | 'mindmap';

export type ActiveView = 'home' | ModuleKey | 'settings';

export type AlertSoundType = 
  | 'chime' 
  | 'digital' 
  | 'celeste'
  | 'multi_alarm'
  | 'long_30s_alarm'
  | 'long_30s_melody'
  | 'long_30s_marimba'
  | 'custom';

export interface AppSettings {
  enabledModules: Record<ModuleKey, boolean>;
  theme: 'system' | 'dark' | 'light' | 'amoled';
  currencySymbol: string;
  todayReminder: {
    enabled: boolean;
    time: string; // e.g. "20:00"
  };
  eventAlarmsEnabled: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  alarmSound?: AlertSoundType;
  todoAlertSound?: AlertSoundType;
  autoBackupEnabled?: boolean;
  customSoundData?: string; // Base64 audio URI for custom storage sound
  customSoundName?: string;
}

export interface SmartSuggestion {
  name: string;
  defaultUnit: string;
  defaultQuantity: number;
  category: string;
}
