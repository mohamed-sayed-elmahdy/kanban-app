export type Column = 'todo' | 'in_progress' | 'review' | 'done';

export interface Task {
  id: number;
  title: string;
  description: string;
  column: Column;
}

export const COLUMNS: { id: Column; label: string }[] = [
  { id: 'todo',     label: 'Todo' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review',      label: 'Review' },
  { id: 'done',        label: 'Done' },
];
