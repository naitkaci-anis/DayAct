// Warm ambient background for the "Sauge" theme — pure CSS, zero dependencies.
// Cream base, slow-drifting sage and blush blobs, a whisper of paper grain.
// Fixed behind everything; never intercepts clicks.

export function AmbientBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* base: light cream, slightly warmer at the top */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 15% 0%, #F7EFE3 0%, rgb(var(--canvas-rgb)) 50%, #EADCC8 100%)",
        }}
      />

      {/* sage blob, top right */}
      <div
        className="absolute rounded-full blur-[90px]"
        style={{
          width: "max(44vw, 380px)",
          height: "max(44vw, 380px)",
          top: "-14%",
          right: "-10%",
          background: "radial-gradient(circle, rgb(var(--sage-rgb) / 0.45), transparent 65%)",
          animation: "blobFloat 30s ease-in-out infinite",
        }}
      />

      {/* cream-peach blob, left */}
      <div
        className="absolute rounded-full blur-[100px]"
        style={{
          width: "max(40vw, 360px)",
          height: "max(40vw, 360px)",
          top: "30%",
          left: "-12%",
          background: "radial-gradient(circle, rgb(var(--cream-rgb) / 0.9), transparent 65%)",
          animation: "blobFloat 34s ease-in-out infinite reverse",
        }}
      />

      {/* faint burgundy warmth, bottom right */}
      <div
        className="absolute rounded-full blur-[110px]"
        style={{
          width: "max(36vw, 320px)",
          height: "max(36vw, 320px)",
          bottom: "-16%",
          right: "5%",
          background: "radial-gradient(circle, rgb(var(--primary-rgb) / 0.10), transparent 65%)",
          animation: "blobFloat 38s ease-in-out infinite",
        }}
      />

      {/* paper grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
