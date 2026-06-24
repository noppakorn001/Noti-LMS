import type { Course, MoodleSession } from "@/lib/types";
import { moodleCall } from "@/services/moodleClient";
import { decodeHtmlEntities } from "@/lib/utils";

type MoodleCourse = {
  id: number;
  fullname?: string;
  shortname?: string;
  displayname?: string;
};

export const courseService = {
  async getCourses(session: MoodleSession) {
    const courses = await moodleCall<MoodleCourse[]>(session, "core_enrol_get_users_courses", {
      userid: session.user.id,
    });

    return courses.map<Course>((course) => {
      const rawName = course.displayname ?? course.fullname ?? course.shortname ?? `Course ${course.id}`;
      const rawShortName = course.shortname ?? course.fullname ?? `C-${course.id}`;
      return {
        id: course.id,
        name: decodeHtmlEntities(rawName),
        shortName: decodeHtmlEntities(rawShortName),
      };
    });
  },
};
