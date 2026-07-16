// Shared visual shell for all auth pages (Front, Login, Register, Forgot Password)
// Keeps one consistent "brand" look across the app — dark gradient, glow orbs, Syne font.

export default function AuthShell({ badge, children, width = 400 }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .ash-bg {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #07070f;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
          padding: 24px;
          box-sizing: border-box;
        }
        .ash-bg::before {
          content: '';
          position: absolute;
          width: 560px; height: 560px;
          background: radial-gradient(circle, rgba(168,85,247,0.26) 0%, transparent 65%);
          top: -160px; left: -160px;
          animation: ash-drift-a 16s ease-in-out infinite;
        }
        .ash-bg::after {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(34,211,238,0.20) 0%, transparent 65%);
          bottom: -160px; right: -160px;
          animation: ash-drift-b 18s ease-in-out infinite;
        }
        .ash-orb-pink {
          content: '';
          position: absolute;
          width: 380px; height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(236,72,153,0.22) 0%, transparent 65%);
          top: 50%; right: 10%;
          transform: translateY(-50%);
          animation: ash-drift-c 14s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes ash-drift-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, 40px) scale(1.15); }
        }
        @keyframes ash-drift-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, -30px) scale(1.1); }
        }
        @keyframes ash-drift-c {
          0%, 100% { transform: translate(0, -50%) scale(1); opacity: 0.8; }
          50% { transform: translate(-40px, -60%) scale(1.2); opacity: 1; }
        }

        .ash-card {
          position: relative; z-index: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 24px;
          padding: 40px 36px;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          text-align: center;
          animation: ash-rise 0.55s cubic-bezier(.2,.8,.2,1) both;
        }
        @keyframes ash-rise {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .ash-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(168,85,247,0.12);
          border: 1px solid rgba(168,85,247,0.3);
          color: #c4b5fd; font-size: 11px; font-weight: 700;
          padding: 5px 14px; border-radius: 20px; margin-bottom: 22px;
          letter-spacing: 0.05em; text-transform: uppercase;
        }
        .ash-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #a855f7; display: inline-block;
          animation: ash-pulse 2s infinite;
        }
        @keyframes ash-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

        .ash-title {
          font-family: 'Syne', sans-serif;
          font-size: 28px; font-weight: 800;
          background: linear-gradient(90deg, #22d3ee, #a855f7, #ec4899, #22d3ee);
          background-size: 300% 100%;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0 0 8px;
          animation: ash-shimmer 6s linear infinite;
        }
        @keyframes ash-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        .ash-subtitle {
          font-size: 13px; color: rgba(255,255,255,0.4);
          margin: 0 0 26px; line-height: 1.5;
        }

        .ash-field { text-align: left; margin-bottom: 14px; }
        .ash-label {
          display: block; font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.45); margin-bottom: 6px;
        }
        .ash-input {
          width: 100%; padding: 12px 14px;
          border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: #f1f5f9; font-size: 13px; outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .ash-input:focus {
          border-color: rgba(168,85,247,0.6);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(168,85,247,0.15);
        }
        .ash-input::placeholder { color: rgba(255,255,255,0.25); }

        .ash-btn {
          width: 100%; padding: 13px;
          border: none; border-radius: 14px;
          background: linear-gradient(90deg, #a855f7, #ec4899);
          color: white;
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          cursor: pointer; margin-top: 6px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.25s;
          box-shadow: 0 8px 24px rgba(168,85,247,0.3);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative;
          overflow: hidden;
        }
        .ash-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -75%;
          width: 50%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: skewX(-20deg);
          transition: left 0.6s ease;
        }
        .ash-btn:hover:not(:disabled)::before { left: 125%; }
        .ash-btn:hover:not(:disabled) {
          opacity: 0.96;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(168,85,247,0.45);
        }
        .ash-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .ash-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .ash-link-row {
          margin-top: 18px; font-size: 12.5px; color: rgba(255,255,255,0.35);
        }
        .ash-link-row span, .ash-link-row a {
          color: #c4b5fd; font-weight: 600; cursor: pointer; text-decoration: none;
        }
        .ash-link-row span:hover, .ash-link-row a:hover { color: #e9d5ff; }

        .ash-error {
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.3);
          color: #fca5a5; font-size: 12.5px;
          padding: 9px 12px; border-radius: 10px;
          margin-bottom: 14px; text-align: left;
        }
        .ash-success {
          background: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.3);
          color: #86efac; font-size: 12.5px;
          padding: 9px 12px; border-radius: 10px;
          margin-bottom: 14px; text-align: left;
        }

        .ash-divider { display: flex; align-items: center; gap: 10px; margin: 18px 0; }
        .ash-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.1); }
        .ash-divider-text { font-size: 11px; color: rgba(255,255,255,0.3); }
      `}</style>

      <div className="ash-bg">
        <div className="ash-orb-pink" />
        <div className="ash-card" style={{ width, maxWidth: "100%" }}>
          {badge && (
            <div className="ash-badge"><span className="ash-dot" />{badge}</div>
          )}
          {children}
        </div>
      </div>
    </>
  );
}
