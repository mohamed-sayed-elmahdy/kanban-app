import axios from 'axios';
import { Column, Task } from '@/types/task';

/** Base axios instance */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
});

export interface FetchTasksParams {
  column: Column;
  q?: string;
  _page?: number;
  _limit?: number;
}

/** Fetch tasks (paginated + optional search) */
export const fetchTasks = async (params: FetchTasksParams) => {
    const res = await api.get('/tasks', {
        params: {
            column: params.column,
            _page: params._page ?? 1,
            _per_page: params._limit ?? 4,
        },
    });

    const { data: tasks, next } = res.data;

    if (params.q) {
        const q = params.q.toLowerCase();
        return {
            tasks: tasks.filter((task: Task) =>
                task.title.toLowerCase().includes(q) ||
                task.description.toLowerCase().includes(q)
            ),
            next,
        };
    }

    return { tasks, next };
};


/** Create task */
export const createTask = (data: Omit<Task, 'id'>) =>
  api.post<Task>('/tasks', data);

/** Update task */
export const updateTask = ({ id, ...data }: Task) =>
  api.put<Task>(`/tasks/${id}`, data);

/** Delete task */
export const deleteTask = (id: number) =>
  api.delete<void>(`/tasks/${id}`);

export default api;