import { useEffect, useRef, useState } from "react"
import API from "../api"

// A short, generated "beep" so we don't need to ship/host an audio file.
const playAlarmSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.value = 880
    gain.gain.value = 0.001
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.stop(ctx.currentTime + 0.45)
    setTimeout(() => ctx.close(), 600)
  } catch {
    // AudioContext unavailable (older browser) — fail silently
  }
}

export default function AlarmCenter() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [snoozeTarget, setSnoozeTarget] = useState(null)
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const knownIds = useRef(new Set())
  const firstLoad = useRef(true)

  const fetchAlarms = async () => {
    try {
      const res = await API.get("/notifications")
      const list = res.data || []

      const newOnes = list.filter((n) => !knownIds.current.has(n._id))
      if (!firstLoad.current && newOnes.some((n) => n.status === "active")) {
        playAlarmSound()
      }
      list.forEach((n) => knownIds.current.add(n._id))
      firstLoad.current = false

      setNotifications(list)
    } catch {
      // silent — alarm bell just won't update this cycle
    }
  }

  useEffect(() => {
    fetchAlarms()
    const interval = setInterval(fetchAlarms, 60000) // poll every minute
    return () => clearInterval(interval)
  }, [])

  const activeCount = notifications.filter((n) => n.status === "active").length

  const handleDismiss = async (id) => {
    setBusy(true)
    try {
      await API.put(`/notifications/${id}/dismiss`)
      setNotifications((ns) => ns.filter((n) => n._id !== id))
    } finally {
      setBusy(false)
    }
  }

  const submitSnooze = async () => {
    if (!reason.trim()) return
    setBusy(true)
    try {
      await API.put(`/notifications/${snoozeTarget._id}/snooze`, {
        reason,
        hours: 24,
      })
      setNotifications((ns) =>
        ns.map((n) =>
          n._id === snoozeTarget._id ? { ...n, status: "snoozed" } : n
        )
      )
      setSnoozeTarget(null)
      setReason("")
    } catch {
      // keep modal open so they can retry
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&display=swap');

        .alc-wrap { position: relative; }
        .alc-bell {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #cbd5e1; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; position: relative;
          transition: background 0.2s, color 0.2s, transform 0.15s;
        }
        .alc-bell:hover { background: rgba(168,85,247,0.18); color: #c4b5fd; }
        .alc-bell.ringing { animation: alc-shake 1.6s ease-in-out infinite; }
        @keyframes alc-shake {
          0%, 100% { transform: rotate(0); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-12deg); }
          30% { transform: rotate(8deg); }
          40% { transform: rotate(-6deg); }
          50% { transform: rotate(0); }
        }
        .alc-badge {
          position: absolute; top: -4px; right: -4px;
          min-width: 16px; height: 16px; padding: 0 3px;
          background: linear-gradient(90deg,#ec4899,#a855f7);
          border-radius: 20px;
          font-size: 10px; font-weight: 700; color: white;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          box-shadow: 0 0 8px rgba(236,72,153,0.6);
        }

        .alc-panel {
          position: absolute; top: 48px; right: 0;
          width: 320px; max-height: 420px; overflow-y: auto;
          background: rgba(15,15,22,0.97);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          backdrop-filter: blur(20px);
          z-index: 2000;
          padding: 14px;
          animation: alc-pop 0.18s ease both;
        }
        @keyframes alc-pop {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .alc-title {
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
          color: #f1f5f9; margin: 0 0 10px;
        }
        .alc-empty {
          font-size: 12.5px; color: rgba(255,255,255,0.35);
          text-align: center; padding: 24px 8px;
        }
        .alc-item {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 12px; margin-bottom: 8px;
        }
        .alc-item.snoozed { opacity: 0.55; }
        .alc-msg { font-size: 12.5px; color: #e2e8f0; line-height: 1.45; margin-bottom: 8px; }
        .alc-course { font-weight: 700; color: #c4b5fd; }
        .alc-tag {
          display: inline-block; font-size: 10px; font-weight: 700;
          padding: 2px 8px; border-radius: 20px; margin-bottom: 8px;
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .alc-tag.active { background: rgba(248,113,113,0.15); color: #f87171; }
        .alc-tag.snoozed-tag { background: rgba(251,191,36,0.15); color: #fbbf24; }
        .alc-actions { display: flex; gap: 8px; }
        .alc-action {
          flex: 1; padding: 7px; border-radius: 8px; border: none;
          font-size: 11.5px; font-weight: 700; cursor: pointer;
          font-family: 'Syne', sans-serif;
          transition: opacity 0.2s, transform 0.1s;
        }
        .alc-action:hover { opacity: 0.85; transform: translateY(-1px); }
        .alc-action.snooze { background: rgba(251,191,36,0.14); color: #fbbf24; }
        .alc-action.done { background: rgba(74,222,128,0.14); color: #4ade80; }

        .alc-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.55);
          display: flex; align-items: center; justify-content: center;
          z-index: 3000;
        }
        .alc-modal {
          width: 340px; background: rgba(15,15,22,0.98);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 18px;
          padding: 22px; box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }
        .alc-modal h4 {
          font-family: 'Syne', sans-serif; color: #f1f5f9; font-size: 15px; margin: 0 0 6px;
        }
        .alc-modal p { font-size: 12px; color: rgba(255,255,255,0.4); margin: 0 0 14px; }
        .alc-modal textarea {
          width: 100%; min-height: 80px; resize: vertical;
          border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); color: #f1f5f9;
          padding: 10px 12px; font-size: 13px; font-family: inherit;
          box-sizing: border-box; outline: none;
        }
        .alc-modal textarea:focus { border-color: rgba(168,85,247,0.5); }
        .alc-modal-actions { display: flex; gap: 10px; margin-top: 14px; }
        .alc-modal-actions button {
          flex: 1; padding: 10px; border: none; border-radius: 10px;
          font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: 'Syne', sans-serif;
        }
        .alc-cancel { background: rgba(255,255,255,0.06); color: #cbd5e1; }
        .alc-confirm { background: linear-gradient(90deg,#a855f7,#ec4899); color: white; }
        .alc-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="alc-wrap">
        <button
          className={`alc-bell${activeCount > 0 ? " ringing" : ""}`}
          onClick={() => setOpen((o) => !o)}
          title="Deadline alarms"
        >
          🔔
          {activeCount > 0 && <span className="alc-badge">{activeCount}</span>}
        </button>

        {open && (
          <div className="alc-panel">
            <p className="alc-title">Deadline Alarms</p>

            {notifications.length === 0 ? (
              <div className="alc-empty">No alarms — you're all caught up 🎉</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`alc-item${n.status === "snoozed" ? " snoozed" : ""}`}
                >
                  <span
                    className={`alc-tag ${
                      n.status === "snoozed" ? "snoozed-tag" : "active"
                    }`}
                  >
                    {n.status === "snoozed" ? "Snoozed" : "Overdue"}
                  </span>
                  <div className="alc-msg">
                    <span className="alc-course">{n.courseId?.title || "Course"}</span>
                    {" — "}deadline passed and it's still incomplete.
                  </div>
                  <div className="alc-actions">
                    <button
                      className="alc-action snooze"
                      onClick={() => setSnoozeTarget(n)}
                      disabled={busy}
                    >
                      Snooze
                    </button>
                    <button
                      className="alc-action done"
                      onClick={() => handleDismiss(n._id)}
                      disabled={busy}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {snoozeTarget && (
        <div
          className="alc-modal-overlay"
          onClick={() => {
            setSnoozeTarget(null)
            setReason("")
          }}
        >
          <div className="alc-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Why snooze this alarm?</h4>
            <p>
              Give a reason for "{snoozeTarget.courseId?.title || "this course"}" —
              it'll go quiet for 24 hours.
            </p>
            <textarea
              autoFocus
              placeholder="e.g. Exams this week, will finish after Friday"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="alc-modal-actions">
              <button
                className="alc-cancel"
                onClick={() => {
                  setSnoozeTarget(null)
                  setReason("")
                }}
              >
                Cancel
              </button>
              <button
                className="alc-confirm"
                onClick={submitSnooze}
                disabled={!reason.trim() || busy}
              >
                {busy ? "Saving..." : "Snooze Alarm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
