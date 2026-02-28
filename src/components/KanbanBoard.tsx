'use client';
import { useState, useCallback } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { useQueryClient } from '@tanstack/react-query';
import { Column, COLUMNS, Task } from '@/types/task';
import { updateTask } from '@/lib/api';
import KanbanColumn from '@/components/KanbanColumn';
import TaskCard from '@/components/TaskCard';
import SearchBar from '@/components/SearchBar';

// Column accent colour map for visual distinction
const COLUMN_COLORS: Record<Column, string> = {
    todo: 'bg-slate-500/10 border-slate-500/30',
    in_progress: 'bg-amber-500/10 border-amber-500/30',
    review: 'bg-violet-500/10 border-violet-500/30',
    done: 'bg-emerald-500/10 border-emerald-500/30',
};

const COLUMN_HEADER_COLORS: Record<Column, string> = {
    todo: 'text-slate-400  bg-slate-500/20',
    in_progress: 'text-amber-400  bg-amber-500/20',
    review: 'text-violet-400 bg-violet-500/20',
    done: 'text-emerald-400 bg-emerald-500/20',
};

export { COLUMN_COLORS, COLUMN_HEADER_COLORS };

export default function KanbanBoard() {
    const [search, setSearch] = useState('');
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const queryClient = useQueryClient();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    /** Track the task being dragged so we can show a DragOverlay */
    const handleDragStart = useCallback((event: DragStartEvent) => {
        const task = event.active.data.current?.task as Task | undefined;
        setActiveTask(task ?? null);
    }, []);

    /**
     * When a card is dropped on a different column droppable:
     * - PATCH the task with the new column
     * - Invalidate the old and new column queries so React Query refetches
     */
    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            setActiveTask(null);
            const { active, over } = event;
            if (!over) return;

            const draggedTask = active.data.current?.task as Task | undefined;
            const newColumn = over.id as Column;

            if (!draggedTask || draggedTask.column === newColumn) return;

            try {
                await updateTask({ ...draggedTask, column: newColumn });

                // Invalidate both source and destination queries
                queryClient.invalidateQueries({ queryKey: ['tasks', draggedTask.column] });
                queryClient.invalidateQueries({ queryKey: ['tasks', newColumn] });
            } catch (err) {
                console.error('Failed to move task:', err);
            }
        },
        [queryClient]
    );

    return (
        <div className="min-h-screen bg-[#0f1117] text-white">
            {/* ── Header ── */}
            <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0f1117]/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold">K</span>
                        <h1 className="text-xl font-semibold tracking-tight">KanbanFlow</h1>
                    </div>
                    <SearchBar value={search} onChange={setSearch} />
                </div>
            </header>
            {/* ── Board ── */}
            <main className="mx-auto max-w-screen-2xl px-4 py-6">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {COLUMNS.map((col) => (
                            <KanbanColumn
                                key={col.id}
                                column={col.id}
                                label={col.label}
                                search={search}
                                colorClass={COLUMN_COLORS[col.id]}
                                headerColorClass={COLUMN_HEADER_COLORS[col.id]}
                            />
                        ))}
                    </div>

                    {/* Ghost card shown while dragging */}
                    <DragOverlay dropAnimation={null}>
                        {activeTask ? (
                            <div className="rotate-2 opacity-90">
                                <TaskCard task={activeTask} isDragging />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </main>
        </div>
    );
}
