import React, { useState } from 'react';
import { ShoppingItem } from '../../types';
import { StorageService } from '../../services/storage';
import { soundService } from '../../services/soundService';
import { AddShoppingModal } from './AddShoppingModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  Store, 
  Building2, 
  Package, 
  Plus, 
  Trash2, 
  Check 
} from 'lucide-react';

export const ShoppingList: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>(StorageService.getShopping());
  const [marketFilter, setMarketFilter] = useState<'local' | 'city' | 'other'>('local');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const saveItems = (updated: ShoppingItem[]) => {
    setItems(updated);
    StorageService.saveShopping(updated.map(i => ({ ...i, completed: false })));
  };

  const handleSaveItem = (itemData: { name: string; quantity: number; unit?: string }) => {
    StorageService.recordShoppingHistory(itemData.name, itemData.quantity, itemData.unit);
    if (editingItem) {
      const updated = items.map(item =>
        item.id === editingItem.id ? { ...item, ...itemData } : item
      );
      saveItems(updated);
      setEditingItem(null);
    } else {
      const item: ShoppingItem = {
        ...itemData,
        id: 'shop_' + Date.now(),
        market: marketFilter,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      saveItems([item, ...items]);
    }
    soundService.triggerHaptic(20);
  };

  const toggleItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        soundService.triggerHaptic(30);
      }
      return next;
    });
  };

  const executeDeleteSelected = () => {
    soundService.triggerHaptic(25);
    const updated = items.filter(item => !checkedIds.has(item.id));
    setCheckedIds(new Set());
    saveItems(updated);
    setIsDeleteConfirmOpen(false);
  };

  const handleItemClick = (item: ShoppingItem) => {
    soundService.triggerHaptic(15);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const filteredItems = items.filter(item => item.market === marketFilter);
  const checkedCountInCurrentMarket = filteredItems.filter(i => checkedIds.has(i.id)).length;

  const localCount = items.filter(i => i.market === 'local').length;
  const cityCount = items.filter(i => i.market === 'city').length;
  const otherCount = items.filter(i => i.market === 'other').length;

  const tabs = [
    { key: 'local' as const, label: 'Local', fullLabel: 'Local Market', icon: Store, count: localCount },
    { key: 'city' as const, label: 'City', fullLabel: 'City Market', icon: Building2, count: cityCount },
    { key: 'other' as const, label: 'Others', fullLabel: 'Others', icon: Package, count: otherCount },
  ];

  return (
    <div className="space-y-4 pb-24 relative font-sans">
      {/* 1. THREE-MARKET SELECTOR - Auto-fit Single Line Segmented Pill */}
      <div className="neo-pill p-1.5 flex items-center gap-1 bg-[var(--bg-surface)] w-full overflow-hidden">
        {tabs.map((tab) => {
          const isActive = marketFilter === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                soundService.triggerHaptic(15);
                setMarketFilter(tab.key);
                setCheckedIds(new Set());
              }}
              className={`flex-1 min-w-0 py-2 px-1.5 sm:px-2.5 rounded-full flex items-center justify-center gap-1 sm:gap-1.5 transition-all active:scale-95 ${
                isActive
                  ? 'bg-[#ff5e1a] text-white shadow-md shadow-[#ff5e1a]/25'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] sm:text-xs font-black truncate max-w-full">
                {tab.label}
              </span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                isActive
                  ? 'bg-white/25 text-white'
                  : 'bg-[var(--border-soft)] text-[var(--text-secondary)]'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. SHOPPING ITEMS FEED */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">
            Items ({filteredItems.length})
          </h3>
        </div>

        {filteredItems.length === 0 ? (
          <div className="neo-card !rounded-2xl p-8 text-center space-y-2">
            <Package className="w-8 h-8 text-[var(--text-secondary)] mx-auto opacity-40" />
            <p className="text-xs font-bold text-[var(--text-secondary)]">No items in this market yet</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isChecked = checkedIds.has(item.id);
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="neo-card !rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer transition-all hover:border-[#ff5e1a]/40"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => toggleItem(item.id, e)}
                    className={`w-6 h-6 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
                      isChecked
                        ? 'bg-[#ff5e1a] border-[#ff5e1a] text-white shadow-sm'
                        : 'border-[var(--border-soft)] hover:border-[#ff5e1a]/60 bg-[var(--bg-main)]'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <span className="text-sm font-black truncate text-[var(--text-primary)]">
                    {item.name}
                  </span>
                </div>

                <div className="shrink-0">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full text-[#ff5e1a] bg-[#ff5e1a]/10">
                    {Number.isInteger(item.quantity) ? item.quantity : parseFloat(Number(item.quantity).toFixed(3))}
                    {item.unit && item.unit !== 'none' ? ` ${item.unit === 'litre' ? 'L' : item.unit === 'nos' ? 'Nos' : item.unit === 'g' ? 'G' : item.unit === 'kg' ? 'Kg' : item.unit}` : ''}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. DUAL FLOATING ACTION BUTTON BAR */}
      <div className="fixed bottom-6 left-0 right-0 max-w-4xl mx-auto px-5 pointer-events-none flex items-center justify-between z-30">
        <div>
          {checkedCountInCurrentMarket > 0 && (
            <button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="pointer-events-auto px-5 py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2 text-xs font-black shadow-2xl active:scale-95 transition-transform"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete ({checkedCountInCurrentMarket})</span>
            </button>
          )}
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="neo-btn-orange pointer-events-auto px-6 py-3.5 flex items-center gap-2 text-sm font-black shadow-2xl active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>Add Item</span>
        </button>
      </div>

      {isModalOpen && (
        <AddShoppingModal
          key={editingItem ? `edit_${editingItem.id}` : 'new'}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSaveItem}
          initialItem={editingItem}
        />
      )}

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Delete Selected Items"
        message={`Are you sure you want to delete ${checkedCountInCurrentMarket} selected item${checkedCountInCurrentMarket === 1 ? '' : 's'}?`}
        onConfirm={executeDeleteSelected}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};
