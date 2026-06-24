import { differenceInHours, isBefore } from "date-fns";
import type { TaskItem, Course, MoodleSession, Priority, TaskStatus } from "@/lib/types";
import { moodleCall } from "@/services/moodleClient";
import { decodeHtmlEntities } from "@/lib/utils";

type MoodleAssignmentResponse = {
  courses?: Array<{
    id: number;
    fullname?: string;
    shortname?: string;
    assignments?: Array<{
      id: number;
      cmid?: number;
      name: string;
      duedate?: number;
      allowsubmissionsfromdate?: number;
      intro?: string;
    }>;
  }>;
};

type SubmissionStatusResponse = {
  lastattempt?: {
    submission?: {
      status?: string;
    };
  };
};

function priorityFor(date: Date): Priority {
  const hours = differenceInHours(date, new Date());
  if (hours <= 24) return "high";
  if (hours <= 168) return "normal";
  return "low";
}

function statusFor(date: Date, submitted: boolean): TaskStatus {
  if (submitted) return "submitted";
  return isBefore(date, new Date()) ? "overdue" : "pending";
}

export const assignmentService = {
  async getAssignments(session: MoodleSession, courses: Course[]): Promise<TaskItem[]> {
    const response = await moodleCall<MoodleAssignmentResponse>(session, "mod_assign_get_assignments", {
      courseids: courses.map((course) => course.id),
    });

    const courseNames = new Map(courses.map((course) => [course.id, course.name]));
    const assignments = response.courses?.flatMap((course) =>
      (course.assignments ?? []).map((assignment) => ({ assignment, course })),
    ) ?? [];

    const enriched = await Promise.allSettled(
      assignments.map(async ({ assignment, course }) => {
        if (!assignment.duedate) return null;

        const dueDate = new Date(assignment.duedate * 1000);
        let submitted = false;

        try {
          const status = await moodleCall<SubmissionStatusResponse>(session, "mod_assign_get_submission_status", {
            assignid: assignment.id,
          });
          submitted = status.lastattempt?.submission?.status === "submitted";
        } catch {
          submitted = false;
        }

        const rawCourseName = courseNames.get(course.id) ?? course.fullname ?? course.shortname ?? "Course";

        return {
          id: assignment.id,
          type: "assignment",
          title: decodeHtmlEntities(assignment.name),
          courseId: course.id,
          courseName: decodeHtmlEntities(rawCourseName),
          dueDate: dueDate,
          startDate: assignment.allowsubmissionsfromdate
            ? new Date(assignment.allowsubmissionsfromdate * 1000)
            : undefined,
          status: statusFor(dueDate, submitted),
          priority: priorityFor(dueDate),
          moodleUrl: `${session.moodleUrl}/mod/assign/view.php?id=${assignment.cmid ?? assignment.id}`,
        } satisfies TaskItem;
      }),
    );

    return enriched.flatMap((result) => (result.status === "fulfilled" && result.value ? [result.value] : []));
  },
};
