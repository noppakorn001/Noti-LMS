import type { MoodleSession, MoodleUser } from "@/lib/types";
import { moodleCall } from "@/services/moodleClient";

type SiteInfoResponse = {
  userid: number;
  fullname?: string;
  firstname?: string;
  lastname?: string;
  userpictureurl?: string;
};

export const authService = {
  async login(input: { moodleUrl: string; username: string; password: string; remember: boolean }) {
    const response = await fetch("/api/moodle/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error ?? "Login failed.");
    }

    const siteInfo = await moodleCall<SiteInfoResponse>(
      { moodleUrl: data.moodleUrl, token: data.token },
      "core_webservice_get_site_info",
    );

    const user: MoodleUser = {
      id: siteInfo.userid,
      fullName:
        siteInfo.fullname ??
        [siteInfo.firstname, siteInfo.lastname].filter(Boolean).join(" ") ??
        "Moodle Student",
      profileImage: siteInfo.userpictureurl,
    };

    return {
      moodleUrl: data.moodleUrl,
      token: data.token,
      user,
      remember: input.remember,
    } satisfies MoodleSession;
  },
};
