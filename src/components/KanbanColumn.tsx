'use client';
import { useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useDroppable } from '@dnd-kit/core';
import { Column, Task } from '@/types/task';
import { fetchTasks, deleteTask } from '@/lib/api';
import TaskCard from '@/components/TaskCard';
import TaskDialog from '@/components/TaskDialog';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';

const PAGE_LIMIT = 6;

interface Props {
    column: Column;
    label: string;
    search: string;
    colorClass: string;
    headerColorClass: string;
}

export default function KanbanColumn({ column, label, search, colorClass, headerColorClass }: Props) {
    const queryClient = useQueryClient();
    // ── Dialog state ──────────────────────────────────────────────
    const [createOpen, setCreateOpen] = useState(false);
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
    // ── dnd-kit droppable ─────────────────────────────────────────
    const { setNodeRef, isOver } = useDroppable({ id: column });


    // ── Data fetching ─────────────────────────────────────────────
    const {
        data,
        isLoading,
        isError,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['tasks', column, search],
        queryFn: ({ pageParam = 1 }) =>
            fetchTasks({ column, q: search || undefined, _page: pageParam, _limit: 4 }),
        getNextPageParam: (lastPage, allPages) => {
            if (!Array.isArray(lastPage) || lastPage.length < 4) return undefined;
            return allPages.length + 1;
        },
        initialPageParam: 1,
    });

    const tasks: Task[] = data?.pages.flatMap(page => page) ?? [];
    const totalCount = tasks.length;


    // ── Delete mutation ───────────────────────────────────────────
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', column] });
            setDeleteTarget(null);
        },
    });

    const handleDelete = useCallback(() => {
        if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
    }, [deleteTarget, deleteMutation]);

    return (
        <>
            {/* ── Column container ─────────────────────────────────── */}
            <div className={`flex flex-col rounded-xl border ${colorClass} min-h-[500px] transition-all duration-200 ${isOver ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-[#0f1117]' : ''}`}>
                {/* Column header */}
                <div className={`flex items-center justify-between rounded-t-xl px-4 py-3 ${headerColorClass}`}>
                    <span className="text-sm font-semibold uppercase tracking-widest">{label}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium">
                        {isLoading ? '…' : totalCount}
                    </span>
                </div>

                {/* Task list – droppable zone */}
                <div ref={setNodeRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
                    {isLoading && (
                        <div className="flex flex-1 items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-white/40" />
                        </div>
                    )}

                    {isError && (
                        <p className="text-center text-xs text-red-400">Failed to load tasks.<br />Is json-server running?</p>
                    )}

                    {tasks.map((task: any, index: number) => (
                        <TaskCard
                            key={index}
                            task={task}
                            onEdit={() => setEditTask(task)}
                            onDelete={() => setDeleteTarget(task)}
                        />
                    ))}


                </div>


                <div className="p-3 pt-0 mt-2 space-y-3">
                    {/* Load More */}
                    {hasNextPage && (
                        <button
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2 text-xs text-white/50 transition hover:bg-white/5 disabled:opacity-50"
                        >
                            {isFetchingNextPage && <Loader2 className="h-3 w-3 animate-spin" />}
                            Load more
                        </button>
                    )}
                    {/* Add task button */}
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 py-2 text-sm text-white/40 transition hover:border-white/40 hover:text-white/70"
                    >
                        <Plus className="h-4 w-4" /> Add task
                    </button>
                </div>
            </div>

            {/* ── Dialogs ─────────────────────────────────────────── */}
            <TaskDialog
                open={createOpen}
                defaultColumn={column}
                onClose={() => setCreateOpen(false)}
            />

            <TaskDialog
                open={!!editTask}
                task={editTask ?? undefined}
                defaultColumn={column}
                onClose={() => setEditTask(null)}
            />

            <DeleteConfirmDialog
                open={!!deleteTarget}
                taskTitle={deleteTarget?.title ?? ''}
                loading={deleteMutation.isPending}
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </>
    );
}
