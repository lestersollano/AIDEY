import { useCallback, useEffect, useState } from 'react';

import {
  getTaskChecklist,
  saveTaskChecklist,
  setTaskChecklistItemDone,
  subscribeToTaskChecklists,
  type StoredChecklist,
} from '@/services/task-checklist';
import type { ChecklistItem } from '@/types/aidey-response';

export function useTaskChecklist(taskKey: string) {
  const [checklist, setChecklist] = useState<StoredChecklist | null>(null);

  const refresh = useCallback(() => {
    void getTaskChecklist(taskKey).then(setChecklist);
  }, [taskKey]);

  useEffect(() => {
    refresh();
    return subscribeToTaskChecklists(refresh);
  }, [refresh]);

  const applyChecklist = useCallback(
    async (items: ChecklistItem[], documentLabel?: string) => {
      await saveTaskChecklist(taskKey, items, documentLabel);
    },
    [taskKey],
  );

  const toggleItem = useCallback(
    async (itemId: string, done: boolean) => {
      await setTaskChecklistItemDone(taskKey, itemId, done);
    },
    [taskKey],
  );

  return {
    items: checklist?.items ?? [],
    checklist,
    applyChecklist,
    toggleItem,
  };
}
