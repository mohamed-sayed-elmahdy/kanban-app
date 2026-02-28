'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/task';
import { Pencil, Trash2, GripVertical } from 'lucide-react';

interface Props {
    task: Task;
    isDragging?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function TaskCard({ task, isDragging = false, onEdit, onDelete }: Props) {
    const { attributes, listeners, setNodeRef, transform, isDragging: dndIsDragging } =
        useDraggable({ id: task.id, data: { task } });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: dndIsDragging ? 0 : 1,   // hide original while dragging (DragOverlay shows the ghost)
    };

    return (
        <div
            ref={isDragging ? undefined : setNodeRef}
            style={isDragging ? undefined : style}
            className={`group relative flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-3 shadow-sm
        transition-all duration-150 hover:border-white/20 hover:bg-white/8 hover:shadow-md
        ${isDragging ? 'cursor-grabbing shadow-2xl ring-1 ring-violet-500' : 'cursor-default'}`}
        >
            {/* Drag handle */}
            <div
                {...(isDragging ? {} : listeners)}
                {...(isDragging ? {} : attributes)}
                className="absolute right-2 top-2 cursor-grab p-1 text-white/20 opacity-0 transition group-hover:opacity-100 active:cursor-grabbing"
            >
                <GripVertical className="h-4 w-4" />
            </div>

            {/* Title */}
            <p className="pr-6 text-sm font-medium leading-snug text-white">{task.title}</p>

            {/* Description */}
            {task.description && (
                <p className="line-clamp-2 text-xs leading-relaxed text-white/50">{task.description}</p>
            )}

            {/* Actions – visible on hover */}
            {!isDragging && (
                <div className="flex items-center justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                        onClick={onEdit}
                        className="rounded p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
                        aria-label="Edit task"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="rounded p-1 text-white/40 transition hover:bg-red-500/20 hover:text-red-400"
                        aria-label="Delete task"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}
