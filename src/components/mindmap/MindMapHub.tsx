import React, { useState } from 'react';
import { MindMap } from '../../types';
import { StorageService } from '../../services/storage';
import { soundService } from '../../services/soundService';
import { MindMapEditor } from './MindMapEditor';
import { ConfirmModal } from '../common/ConfirmModal';
import { Plus, Trash2, Network, Calendar } from 'lucide-react';

interface MindMapHubProps {
  onEditorStateChange?: (isOpen: boolean) => void;
}

export const MindMapHub: React.FC<MindMapHubProps> = ({ onEditorStateChange }) => {
  const [mindmaps, setMindmaps] = useState<MindMap[]>(StorageService.getMindMaps());
  const [activeMindMap, setActiveMindMap] = useState<MindMap | null>(null);
  const [mapToDelete, setMapToDelete] = useState<MindMap | null>(null);

  const openMap = (mm: MindMap) => {
    setActiveMindMap(mm);
    onEditorStateChange?.(true);
  };

  const closeMap = () => {
    setActiveMindMap(null);
    onEditorStateChange?.(false);
  };

  const saveMindMaps = (updated: MindMap[]) => {
    setMindmaps(updated);
    StorageService.saveMindMaps(updated);
  };

  const handleCreateNew = () => {
    soundService.triggerHaptic(20);
    const newId = 'mm_' + Date.now();
    const rootId = 'root_' + Date.now();

    const newMap: MindMap = {
      id: newId,
      title: 'New Mind Map',
      rootNodeId: rootId,
      nodes: {
        [rootId]: {
          id: rootId,
          text: 'Central Theme',
          parentId: null,
          color: '#ff5e1a',
          childrenIds: [],
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newMap, ...mindmaps];
    saveMindMaps(updated);
    openMap(newMap);
  };

  const handleSaveMap = (updatedMap: MindMap) => {
    const updated = mindmaps.map(m => m.id === updatedMap.id ? updatedMap : m);
    saveMindMaps(updated);
    setActiveMindMap(updatedMap);
  };

  const executeDelete = () => {
    if (!mapToDelete) return;
    soundService.triggerHaptic(20);
    const updated = mindmaps.filter(m => m.id !== mapToDelete.id);
    saveMindMaps(updated);
    setMapToDelete(null);
    if (activeMindMap?.id === mapToDelete.id) {
      closeMap();
    }
  };

  if (activeMindMap) {
    return (
      <MindMapEditor
        mindmap={activeMindMap}
        onBack={closeMap}
        onSave={handleSaveMap}
      />
    );
  }

  return (
    <div className="space-y-4 pb-24 relative font-sans">
      {/* List Grid */}
      {mindmaps.length === 0 ? (
        <div className="neo-card p-12 text-center space-y-3">
          <Network className="w-10 h-10 text-[var(--text-secondary)] mx-auto opacity-40" />
          <h3 className="text-base font-black text-[var(--text-primary)]">No Mind Maps Yet</h3>
          <p className="text-xs font-bold text-[var(--text-secondary)]">
            Tap + below to brainstorm your first interactive mind map
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {mindmaps.map((mm) => {
            const nodeCount = Object.keys(mm.nodes || {}).length;
            const rootNode = mm.nodes[mm.rootNodeId];
            const branchCount = rootNode ? rootNode.childrenIds.length : 0;

            return (
              <div
                key={mm.id}
                onClick={() => {
                  soundService.triggerHaptic(15);
                  openMap(mm);
                }}
                className="neo-card p-5 cursor-pointer hover:border-[#ff5e1a]/40 flex flex-col justify-between min-h-[140px] group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black text-[var(--text-secondary)] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(mm.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMapToDelete(mm);
                      }}
                      title="Delete Mind Map"
                      className="p-1.5 text-[var(--text-secondary)] hover:text-rose-500 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-black text-[var(--text-primary)] leading-snug group-hover:text-[#ff5e1a] transition-colors">
                    {mm.title}
                  </h3>

                  <p className="text-xs font-bold text-[var(--text-secondary)] mt-1 line-clamp-1">
                    Central Idea: <span className="text-[var(--text-primary)]">{rootNode?.text || 'Untitled'}</span>
                  </p>
                </div>

                {/* Badges footer */}
                <div className="pt-3 mt-2 border-t border-[var(--border-soft)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-[#ff5e1a]/15 text-[#ff5e1a] text-[10px] font-black">
                      {nodeCount} {nodeCount === 1 ? 'Node' : 'Nodes'}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-soft)] text-[var(--text-secondary)] text-[10px] font-bold">
                      {branchCount} {branchCount === 1 ? 'Branch' : 'Branches'}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-[#ff5e1a] group-hover:translate-x-1 transition-transform">
                    Open →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Create FAB */}
      <div className="fixed bottom-6 left-0 right-0 max-w-4xl mx-auto px-5 pointer-events-none flex justify-end z-30">
        <button
          onClick={handleCreateNew}
          className="neo-btn-orange pointer-events-auto px-6 py-3.5 flex items-center gap-2 text-sm font-black shadow-2xl active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>New Mind Map</span>
        </button>
      </div>

      {/* Confirmation Modal for deleting mind map */}
      <ConfirmModal
        isOpen={!!mapToDelete}
        title="Delete Mind Map"
        message={`Are you sure you want to delete "${mapToDelete?.title || 'this mind map'}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={executeDelete}
        onCancel={() => setMapToDelete(null)}
      />
    </div>
  );
};
