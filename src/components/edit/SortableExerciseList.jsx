import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GripVertical } from 'lucide-react';

const AUTO_SCROLL_EDGE_PX = 88;
const AUTO_SCROLL_MAX_SPEED = 16;

export default function SortableExerciseList({ items, disabled, isDark, onReorder, children }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [ghost, setGhost] = useState(null);
  const listRef = useRef(null);
  const dragIndexRef = useRef(null);
  const overIndexRef = useRef(null);
  const onReorderRef = useRef(onReorder);
  const dragActiveRef = useRef(false);
  const grabOffsetYRef = useRef(0);
  const pointerYRef = useRef(0);
  const scrollElRef = useRef(null);
  const autoScrollRafRef = useRef(null);
  const ghostRectRef = useRef(null);

  onReorderRef.current = onReorder;

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRafRef.current != null) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (dragIndex === null) return;
    const prevSelect = document.body.style.userSelect;
    const prevWebkit = document.body.style.webkitUserSelect;
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    return () => {
      document.body.style.userSelect = prevSelect;
      document.body.style.webkitUserSelect = prevWebkit;
      stopAutoScroll();
    };
  }, [dragIndex, stopAutoScroll]);

  const getIndexFromPoint = useCallback((clientY) => {
    const nodes = listRef.current?.querySelectorAll('[data-sortable-index]');
    if (!nodes?.length) return null;
    for (const el of nodes) {
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (clientY < mid) return Number(el.dataset.sortableIndex);
    }
    return items.length - 1;
  }, [items.length]);

  const clearGhost = useCallback(() => {
    setGhost(null);
  }, []);

  const finishDrag = useCallback(() => {
    const from = dragIndexRef.current;
    if (from === null) return;
    const to = overIndexRef.current ?? from;
    if (from !== to) onReorderRef.current(from, to);
    dragIndexRef.current = null;
    overIndexRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
    clearGhost();
    window.getSelection()?.removeAllRanges();
  }, [clearGhost]);

  const startDrag = useCallback((index, clientY) => {
    if (dragActiveRef.current) return;
    dragActiveRef.current = true;

    const row = listRef.current?.querySelector(`[data-sortable-index="${index}"]`);
    const card = row?.querySelector('[data-sortable-card]');
    const measureEl = card ?? row;
    const rect = measureEl?.getBoundingClientRect();
    const item = items[index];

    ghostRectRef.current = rect ?? null;
    scrollElRef.current = listRef.current?.closest('.app-scroll') ?? null;
    pointerYRef.current = clientY;

    if (rect) {
      grabOffsetYRef.current = clientY - rect.top;
      setGhost({
        left: rect.left,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        label: item?.customName || item?.name || 'Ejercicio',
        sets: item?.sets,
        targetReps: item?.targetReps,
      });
    }

    dragIndexRef.current = index;
    overIndexRef.current = index;
    setDragIndex(index);
    setOverIndex(index);

    const updatePointer = (y) => {
      pointerYRef.current = y;
      const idx = getIndexFromPoint(y);
      if (idx !== null) {
        overIndexRef.current = idx;
        setOverIndex(idx);
      }
      if (ghostRectRef.current) {
        setGhost((g) => (g ? { ...g, top: y - grabOffsetYRef.current } : g));
      }
    };

    const autoScrollTick = () => {
      const scrollEl = scrollElRef.current;
      const y = pointerYRef.current;
      if (scrollEl && dragActiveRef.current) {
        const { top, bottom } = scrollEl.getBoundingClientRect();
        let delta = 0;

        if (y < top + AUTO_SCROLL_EDGE_PX) {
          const t = Math.min(1, (top + AUTO_SCROLL_EDGE_PX - y) / AUTO_SCROLL_EDGE_PX);
          delta = -AUTO_SCROLL_MAX_SPEED * t;
        } else if (y > bottom - AUTO_SCROLL_EDGE_PX) {
          const t = Math.min(1, (y - (bottom - AUTO_SCROLL_EDGE_PX)) / AUTO_SCROLL_EDGE_PX);
          delta = AUTO_SCROLL_MAX_SPEED * t;
        }

        if (delta !== 0) {
          const prevTop = scrollEl.scrollTop;
          scrollEl.scrollTop += delta;
          if (scrollEl.scrollTop !== prevTop) {
            updatePointer(y);
          }
        }
      }
      autoScrollRafRef.current = requestAnimationFrame(autoScrollTick);
    };

    updatePointer(clientY);
    stopAutoScroll();
    autoScrollRafRef.current = requestAnimationFrame(autoScrollTick);

    const onMove = (e) => {
      e.preventDefault();
      updatePointer(e.clientY);
    };

    const onEnd = () => {
      dragActiveRef.current = false;
      stopAutoScroll();
      scrollElRef.current = null;
      ghostRectRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      finishDrag();
    };

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
  }, [finishDrag, getIndexFromPoint, items, stopAutoScroll]);

  const onHandlePointerDown = (index, e) => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    window.getSelection()?.removeAllRanges();
    startDrag(index, e.clientY);
  };

  const getDragHandleProps = (idx) => ({
    role: 'button',
    tabIndex: 0,
    'aria-label': 'Arrastrar para reordenar',
    className: `p-2 -mr-1 rounded-lg shrink-0 select-none cursor-grab active:cursor-grabbing transition-colors ${
      dragIndex === idx
        ? isDark
          ? 'text-purple-400 bg-purple-500/20'
          : 'text-purple-600 bg-purple-100'
        : ''
    }`,
    style: { touchAction: 'none' },
    onPointerDown: (e) => onHandlePointerDown(idx, e),
    onContextMenu: (e) => e.preventDefault(),
    onDragStart: (e) => e.preventDefault(),
  });

  const ghostPortal =
    ghost &&
    createPortal(
      <div
        className="fixed z-[200] pointer-events-none"
        style={{
          left: ghost.left,
          top: ghost.top,
          width: ghost.width,
          minHeight: ghost.height,
        }}
      >
        <div
          className={`p-5 rounded-3xl border-2 flex flex-col gap-3 shadow-2xl scale-[1.03] rotate-[0.5deg] ${
            isDark
              ? 'bg-[#1a1a1a] border-purple-500 shadow-purple-500/30'
              : 'bg-white border-purple-500 shadow-purple-500/25'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <p
              className={`font-black text-[16px] truncate flex-1 ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}
            >
              {ghost.label}
            </p>
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isDark ? 'bg-purple-500/25 text-purple-400' : 'bg-purple-100 text-purple-600'
              }`}
            >
              <GripVertical size={20} className="pointer-events-none" />
            </div>
          </div>
          {(ghost.sets != null || ghost.targetReps) && (
            <p className={`text-[10px] font-bold uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {ghost.sets} series · {ghost.targetReps} reps
            </p>
          )}
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <div ref={listRef} className={`space-y-4 ${dragIndex !== null ? 'select-none' : ''}`}>
        {items.map((item, idx) => {
          const isDragging = dragIndex === idx;
          const isDropTarget = overIndex === idx && dragIndex !== null && dragIndex !== idx;

          return (
            <div
              key={`${item.exId ?? 'ex'}-${idx}-${item.customName}`}
              data-sortable-index={idx}
              className="relative"
            >
              {isDropTarget && (
                <div
                  className={`absolute inset-x-4 -top-0.5 h-1 rounded-full z-10 ${
                    isDark ? 'bg-purple-400' : 'bg-purple-500'
                  }`}
                />
              )}
              <div
                className={`transition-all duration-150 ${
                  isDragging
                    ? `rounded-3xl border-2 border-dashed min-h-[88px] ${
                        isDark
                          ? 'border-purple-500/40 bg-purple-500/5'
                          : 'border-purple-300 bg-purple-50/50'
                      }`
                    : ''
                }`}
              >
                <div className={isDragging ? 'opacity-0 pointer-events-none' : ''}>
                  {children(item, idx, {
                    dragHandleProps: disabled ? null : getDragHandleProps(idx),
                    isDragging,
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {ghostPortal}
    </>
  );
}
