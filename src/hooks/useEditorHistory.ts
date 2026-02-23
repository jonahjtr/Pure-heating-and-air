import { useState, useCallback, useRef } from 'react';
import type { Block } from '@/components/editor/types';

interface HistoryState {
  past: Block[][];
  present: Block[];
  future: Block[][];
}

export function useEditorHistory(initialBlocks: Block[]) {
  const [state, setState] = useState<HistoryState>({
    past: [],
    present: initialBlocks,
    future: [],
  });

  // Track if we should record history (avoid recording during undo/redo)
  const isUndoRedo = useRef(false);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const set = useCallback((newBlocks: Block[] | ((prev: Block[]) => Block[])) => {
    setState((prev) => {
      const nextBlocks = typeof newBlocks === 'function' ? newBlocks(prev.present) : newBlocks;
      
      // Don't add to history if this is an undo/redo operation
      if (isUndoRedo.current) {
        isUndoRedo.current = false;
        return { ...prev, present: nextBlocks };
      }

      // Don't add to history if blocks are the same
      if (JSON.stringify(prev.present) === JSON.stringify(nextBlocks)) {
        return prev;
      }

      return {
        past: [...prev.past, prev.present].slice(-50), // Keep last 50 states
        present: nextBlocks,
        future: [], // Clear future when new changes are made
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);

      isUndoRedo.current = true;

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      isUndoRedo.current = true;

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((blocks: Block[]) => {
    setState({
      past: [],
      present: blocks,
      future: [],
    });
  }, []);

  return {
    blocks: state.present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  };
}
