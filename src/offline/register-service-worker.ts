export async function registerSafeWatchServiceWorker(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await registration.update();
  } catch (error) {
    console.error("[pwa] Service worker registration failed.", error);
  }
}
