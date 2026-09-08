import React, { useState, useEffect } from 'react';
import { FinanceRecord } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { backButtonService, soundService } from '../../services/soundService';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Trash2, Plus } from 'lucide-react';

interface PersonHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  personName: string;
  records: FinanceRecord[];
  currencySymbol: string;
  onDeleteRecord: (id: string) => void;
  onEditRecord: (record: FinanceRecord) => void;
  onAddNewForPerson: (personName: string) => void;
}

export const PersonHistoryModal: React.FC<PersonHistoryModalProps> = ({
  isOpen,
  onClose,
  personName,
  records,
  currencySymbol,
  onDeleteRecord,
  onEditRecord,
  onAddNewForPerson,
}) => {
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  React.useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [isOpen, personName]);

  useEffect(() => {
    if (!isOpen) return;
    const unregister = backButtonService.register('person-history-modal', () => {
      // If inner delete modal is open, let ConfirmModal handle it
      if (recordToDelete) {
        setRecordToDelete(null);
        return true;
      }
      onClose();
      return true;
    }, 90);
    return unregister;
  }, [isOpen, onClose, recordToDelete]);

  if (!isOpen) return null;

  // Filter records for this person
  const personRecords = records
    .filter(r => r.personName.toLowerCase() === personName.toLowerCase())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalGave = personRecords.filter(r => r.direction === 'gave').reduce((sum, r) => sum + r.amount, 0);
  const totalReceived = personRecords.filter(r => r.direction === 'received').reduce((sum, r) => sum + r.amount, 0);
  const net = totalGave - totalReceived;

  return (
    <div className="w-full h-full min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col font-sans">
      {/* Top Header Bar matching Header.tsx */}
      <header className="sticky top-0 z-30 bg-[var(--bg-main)]/90 backdrop-blur-2xl px-5 pt-3 pb-3.5 safe-top transition-all border-b border-[var(--border-soft)] shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundService.triggerHaptic(15);
                onClose();
              }}
              aria-label="Back"
              className="neo-pill w-10 h-10 flex items-center justify-center text-[var(--text-primary)] hover:border-[#ff5e1a]/40 transition-all active:scale-90 shrink-0"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5] text-[#ff5e1a] -ml-0.5" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
                {personName}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Full-Screen Content Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 pt-2 md:p-6 space-y-4 overflow-y-auto pb-28">
        {/* 1. Flattened Summary Bar without card */}
        <div className="grid grid-cols-3 divide-x divide-[var(--border-soft)] py-2">
          <div className="px-2 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#10b981] block mb-1">
              To Receive
            </span>
            <div className="text-base sm:text-lg font-black text-[#10b981] truncate">
              {currencySymbol}{totalGave.toLocaleString()}
            </div>
          </div>

          <div className="px-2 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#ef4444] block mb-1">
              To Return
            </span>
            <div className="text-base sm:text-lg font-black text-[#ef4444] truncate">
              {currencySymbol}{totalReceived.toLocaleString()}
            </div>
          </div>

          <div className="px-2 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)] block mb-1">
              Net Balance
            </span>
            <div className="text-base sm:text-lg font-black text-[var(--text-primary)] truncate">
              {net > 0 ? `+${currencySymbol}${net.toLocaleString()}` : net < 0 ? `-${currencySymbol}${Math.abs(net).toLocaleString()}` : `${currencySymbol}0`}
            </div>
          </div>
        </div>

        {/* 2. Transactions Feed */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">
              Transactions ({personRecords.length})
            </h3>
          </div>

          {personRecords.length === 0 ? (
            <div className="neo-card !rounded-2xl p-8 text-center space-y-2">
              <p className="text-xs font-bold text-[var(--text-secondary)]">No transactions recorded yet</p>
            </div>
          ) : (
            personRecords.map((record) => {
              const isGave = record.direction === 'gave';
              return (
                <div
                  key={record.id}
                  onClick={() => {
                    soundService.triggerHaptic(15);
                    onEditRecord(record);
                  }}
                  className="neo-card !rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-[#ff5e1a]/40 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isGave ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#ef4444]/15 text-[#ef4444]'
                    }`}>
                      {isGave ? <ArrowUpRight className="w-5 h-5 stroke-[2.5]" /> : <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-[var(--text-primary)] truncate">
                        {record.notes?.trim() ? record.notes : (isGave ? 'Gave' : 'Received')}
                      </h4>
                      <span className="text-[11px] font-bold text-[var(--text-secondary)] block mt-0.5">
                        {record.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-base font-black ${isGave ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {isGave ? '+' : '-'}{currencySymbol}{record.amount.toLocaleString()}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundService.triggerHaptic(15);
                        setRecordToDelete(record.id);
                      }}
                      className="p-2 text-[var(--text-secondary)] hover:text-rose-500 rounded-xl hover:bg-[var(--bg-main)] transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-0 right-0 max-w-4xl mx-auto px-5 pointer-events-none flex items-center justify-end z-30">
        <button
          type="button"
          onClick={() => {
            soundService.triggerHaptic(20);
            onAddNewForPerson(personName);
          }}
          className="neo-btn-orange pointer-events-auto px-6 py-3.5 flex items-center gap-2 text-sm font-black shadow-2xl active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Custom Confirmation Popup */}
      <ConfirmModal
        isOpen={!!recordToDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this finance entry?"
        onConfirm={() => {
          if (recordToDelete) {
            onDeleteRecord(recordToDelete);
            setRecordToDelete(null);
          }
        }}
        onCancel={() => setRecordToDelete(null)}
      />
    </div>
  );
};
