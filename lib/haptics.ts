export const haptic = {
  light() {
    if (typeof window === "undefined" || typeof navigator === "undefined" || !("vibrate" in navigator)) return;
    try {
      if (localStorage.getItem("dripcheck_haptics") !== "false") {
        navigator.vibrate(10);
      }
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  },

  medium() {
    if (typeof window === "undefined" || typeof navigator === "undefined" || !("vibrate" in navigator)) return;
    try {
      if (localStorage.getItem("dripcheck_haptics") !== "false") {
        navigator.vibrate(25);
      }
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  },

  success() {
    if (typeof window === "undefined" || typeof navigator === "undefined" || !("vibrate" in navigator)) return;
    try {
      if (localStorage.getItem("dripcheck_haptics") !== "false") {
        navigator.vibrate([15, 40, 20]);
      }
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  },
};
