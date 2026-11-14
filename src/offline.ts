import { Platform } from "react-native";

/**
 * On the web, register the service worker so the installed app opens without
 * a connection. The scripts already on the page are added to its cache right
 * away, so the very first visit is enough. Recordings are cached as they are
 * played; a line that was never heard falls back to the device voice offline.
 */
export function enableOffline() {
  if (
    Platform.OS !== "web" ||
    __DEV__ ||
    typeof navigator === "undefined" ||
    !("serviceWorker" in navigator) ||
    typeof caches === "undefined"
  )
    return;
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then(() => caches.open("grove-v1"))
      .then((cache) =>
        cache.addAll(
          Array.from(document.scripts)
            .map((script) => script.src)
            .filter((src) => src.startsWith(window.location.origin)),
        ),
      )
      .catch(() => {});
  });
}
