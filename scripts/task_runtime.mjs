import { ConvexHttpClient } from "convex/browser";
import { getConvexUrl } from "./task_cli_utils.mjs";

export class TaskSyncRuntime {
  constructor({ intervalMs = 15000 } = {}) {
    this.client = new ConvexHttpClient(getConvexUrl());
    this.intervalMs = intervalMs;
    this.taskId = undefined;
    this.timer = undefined;
  }

  async logTask(fields) {
    this.taskId = await this.client.mutation("tasks:create", fields);
    return this.taskId;
  }

  async updateTask(updates) {
    const id = updates.id ?? this.taskId;
    if (!id) throw new Error("Missing task id");
    await this.client.mutation("tasks:update", { ...updates, id });
    this.taskId = id;
    return id;
  }

  async start(fields) {
    const id = await this.logTask(fields);
    this.startHeartbeat();
    return id;
  }

  startHeartbeat(lastAction = "running") {
    this.stopHeartbeat();
    this.timer = setInterval(() => {
      if (!this.taskId) return;
      this.updateTask({
        id: this.taskId,
        status: "in_progress",
        lastAction,
        lastActionAt: Date.now(),
      }).catch(() => {});
    }, this.intervalMs);
    if (typeof this.timer.unref === "function") this.timer.unref();
  }

  stopHeartbeat() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = undefined;
  }

  async done(fields = {}) {
    this.stopHeartbeat();
    return this.updateTask({
      status: "done",
      lastAction: "completed",
      lastActionAt: Date.now(),
      ...fields,
    });
  }

  async fail(error, fields = {}) {
    this.stopHeartbeat();
    const message = error instanceof Error ? error.message : String(error);
    return this.updateTask({
      status: "failed",
      lastAction: "failed",
      lastActionAt: Date.now(),
      errorMessage: message,
      ...fields,
    });
  }
}

