// alert.js
export function showToast(message, duration = 3000) {
  // Create container if not exists
  let container = document.getElementById("drive-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "drive-toast-container";
    Object.assign(container.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    });
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.textContent = message;
  Object.assign(toast.style, {
    background: "#323232",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "6px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    fontSize: "14px",
    opacity: "0",
    transition: "opacity 0.3s ease",
  });

  container.appendChild(toast);

  // Fade in
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });

  // Remove after duration
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}
