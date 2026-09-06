import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MindMap, MindMapNode } from '../../types';
import { soundService, backButtonService } from '../../services/soundService';
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Check, 
  Palette,
  X,
  Sparkles
} from 'lucide-react';

interface MindMapEditorProps {
  mindmap: MindMap;
  onBack: () => void;
  onSave: (updatedMap: MindMap) => void;
}

const COLOR_PALETTE = [
  { name: 'Orange', color: '#ff5e1a' },
  { name: 'Purple', color: '#8b5cf6' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Emerald', color: '#10b981' },
  { name: 'Rose', color: '#f43f5e' },
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Teal', color: '#14b8a6' },
  { name: 'Indigo', color: '#6366f1' },
];

interface ComputedPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const MindMapEditor: React.FC<MindMapEditorProps> = ({
  mindmap: initialMindmap,
  onBack,
  onSave,
}) => {
  const [mindmap, setMindmap] = useState<MindMap>(initialMindmap);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [title, setTitle] = useState(initialMindmap.title);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSavePromptOpen, setIsSavePromptOpen] = useState(false);

  // Pan & Zoom transform state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const pointerStartPosRef = useRef({ x: 0, y: 0 });
  const dragMovedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update mindmap state & mark dirty
  const updateMindMap = (updated: MindMap) => {
    setMindmap(updated);
    setIsDirty(true);
  };

  const handleDone = () => {
    soundService.triggerHaptic(15);
    onSave(mindmap);
    setIsDirty(false);
    onBack();
  };

  const handleBack = () => {
    soundService.triggerHaptic(15);
    if (isDirty) {
      setIsSavePromptOpen(true);
    } else {
      onBack();
    }
  };

  // Register physical back button listener for Mind Map Editor
  useEffect(() => {
    const unregister = backButtonService.register('mindmap-editor', () => {
      // If color picker is open, close color picker first
      if (isColorPickerOpen) {
        setIsColorPickerOpen(false);
        return true;
      }
      // If prompt is already open, close it
      if (isSavePromptOpen) {
        setIsSavePromptOpen(false);
        return true;
      }
      // If there are unsaved changes, show save/discard prompt
      if (isDirty) {
        setIsSavePromptOpen(true);
        return true;
      }
      // Otherwise cleanly navigate back to mind map list
      onBack();
      return true;
    }, 50);

    return unregister;
  }, [isColorPickerOpen, isSavePromptOpen, isDirty]);

  // 1. Calculate Hierarchical Layout Coordinates
  const layout = useMemo(() => {
    const positions: Record<string, ComputedPosition> = {};
    const rootId = mindmap.rootNodeId;
    const rootNode = mindmap.nodes[rootId];
    if (!rootNode) return positions;

    // Node dimensions
    const NODE_W = 160;
    const NODE_H = 50;
    const HORIZONTAL_GAP = 120;
    const VERTICAL_GAP = 30;

    // Calculate height required for a subtree
    const calculateSubtreeHeight = (nodeId: string): number => {
      const node = mindmap.nodes[nodeId];
      if (!node || node.childrenIds.length === 0) {
        return NODE_H + VERTICAL_GAP;
      }
      let totalH = 0;
      for (const childId of node.childrenIds) {
        totalH += calculateSubtreeHeight(childId);
      }
      return Math.max(NODE_H + VERTICAL_GAP, totalH);
    };

    // Position Right and Left branches
    const children = rootNode.childrenIds;
    const half = Math.ceil(children.length / 2);
    const rightChildren = children.slice(0, half);
    const leftChildren = children.slice(half);

    // Root position at canvas center (0, 0)
    positions[rootId] = { x: 0, y: 0, width: 180, height: 56 };

    // Layout right subtrees
    let currentRightY = -(rightChildren.reduce((acc, cid) => acc + calculateSubtreeHeight(cid), 0)) / 2;
    const layoutBranch = (nodeId: string, currentX: number, startY: number, direction: 1 | -1): number => {
      const node = mindmap.nodes[nodeId];
      if (!node) return startY;

      const subtreeH = calculateSubtreeHeight(nodeId);
      const nodeY = startY + subtreeH / 2 - NODE_H / 2;
      const nodeX = currentX + direction * (NODE_W / 2 + HORIZONTAL_GAP);

      positions[nodeId] = { x: nodeX, y: nodeY, width: NODE_W, height: NODE_H };

      let childY = startY;
      for (const childId of node.childrenIds) {
        childY = layoutBranch(childId, nodeX, childY, direction);
      }

      return startY + subtreeH;
    };

    // Layout Right
    for (const cid of rightChildren) {
      currentRightY = layoutBranch(cid, 0, currentRightY, 1);
    }

    // Layout Left
    let currentLeftY = -(leftChildren.reduce((acc, cid) => acc + calculateSubtreeHeight(cid), 0)) / 2;
    for (const cid of leftChildren) {
      currentLeftY = layoutBranch(cid, 0, currentLeftY, -1);
    }

    return positions;
  }, [mindmap]);

  // Center view on initial mount
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setPan({ x: clientWidth / 2, y: clientHeight / 2 });
    }
  }, []);

  // Multi-touch tracking for pinch-to-zoom and pan
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1);
  const pinchCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pan & Pinch Zoom handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (
      (e.target as HTMLElement).closest('.node-action-popup') ||
      (e.target as HTMLElement).closest('.toolbar-btn') ||
      (e.target as HTMLElement).closest('input') ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('.modal-overlay')
    ) {
      return;
    }

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1) {
      setIsDragging(true);
      dragMovedRef.current = false;
      pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      pinchStartDistRef.current = null;
    } else if (activePointersRef.current.size === 2) {
      dragMovedRef.current = true;
      const points = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      pinchStartDistRef.current = dist > 0 ? dist : 1;
      pinchStartZoomRef.current = zoom;
      pinchCenterRef.current = {
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activePointersRef.current.has(e.pointerId)) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 2 && pinchStartDistRef.current !== null) {
      dragMovedRef.current = true;
      const points = Array.from(activePointersRef.current.values());
      const currentDist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      const ratio = currentDist / pinchStartDistRef.current;
      const targetZoom = Math.min(2.5, Math.max(0.3, pinchStartZoomRef.current * ratio));

      const currentCenter = {
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2,
      };

      setPan(prev => {
        const scaleFactor = targetZoom / zoom;
        return {
          x: currentCenter.x - (currentCenter.x - prev.x) * scaleFactor,
          y: currentCenter.y - (currentCenter.y - prev.y) * scaleFactor,
        };
      });
      setZoom(targetZoom);
    } else if (activePointersRef.current.size === 1 && isDragging) {
      const dist = Math.hypot(e.clientX - pointerStartPosRef.current.x, e.clientY - pointerStartPosRef.current.y);
      if (dist > 4) {
        dragMovedRef.current = true;
      }
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    activePointersRef.current.delete(e.pointerId);

    if (activePointersRef.current.size < 2) {
      pinchStartDistRef.current = null;
    }
    if (activePointersRef.current.size === 0) {
      setIsDragging(false);
    } else if (activePointersRef.current.size === 1) {
      const remaining = Array.from(activePointersRef.current.values())[0];
      pointerStartPosRef.current = { x: remaining.x, y: remaining.y };
      dragStartRef.current = { x: remaining.x - pan.x, y: remaining.y - pan.y };
    }
  };

  // Node Click: Toggle Selection & Popup Actions
  const handleSelectNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (dragMovedRef.current) return;

    soundService.triggerHaptic(15);
    // If clicking same node, keep open; if clicking another, switch to it
    setSelectedNodeId(id);
    setIsColorPickerOpen(false);
  };

  // Click on background canvas deselects popup
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (dragMovedRef.current) return;
    if ((e.target as HTMLElement).closest('.mindmap-node') || (e.target as HTMLElement).closest('.node-action-popup')) {
      return;
    }
    setSelectedNodeId(null);
    setIsColorPickerOpen(false);
  };

  const startEditNode = (id: string, text: string) => {
    if (dragMovedRef.current) return;
    soundService.triggerHaptic(15);
    setEditingNodeId(id);
    setEditingText(text);
  };

  const saveEditedNodeText = () => {
    if (!editingNodeId) return;
    const newText = editingText.trim() || 'New Idea';
    const updatedNodes = {
      ...mindmap.nodes,
      [editingNodeId]: {
        ...mindmap.nodes[editingNodeId],
        text: newText,
      },
    };
    updateMindMap({ ...mindmap, nodes: updatedNodes, updatedAt: new Date().toISOString() });
    setEditingNodeId(null);
  };

  // Add Child Node from Target Node
  const handleAddChild = (targetId: string = selectedNodeId || mindmap.rootNodeId) => {
    if (!mindmap.nodes[targetId]) return;
    soundService.triggerHaptic(20);

    const parentNode = mindmap.nodes[targetId];
    const newId = 'node_' + Date.now();
    const isRoot = targetId === mindmap.rootNodeId;
    const defaultColor = isRoot 
      ? COLOR_PALETTE[parentNode.childrenIds.length % COLOR_PALETTE.length].color 
      : parentNode.color;

    const newNode: MindMapNode = {
      id: newId,
      text: 'New Sub-topic',
      parentId: targetId,
      color: defaultColor || '#ff5e1a',
      childrenIds: [],
    };

    const updatedNodes = {
      ...mindmap.nodes,
      [targetId]: {
        ...parentNode,
        childrenIds: [...parentNode.childrenIds, newId],
      },
      [newId]: newNode,
    };

    updateMindMap({ ...mindmap, nodes: updatedNodes, updatedAt: new Date().toISOString() });
    setSelectedNodeId(newId);
    startEditNode(newId, 'New Sub-topic');
  };

  // Add Sibling Node from Target Node
  const handleAddSibling = (targetId: string = selectedNodeId || mindmap.rootNodeId) => {
    if (!targetId || targetId === mindmap.rootNodeId) {
      handleAddChild(targetId);
      return;
    }
    const currentNode = mindmap.nodes[targetId];
    if (!currentNode || !currentNode.parentId) return;

    soundService.triggerHaptic(20);
    const parentId = currentNode.parentId;
    const parentNode = mindmap.nodes[parentId];
    const newId = 'node_' + Date.now();

    const newNode: MindMapNode = {
      id: newId,
      text: 'New Topic',
      parentId: parentId,
      color: currentNode.color || '#ff5e1a',
      childrenIds: [],
    };

    const updatedNodes = {
      ...mindmap.nodes,
      [parentId]: {
        ...parentNode,
        childrenIds: [...parentNode.childrenIds, newId],
      },
      [newId]: newNode,
    };

    updateMindMap({ ...mindmap, nodes: updatedNodes, updatedAt: new Date().toISOString() });
    setSelectedNodeId(newId);
    startEditNode(newId, 'New Topic');
  };

  // Delete Node
  const handleDeleteNode = (targetId: string = selectedNodeId || '') => {
    if (!targetId || targetId === mindmap.rootNodeId) return;
    const currentNode = mindmap.nodes[targetId];
    if (!currentNode || !currentNode.parentId) return;

    soundService.triggerHaptic(20);

    const idsToDelete = new Set<string>([targetId]);
    const collectDescendants = (nodeId: string) => {
      const n = mindmap.nodes[nodeId];
      if (n) {
        for (const childId of n.childrenIds) {
          idsToDelete.add(childId);
          collectDescendants(childId);
        }
      }
    };
    collectDescendants(targetId);

    const parentNode = mindmap.nodes[currentNode.parentId];
    const updatedNodes = { ...mindmap.nodes };

    idsToDelete.forEach(id => delete updatedNodes[id]);

    if (parentNode) {
      updatedNodes[parentNode.id] = {
        ...parentNode,
        childrenIds: parentNode.childrenIds.filter(id => id !== targetId),
      };
    }

    updateMindMap({ ...mindmap, nodes: updatedNodes, updatedAt: new Date().toISOString() });
    setSelectedNodeId(null);
  };

  // Change Node Color
  const handleColorChange = (color: string, targetId: string = selectedNodeId || '') => {
    if (!targetId || !mindmap.nodes[targetId]) return;
    soundService.triggerHaptic(15);

    const updatedNodes = {
      ...mindmap.nodes,
      [targetId]: {
        ...mindmap.nodes[targetId],
        color,
      },
    };

    updateMindMap({ ...mindmap, nodes: updatedNodes, updatedAt: new Date().toISOString() });
    setIsColorPickerOpen(false);
  };

  // Center Canvas
  const resetCenter = () => {
    soundService.triggerHaptic(15);
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setPan({ x: clientWidth / 2, y: clientHeight / 2 });
      setZoom(1);
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col font-sans select-none">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-main)]/90 backdrop-blur-2xl px-5 pt-3 pb-3.5 safe-top transition-all border-b border-[var(--border-soft)] shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between w-full">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            className="neo-pill w-10 h-10 flex items-center justify-center text-[var(--text-primary)] hover:border-[#ff5e1a]/40 transition-all active:scale-90 shrink-0"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5] text-[#ff5e1a] -ml-0.5" />
          </button>

          {/* Map Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              updateMindMap({ ...mindmap, title: e.target.value || 'Untitled Mind Map', updatedAt: new Date().toISOString() });
            }}
            placeholder="Mind Map Title..."
            className="bg-transparent text-sm font-black text-[var(--text-primary)] text-center focus:outline-none focus:border-b-2 focus:border-[#ff5e1a] px-2 py-1 mx-2 flex-1 max-w-xs truncate"
          />

          {/* Save / Done Button */}
          <button
            type="button"
            onClick={handleDone}
            aria-label="Save"
            className="neo-pill w-10 h-10 flex items-center justify-center text-[var(--text-primary)] hover:border-[#ff5e1a]/40 transition-all active:scale-90 shrink-0"
          >
            <Check className="w-6 h-6 stroke-[2.5] text-[#ff5e1a]" />
          </button>
        </div>
      </header>

      {/* Main Interactive Canvas */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="flex-1 relative overflow-hidden bg-[radial-gradient(#80808020_1px,transparent_1px)] [background-size:24px_24px] cursor-grab active:cursor-grabbing touch-none"
      >
        {/* World Space: Transformed Container */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
          className="absolute left-0 top-0 w-0 h-0 pointer-events-none"
        >
          {/* SVG Connecting Curved Bezier Lines */}
          <svg className="overflow-visible absolute left-0 top-0 pointer-events-none">
            {Object.values(mindmap.nodes).map((node) => {
              if (!node.parentId) return null;
              const parentPos = layout[node.parentId];
              const childPos = layout[node.id];
              if (!parentPos || !childPos) return null;

              const isRight = childPos.x >= parentPos.x;
              const startX = isRight ? parentPos.x + parentPos.width / 2 : parentPos.x - parentPos.width / 2;
              const startY = parentPos.y;
              const endX = isRight ? childPos.x - childPos.width / 2 : childPos.x + childPos.width / 2;
              const endY = childPos.y;

              const deltaX = Math.abs(endX - startX) * 0.5;
              const pathData = `M ${startX} ${startY} C ${startX + (isRight ? deltaX : -deltaX)} ${startY}, ${endX - (isRight ? deltaX : -deltaX)} ${endY}, ${endX} ${endY}`;
              const strokeColor = node.color || '#ff5e1a';

              return (
                <g key={`edge_${node.id}`}>
                  <path
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={selectedNodeId === node.id ? 3.5 : 2.5}
                    strokeOpacity={0.85}
                    strokeLinecap="round"
                  />
                  <circle cx={endX} cy={endY} r={3.5} fill={strokeColor} />
                </g>
              );
            })}
          </svg>

          {/* Render Nodes with Contextual Floating Action Popups */}
          {Object.values(mindmap.nodes).map((node) => {
            const pos = layout[node.id];
            if (!pos) return null;

            const isSelected = selectedNodeId === node.id;
            const isRootNode = node.id === mindmap.rootNodeId;
            const nodeColor = node.color || '#ff5e1a';

            return (
              <div
                key={node.id}
                style={{
                  transform: `translate(${pos.x - pos.width / 2}px, ${pos.y - pos.height / 2}px)`,
                  width: `${pos.width}px`,
                }}
                className="absolute pointer-events-auto"
              >
                {/* Node Box */}
                <div
                  onClick={(e) => handleSelectNode(node.id, e)}
                  onDoubleClick={() => startEditNode(node.id, node.text)}
                  style={{
                    borderColor: isSelected ? nodeColor : undefined,
                    boxShadow: isSelected ? `0 0 0 3px ${nodeColor}33, 0 10px 25px -5px rgba(0,0,0,0.2)` : undefined,
                  }}
                  className={`mindmap-node rounded-2xl p-3 flex items-center justify-center text-center cursor-pointer transition-all duration-150 relative ${
                    isRootNode
                      ? 'bg-[#ff5e1a] text-white font-black text-sm shadow-[#ff5e1a]/30 shadow-lg'
                      : isSelected
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold text-xs border-2'
                      : 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold text-xs border border-[var(--border-soft)] hover:border-[#ff5e1a]/50 shadow-sm'
                  }`}
                >
                  {!isRootNode && (
                    <span
                      style={{ backgroundColor: nodeColor }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-full"
                    />
                  )}

                  <span className={`line-clamp-2 ${!isRootNode ? 'pl-2' : ''}`}>
                    {node.text}
                  </span>
                </div>

                {/* ON CLICK CONTEXTUAL FLOATING ACTION POPUP */}
                {isSelected && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="node-action-popup absolute -top-13 left-1/2 -translate-x-1/2 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-soft)] rounded-full px-2 py-1 shadow-2xl flex items-center gap-1 animate-in fade-in zoom-in-90 duration-150 whitespace-nowrap"
                  >
                    {/* Add Child Branch */}
                    <button
                      type="button"
                      onClick={() => handleAddChild(node.id)}
                      className="toolbar-btn px-2.5 py-1.5 rounded-full bg-[#ff5e1a]/15 text-[#ff5e1a] hover:bg-[#ff5e1a] hover:text-white font-black text-[11px] flex items-center gap-1 transition-all active:scale-90"
                      title="Add Sub-topic"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Sub</span>
                    </button>

                    {/* Add Sibling (if not root) */}
                    {!isRootNode && (
                      <button
                        type="button"
                        onClick={() => handleAddSibling(node.id)}
                        className="toolbar-btn px-2 py-1.5 rounded-full bg-[var(--bg-main)] hover:bg-[var(--border-soft)] text-[var(--text-primary)] font-bold text-[11px] flex items-center gap-1 transition-all active:scale-90"
                        title="Add Sibling topic"
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                        <span>Sibling</span>
                      </button>
                    )}

                    {/* Quick Edit Text */}
                    <button
                      type="button"
                      onClick={() => startEditNode(node.id, node.text)}
                      className="toolbar-btn p-1.5 rounded-full bg-[var(--bg-main)] hover:bg-[var(--border-soft)] text-[var(--text-primary)] transition-all active:scale-90"
                      title="Edit Text"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Color Picker Toggle */}
                    {!isRootNode && (
                      <button
                        type="button"
                        onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                        className="toolbar-btn p-1.5 rounded-full bg-[var(--bg-main)] hover:bg-[var(--border-soft)] text-[var(--text-primary)] transition-all active:scale-90"
                        title="Branch Color"
                      >
                        <Palette className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete Node */}
                    {!isRootNode && (
                      <button
                        type="button"
                        onClick={() => handleDeleteNode(node.id)}
                        className="toolbar-btn p-1.5 rounded-full bg-[var(--bg-main)] hover:bg-rose-500/15 text-rose-500 transition-all active:scale-90"
                        title="Delete Branch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Floating Color Palette (inside popup when palette clicked) */}
                    {isColorPickerOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute -top-11 left-1/2 -translate-x-1/2 bg-[var(--bg-surface)] border border-[var(--border-soft)] px-2.5 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-100"
                      >
                        {COLOR_PALETTE.map((p) => (
                          <button
                            key={p.color}
                            type="button"
                            onClick={() => handleColorChange(p.color, node.id)}
                            style={{ backgroundColor: p.color }}
                            className="w-5 h-5 rounded-full transition-transform hover:scale-125 active:scale-90 shadow-sm"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Canvas Zoom / Pan Controls (Bottom Left) */}
        <div className="absolute bottom-6 left-4 z-20 flex flex-col gap-1.5 bg-[var(--bg-surface)]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[var(--border-soft)] shadow-xl">
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
            title="Zoom In"
            className="toolbar-btn p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)] transition-colors active:scale-95"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}
            title="Zoom Out"
            className="toolbar-btn p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)] transition-colors active:scale-95"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={resetCenter}
            title="Reset View"
            className="toolbar-btn p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)] transition-colors active:scale-95"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Edit Node Text Modal */}
      {editingNodeId && (
        <div className="modal-overlay flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-3">
              <h3 className="text-sm font-black text-[var(--text-primary)]">Edit Node Title</h3>
              <button
                onClick={() => setEditingNodeId(null)}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEditedNodeText();
              }}
              placeholder="Enter node topic..."
              className="w-full bg-[var(--bg-main)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-soft)] focus:border-[#ff5e1a] outline-none text-sm font-bold"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingNodeId(null)}
                className="flex-1 py-2.5 rounded-2xl bg-[var(--bg-main)] text-[var(--text-secondary)] font-black text-xs active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditedNodeText}
                className="flex-1 py-2.5 rounded-2xl bg-[#ff5e1a] text-white font-black text-xs shadow-lg shadow-[#ff5e1a]/30 active:scale-95 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Confirmation Modal */}
      {isSavePromptOpen && (
        <div className="modal-overlay flex items-center justify-center p-4 z-50 font-sans">
          <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-black text-[var(--text-primary)]">Save Changes?</h3>
            <p className="text-xs font-bold text-[var(--text-secondary)] leading-relaxed">
              Do you want to save changes to &quot;{mindmap.title}&quot; before leaving?
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundService.triggerHaptic(15);
                  onSave(mindmap);
                  setIsSavePromptOpen(false);
                  onBack();
                }}
                className="w-full py-3 rounded-2xl bg-[#ff5e1a] text-white font-black text-xs shadow-lg shadow-[#ff5e1a]/30 active:scale-95 transition-transform"
              >
                Save &amp; Exit
              </button>

              <button
                type="button"
                onClick={() => {
                  soundService.triggerHaptic(15);
                  setIsSavePromptOpen(false);
                  onBack();
                }}
                className="w-full py-2.5 rounded-2xl bg-[var(--bg-main)] hover:bg-rose-500/10 text-rose-500 font-black text-xs active:scale-95 transition-transform"
              >
                Discard Changes
              </button>

              <button
                type="button"
                onClick={() => setIsSavePromptOpen(false)}
                className="w-full py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
