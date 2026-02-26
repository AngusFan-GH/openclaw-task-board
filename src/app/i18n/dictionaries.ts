export type Locale = "zh" | "en";

export type Dictionary = {
  nav: {
    tasks: string;
    calendar: string;
    memory: string;
    pipeline: string;
    team: string;
    office: string;
  };
  common: {
    all: string;
    notAvailable: string;
    none: string;
    cancel: string;
    save: string;
    edit: string;
    me: string;
    you: string;
  };
  taskBoard: {
    title: string;
    subtitle: string;
    searchTasks: string;
    filterAssignee: string;
    filterStatus: string;
    filterSource: string;
    filterType: string;
    allStatuses: string;
    allSources: string;
    allTypes: string;
    assignedToMe: string;
    assignedToYou: string;
    taskTitle: string;
    taskDescription: string;
    assignToMe: string;
    assignToYou: string;
    relatedIdOptional: string;
    addTask: string;
    systemStatus: string;
    latestTaskUpdate: string;
    latestActionUpdate: string;
    runningProcesses: string;
    noRunningProcessIds: string;
    source: string;
    type: string;
    status: string;
    lastAction: string;
    actionAt: string;
    relatedId: string;
    error: string;
    moveTo: string;
    assignTo: string;
    noTasksInColumn: string;
    editTask: string;
    lastActionInput: string;
    relatedIdInput: string;
    errorMessageInput: string;
  };
  statuses: Record<"todo" | "in_progress" | "blocked" | "waiting" | "done" | "failed" | "canceled", string>;
  sources: Record<"user" | "agent" | "subagent" | "cron", string>;
  taskTypes: Record<"coding" | "browsing" | "message" | "ops" | "analysis", string>;
};

export const dictionaries: Record<Locale, Dictionary> = {
  zh: {
    nav: {
      tasks: "任务",
      calendar: "日历",
      memory: "记忆",
      pipeline: "内容流水线",
      team: "团队",
      office: "办公",
    },
    common: {
      all: "全部",
      notAvailable: "无",
      none: "无",
      cancel: "取消",
      save: "保存",
      edit: "编辑",
      me: "我",
      you: "你",
    },
    taskBoard: {
      title: "任务指挥台",
      subtitle: "任务、日历和记忆集中管理。",
      searchTasks: "搜索任务",
      filterAssignee: "筛选负责人",
      filterStatus: "筛选状态",
      filterSource: "筛选来源",
      filterType: "筛选类型",
      allStatuses: "全部状态",
      allSources: "全部来源",
      allTypes: "全部类型",
      assignedToMe: "分配给我",
      assignedToYou: "分配给你",
      taskTitle: "任务标题",
      taskDescription: "描述（可选）",
      assignToMe: "指派给我",
      assignToYou: "指派给你",
      relatedIdOptional: "关联 ID（可选）",
      addTask: "添加任务",
      systemStatus: "系统状态",
      latestTaskUpdate: "最近任务更新时间",
      latestActionUpdate: "最近动作更新时间",
      runningProcesses: "运行中进程",
      noRunningProcessIds: "未发现运行中的进程 ID。",
      source: "来源",
      type: "类型",
      status: "状态",
      lastAction: "最后动作",
      actionAt: "动作时间",
      relatedId: "关联 ID",
      error: "错误",
      moveTo: "移动到",
      assignTo: "指派给",
      noTasksInColumn: "该列暂无任务。",
      editTask: "编辑任务",
      lastActionInput: "最后动作",
      relatedIdInput: "关联 ID",
      errorMessageInput: "错误信息",
    },
    statuses: {
      todo: "待办",
      in_progress: "进行中",
      blocked: "阻塞",
      waiting: "等待",
      done: "完成",
      failed: "失败",
      canceled: "已取消",
    },
    sources: {
      user: "用户",
      agent: "Agent",
      subagent: "Subagent",
      cron: "定时任务",
    },
    taskTypes: {
      coding: "编码",
      browsing: "浏览",
      message: "消息",
      ops: "运维",
      analysis: "分析",
    },
  },
  en: {
    nav: {
      tasks: "Tasks",
      calendar: "Calendar",
      memory: "Memory",
      pipeline: "Content Pipeline",
      team: "Team",
      office: "Office",
    },
    common: {
      all: "All",
      notAvailable: "n/a",
      none: "none",
      cancel: "Cancel",
      save: "Save",
      edit: "Edit",
      me: "Me",
      you: "You",
    },
    taskBoard: {
      title: "Mission Control",
      subtitle: "Tasks, calendar, and memory in one place.",
      searchTasks: "Search tasks",
      filterAssignee: "Filter assignee",
      filterStatus: "Filter status",
      filterSource: "Filter source",
      filterType: "Filter type",
      allStatuses: "All Statuses",
      allSources: "All Sources",
      allTypes: "All Types",
      assignedToMe: "Assigned to Me",
      assignedToYou: "Assigned to You",
      taskTitle: "Task title",
      taskDescription: "Description (optional)",
      assignToMe: "Assign to Me",
      assignToYou: "Assign to You",
      relatedIdOptional: "Related ID (optional)",
      addTask: "Add Task",
      systemStatus: "System Status",
      latestTaskUpdate: "Latest task update",
      latestActionUpdate: "Latest action update",
      runningProcesses: "Running processes",
      noRunningProcessIds: "No running process IDs found.",
      source: "Source",
      type: "Type",
      status: "Status",
      lastAction: "Last action",
      actionAt: "Action at",
      relatedId: "Related ID",
      error: "Error",
      moveTo: "Move to",
      assignTo: "Assign to",
      noTasksInColumn: "No tasks in this column.",
      editTask: "Edit Task",
      lastActionInput: "Last action",
      relatedIdInput: "Related ID",
      errorMessageInput: "Error message",
    },
    statuses: {
      todo: "To Do",
      in_progress: "In Progress",
      blocked: "Blocked",
      waiting: "Waiting",
      done: "Done",
      failed: "Failed",
      canceled: "Canceled",
    },
    sources: {
      user: "User",
      agent: "Agent",
      subagent: "Subagent",
      cron: "Cron",
    },
    taskTypes: {
      coding: "Coding",
      browsing: "Browsing",
      message: "Message",
      ops: "Ops",
      analysis: "Analysis",
    },
  },
};
