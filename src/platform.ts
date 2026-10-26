import {
  Device,
  Environment,
  File,
  Notification,
  Review,
  appLogin,
  openURL,
  Share,
  Storage,
  loadFullScreenAd,
  showFullScreenAd,
  type HapticFeedbackType,
} from "@apps-in-toss/web-framework";
import { NOTIFICATION_TEMPLATE_CODE, REWARDED_AD_GROUP_ID } from "./config";

// 토스 앱 안(웹뷰)에서는 앱인토스 API를, 브라우저 개발 환경에서는 웹 API를 쓴다
export function isInToss(): boolean {
  return typeof window !== "undefined" && "ReactNativeWebView" in window;
}

const APP_NAME = "check-my-saju";

export async function getItem(key: string): Promise<string | null> {
  if (isInToss()) {
    try {
      return await Storage.getItem(key);
    } catch {
      return null;
    }
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  if (isInToss()) {
    try {
      await Storage.setItem(key, value);
      return;
    } catch {
      // 아래 localStorage로 한 번 더 시도한다
    }
  }
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // 저장소를 쓸 수 없는 환경이면 무시한다
  }
}

export async function removeItem(key: string): Promise<void> {
  if (isInToss()) {
    try {
      await Storage.removeItem(key);
      return;
    } catch {
      // 아래 localStorage로 한 번 더 시도한다
    }
  }
  try {
    window.localStorage.removeItem(key);
  } catch {
    // 무시
  }
}

export type ShareOutcome = "shared" | "copied" | "failed";

export async function shareMessage(message: string): Promise<ShareOutcome> {
  if (isInToss()) {
    try {
      await Share.sendMessage({ message });
      return "shared";
    } catch {
      return "failed";
    }
  }
  try {
    if (navigator.share) {
      await navigator.share({ text: message });
      return "shared";
    }
    await navigator.clipboard.writeText(message);
    return "copied";
  } catch {
    return "failed";
  }
}

export async function saveImage(dataUrl: string, fileName: string): Promise<boolean> {
  if (isInToss()) {
    try {
      await File.saveBase64({ data: dataUrl.split(",")[1], fileName, mimeType: "image/png" });
      return true;
    } catch {
      return false;
    }
  }
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  a.click();
  return true;
}

// 앱을 여는 링크를 만든다. 토스 앱에서는 intoss:// 딥링크 기반 공유 링크, 브라우저에서는 현재 주소 기반
export async function createAppLink(query: Record<string, string>): Promise<string> {
  const qs = new URLSearchParams(query).toString();
  if (isInToss()) {
    try {
      return await Share.createLink({ path: `intoss://${APP_NAME}?${qs}` });
    } catch {
      // 아래 웹 주소로 대신한다
    }
  }
  return `${window.location.origin}${window.location.pathname}?${qs}`;
}

// 앱에 들어올 때 붙어온 쿼리 값을 읽는다
export function readLaunchParam(name: string): string | null {
  const fromLocation = new URLSearchParams(window.location.search).get(name);
  if (fromLocation) return fromLocation;
  if (!isInToss()) return null;
  try {
    const initial = Environment.initialURL;
    const q = initial.indexOf("?");
    return q >= 0 ? new URLSearchParams(initial.slice(q + 1)).get(name) : null;
  } catch {
    return null;
  }
}

// 짧은 진동. 토스 앱에서는 햅틱, 브라우저에서는 지원하는 기기에서만 vibrate
export function haptic(type: HapticFeedbackType = "tickWeak"): void {
  if (isInToss()) {
    Device.triggerHaptic({ type }).catch(() => undefined);
    return;
  }
  try {
    navigator.vibrate?.(type === "success" || type === "confetti" ? [12, 40, 12] : 10);
  } catch {
    // 진동을 지원하지 않으면 무시한다
  }
}

export type NotificationOutcome = "agreed" | "rejected" | "unavailable";

// 매일 아침 운세 알림 수신 동의를 요청한다
export function requestDailyNotification(): Promise<NotificationOutcome> {
  if (!isInToss() || !NOTIFICATION_TEMPLATE_CODE || !Notification.requestAgreement.isSupported()) {
    return Promise.resolve("unavailable");
  }
  return new Promise((resolve) => {
    const cleanup = Notification.requestAgreement({
      options: { templateCode: NOTIFICATION_TEMPLATE_CODE },
      onEvent: ({ type }) => {
        cleanup();
        resolve(type === "agreementRejected" ? "rejected" : "agreed");
      },
      onError: () => {
        cleanup();
        resolve("unavailable");
      },
    });
  });
}

// 보상형 광고를 끝까지 보면 true. 광고 ID가 없거나 토스 앱 밖이면 개발용으로 바로 true
export function showRewardedAd(): Promise<boolean> {
  if (!isInToss() || !REWARDED_AD_GROUP_ID || !loadFullScreenAd.isSupported()) {
    return Promise.resolve(true);
  }
  const options = { adGroupId: REWARDED_AD_GROUP_ID };
  return new Promise((resolve) => {
    let rewarded = false;
    const stopLoad = loadFullScreenAd({
      options,
      onEvent: () => {
        stopLoad();
        const stopShow = showFullScreenAd({
          options,
          onEvent: (event) => {
            if (event.type === "userEarnedReward") rewarded = true;
            if (event.type === "dismissed" || event.type === "failedToShow") {
              stopShow();
              resolve(rewarded);
            }
          },
          onError: () => {
            stopShow();
            resolve(false);
          },
        });
      },
      onError: () => {
        stopLoad();
        resolve(false);
      },
    });
  });
}

export type LoginOutcome = { ok: true; authorizationCode: string } | { ok: false; reason: "unavailable" | "cancelled" };

// 토스 로그인. 받은 인가 코드는 서버에서 토스 API로 교환해야 사용자 정보를 얻을 수 있다
export async function tossLogin(): Promise<LoginOutcome> {
  if (!isInToss()) return { ok: false, reason: "unavailable" };
  try {
    const { authorizationCode } = await appLogin();
    return { ok: true, authorizationCode };
  } catch {
    return { ok: false, reason: "cancelled" };
  }
}

// 토스 미니앱 리뷰 요청. 지원하지 않으면 false
export async function requestAppReview(): Promise<boolean> {
  if (!isInToss() || !Review.request.isSupported()) return false;
  try {
    await Review.request();
    return true;
  } catch {
    return false;
  }
}

export async function openExternal(url: string): Promise<void> {
  if (isInToss()) {
    try {
      await openURL(url);
      return;
    } catch {
      // 아래 브라우저 방식으로 대신한다
    }
  }
  window.open(url, "_blank", "noopener");
}
