'use client';

import { AlertTriangle, Loader2, X } from 'lucide-react';

interface Props {
    open: boolean;
    taskTitle: string;
    loading: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export default function DeleteConfirmDialog({ open, taskTitle, loading, onConfirm, onClose }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1d27] shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                    <div className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        <h2 className="text-sm font-semibold">Delete Task</h2>
                    </div>
                    <button onClick={onClose} className="rounded p-1 text-white/40 transition hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex flex-col gap-5 p-6">
                    <p className="text-sm text-white/70">
                        Are you sure you want to delete{' '}
                        <span className="font-medium text-white">&ldquo;{taskTitle}&rdquo;</span>?
                        This action cannot be undone.
                    </p>

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
