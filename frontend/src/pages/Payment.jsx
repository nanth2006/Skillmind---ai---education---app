import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api"
import { showAlert } from "../components/Alert"

const PRO_PRICE = 499

const PRO_FEATURES = [
  { icon: "📚", title: "All Premium Courses", desc: "Unlock every paid course in the library" },
  { icon: "🤖", title: "Unlimited AI Chat", desc: "No limits on your AI tutor sessions" },
  { icon: "⚡", title: "Priority Approval", desc: "Skip the queue for course enrollment" },
  { icon: "🎓", title: "Certificates", desc: "Download verified completion certificates" },
  { icon: "✨", title: "Ad-Free Experience", desc: "Clean, distraction-free learning" },
]

export default function Payment() {
  const [isPro, setIsPro] = useState(false)
  const [proSince, setProSince] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [history, setHistory] = useState([])
  const navigate = useNavigate()

  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetchStatus()
    fetchHistory()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await API.get("/payments/pro-status", { headers })
      setIsPro(res.data.isPro)
      setProSince(res.data.proSince)
    } catch {
      showAlert("error", "Failed to load Pro status")
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await API.get("/payments/my", { headers })
      setHistory(res.data)
    } catch {
      // ignore silently
    }
  }

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const upgradeToPro = async () => {
    setPaying(true)
    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        showAlert("error", "Couldn't load Razorpay ❌", "Check your internet connection")
        return
      }

      const orderRes = await API.post(
        "/payments/razorpay/order",
        { type: "pro", amount: PRO_PRICE },
        { headers }
      )
      const { orderId, amount, currency, keyId, paymentId } = orderRes.data

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: "SkillMind",
        description: "Pro Plan — Lifetime Access",
        theme: { color: "#a855f7" },
        handler: async (response) => {
          try {
            await API.post(
              "/payments/razorpay/verify",
              {
                orderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                paymentId,
              },
              { headers }
            )
            showAlert("success", "Welcome to Pro! 🎉")
            fetchStatus()
            fetchHistory()
          } catch {
            showAlert("error", "Payment verification failed ❌")
          } finally {
            setPaying(false)
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      })

      rzp.open()
    } catch (err) {
      showAlert("error", "Payment failed ❌", err.response?.data?.error || "")
      setPaying(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; }

        .pay-bg {
          min-height: 100vh;
          background: #07070f;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow-x: hidden;
        }
        .pay-bg::before {
          content: '';
          position: fixed;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 65%);
          top: -180px; right: -180px;
          pointer-events: none;
        }
        .pay-bg::after {
          content: '';
          position: fixed;
          width: 450px; height: 450px;
          background: radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 65%);
          bottom: -120px; left: -120px;
          pointer-events: none;
        }

        .pay-header {
          display: flex; align-items: center; gap: 12px;
          padding: 20px 28px;
          position: relative; z-index: 1;
        }
        .pay-back {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #cbd5e1; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.2s, color 0.2s;
        }
        .pay-back:hover { background: rgba(168,85,247,0.18); color: #c4b5fd; }
        .pay-header-title {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; color: #f1f5f9;
        }

        .pay-wrap {
          max-width: 980px; margin: 0 auto;
          padding: 20px 24px 60px;
          position: relative; z-index: 1;
        }

        /* hero */
        .pay-hero { text-align: center; margin-bottom: 36px; }
        .pay-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(168,85,247,0.12);
          border: 1px solid rgba(168,85,247,0.3);
          color: #c4b5fd; font-size: 12px; font-weight: 700;
          padding: 6px 16px; border-radius: 20px; margin-bottom: 16px;
          letter-spacing: 0.05em; text-transform: uppercase;
        }
        .pay-title {
          font-family: 'Syne', sans-serif;
          font-size: 34px; font-weight: 800;
          background: linear-gradient(90deg, #22d3ee, #a855f7, #ec4899);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }
        .pay-subtitle { font-size: 14px; color: rgba(255,255,255,0.4); max-width: 460px; margin: 0 auto; }

        /* grid */
        .pay-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .pay-grid { grid-template-columns: 1fr; }
        }

        .pay-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 24px;
          padding: 32px;
          backdrop-filter: blur(20px);
        }

        /* plan card */
        .pay-plan-tag {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 800; letter-spacing: 0.08em;
          padding: 6px 14px; border-radius: 20px; margin-bottom: 18px;
          text-transform: uppercase;
        }
        .pay-plan-tag.active { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(74,222,128,0.3); }
        .pay-plan-tag.inactive { background: rgba(168,85,247,0.15); color: #c4b5fd; border: 1px solid rgba(168,85,247,0.3); }

        .pay-price {
          font-family: 'Syne', sans-serif;
          font-size: 42px; font-weight: 800; color: #fff;
          margin-bottom: 4px;
        }
        .pay-price span { font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.35); }
        .pay-price-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 24px; }

        .pay-feature {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .pay-feature:last-child { border-bottom: none; }
        .pay-feature-icon {
          width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
          background: rgba(168,85,247,0.1);
          display: flex; align-items: center; justify-content: center; font-size: 18px;
        }
        .pay-feature-title { font-size: 14px; font-weight: 600; color: #f1f5f9; margin-bottom: 2px; }
        .pay-feature-desc { font-size: 12px; color: rgba(255,255,255,0.35); }

        .pay-btn {
          width: 100%; padding: 16px;
          border: none; border-radius: 16px;
          background: linear-gradient(90deg, #a855f7, #ec4899);
          color: white;
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700;
          cursor: pointer; margin-top: 26px;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 8px 30px rgba(168,85,247,0.35);
          letter-spacing: 0.02em;
        }
        .pay-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-2px); }
        .pay-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* history card */
        .pay-history-title {
          font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #f1f5f9;
          margin-bottom: 18px;
        }
        .pay-hist-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .pay-hist-row:last-child { border-bottom: none; }
        .pay-hist-name { font-size: 13px; font-weight: 600; color: #f1f5f9; }
        .pay-hist-date { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 2px; }
        .pay-hist-amount { font-size: 14px; font-weight: 700; color: #f1f5f9; }
        .pay-status {
          font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
          text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; display: inline-block;
        }
        .pay-status.success { background: rgba(74,222,128,0.15); color: #4ade80; }
        .pay-status.pending { background: rgba(251,191,36,0.15); color: #fbbf24; }
        .pay-status.failed  { background: rgba(248,113,113,0.15); color: #f87171; }
        .pay-empty { font-size: 13px; color: rgba(255,255,255,0.3); text-align: center; padding: 20px 0; }

        .pay-pro-since { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 24px; }
      `}</style>

      <div className="pay-bg">
        <div className="pay-header">
          <button className="pay-back" onClick={() => navigate("/home")} title="Back to Home">←</button>
          <span className="pay-header-title">SkillMind</span>
        </div>

        <div className="pay-wrap">
          <div className="pay-hero">
            <div className="pay-badge">⭐ Premium</div>
            <div className="pay-title">Unlock Your Full Potential</div>
            <p className="pay-subtitle">Upgrade to Pro and get unlimited access to everything SkillMind has to offer.</p>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Loading...</p>
          ) : (
            <div className="pay-grid">

              {/* Plan card */}
              <div className="pay-card">
                {isPro ? (
                  <>
                    <div className="pay-plan-tag active">✅ Pro Member</div>
                    <div className="pay-price">You're all set!</div>
                    <div className="pay-pro-since">
                      Active since {proSince ? new Date(proSince).toLocaleDateString("en-IN") : "—"}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="pay-plan-tag inactive">⭐ Pro Plan</div>
                    <div className="pay-price">₹{PRO_PRICE} <span>/ one-time</span></div>
                    <div className="pay-price-sub">Lifetime access — pay once, learn forever</div>
                  </>
                )}

                <div>
                  {PRO_FEATURES.map(f => (
                    <div className="pay-feature" key={f.title}>
                      <div className="pay-feature-icon">{f.icon}</div>
                      <div>
                        <div className="pay-feature-title">{f.title}</div>
                        <div className="pay-feature-desc">{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {!isPro && (
                  <button className="pay-btn" onClick={upgradeToPro} disabled={paying}>
                    {paying ? "Processing..." : `Pay ₹${PRO_PRICE} & Go Pro`}
                  </button>
                )}
              </div>

              {/* History card */}
              <div className="pay-card">
                <div className="pay-history-title">Payment History</div>
                {history.length === 0 ? (
                  <div className="pay-empty">No payments yet</div>
                ) : (
                  history.map(p => (
                    <div className="pay-hist-row" key={p._id}>
                      <div>
                        <div className="pay-hist-name">{p.type === "pro" ? "Pro Upgrade" : (p.courseId?.title || "Course Payment")}</div>
                        <div className="pay-hist-date">{new Date(p.createdAt).toLocaleDateString("en-IN")}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="pay-hist-amount">₹{p.amount}</div>
                        <span className={`pay-status ${p.status}`}>{p.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
