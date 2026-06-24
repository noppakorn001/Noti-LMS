import { differenceInHours, isBefore } from "date-fns";
import type { TaskItem, Course, MoodleSession, Priority } from "@/lib/types";
import { moodleCall } from "@/services/moodleClient";
import { decodeHtmlEntities } from "@/lib/utils";

type MoodleQuizResponse = {
  quizzes?: Array<{
    id: number;
    course: number;
    name: string;
    timeopen?: number;
    timeclose?: number;
    timelimit?: number;
    coursemodule?: number;
  }>;
};

function priorityFor(date: Date): Priority {
  const hours = differenceInHours(date, new Date());
  if (hours <= 24) return "high";
  if (hours <= 168) return "normal";
  return "low";
}

export const examService = {
  async getExams(session: MoodleSession, courses: Course[]): Promise<TaskItem[]> {
    const response = await moodleCall<MoodleQuizResponse>(session, "mod_quiz_get_quizzes_by_courses", {
      courseids: courses.map((course) => course.id),
    });

    const courseNames = new Map(courses.map((course) => [course.id, course.name]));

    return (response.quizzes ?? [])
      .filter((quiz) => quiz.timeopen || quiz.timeclose)
      .map<TaskItem>((quiz) => {
        const dueDate = new Date((quiz.timeclose || quiz.timeopen || 0) * 1000);
        const rawCourseName = courseNames.get(quiz.course) ?? "Course";

        return {
          id: quiz.id,
          type: "exam",
          title: decodeHtmlEntities(quiz.name),
          courseId: quiz.course,
          courseName: decodeHtmlEntities(rawCourseName),
          dueDate: dueDate,
          startDate: quiz.timeopen ? new Date(quiz.timeopen * 1000) : undefined,
          endDate: quiz.timeclose ? new Date(quiz.timeclose * 1000) : undefined,
          timeLimit: quiz.timelimit,
          status: isBefore(dueDate, new Date()) ? "overdue" : "pending",
          priority: priorityFor(dueDate),
          moodleUrl: `${session.moodleUrl}/mod/quiz/view.php?id=${quiz.coursemodule ?? quiz.id}`,
        };
      });
  },
};
