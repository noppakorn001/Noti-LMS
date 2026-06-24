"use client";

import {
  addDays,
  differenceInCalendarDays,
  differenceInHours,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isToday,
  isTomorrow,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  Timer,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { assignmentService } from "@/services/assignmentService";
import { authService } from "@/services/authService";
import { courseService } from "@/services/courseService";
import { examService } from "@/services/examService";
import type { TaskItem, Course, DashboardView, MoodleSession, TaskStatus, Theme } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  isPushSupported,
  isInstalledPWA,
  registerServiceWorker,
  subscribeToPush,
  showLocalNotification,
} from "@/lib/push-client";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

const SESSION_KEY = "noti-lms-session";
const THEME_KEY = "noti-lms-theme";

const navigation: Array<{ id: DashboardView; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "today", label: "Today", icon: Clock3 },
  { id: "week", label: "Week", icon: LayoutDashboard },
  { id: "month", label: "Month", icon: CalendarDays },
  { id: "settings", label: "Settings", icon: Settings },
];

function readStoredSession() {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(SESSION_KEY) ?? window.sessionStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as MoodleSession;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function saveSession(session: MoodleSession) {
  const target = session.remember ? window.localStorage : window.sessionStorage;
  const other = session.remember ? window.sessionStorage : window.localStorage;
  target.setItem(SESSION_KEY, JSON.stringify(session));
  other.removeItem(SESSION_KEY);
}

function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}

function getTaskDate(task: TaskItem) {
  return task.startDate ?? task.dueDate;
}

function getDeadlineDate(task: TaskItem) {
  return task.dueDate;
}

function getDueLabel(task: TaskItem) {
  const date = getDeadlineDate(task);
  const now = new Date();
  const hours = differenceInHours(date, now);
  const days = differenceInCalendarDays(date, now);

  if (hours < 0) return "Overdue";
  if (hours < 1) return "Due soon";
  if (hours < 24) return `Due in ${hours} hour${hours === 1 ? "" : "s"}`;
  return `Due in ${days} day${days === 1 ? "" : "s"}`;
}

function sortTasks(tasks: TaskItem[]) {
  return [...tasks].sort((a, b) => getTaskDate(a).getTime() - getTaskDate(b).getTime());
}

function withinNextDays(task: TaskItem, days: number) {
  const date = getTaskDate(task);
  const today = startOfDay(new Date());
  return !isBefore(date, today) && !isAfter(date, addDays(today, days));
}

function getVisualStatus(task: TaskItem): "submitted" | "overdue" | "due-soon" | "pending" {
  if (task.status === "submitted") return "submitted";
  if (task.status === "overdue") return "overdue";
  const now = new Date();
  const hours = differenceInHours(task.dueDate, now);
  if (hours >= 0 && hours < 24) {
    return "due-soon";
  }
  return "pending";
}

function getStatusBadgeProps(task: TaskItem) {
  const visualStatus = getVisualStatus(task);
  switch (visualStatus) {
    case "submitted":
      return {
        label: "Submitted",
        className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      };
    case "overdue":
      return {
        label: "Overdue",
        className: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
      };
    case "due-soon":
      return {
        label: "Due Soon",
        className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      };
    case "pending":
    default:
      return {
        label: "Pending",
        className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      };
  }
}

function getPriorityProps(dueDate: Date) {
  const now = new Date();
  const hours = differenceInHours(dueDate, now);

  if (hours < 0) {
    return {
      label: "Critical",
      className: "bg-red-500 text-white",
    };
  }
  if (hours < 12) {
    return {
      label: "Critical",
      className: "bg-red-500 text-white",
    };
  }
  if (hours < 24) {
    return {
      label: "High",
      className: "bg-orange-500 text-white",
    };
  }
  if (hours < 72) {
    return {
      label: "Medium",
      className: "bg-yellow-500 text-black",
    };
  }
  return {
    label: "Low",
    className: "bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:text-zinc-200",
  };
}

function getLeftBorderClass(task: TaskItem) {
  const visualStatus = getVisualStatus(task);
  switch (visualStatus) {
    case "submitted":
      return "border-l-4 border-l-green-500";
    case "overdue":
      return "border-l-4 border-l-red-500";
    case "due-soon":
      return "border-l-4 border-l-orange-500";
    case "pending":
    default:
      return "border-l-4 border-l-blue-500";
  }
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY) as Theme | null;
    const initial = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const updateTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  return [theme, updateTheme] as const;
}

export function DashboardApp() {
  const queryClient = useQueryClient();
  const [theme, setTheme] = useTheme();
  const [session, setSession] = useState<MoodleSession | null>(null);
  const [activeView, setActiveView] = useState<DashboardView>("today");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setSession(readStoredSession());
    setNotificationPermission(typeof Notification === "undefined" ? "denied" : Notification.permission);
    setHasHydrated(true);

    // Register Service Worker for PWA & push notification support
    registerServiceWorker();
  }, []);

  const coursesQuery = useQuery({
    queryKey: ["courses", session?.moodleUrl, session?.user.id],
    queryFn: () => courseService.getCourses(session as MoodleSession),
    enabled: Boolean(session),
  });

  const assignmentsQuery = useQuery({
    queryKey: ["assignments", session?.moodleUrl, coursesQuery.data?.map((course) => course.id).join(",")],
    queryFn: () => assignmentService.getAssignments(session as MoodleSession, coursesQuery.data ?? []),
    enabled: Boolean(session && coursesQuery.data?.length),
  });

  const examsQuery = useQuery({
    queryKey: ["exams", session?.moodleUrl, coursesQuery.data?.map((course) => course.id).join(",")],
    queryFn: () => examService.getExams(session as MoodleSession, coursesQuery.data ?? []),
    enabled: Boolean(session && coursesQuery.data?.length),
  });

  const allTasks = useMemo(
    () => sortTasks([...(assignmentsQuery.data ?? []), ...(examsQuery.data ?? [])]),
    [assignmentsQuery.data, examsQuery.data],
  );

  const isLoading = coursesQuery.isLoading || assignmentsQuery.isLoading || examsQuery.isLoading;
  const error = coursesQuery.error ?? assignmentsQuery.error ?? examsQuery.error;

  const todayTasks = useMemo(
    () => allTasks.filter((task) => isToday(getTaskDate(task)) || isToday(getDeadlineDate(task))),
    [allTasks],
  );

  const weekTasks = useMemo(() => allTasks.filter((task) => withinNextDays(task, 7)), [allTasks]);
  const monthTasks = useMemo(() => allTasks.filter((task) => withinNextDays(task, 30)), [allTasks]);

  const dueTomorrow = useMemo(
    () => allTasks.filter((task) => isTomorrow(getTaskDate(task)) || isTomorrow(getDeadlineDate(task))),
    [allTasks],
  );

    const examsSoon = useMemo(
    () =>
      allTasks.filter((task) => {
        if (task.type !== "exam") return false;
        const start = task.startDate ? task.startDate : getTaskDate(task);
        const hours = differenceInHours(start, new Date());
        return hours >= 0 && hours <= 24;
      }),
    [allTasks],
  );

  useEffect(() => {
    if (notificationPermission !== "granted") return;
    const key = `noti-lms-notified-${format(new Date(), "yyyy-MM-dd")}`;
    if (window.sessionStorage.getItem(key)) return;

    const messageParts = [
      todayTasks.length ? `${todayTasks.length} due today` : "",
      dueTomorrow.length ? `${dueTomorrow.length} due tomorrow` : "",
      examsSoon.length ? `${examsSoon.length} exam${examsSoon.length === 1 ? "" : "s"} soon` : "",
    ].filter(Boolean);

    if (messageParts.length) {
      // Use Service Worker showNotification — works on both mobile and desktop
      showLocalNotification("Noti LMS", messageParts.join(" · "), {
        tag: "daily-summary",
      });
      window.sessionStorage.setItem(key, "true");
    }
  }, [dueTomorrow.length, examsSoon.length, notificationPermission, todayTasks.length]);

  const handleLogin = (nextSession: MoodleSession) => {
    saveSession(nextSession);
    setSession(nextSession);
    setActiveView("today");
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    queryClient.clear();
  };

  const enableNotifications = async () => {
    if (typeof Notification === "undefined") return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    // If granted, subscribe to push notifications for background alerts
    if (permission === "granted" && isPushSupported()) {
      const registration = await navigator.serviceWorker.ready;
      await subscribeToPush(registration);
    }
  };

  if (!hasHydrated) {
    return <LoadingShell />;
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} theme={theme} setTheme={setTheme} />;
  }

  return (
    <main className="min-h-screen bg-white text-[#171A20] dark:bg-[#171A20] dark:text-white">
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          session={session}
          theme={theme}
          setTheme={setTheme}
          onLogout={handleLogout}
        />

        <section className="flex-1 overflow-hidden">
          <MobileNav
            activeView={activeView}
            setActiveView={setActiveView}
            session={session}
            theme={theme}
            setTheme={setTheme}
          />

          <div className="scrollbar-minimal h-[calc(100vh-72px)] overflow-y-auto px-4 py-5 md:h-screen md:px-8 md:py-8 lg:px-12">
            <Header
              activeView={activeView}
              session={session}
              notificationPermission={notificationPermission}
              enableNotifications={enableNotifications}
            />

            {error ? (
              <ErrorState error={error} />
            ) : activeView === "today" ? (
              <TodayView tasks={todayTasks} allTasks={allTasks} isLoading={isLoading} />
            ) : activeView === "week" ? (
              <WeekView tasks={weekTasks} courses={coursesQuery.data ?? []} isLoading={isLoading} />
            ) : activeView === "month" ? (
              <MonthView
                tasks={monthTasks}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                isLoading={isLoading}
              />
            ) : (
              <SettingsView
                session={session}
                theme={theme}
                setTheme={setTheme}
                notificationPermission={notificationPermission}
                enableNotifications={enableNotifications}
                onLogout={handleLogout}
              />
            )}
          </div>
        </section>
      </div>

      {/* PWA install prompt for iOS & Android */}
      <PWAInstallPrompt />
    </main>
  );
}

function LoadingShell() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white text-[#171A20] dark:bg-[#171A20] dark:text-white">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-10 w-10 rounded bg-[#3E6AE1]" />
        <p className="text-sm text-[#5C5E62] dark:text-[#D0D1D2]">Starting academic command center</p>
      </div>
    </main>
  );
}

function LoginScreen({
  onLogin,
  theme,
  setTheme,
}: {
  onLogin: (session: MoodleSession) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}) {
  const [moodleUrl, setMoodleUrl] = useState("https://lms.psu.ac.th");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: onLogin,
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate({ moodleUrl, username, password, remember });
  };

  return (
    <main className="min-h-screen bg-white text-[#171A20] dark:bg-[#171A20] dark:text-white">
      <header className="fixed left-0 right-0 top-0 z-10 flex h-16 items-center justify-between px-5 md:px-8">
        <div className="text-sm font-medium tracking-[0.35em]">NOTI LMS</div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </header>

      <section className="grid min-h-screen place-items-center px-4 py-24">
        <div className="w-full max-w-[1040px] md:grid md:grid-cols-[1fr_420px] md:gap-16">
          <div className="mb-10 flex flex-col justify-center md:mb-0">
            <Badge className="mb-5 w-fit bg-[#F4F4F4] dark:bg-white/10">Moodle API workspace</Badge>
            <h1 className="text-display max-w-xl text-[40px] font-medium leading-[1.2] tracking-normal">
              personal academic command center
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#5C5E62] dark:text-[#D0D1D2]">
              Connect once, then land directly on what matters: assignments, exams, and the next deadline in front of
              you.
            </p>
            <div className="mt-8 grid gap-3 text-sm text-[#393C41] dark:text-[#D0D1D2] sm:grid-cols-3">
              {["Today", "Week", "Month"].map((item) => (
                <div key={item} className="rounded bg-[#F4F4F4] px-4 py-3 dark:bg-white/5">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Card className="fade-up bg-[#F4F4F4] p-5 md:p-6 dark:bg-white/5">
            <div className="mb-7">
              <h2 className="text-xl font-medium">Sign in</h2>
              <p className="mt-1 text-sm text-[#5C5E62] dark:text-[#D0D1D2]">Use your Moodle account, not Moodle UI.</p>
            </div>

            <form className="space-y-4" onSubmit={submit}>
              <label className="block space-y-2 text-sm font-medium">
                <span>Moodle URL</span>
                <Input value={moodleUrl} onChange={(event) => setMoodleUrl(event.target.value)} required />
              </label>

              <label className="block space-y-2 text-sm font-medium">
                <span>Username</span>
                <Input value={username} onChange={(event) => setUsername(event.target.value)} required />
              </label>

              <label className="block space-y-2 text-sm font-medium">
                <span>Password</span>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pr-11"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C5E62] dark:text-[#D0D1D2]"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              <label className="flex items-center justify-between rounded bg-white px-3 py-3 text-sm dark:bg-[#171A20]">
                <span>Remember session</span>
                <input
                  className="h-4 w-4 accent-[#3E6AE1]"
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
              </label>

              {loginMutation.error ? (
                <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
                  {loginMutation.error.message}
                </p>
              ) : null}

              <Button className="w-full" size="lg" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Authenticating..." : "Continue"}
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
}

function Sidebar({
  activeView,
  setActiveView,
  session,
  theme,
  setTheme,
  onLogout,
}: {
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
  session: MoodleSession;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="hidden w-[264px] shrink-0 flex-col justify-between bg-[#F4F4F4] px-4 py-5 dark:bg-[#111318] md:flex">
      <div>
        <div className="mb-10 flex items-center justify-between px-2">
          <div className="text-sm font-medium tracking-[0.35em]">NOTI LMS</div>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "tesla-transition flex min-h-10 w-full items-center gap-3 rounded px-3 text-sm font-medium text-[#5C5E62] hover:bg-white hover:text-[#171A20] dark:text-[#D0D1D2] dark:hover:bg-white/10 dark:hover:text-white",
                  activeView === item.id && "bg-white text-[#171A20] dark:bg-white/10 dark:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        <UserBlock session={session} />
        <Button variant="danger" className="w-full justify-start gap-2" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

function MobileNav({
  activeView,
  setActiveView,
  session,
  theme,
  setTheme,
}: {
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
  session: MoodleSession;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}) {
  return (
    <div className="sticky top-0 z-20 bg-white/80 px-4 py-3 backdrop-blur dark:bg-[#171A20]/80 md:hidden">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium tracking-[0.35em]">NOTI LMS</div>
        <div className="flex items-center gap-1">
          <span className="max-w-[120px] truncate text-sm text-[#5C5E62] dark:text-[#D0D1D2]">
            {session.user.fullName}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      <nav className="grid grid-cols-4 gap-1">
        {navigation.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={cn(
              "tesla-transition min-h-9 rounded text-sm font-medium text-[#5C5E62] dark:text-[#D0D1D2]",
              activeView === item.id && "bg-[#F4F4F4] text-[#171A20] dark:bg-white/10 dark:text-white",
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function UserBlock({ session }: { session: MoodleSession }) {
  return (
    <div className="rounded bg-white p-3 dark:bg-white/5">
      <div className="flex items-center gap-3">
        {session.user.profileImage ? (
          <img className="h-10 w-10 rounded object-cover" src={session.user.profileImage} alt="" />
        ) : (
          <div className="grid h-10 w-10 place-items-center rounded bg-[#3E6AE1] text-sm font-medium text-white">
            {session.user.fullName.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{session.user.fullName}</p>
          <p className="truncate text-xs text-[#5C5E62] dark:text-[#D0D1D2]">{session.moodleUrl}</p>
        </div>
      </div>
    </div>
  );
}

function Header({
  activeView,
  session,
  notificationPermission,
  enableNotifications,
}: {
  activeView: DashboardView;
  session: MoodleSession;
  notificationPermission: NotificationPermission;
  enableNotifications: () => void;
}) {
  const title = navigation.find((item) => item.id === activeView)?.label ?? "Today";

  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-sm text-[#5C5E62] dark:text-[#D0D1D2]">{format(new Date(), "EEEE, MMMM d")}</p>
        <h1 className="text-display mt-1 text-[40px] font-medium leading-[1.2]">{title}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-[#F4F4F4] dark:bg-white/10">
          <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
          API connected
        </Badge>
        {notificationPermission !== "granted" ? (
          <Button variant="secondary" onClick={enableNotifications}>
            <Bell className="mr-2 h-4 w-4" />
            Enable notifications
          </Button>
        ) : null}
        <div className="hidden md:block">
          <UserBlock session={session} />
        </div>
      </div>
    </header>
  );
}

function TodayView({
  tasks,
  allTasks,
  isLoading,
}: {
  tasks: TaskItem[];
  allTasks: TaskItem[];
  isLoading: boolean;
}) {
  const nextAssignment = allTasks.find((task) => task.type === "assignment" && !isBefore(getDeadlineDate(task), new Date()));
  const nextExam = allTasks.find((task) => task.type === "exam" && !isBefore(getDeadlineDate(task), new Date()));
  const weekTasks = allTasks.filter((task) => withinNextDays(task, 7));
  const examsThisWeek = weekTasks.filter((task) => task.type === "exam");

  return (
    <div className="space-y-8">
      <section className="grid gap-3 lg:grid-cols-[1.25fr_0.75fr_0.75fr]">
        <DeadlineCard nextAssignment={nextAssignment} nextExam={nextExam} isLoading={isLoading} />
        <MetricCard label="Assignments today" value={tasks.filter((task) => task.type === "assignment").length} />
        <MetricCard label="Exams this week" value={examsThisWeek.length} />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <TaskSection title="Due today" tasks={tasks} isLoading={isLoading} empty="No assignments or exams due today." />
        <CourseBreakdown tasks={weekTasks} />
      </section>
    </div>
  );
}

function WeekView({ tasks, courses, isLoading }: { tasks: TaskItem[]; courses: Course[]; isLoading: boolean }) {
  const groupedByDay = useMemo(() => {
    const groups = new Map<string, TaskItem[]>();
    sortTasks(tasks).forEach((task) => {
      const key = format(getTaskDate(task), "yyyy-MM-dd");
      groups.set(key, [...(groups.get(key) ?? []), task]);
    });
    return [...groups.entries()];
  }, [tasks]);

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-medium">Next 7 days</h2>
            <p className="mt-1 text-sm text-[#5C5E62] dark:text-[#D0D1D2]">Timeline sorted by nearest deadline.</p>
          </div>
          <Badge className="bg-[#F4F4F4] dark:bg-white/10">{tasks.length} tasks</Badge>
        </div>

        {isLoading ? <SkeletonList /> : null}

        {!isLoading && groupedByDay.length === 0 ? <EmptyState message="Your week is clear." /> : null}

        {!isLoading
          ? groupedByDay.map(([date, dayTasks]) => (
              <div key={date} className="grid gap-3 md:grid-cols-[128px_1fr]">
                <div className="pt-4">
                  <p className="text-sm font-medium">{format(parseISO(date), "EEE")}</p>
                  <p className="text-sm text-[#5C5E62] dark:text-[#D0D1D2]">{format(parseISO(date), "MMM d")}</p>
                </div>
                <div className="space-y-3">
                  {dayTasks.map((task) => (
                    <TaskCard key={`${task.type}-${task.id}`} task={task} />
                  ))}
                </div>
              </div>
            ))
          : null}
      </section>

      <aside className="space-y-4">
        <WorkloadSummary tasks={tasks} />
        <CourseBreakdown tasks={tasks} courses={courses} />
      </aside>
    </div>
  );
}

function MonthView({
  tasks,
  selectedDate,
  setSelectedDate,
  isLoading,
}: {
  tasks: TaskItem[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  isLoading: boolean;
}) {
  const selectedTasks = tasks.filter((task) => isSameDay(getTaskDate(task), selectedDate));

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-medium">30 day calendar</h2>
            <p className="mt-1 text-sm text-[#5C5E62] dark:text-[#D0D1D2]">Click a date to inspect its workload.</p>
          </div>
          <Badge className="bg-[#F4F4F4] dark:bg-white/10">{tasks.length} upcoming</Badge>
        </div>
        {isLoading ? <Skeleton className="h-[520px]" /> : <CalendarGrid tasks={tasks} selectedDate={selectedDate} onSelect={setSelectedDate} />}
      </section>

      <aside className="space-y-4">
        <TaskSection
          title={format(selectedDate, "MMMM d")}
          tasks={selectedTasks}
          isLoading={false}
          empty="No tasks on this date."
        />
        <WorkloadSummary tasks={tasks} />
      </aside>
    </div>
  );
}

function SettingsView({
  session,
  theme,
  setTheme,
  notificationPermission,
  enableNotifications,
  onLogout,
}: {
  session: MoodleSession;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  notificationPermission: NotificationPermission;
  enableNotifications: () => void;
  onLogout: () => void;
}) {
  const [pwaInstalled, setPwaInstalled] = useState(false);

  useEffect(() => {
    setPwaInstalled(isInstalledPWA());
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="space-y-5">
        <div>
          <h2 className="text-xl font-medium">Session</h2>
          <p className="mt-1 text-sm text-[#5C5E62] dark:text-[#D0D1D2]">Auto login uses your remembered Moodle token.</p>
        </div>
        <div className="space-y-3 text-sm">
          <InfoRow label="Moodle URL" value={session.moodleUrl} />
          <InfoRow label="User" value={session.user.fullName} />
          <InfoRow label="Remember session" value={session.remember ? "On" : "Off"} />
        </div>
        <Button variant="danger" onClick={onLogout}>
          Logout
        </Button>
      </Card>

      <Card className="space-y-5">
        <div>
          <h2 className="text-xl font-medium">Preferences</h2>
          <p className="mt-1 text-sm text-[#5C5E62] dark:text-[#D0D1D2]">Keep the interface quiet and fast.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant={theme === "light" ? "primary" : "secondary"} onClick={() => setTheme("light")}>
            <Sun className="mr-2 h-4 w-4" />
            Light
          </Button>
          <Button variant={theme === "dark" ? "primary" : "secondary"} onClick={() => setTheme("dark")}>
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </Button>
        </div>

        {/* Notification settings */}
        <div className="space-y-2">
          <div className="rounded bg-white p-3 text-sm dark:bg-[#171A20]">
            <div className="flex items-center justify-between gap-4">
              <span>Push notifications</span>
              {notificationPermission === "granted" ? (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Enabled</Badge>
              ) : (
                <Button variant="secondary" size="sm" onClick={enableNotifications}>
                  Enable
                </Button>
              )}
            </div>
          </div>

          <div className="rounded bg-white p-3 text-sm dark:bg-[#171A20]">
            <div className="flex items-center justify-between gap-4">
              <span>App installed (PWA)</span>
              {pwaInstalled ? (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Installed</Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Not installed</Badge>
              )}
            </div>
          </div>

          {!pwaInstalled && (
            <p className="rounded bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              <strong>iPhone users:</strong> Open in Safari → tap Share → Add to Home Screen. Push notifications only work inside the installed app (iOS 16.4+).
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6 rounded bg-white px-3 py-3 dark:bg-[#171A20]">
      <span className="text-[#5C5E62] dark:text-[#D0D1D2]">{label}</span>
      <span className="truncate text-right font-medium">{value}</span>
    </div>
  );
}

function DeadlineCard({
  nextAssignment,
  nextExam,
  isLoading,
}: {
  nextAssignment?: TaskItem;
  nextExam?: TaskItem;
  isLoading: boolean;
}) {
  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Upcoming deadline</h2>
          <p className="mt-1 text-sm text-[#5C5E62] dark:text-[#D0D1D2]">Next assignment and exam.</p>
        </div>
        <Timer className="h-5 w-5 text-[#3E6AE1]" />
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <MiniDeadline task={nextAssignment} fallback="No upcoming assignments" />
          <MiniDeadline task={nextExam} fallback="No upcoming exams" />
        </div>
      )}
    </Card>
  );
}

function MiniDeadline({ task, fallback }: { task?: TaskItem; fallback: string }) {
  if (!task) {
    return <div className="rounded bg-white p-4 text-sm text-[#5C5E62] dark:bg-[#171A20] dark:text-[#D0D1D2]">{fallback}</div>;
  }

  const handleOpen = () => {
    if (task.moodleUrl) {
      window.open(task.moodleUrl, "_blank");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className="group relative rounded bg-white p-4 dark:bg-[#171A20] transition-all duration-200 ease-in-out hover:bg-[#EEEEEE] hover:-translate-y-0.5 hover:scale-[1.005] cursor-pointer dark:hover:bg-white/5 outline-none focus-visible:ring-2 focus-visible:ring-[#3E6AE1]"
    >
      <div className="mb-3 flex items-center justify-between pr-6">
        <Badge className="bg-[#F4F4F4] capitalize dark:bg-white/10">{task.type}</Badge>
        <span className="text-sm font-medium text-[#3E6AE1]">{getDueLabel(task)}</span>
      </div>
      <p className="line-clamp-2 text-sm font-medium group-hover:text-[#3E6AE1] transition-colors">{task.title}</p>
      <p className="mt-1 truncate text-sm text-[#5C5E62] dark:text-[#D0D1D2]">{task.courseName}</p>
      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ExternalLink className="h-3.5 w-3.5 text-[#5C5E62] dark:text-[#D0D1D2]" />
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-sm text-[#5C5E62] dark:text-[#D0D1D2]">{label}</p>
      <p className="text-display mt-6 text-[40px] font-medium leading-none">{value}</p>
    </Card>
  );
}

function WorkloadSummary({ tasks }: { tasks: TaskItem[] }) {
  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-medium">Workload summary</h2>
      <div className="grid gap-2">
        <InfoRow label="Assignments due today" value={String(tasks.filter((task) => task.type === "assignment" && isToday(getTaskDate(task))).length)} />
        <InfoRow label="Assignments this week" value={String(tasks.filter((task) => task.type === "assignment").length)} />
        <InfoRow label="Exams this week" value={String(tasks.filter((task) => task.type === "exam").length)} />
      </div>
    </Card>
  );
}

function CourseBreakdown({ tasks, courses }: { tasks: TaskItem[]; courses?: Course[] }) {
  const breakdown = useMemo(() => {
    const counts = new Map<string, number>();
    tasks.forEach((task) => counts.set(task.courseName, (counts.get(task.courseName) ?? 0) + 1));
    courses?.forEach((course) => counts.set(course.name, counts.get(course.name) ?? 0));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [courses, tasks]);

  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-medium">Course breakdown</h2>
      {breakdown.length ? (
        <div className="space-y-2">
          {breakdown.map(([course, count]) => (
            <div key={course} className="rounded bg-white p-3 dark:bg-[#171A20]">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium">{course}</span>
                <span className="text-[#5C5E62] dark:text-[#D0D1D2]">{count}</span>
              </div>
              <div className="h-1.5 rounded bg-[#EEEEEE] dark:bg-white/10">
                <div className="h-1.5 rounded bg-[#3E6AE1]" style={{ width: `${Math.min(count * 18, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#5C5E62] dark:text-[#D0D1D2]">No course tasks to summarize yet.</p>
      )}
    </Card>
  );
}

function TaskSection({
  title,
  tasks,
  isLoading,
  empty,
}: {
  title: string;
  tasks: TaskItem[];
  isLoading: boolean;
  empty: string;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">{title}</h2>
        <Badge className="bg-[#F4F4F4] dark:bg-white/10">{tasks.length}</Badge>
      </div>
      {isLoading ? <SkeletonList /> : null}
      {!isLoading && tasks.length === 0 ? <EmptyState message={empty} /> : null}
      {!isLoading ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={`${task.type}-${task.id}`} task={task} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function TaskCard({ task }: { task: TaskItem }) {
  const Icon = task.type === "exam" ? Timer : CheckCircle2;
  const statusBadge = getStatusBadgeProps(task);
  const priorityBadge = getPriorityProps(task.dueDate);
  const leftBorderClass = getLeftBorderClass(task);

  const handleOpen = () => {
    if (task.moodleUrl) {
      window.open(task.moodleUrl, "_blank");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex gap-4 rounded-lg bg-[#F4F4F4] p-4 transition-all duration-200 ease-in-out hover:bg-[#EEEEEE] hover:-translate-y-0.5 hover:scale-[1.005] cursor-pointer dark:bg-white/5 dark:hover:bg-white/10 outline-none focus-visible:ring-2 focus-visible:ring-[#3E6AE1]",
        leftBorderClass
      )}
    >
      <div className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded bg-white dark:bg-[#171A20]">
        <Icon className="h-5 w-5 text-[#3E6AE1]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between pr-12 sm:pr-16">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium group-hover:text-[#3E6AE1] transition-colors">{task.title}</h3>
            <p className="mt-1 truncate text-sm text-[#5C5E62] dark:text-[#D0D1D2]">{task.courseName}</p>
          </div>
          <div className="shrink-0 text-left sm:text-right">
            <p className="text-sm font-medium">{format(getTaskDate(task), "MMM d, h:mm a")}</p>
            <p className="mt-1 text-sm text-[#5C5E62] dark:text-[#D0D1D2]">{getDueLabel(task)}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge className="bg-white capitalize dark:bg-[#171A20] text-[#171A20] dark:text-white border border-[#EEEEEE] dark:border-white/10">{task.type}</Badge>
          <Badge className={cn("border-none", statusBadge.className)}>{statusBadge.label}</Badge>
          <Badge className={cn("border-none", priorityBadge.className)}>{priorityBadge.label}</Badge>
          {task.timeLimit ? <Badge className="bg-white dark:bg-[#171A20] text-[#171A20] dark:text-white border border-[#EEEEEE] dark:border-white/10">{Math.round(task.timeLimit / 60)} min</Badge> : null}
        </div>
      </div>
      {/* Quick Open Icon & Chevron Arrow Animation */}
      <div className="absolute right-4 top-4 flex items-center gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpen();
          }}
          className="rounded p-1 text-[#5C5E62] hover:bg-zinc-200 hover:text-black dark:text-[#D0D1D2] dark:hover:bg-white/10 dark:hover:text-white transition-colors"
          title="Open in Moodle"
          aria-label="Open assignment in Moodle"
        >
          <ExternalLink className="h-4 w-4" />
        </button>
        <ChevronRight className="h-5 w-5 text-[#D0D1D2] transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </article>
  );
}

function CalendarGrid({
  tasks,
  selectedDate,
  onSelect,
}: {
  tasks: TaskItem[];
  selectedDate: Date;
  onSelect: (date: Date) => void;
}) {
  const today = new Date();
  const gridStart = startOfWeek(startOfMonth(today));
  const gridEnd = endOfWeek(endOfMonth(today));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="rounded-lg bg-[#F4F4F4] p-3 dark:bg-white/5">
      <div className="mb-3 grid grid-cols-7 gap-1 text-center text-xs text-[#5C5E62] dark:text-[#D0D1D2]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayTasks = tasks.filter((task) => isSameDay(getTaskDate(task), day));
          const inMonth = day.getMonth() === today.getMonth();
          const selected = isSameDay(day, selectedDate);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect(day)}
              className={cn(
                "tesla-transition min-h-20 rounded bg-white p-2 text-left hover:bg-[#EEEEEE] dark:bg-[#171A20] dark:hover:bg-white/10",
                !inMonth && "opacity-40",
                selected && "outline outline-2 outline-[#3E6AE1]",
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={cn("text-xs sm:text-sm", isToday(day) && "font-medium text-[#3E6AE1]")}>{format(day, "d")}</span>
                {dayTasks.length ? <span className="text-[10px] sm:text-xs text-[#5C5E62] dark:text-[#D0D1D2]">{dayTasks.length}</span> : null}
              </div>
              <div className="flex flex-wrap gap-1">
                {dayTasks.slice(0, 4).map((task) => (
                  <span
                    key={`${task.type}-${task.id}`}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      task.type === "assignment" ? "bg-[#3E6AE1]" : "bg-[#171A20] dark:bg-white",
                    )}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-[#F4F4F4] p-8 text-center text-sm text-[#5C5E62] dark:bg-white/5 dark:text-[#D0D1D2]">
      {message}
    </div>
  );
}

function ErrorState({ error }: { error: Error }) {
  return (
    <Card className="space-y-3">
      <h2 className="text-xl font-medium">Unable to load Moodle data</h2>
      <p className="text-sm text-[#5C5E62] dark:text-[#D0D1D2]">{error.message}</p>
      <p className="text-sm text-[#5C5E62] dark:text-[#D0D1D2]">
        Check that Moodle Web Services are enabled for your account and that the mobile service is available.
      </p>
    </Card>
  );
}
