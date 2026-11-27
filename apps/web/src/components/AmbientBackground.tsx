// Ambient background, driven by the active theme (see --bg-*, --blob-* and
// --grain-* in globals.css). Nuit: midnight black with cobalt glows and a
// hint of lime. Sauge: warm cream with sage and blush blobs.
// Pure CSS, fixed behind everything, never intercepts clicks.

export function AmbientBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 15% 0%, var(--bg-top) 0%, rgb(var(--canvas-rgb)) 50%, var(--bg-bottom) 100%)",
        }}
      />

      {/* main glow, top right */}
      <div
        className="absolute rounded-full blur-[90px]"
        style={{
          width: "max(48vw, 400px)",
          height: "max(48vw, 400px)",
          top: "-16%",
          right: "-12%",
          background: "radial-gradient(circle, rgb(var(--blob-1) / var(--blob-1-a)), transparent 65%)",
          animation: "blobFloat 30s ease-in-out infinite",
        }}
      />

      {/* second glow, left */}
      <div
        className="absolute rounded-full blur-[100px]"
        style={{
          width: "max(40vw, 360px)",
          height: "max(40vw, 360px)",
          top: "34%",
          left: "-14%",
          background: "radial-gradient(circle, rgb(var(--blob-2) / var(--blob-2-a)), transparent 65%)",
          animation: "blobFloat 34s ease-in-out infinite reverse",
        }}
      />

      {/* faint warmth, bottom right */}
      <div
        className="absolute rounded-full blur-[110px]"
        style={{
          width: "max(36vw, 320px)",
          height: "max(36vw, 320px)",
          bottom: "-16%",
          right: "5%",
          background: "radial-gradient(circle, rgb(var(--blob-3) / var(--blob-3-a)), transparent 65%)",
          animation: "blobFloat 38s ease-in-out infinite",
        }}
      />

      {/* grain */}
      <div
        className="absolute inset-0"
        style={{
          opacity: "var(--grain-opacity)",
          mixBlendMode: "var(--grain-blend)" as React.CSSProperties["mixBlendMode"],
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
