"use client";

import { useEffect, useState } from "react";
import { isInstalledPWA } from "@/lib/push-client";
import { X, Share, Plus, Bell, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Detects iOS Safari and shows the user a step-by-step prompt
 * to install the PWA via "Add to Home Screen". This is required
 * because iOS does not support automatic install prompts.
 *
 * Also handles Android "beforeinstallprompt" for Chrome.
 */

function isIOSSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
  return isIOS && isSafari;
}

function isAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

const DISMISS_KEY = "noti-lms-pwa-prompt-dismissed";

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    // Don't show if already installed or previously dismissed
    if (isInstalledPWA()) return;
    if (window.sessionStorage.getItem(DISMISS_KEY)) return;

    if (isIOSSafari()) {
      setPlatform("ios");
      setShowPrompt(true);
    } else if (isAndroid()) {
      setPlatform("android");
      // Wait for the beforeinstallprompt event
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      // If no prompt fires after 3s, show manual instructions
      const timeout = setTimeout(() => {
        if (!deferredPrompt) {
          setShowPrompt(true);
        }
      }, 3000);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        clearTimeout(timeout);
      };
    }
  }, [deferredPrompt]);

  const dismiss = () => {
    setShowPrompt(false);
    window.sessionStorage.setItem(DISMISS_KEY, "true");
  };

  const installAndroid = async () => {
    if (deferredPrompt && "prompt" in deferredPrompt) {
      // @ts-expect-error — prompt() is not in the base Event type
      await deferredPrompt.prompt();
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-slideUp p-4 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#171A20] p-5 text-white shadow-2xl shadow-black/40">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#3E6AE1]">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Get push notifications</h3>
            <p className="text-xs text-white/60">Never miss a deadline</p>
          </div>
        </div>

        {platform === "ios" ? (
          <IOSInstructions />
        ) : (
          <AndroidInstructions
            deferredPrompt={deferredPrompt}
            onInstall={installAndroid}
          />
        )}

        <button
          onClick={dismiss}
          className="mt-3 w-full text-center text-xs text-white/40 hover:text-white/60"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

function IOSInstructions() {
  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-white/70">
        Install this app on your iPhone to receive assignment and exam
        notifications:
      </p>
      <ol className="space-y-2.5 text-sm">
        <li className="flex items-start gap-3">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#3E6AE1] text-xs font-bold">
            1
          </span>
          <span className="text-white/90">
            Tap the{" "}
            <span className="inline-flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5 text-xs font-medium">
              <Share className="h-3 w-3" /> Share
            </span>{" "}
            button in Safari
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#3E6AE1] text-xs font-bold">
            2
          </span>
          <span className="text-white/90">
            Scroll down and tap{" "}
            <span className="inline-flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5 text-xs font-medium">
              <Plus className="h-3 w-3" /> Add to Home Screen
            </span>
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#3E6AE1] text-xs font-bold">
            3
          </span>
          <span className="text-white/90">
            Open{" "}
            <span className="font-medium text-[#3E6AE1]">Noti LMS</span> from
            your home screen
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#3E6AE1] text-xs font-bold">
            4
          </span>
          <span className="text-white/90">
            Tap{" "}
            <span className="font-medium text-[#3E6AE1]">
              Enable notifications
            </span>{" "}
            inside the app
          </span>
        </li>
      </ol>
      <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
        <Smartphone className="h-4 w-4 shrink-0 text-[#3E6AE1]" />
        <p className="text-xs text-white/50">
          Requires iOS 16.4 or later
        </p>
      </div>
    </div>
  );
}

function AndroidInstructions({
  deferredPrompt,
  onInstall,
}: {
  deferredPrompt: Event | null;
  onInstall: () => void;
}) {
  if (deferredPrompt) {
    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-white/70">
          Install this app to receive push notifications even when the browser
          is closed.
        </p>
        <Button
          onClick={onInstall}
          className="w-full bg-[#3E6AE1] hover:bg-[#3E6AE1]/90"
        >
          <Smartphone className="mr-2 h-4 w-4" />
          Install App
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-white/70">
        Install this app for the best notification experience:
      </p>
      <ol className="space-y-2 text-sm">
        <li className="flex items-start gap-3">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#3E6AE1] text-xs font-bold">
            1
          </span>
          <span className="text-white/90">
            Tap the{" "}
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-medium">
              ⋮
            </span>{" "}
            menu in Chrome
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#3E6AE1] text-xs font-bold">
            2
          </span>
          <span className="text-white/90">
            Tap{" "}
            <span className="font-medium text-[#3E6AE1]">Install app</span> or{" "}
            <span className="font-medium text-[#3E6AE1]">
              Add to Home screen
            </span>
          </span>
        </li>
      </ol>
    </div>
  );
}
