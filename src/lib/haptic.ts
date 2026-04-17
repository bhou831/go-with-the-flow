// iOS Safari doesn't expose navigator.vibrate, but clicking a hidden
// <label for="switch-checkbox"> triggers the system switch haptic.
// This lets us fire a subtle tick on button taps without any extra API.
let hapticLabel: HTMLLabelElement | null = null;
let triggering = false;

export function mountHaptic(): void {
  if (typeof window === "undefined" || hapticLabel) return;

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!isIOS) return;

  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = "___haptic___";
  input.setAttribute("switch", "");
  input.style.display = "none";
  document.body.appendChild(input);

  hapticLabel = document.createElement("label");
  hapticLabel.htmlFor = "___haptic___";
  hapticLabel.style.display = "none";
  document.body.appendChild(hapticLabel);
}

export function triggerHaptic(): void {
  if (typeof document === "undefined" || triggering) return;
  triggering = true;
  if (hapticLabel) {
    hapticLabel.click();
  } else if (
    typeof navigator !== "undefined" &&
    typeof navigator.vibrate === "function"
  ) {
    navigator.vibrate(10);
  }
  triggering = false;
}
