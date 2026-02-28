'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Column, COLUMNS, Task } from '@/types/task';
import { createTask, updateTask } from '@/lib/api';
import { X } from 'lucide-react';

interface Props {
    open: boolean;
    task?: Task;           // if provided → edit mode
    defaultColumn: Column;
    onClose: () => void;
}

const EMPTY = { title: '', description: '', column: 'backlog' as Column };

export default function TaskDialog({ open, task, defaultColumn, onClose }: Props) {
    const queryClient = useQueryClient();
    const isEdit = !!task;

    const [form, setForm] = useState({
        title: task?.title ?? '',
        description: task?.description ?? '',
        column: task?.column ?? defaultColumn,
    });
    const [errors, setErrors] = useState({ title: '' });

    // Sync form when task or defaultColumn changes
    useEffect(() => {
        if (open) {
            setForm({
                title: task?.title ?? '',
                description: task?.description ?? '',
                column: task?.column ?? defaultColumn,
            });
            setErrors({ title: '' });
        }
    }, [open, task, defaultColumn]);

    const mutation = useMutation({
        mutationFn: isEdit
            ? () => updateTask({ id: task!.id, ...form })
            : () => createTask(form),
        onSuccess: () => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/43563e0a-7fd8-465d-8a13-d58f75121058', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: `log_${Date.now()}_task_created_or_updated`,
                    timestamp: Date.now(),
                    location: 'TaskDialog.tsx:mutation',
                    message: isEdit ? 'Task updated (UI)' : 'Task created (UI)',
                    data: {
                        mode: isEdit ? 'edit' : 'create',
                        title: form.title,
                        column: form.column,
                    },
                    runId: 'tasks-missing',
                    hypothesisId: 'H2',
                }),
            }).catch(() => {});
            // #endregion

            // Invalidate both old column (edit) and new column
            if (isEdit && task!.column !== form.column) {
                queryClient.invalidateQueries({ queryKey: ['tasks', task!.column] });
            }
            queryClient.invalidateQueries({ queryKey: ['tasks', form.column] });
            onClose();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            setErrors({ title: 'Title is required.' });
            return;
        }
        mutation.mutate();
    };

    if (!open) return null;

    return (
        /* Backdrop */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1d27] shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                    <h2 className="text-sm font-semibold text-white">{isEdit ? 'Edit Task' : 'New Task'}</h2>
                    <button onClick={onClose} className="rounded p-1 text-white/40 transition hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">

                    {/* Title */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-white/60">Title *</label>
                        <input
                            autoFocus
                            value={form.title}
                            onChange={(e) => {
                                setForm((f) => ({ ...f, title: e.target.value }));
                                setErrors({ title: '' });
                            }}
                            placeholder="Task title…"
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20
                         outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                        />
                        {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-white/60">Description</label>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            placeholder="Optional description…"
                            className="resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20
                         outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                        />
                    </div>

                    {/* Column */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-white/60">Column</label>
                        <select
                            value={form.column}
                            onChange={(e) => setForm((f) => ({ ...f, column: e.target.value as Column }))}
                            className="rounded-lg border border-white/10 bg-[#1a1d27] px-3 py-2 text-sm text-white
                         outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                        >
                            {COLUMNS.map((c) => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Error from API */}
                    {mutation.isError && (
                        <p className="text-xs text-red-400">Something went wrong. Is json-server running?</p>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white transition
                         hover:bg-violet-500 disabled:opacity-50"
                        >
                            {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
