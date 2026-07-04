import { useState } from "react"
import { showAlert } from "../../components/Alert"

const inp = { width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }
const lbl = { display: "block", fontSize: 12, fontWeight: 500, color: "#6b7280", marginBottom: 5 }

export default function SettingsPage() {
  const [platform, setPlatform] = useState({ name: "NeuroBuddy", email: "admin@neurobuddy.com", currency: "INR", emailNotifications: true, autoApprove: false })
  const [gateway, setGateway]   = useState({ selected: "razorpay", razorpayKey: "", razorpaySecret: "", stripeKey: "", testMode: true })
  const [google, setGoogle]     = useState({ clientId: "", clientSecret: "" })

  const Toggle = ({ checked, onChange }) => (
    <label style={{ position: "relative", display: "inline-block", width: 38, height: 22, cursor: "pointer" }}>
      <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={checked} onChange={onChange} />
      <span style={{ position: "absolute", inset: 0, background: checked ? "#2563eb" : "#d1d5db", borderRadius: 22, transition: "0.2s" }}>
        <span style={{ position: "absolute", height: 16, width: 16, left: checked ? 19 : 3, bottom: 3, background: "#fff", borderRadius: "50%", transition: "0.2s" }} />
      </span>
    </label>
  )

  return (
    <div style={{ flex: 1, padding: 24, marginLeft: 70, background: "#f8fafc", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Settings</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Platform Settings */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, margin: "0 0 16px" }}>Platform Settings</h3>
            <div style={{ marginBottom: 14 }}><label style={lbl}>Platform Name</label><input style={inp} value={platform.name} onChange={e => setPlatform({...platform, name: e.target.value})} /></div>
            <div style={{ marginBottom: 14 }}><label style={lbl}>Admin Email</label><input style={inp} value={platform.email} onChange={e => setPlatform({...platform, email: e.target.value})} /></div>
            <div style={{ marginBottom: 14 }}><label style={lbl}>Currency</label>
              <select style={inp} value={platform.currency} onChange={e => setPlatform({...platform, currency: e.target.value})}>
                <option value="INR">INR (₹)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option>
              </select>
            </div>
            {[["Email Notifications","Send emails on enrollment","emailNotifications"],["Auto-approve Free Courses","Skip approval for free courses","autoApprove"]].map(([l,s,k]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid #f3f4f6" }}>
                <div><div style={{ fontSize: 13, fontWeight: 500 }}>{l}</div><div style={{ fontSize: 11, color: "#9ca3af" }}>{s}</div></div>
                <Toggle checked={platform[k]} onChange={e => setPlatform({...platform, [k]: e.target.checked})} />
              </div>
            ))}
            <button onClick={() => showAlert("success","Settings saved ✅")} style={{ marginTop: 14, padding: "9px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save Settings</button>
          </div>

          {/* Payment Gateway */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 16px" }}>Payment Gateway</h3>
            <div style={{ marginBottom: 14 }}><label style={lbl}>Gateway</label>
              <select style={inp} value={gateway.selected} onChange={e => setGateway({...gateway, selected: e.target.value})}>
                <option value="razorpay">Razorpay</option><option value="stripe">Stripe</option><option value="both">Both</option>
              </select>
            </div>
            {(gateway.selected === "razorpay" || gateway.selected === "both") && <>
              <div style={{ marginBottom: 14 }}><label style={lbl}>Razorpay Key ID</label><input style={inp} type="password" value={gateway.razorpayKey} onChange={e => setGateway({...gateway, razorpayKey: e.target.value})} placeholder="rzp_live_••••" /></div>
              <div style={{ marginBottom: 14 }}><label style={lbl}>Razorpay Secret</label><input style={inp} type="password" value={gateway.razorpaySecret} onChange={e => setGateway({...gateway, razorpaySecret: e.target.value})} placeholder="••••••••" /></div>
            </>}
            {(gateway.selected === "stripe" || gateway.selected === "both") && (
              <div style={{ marginBottom: 14 }}><label style={lbl}>Stripe Secret Key</label><input style={inp} type="password" value={gateway.stripeKey} onChange={e => setGateway({...gateway, stripeKey: e.target.value})} placeholder="sk_live_••••" /></div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid #f3f4f6", marginBottom: gateway.testMode ? 8 : 14 }}>
              <div><div style={{ fontSize: 13, fontWeight: 500 }}>Test Mode</div><div style={{ fontSize: 11, color: "#9ca3af" }}>Use sandbox credentials</div></div>
              <Toggle checked={gateway.testMode} onChange={e => setGateway({...gateway, testMode: e.target.checked})} />
            </div>
            {gateway.testMode && <div style={{ background: "#fefce8", border: "1px solid #fef08a", color: "#a16207", padding: "8px 12px", borderRadius: 8, fontSize: 12, marginBottom: 14 }}>⚠️ Test mode ON — payments won't be real</div>}
            <button onClick={() => showAlert("success","Gateway saved ✅")} style={{ padding: "9px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save Gateway</button>
          </div>

          {/* Google OAuth */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 16px" }}>Google OAuth</h3>
            <div style={{ marginBottom: 14 }}><label style={lbl}>Google Client ID</label><input style={inp} value={google.clientId} onChange={e => setGoogle({...google, clientId: e.target.value})} placeholder="your-client-id.apps.googleusercontent.com" /></div>
            <div style={{ marginBottom: 14 }}><label style={lbl}>Google Client Secret</label><input style={inp} type="password" value={google.clientSecret} onChange={e => setGoogle({...google, clientSecret: e.target.value})} placeholder="••••••••" /></div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>Get credentials from <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>Google Cloud Console →</a></div>
            <button onClick={() => showAlert("success","Google OAuth saved ✅")} style={{ padding: "9px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save Google OAuth</button>
          </div>

          {/* Danger Zone */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 16px" }}>Danger Zone</h3>
            {[["Clear all enrollments","This cannot be undone"],["Reset platform data","Removes all courses & users"]].map(([l,s]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f3f4f6" }}>
                <div><div style={{ fontSize: 13, fontWeight: 500 }}>{l}</div><div style={{ fontSize: 11, color: "#9ca3af" }}>{s}</div></div>
                <button onClick={() => showAlert("warning","Are you sure?","This action is irreversible")} style={{ padding: "7px 16px", background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Reset</button>
              </div>
            ))}
          </div>

        </div>
    </div>
  )
}
