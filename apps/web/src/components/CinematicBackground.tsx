// Cinematic premium background — pure CSS, zero dependencies.
// Aurora blobs + gradient mesh + noise + subtle stars. Fixed behind everything.

export function CinematicBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* base deep gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 125% at 15% 10%, #0a1230 0%, #050816 45%, #03040c 100%)",
        }}
      />

      {/* aurora ribbon */}
      <div
        className="absolute -top-1/4 left-0 right-0 h-[70vh] blur-[60px]"
        style={{
          background:
            "conic-gradient(from 200deg at 50% 50%, rgba(91,231,255,0.10), rgba(139,92,246,0.14), rgba(192,38,255,0.10), rgba(91,231,255,0.10))",
          animation: "auroraDrift 22s ease-in-out infinite",
          opacity: 0.7,
        }}
      />

      {/* floating blobs — min sizes so phones still get a living background */}
      <div
        className="absolute rounded-full blur-[90px]"
        style={{
          width: "max(42vw, 380px)",
          height: "max(42vw, 380px)",
          top: "-8%",
          left: "-6%",
          background: "radial-gradient(circle, rgba(91,231,255,0.22), transparent 65%)",
          animation: "blobFloat 26s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full blur-[100px]"
        style={{
          width: "max(46vw, 420px)",
          height: "max(46vw, 420px)",
          bottom: "-12%",
          right: "-8%",
          background: "radial-gradient(circle, rgba(192,38,255,0.20), transparent 65%)",
          animation: "blobFloat 30s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute rounded-full blur-[90px]"
        style={{
          width: "max(32vw, 300px)",
          height: "max(32vw, 300px)",
          top: "35%",
          left: "40%",
          background: "radial-gradient(circle, rgba(139,92,246,0.16), transparent 65%)",
          animation: "blobFloat 34s ease-in-out infinite",
        }}
      />

      {/* subtle stars */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.6), transparent), radial-gradient(1px 1px at 85% 25%, rgba(255,255,255,0.45), transparent), radial-gradient(1px 1px at 55% 15%, rgba(255,255,255,0.5), transparent)",
          backgroundRepeat: "repeat",
          backgroundSize: "600px 600px",
          animation: "twinkle 6s ease-in-out infinite",
        }}
      />

      {/* fine grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(120% 80% at 50% 0%, #000 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(120% 80% at 50% 0%, #000 30%, transparent 80%)",
        }}
      />

      {/* noise grain */}
      <div
        className="absolute inset-0 opacity-[0.045] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* top + bottom vignette for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,8,22,0.4) 0%, transparent 18%, transparent 82%, rgba(3,4,12,0.6) 100%)",
        }}
      />
    </div>
  );
}
