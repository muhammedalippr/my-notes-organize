import React, { useState, useEffect } from 'react';
import { ShoppingItem, SmartSuggestion } from '../../types';
import { 
  searchSmartSuggestions, 
  COMMON_SHOPPING_ITEMS 
} from '../../services/itemDetector';
import { StorageService } from '../../services/storage';
import { backButtonService } from '../../services/soundService';
import { X, Plus, Minus, Sparkles, Tag, Clock, ChevronDown } from 'lucide-react';

interface AddShoppingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: { name: string; quantity: number; unit?: string }) => void;
  initialItem?: ShoppingItem | null;
}

const UNIT_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'nos', label: 'Nos' },
  { id: 'g', label: 'G' },
  { id: 'kg', label: 'Kg' },
  { id: 'ml', label: 'ml' },
  { id: 'litre', label: 'L' },
];

export const AddShoppingModal: React.FC<AddShoppingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem = null,
}) => {
  const [name, setName] = useState(initialItem ? initialItem.name : '');
  const [quantity, setQuantity] = useState<number>(initialItem ? initialItem.quantity : 1);
  const [unit, setUnit] = useState<string>(initialItem?.unit || 'none');
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isRecentView, setIsRecentView] = useState(false);
  const [isUnitSelectorOpen, setIsUnitSelectorOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const unregister = backButtonService.register('add-shopping-modal', () => {
      onClose();
      return true;
    }, 100);
    return unregister;
  }, [isOpen, onClose]);

  // Helper to load suggestions (recent items first if empty)
  const loadSuggestionsForInput = (val: string) => {
    const recent = StorageService.getRecentShoppingItems();
    const historyMap = new Map(recent.map(r => [r.name.toLowerCase(), { qty: r.quantity, unit: r.unit }]));

    if (val.trim().length > 0) {
      setIsRecentView(false);
      const matches = searchSmartSuggestions(val);
      // If user had a last used quantity/unit for this item, use it!
      const mapped = matches.map(m => {
        const last = historyMap.get(m.name.toLowerCase());
        return last !== undefined ? { ...m, defaultQuantity: last.qty, defaultUnit: last.unit || '' } : m;
      });
      setSuggestions(mapped);
    } else {
      // If textbox is empty, show recent items first
      if (recent.length > 0) {
        setIsRecentView(true);
        const recentSuggestions: SmartSuggestion[] = recent.slice(0, 8).map(r => ({
          name: r.name,
          defaultQuantity: r.quantity,
          defaultUnit: r.unit || '',
          category: 'Recent'
        }));
        setSuggestions(recentSuggestions);
      } else {
        setIsRecentView(false);
        setSuggestions(COMMON_SHOPPING_ITEMS.slice(0, 6));
      }
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    loadSuggestionsForInput(val);
  };

  React.useLayoutEffect(() => {
    if (isOpen) {
      if (initialItem) {
        setName(initialItem.name);
        setQuantity(initialItem.quantity);
        setUnit(initialItem.unit || 'none');
        setSuggestions([]);
        setIsRecentView(false);
      } else {
        setName('');
        setQuantity(1);
        setUnit('none');
        loadSuggestionsForInput('');
      }
      setIsUnitSelectorOpen(false);
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSelectSuggestion = (s: SmartSuggestion) => {
    setName(s.name);
    setQuantity(s.defaultQuantity);
    if (s.defaultUnit) {
      const match = UNIT_OPTIONS.find(u => u.id === s.defaultUnit || u.label === s.defaultUnit);
      if (match) setUnit(match.id);
    }
    setSuggestions([]);
  };

  // Stepper ladder points defined by user
  const STEP_LADDER = [
    0.1, 0.2, 0.25, 0.5, 0.75,
    1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 4.5, 5,
    5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    25, 50, 100, 200, 250, 500, 750, 1000
  ];

  const handleIncrement = () => {
    setQuantity(prev => {
      const current = Number(prev) || 0;
      const next = STEP_LADDER.find(val => val > current + 0.001);
      if (next !== undefined) return next;
      return +(current + 1).toFixed(3);
    });
  };

  const handleDecrement = () => {
    setQuantity(prev => {
      const current = Number(prev) || 0;
      const prevSteps = STEP_LADDER.filter(val => val < current - 0.001);
      if (prevSteps.length > 0) {
        return prevSteps[prevSteps.length - 1];
      }
      return 1;
    });
  };

  const setQuickAmount = (qty: number) => {
    setQuantity(qty);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      quantity: Number(quantity) || 1,
      unit: unit === 'none' ? undefined : unit,
    });

    setName('');
    setQuantity(1);
    setUnit('none');
    setSuggestions([]);
    onClose();
  };

  // Helper to format quantity display string cleanly without trailing 0s
  const formatQuantityDisplay = (qty: number): string => {
    if (isNaN(qty)) return '';
    if (Number.isInteger(qty)) return qty.toString();
    return parseFloat(qty.toFixed(3)).toString();
  };

  const activeUnitLabel = UNIT_OPTIONS.find(u => u.id === unit)?.label || 'None';

  return (
    <div className="modal-overlay flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-soft)]">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#ff5e1a]" />
            <h3 className="text-base font-black text-[var(--text-primary)]">
              {initialItem ? 'Edit Item' : 'Add Item'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Item Name Input */}
          <div>
            <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Item Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Tomato, Milk, Eggs, Rice, Soap, Washing powder..."
              className="w-full bg-[var(--bg-main)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-soft)] focus:border-[#ff5e1a]/50 outline-none text-sm font-bold transition-all"
            />

            {/* Smart Auto-fill suggestions & Recents */}
            {suggestions.length > 0 && (
              <div className="mt-2.5">
                <div className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1 mb-1.5">
                  {isRecentView ? (
                    <>
                      <Clock className="w-3 h-3 text-[#ff5e1a]" />
                      <span>Recent Items (Tap to add)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-[#ff5e1a]" />
                      <span>Suggestions</span>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="px-3 py-1.5 rounded-xl bg-[var(--bg-main)] hover:border-[#ff5e1a] border border-[var(--border-soft)] text-[var(--text-primary)] text-xs font-bold transition-all inline-flex items-center gap-1.5 active:scale-95 whitespace-normal text-left max-w-full"
                    >
                      <span className="break-words">{s.name}</span>
                      {s.defaultQuantity !== undefined && (
                        <span className="text-[10px] font-black text-[#ff5e1a] shrink-0 bg-[#ff5e1a]/10 px-1.5 py-0.5 rounded-md">
                          {s.defaultQuantity} {s.defaultUnit ? s.defaultUnit : ''}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity Header with Unit Dropdown on Opposite Side */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between relative">
              <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">
                Quantity
              </label>

              {/* Unit Dropdown Trigger (Opposite side of Quantity) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUnitSelectorOpen(!isUnitSelectorOpen)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 ${
                    unit !== 'none'
                      ? 'bg-[#ff5e1a]/15 border-[#ff5e1a] text-[#ff5e1a]'
                      : 'bg-[var(--bg-main)] border-[var(--border-soft)] text-[var(--text-primary)] hover:border-[#ff5e1a]/50'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Unit:</span>
                  <span>{activeUnitLabel}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isUnitSelectorOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Popout Dropdown Menu */}
                {isUnitSelectorOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-36 p-1.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-soft)] shadow-2xl z-50 grid grid-cols-2 gap-1 animate-in fade-in zoom-in-95 duration-100">
                    {UNIT_OPTIONS.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setUnit(u.id);
                          setIsUnitSelectorOpen(false);
                        }}
                        className={`py-2 px-1 rounded-xl text-xs font-black transition-all text-center ${
                          unit === u.id
                            ? 'bg-[#ff5e1a] text-white shadow-sm'
                            : 'bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-soft)] hover:border-[#ff5e1a]/50'
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Row 1: Standard quantities */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {[1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setQuickAmount(val)}
                  className={`flex-1 min-w-[36px] py-1.5 px-2 rounded-xl text-xs font-black border transition-all text-center shrink-0 ${
                    Math.abs(quantity - val) < 0.001
                      ? 'bg-[#ff5e1a] text-white border-[#ff5e1a]'
                      : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-soft)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>

            {/* Row 2: Sub quantities */}
            <div className="grid grid-cols-5 gap-1.5">
              {[100, 200, 250, 500, 750].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setQuickAmount(val)}
                  className={`py-1.5 rounded-xl text-xs font-black border transition-all text-center ${
                    Math.abs(quantity - val) < 0.001
                      ? 'bg-[#ff5e1a] text-white border-[#ff5e1a]'
                      : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-soft)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Volume / Stepper Controller */}
          <div className="pt-1">
            <div className="flex items-center gap-2 bg-[var(--bg-main)] p-2 rounded-2xl border border-[var(--border-soft)]">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] hover:bg-[#ff5e1a] hover:text-white flex items-center justify-center text-[var(--text-primary)] transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="text"
                inputMode="decimal"
                value={formatQuantityDisplay(quantity)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setQuantity(isNaN(val) ? 0 : val);
                }}
                className="w-full bg-transparent text-center text-lg font-black text-[var(--text-primary)] outline-none"
              />
              <button
                type="button"
                onClick={handleIncrement}
                className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] hover:bg-[#ff5e1a] hover:text-white flex items-center justify-center text-[var(--text-primary)] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-[#ff5e1a] text-white font-black text-sm shadow-lg shadow-[#ff5e1a]/30 hover:bg-[#e54c09] active:scale-[0.98] transition-all"
            >
              {initialItem ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
