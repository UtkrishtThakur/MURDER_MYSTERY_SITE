export interface TaskProgress {
    [taskId: string]: boolean;
}

export const TASKS = [
    { id: 'task1', title: 'Task 1' },
    { id: 'task2', title: 'Task 2' },
    { id: 'task3', title: 'Task 3' },
];

export function getProgress(): TaskProgress {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem('task_progress');
    if (data) {
        try {
            return JSON.parse(data);
        } catch {
            return {};
        }
    }
    return {};
}

export function markTaskComplete(taskId: string): void {
    if (typeof window === 'undefined') return;
    const current = getProgress();
    current[taskId] = true;
    localStorage.setItem('task_progress', JSON.stringify(current));
    window.dispatchEvent(new Event('progress_updated'));
}

export function isTaskUnlocked(taskId: string): boolean {
    if (typeof window === 'undefined') return taskId === 'task1';
    if (taskId === 'task1') return true;

    const progress = getProgress();
    const taskIndex = TASKS.findIndex(t => t.id === taskId);

    if (taskIndex <= 0) return true;

    const prevTaskId = TASKS[taskIndex - 1].id;
    return !!progress[prevTaskId];
}

export function isTaskComplete(taskId: string): boolean {
    if (typeof window === 'undefined') return false;
    const progress = getProgress();
    return !!progress[taskId];
}
