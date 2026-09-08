import React, { useState, useEffect } from 'react';
import { FinanceRecord, FinanceAccount, AppSettings } from '../../types';
import { StorageService } from '../../services/storage';
import { soundService } from '../../services/soundService';
import { AddFinanceModal } from './AddFinanceModal';
import { AddAccountModal } from './AddAccountModal';
import { PersonHistoryModal } from './PersonHistoryModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { ArrowUpRight, ArrowDownLeft, Plus, ChevronRight, User, Trash2, UserPlus } from 'lucide-react';

interface CashManagerProps {
  settings: AppSettings;
  onEditorStateChange?: (active: boolean) => void;
}

interface PersonSummary {
  personName: string;
  totalGave: number;
  totalReceived: number;
  netAmount: number;
  transactionCount: number;
  lastDate: string;
}

export const CashManager: React.FC<CashManagerProps> = ({ settings, onEditorStateChange }) => {
  const [accounts, setAccounts] = useState<FinanceAccount[]>(() => StorageService.getFinanceAccounts());
  const [records, setRecords] = useState<FinanceRecord[]>(() => StorageService.getFinance());
  const [filter, setFilter] = useState<'all' | 'gave' | 'received'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [activePersonName, setActivePersonName] = useState<string | null>(null);
  const [prefilledPersonName, setPrefilledPersonName] = useState<string>('');
  const [personToDelete, setPersonToDelete] = useState<string | null>(null);

  const currency = settings.currencySymbol || '₹';

  const saveAccounts = (updated: FinanceAccount[]) => {
    setAccounts(updated);
    StorageService.saveFinanceAccounts(updated);
  };

  const saveRecords = (updated: FinanceRecord[]) => {
    setRecords(updated);
    StorageService.saveFinance(updated);
  };

  const handleOpenPerson = (name: string) => {
    soundService.triggerHaptic(15);
    setActivePersonName(name);
    onEditorStateChange?.(true);
  };

  const handleClosePerson = () => {
    soundService.triggerHaptic(15);
    setActivePersonName(null);
    onEditorStateChange?.(false);
  };

  const handleSaveRecord = (
    newRecord: Omit<FinanceRecord, 'id' | 'createdAt' | 'status'>,
    editId?: string
  ) => {
    const pName = newRecord.personName.trim();
    if (pName && !accounts.some(a => a.name.toLowerCase() === pName.toLowerCase())) {
      const newAcc: FinanceAccount = {
        id: 'acc_' + Date.now(),
        name: pName,
        createdAt: new Date().toISOString(),
      };
      saveAccounts([newAcc, ...accounts]);
    }

    if (editId) {
      const updated = records.map(r => r.id === editId ? { ...r, ...newRecord } : r);
      saveRecords(updated);
      setEditingRecord(null);
    } else {
      const record: FinanceRecord = {
        ...newRecord,
        id: 'fin_' + Date.now(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      saveRecords([record, ...records]);
    }
    soundService.triggerHaptic(20);
  };

  const handleAddAccount = (personName: string, contact?: string, notes?: string) => {
    const trimmed = personName.trim();
    if (!trimmed) return;
    const exists = accounts.some(a => a.name.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      const newAcc: FinanceAccount = {
        id: 'acc_' + Date.now(),
        name: trimmed,
        contact: contact?.trim(),
        notes: notes?.trim(),
        createdAt: new Date().toISOString(),
      };
      saveAccounts([newAcc, ...accounts]);
    }
    soundService.triggerHaptic(20);
  };

  const handleDeleteRecord = (id: string) => {
    soundService.triggerHaptic(20);
    const updated = records.filter(r => r.id !== id);
    saveRecords(updated);
  };

  const handleDeletePerson = (name: string) => {
    soundService.triggerHaptic(20);
    const updatedAccounts = accounts.filter(a => a.name.toLowerCase() !== name.toLowerCase());
    saveAccounts(updatedAccounts);
    const updatedRecords = records.filter(r => r.personName.toLowerCase() !== name.toLowerCase());
    saveRecords(updatedRecords);
    if (activePersonName?.toLowerCase() === name.toLowerCase()) {
      handleClosePerson();
    }
    setPersonToDelete(null);
  };

  // Group transactions by person, preserving registered accounts even with 0 transactions
  const personMap = new Map<string, PersonSummary>();

  accounts.forEach(acc => {
    const key = acc.name.trim();
    if (!key) return;
    personMap.set(key.toLowerCase(), {
      personName: key,
      totalGave: 0,
      totalReceived: 0,
      netAmount: 0,
      transactionCount: 0,
      lastDate: acc.createdAt.slice(0, 10),
    });
  });

  records.forEach(r => {
    const key = r.personName.trim();
    if (!key) return;

    const existing = personMap.get(key.toLowerCase()) || {
      personName: key,
      totalGave: 0,
      totalReceived: 0,
      netAmount: 0,
      transactionCount: 0,
      lastDate: r.date,
    };

    if (r.direction === 'gave') {
      existing.totalGave += r.amount;
    } else {
      existing.totalReceived += r.amount;
    }

    existing.netAmount = existing.totalGave - existing.totalReceived;
    if (r.amount > 0) {
      existing.transactionCount += 1;
    }
    if (new Date(r.date).getTime() > new Date(existing.lastDate).getTime()) {
      existing.lastDate = r.date;
    }

    personMap.set(key.toLowerCase(), existing);
  });

  const peopleList: PersonSummary[] = Array.from(personMap.values());

  // Global calculations
  const totalToReceive = peopleList.filter(p => p.netAmount > 0).reduce((sum, p) => sum + p.netAmount, 0);
  const totalToReturn = peopleList.filter(p => p.netAmount < 0).reduce((sum, p) => sum + Math.abs(p.netAmount), 0);
  const netBalance = totalToReceive - totalToReturn;

  const filteredPeople = peopleList.filter(p => {
    if (filter === 'gave') return p.netAmount > 0;
    if (filter === 'received') return p.netAmount < 0;
    return true;
  }).sort((a, b) => Math.abs(b.netAmount) - Math.abs(a.netAmount));

  // If viewing a person in full screen mode
  if (activePersonName) {
    return (
      <div className="w-full h-full min-h-screen">
        <PersonHistoryModal
          isOpen={true}
          onClose={handleClosePerson}
          personName={activePersonName}
          records={records}
          currencySymbol={currency}
          onDeleteRecord={handleDeleteRecord}
          onEditRecord={(rec) => {
            setEditingRecord(rec);
            setIsAddModalOpen(true);
          }}
          onAddNewForPerson={(name) => {
            setEditingRecord(null);
            setPrefilledPersonName(name);
            setIsAddModalOpen(true);
          }}
        />

        {/* Add / Edit Finance Modal on top of person view */}
        {isAddModalOpen && (
          <AddFinanceModal
            key={editingRecord ? `edit_${editingRecord.id}` : `new_${prefilledPersonName || ''}_${Date.now()}`}
            isOpen={isAddModalOpen}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingRecord(null);
              setPrefilledPersonName('');
            }}
            onSave={handleSaveRecord}
            currencySymbol={currency}
            initialPersonName={prefilledPersonName}
            editingRecord={editingRecord}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 relative font-sans">
      {/* 1. FLATTENED UNIFIED SUMMARY (NO CARD) */}
      <div className="grid grid-cols-3 divide-x divide-[var(--border-soft)] py-2">
        {/* To Receive */}
        <button
          type="button"
          onClick={() => setFilter(filter === 'gave' ? 'all' : 'gave')}
          className={`px-2 text-center transition-all ${
            filter === 'gave' ? 'scale-105' : 'opacity-85 hover:opacity-100'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-[#10b981] block mb-1">
            To Receive
          </span>
          <div className="text-base sm:text-lg font-black text-[#10b981] truncate">
            {currency}{totalToReceive.toLocaleString()}
          </div>
        </button>

        {/* To Return */}
        <button
          type="button"
          onClick={() => setFilter(filter === 'received' ? 'all' : 'received')}
          className={`px-2 text-center transition-all ${
            filter === 'received' ? 'scale-105' : 'opacity-85 hover:opacity-100'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-[#ef4444] block mb-1">
            To Return
          </span>
          <div className="text-base sm:text-lg font-black text-[#ef4444] truncate">
            {currency}{totalToReturn.toLocaleString()}
          </div>
        </button>

        {/* Net Balance */}
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-2 text-center transition-all ${
            filter === 'all' ? 'scale-105' : 'opacity-85 hover:opacity-100'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)] block mb-1">
            Net Balance
          </span>
          <div className="text-base sm:text-lg font-black text-[var(--text-primary)] truncate">
            {netBalance >= 0 ? '+' : '-'}{currency}{Math.abs(netBalance).toLocaleString()}
          </div>
        </button>
      </div>

      {/* 2. PERSON-BASED FINANCE LIST */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">
            Accounts ({filteredPeople.length})
          </h3>
        </div>

        {filteredPeople.length === 0 ? (
          <div className="neo-card !rounded-2xl p-8 text-center space-y-2">
            <User className="w-8 h-8 text-[var(--text-secondary)] mx-auto opacity-40" />
            <p className="text-xs font-bold text-[var(--text-secondary)]">No accounts recorded yet</p>
          </div>
        ) : (
          filteredPeople.map((person) => {
            const isToReceive = person.netAmount > 0;
            const isToReturn = person.netAmount < 0;

            return (
              <div
                key={person.personName}
                onClick={() => handleOpenPerson(person.personName)}
                className="neo-card !rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-[#ff5e1a]/40 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isToReceive 
                      ? 'bg-[#10b981]/15 text-[#10b981]' 
                      : isToReturn 
                        ? 'bg-[#ef4444]/15 text-[#ef4444]' 
                        : 'bg-[var(--bg-main)] text-[var(--text-secondary)]'
                  }`}>
                    {isToReceive ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : isToReturn ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-black text-[var(--text-primary)] truncate block">
                      {person.personName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-base font-black ${
                    isToReceive ? 'text-[#10b981]' : isToReturn ? 'text-[#ef4444]' : 'text-[var(--text-secondary)]'
                  }`}>
                    {isToReceive ? '+' : isToReturn ? '-' : ''}{currency}{Math.abs(person.netAmount).toLocaleString()}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] opacity-60" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. EXTENDED LONG FAB - NEW ACCOUNT */}
      <div className="fixed bottom-6 left-0 right-0 max-w-4xl mx-auto px-5 pointer-events-none flex justify-end z-30">
        <button
          onClick={() => {
            soundService.triggerHaptic(15);
            setIsAddAccountModalOpen(true);
          }}
          className="neo-btn-orange pointer-events-auto px-6 py-3.5 flex items-center gap-2 text-sm font-black shadow-2xl active:scale-95 transition-transform"
        >
          <UserPlus className="w-5 h-5 stroke-[2.5]" />
          <span>New Account</span>
        </button>
      </div>

      {/* Add Account Modal */}
      {isAddAccountModalOpen && (
        <AddAccountModal
          isOpen={isAddAccountModalOpen}
          onClose={() => setIsAddAccountModalOpen(false)}
          onSave={handleAddAccount}
        />
      )}

      {/* Add / Edit Finance Modal */}
      {isAddModalOpen && (
        <AddFinanceModal
          key={editingRecord ? `edit_${editingRecord.id}` : `new_${prefilledPersonName || ''}_${Date.now()}`}
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingRecord(null);
            setPrefilledPersonName('');
          }}
          onSave={handleSaveRecord}
          currencySymbol={currency}
          initialPersonName={prefilledPersonName}
          editingRecord={editingRecord}
        />
      )}

      {/* Custom Confirmation Popup for Person Delete */}
      <ConfirmModal
        isOpen={!!personToDelete}
        title="Delete Contact & History"
        message={`Are you sure you want to delete all records for "${personToDelete}"?`}
        onConfirm={() => {
          if (personToDelete) handleDeletePerson(personToDelete);
        }}
        onCancel={() => setPersonToDelete(null)}
      />
    </div>
  );
};
