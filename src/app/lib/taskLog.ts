type TaskStatus =
  | "todo"
  | "in_progress"
  | "blocked"
  | "waiting"
  | "done"
  | "failed"
  | "canceled";
type TaskSource = "user" | "agent" | "subagent" | "cron";
type TaskType = "coding" | "browsing" | "message" | "ops" | "analysis";
type Assignee = "me" | "you";

type CreateTaskArgs = {
  title: string;
  description?: string;
  status?: TaskStatus;
  assignee?: Assignee;
  source?: TaskSource;
  taskType?: TaskType;
  lastAction?: string;
  lastActionAt?: number;
  relatedId?: string;
  errorMessage?: string;
};

type UpdateTaskArgs = {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignee?: Assignee;
  source?: TaskSource;
  taskType?: TaskType;
  lastAction?: string;
  lastActionAt?: number;
  relatedId?: string;
  errorMessage?: string;
};

type MoveTaskArgs = {
  id: string;
  status: TaskStatus;
  lastAction?: string;
  relatedId?: string;
  errorMessage?: string;
};

type MutationFn<TArgs> = (args: TArgs) => Promise<unknown>;

export function createTaskLogApi(
  createTask: MutationFn<CreateTaskArgs>,
  updateTask: MutationFn<UpdateTaskArgs>,
  moveTask: MutationFn<MoveTaskArgs>,
) {
  return {
    logTask: async (args: CreateTaskArgs) => createTask(args),
    updateTaskLog: async (args: UpdateTaskArgs) => updateTask(args),
    setTaskStatus: async (args: MoveTaskArgs) => moveTask(args),
  };
}

