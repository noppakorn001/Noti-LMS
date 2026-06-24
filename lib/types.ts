export type Theme = "light" | "dark";

export type DashboardView = "today" | "week" | "month" | "settings";

export type TaskStatus = "pending" | "submitted" | "overdue";

export type TaskType = "assignment" | "exam";

export type Priority = "high" | "normal" | "low";

export type MoodleSession = {
  moodleUrl: string;
  token: string;
  user: MoodleUser;
  remember: boolean;
};

export type MoodleUser = {
  id: number;
  fullName: string;
  profileImage?: string;
};

export type Course = {
  id: number;
  name: string;
  shortName: string;
};

export interface TaskItem {
  id: number;
  title: string;
  type: TaskType;
  courseId: number;
  courseName: string;
  dueDate: Date;
  startDate?: Date;
  endDate?: Date;
  timeLimit?: number;
  status: TaskStatus;
  priority: Priority;
  moodleUrl: string;
}
