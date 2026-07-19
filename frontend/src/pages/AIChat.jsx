import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activePage, setActivePage }) {
  const [hovered, setHovered] = useState(false);
  const navLinks = [
    { id: "chat",       icon: "◎", label: "AI Chat"     },
    { id: "questions",  icon: "⊟", label: "Questions"   },
    { id: "motivation", icon: "✦", label: "Motivation"  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        .sb {
          width: ${hovered ? "210px" : "68px"};
          height: 100vh; background: #060610;
          position: fixed; top: 0; left: 0;
          display: flex; flex-direction: column;
          padding: 20px 0;
          transition: width 0.3s cubic-bezier(.77,0,.18,1);
          overflow: hidden; z-index: 1000;
          border-right: 1px solid rgba(139,92,246,0.15);
          box-sizing: border-box;
        }
        .sb-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 0 13px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 14px; white-space: nowrap;
        }
        .sb-logo-icon {
          width: 42px; height: 42px; flex-shrink: 0;
          background: linear-gradient(135deg,#7c3aed,#ec4899);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; color: #fff;
          box-shadow: 0 0 18px rgba(124,58,237,0.4);
        }
        .sb-logo-text {
          font-family:'Syne',sans-serif; font-weight:800;
          font-size:13px; color:#f1f5f9; letter-spacing:.04em;
          opacity: ${hovered ? 1 : 0};
          transition: opacity 0.15s ${hovered ? "0.1s" : "0s"};
          white-space:nowrap;
        }
        .sb-nav { flex:1; display:flex; flex-direction:column; gap:4px; padding:0 9px; }
        .sb-link {
          display:flex; align-items:center; gap:13px;
          padding: 12px 8px; border-radius:10px;
          cursor:pointer; color:rgba(255,255,255,0.4);
          font-family:'Syne',sans-serif; font-size:13px; font-weight:400;
          white-space:nowrap; transition:background 0.2s,color 0.2s;
          position:relative; user-select:none; border:none; background:none; text-align:left;
        }
        .sb-link:hover { background:rgba(124,58,237,0.12); color:#e2d9f3; }
        .sb-link.active {
          background: rgba(124,58,237,0.2); color:#c4b5fd;
        }
        .sb-link.active::before {
          content:''; position:absolute; left:0; top:18%; bottom:18%;
          width:3px; border-radius:0 3px 3px 0;
          background:linear-gradient(180deg,#7c3aed,#ec4899);
        }
        .sb-icon { font-size:18px; flex-shrink:0; width:26px; text-align:center; }
        .sb-label {
          opacity:${hovered ? 1 : 0};
          transition:opacity 0.15s ${hovered ? "0.08s" : "0s"};
        }
      `}</style>
      <div
        className="sb"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="sb-logo">
          <div className="sb-logo-icon">✦</div>
          <span className="sb-logo-text">SKILL MIND</span>
        </div>
        <nav className="sb-nav">
          {navLinks.map(({ id, icon, label }) => (
            <button
              key={id}
              className={`sb-link${activePage === id ? " active" : ""}`}
              onClick={() => setActivePage(id)}
            >
              <span className="sb-icon">{icon}</span>
              <span className="sb-label">{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────
function AIChat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAttachedFile(file);
    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
    e.target.value = "";
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    setFilePreview(null);
  };

  const sendMessage = async () => {
    if ((!message.trim() && !attachedFile) || loading) return;

    const currentMsg = message;
    const currentFile = attachedFile;
    const currentPreview = filePreview;

    const userMsg = {
      sender: "user",
      text: currentMsg,
      fileName: currentFile?.name,
      filePreview: currentPreview,
    };
    setChat(prev => [...prev, userMsg, { sender: "ai", text: "" }]);
    setMessage("");
    setAttachedFile(null);
    setFilePreview(null);
    setLoading(true);

    try {
      let res;
      if (currentFile) {
        const formData = new FormData();
        formData.append("message", currentMsg);
        formData.append("file", currentFile);
        res = await fetch(`${BASE}/api/ai/stream`, {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch(`${BASE}/api/ai/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: currentMsg }),
        });
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiText = "", buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop();
        for (let part of parts) {
          if (!part.startsWith("data: ")) continue;
          const jsonStr = part.replace("data: ", "").trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed?.choices?.[0]?.delta?.content;
            if (content) {
              aiText += content;
              setChat(prev => {
                const u = [...prev];
                u[u.length - 1] = { sender: "ai", text: aiText + "▋" };
                return u;
              });
            }
          } catch {}
        }
      }
      setChat(prev => {
        const u = [...prev];
        u[u.length - 1] = { sender: "ai", text: aiText };
        return u;
      });
    } catch {
      setChat(prev => {
        const u = [...prev];
        u[u.length - 1] = { sender: "ai", text: "❌ Error connecting to AI." };
        return u;
      });
    }
    setLoading(false);
  };

  return (
    <div className="chat-wrap">
      <style>{`
        .chat-wrap { display:flex; flex-direction:column; height:100%; position:relative; }
        .chat-empty { position:absolute; top:40%; left:50%; transform:translate(-50%,-50%); text-align:center; pointer-events:none; }
        .chat-empty-icon { font-size:52px; margin-bottom:16px; opacity:0.3; }
        .chat-empty-title { font-family:'Syne',sans-serif; font-size:22px; font-weight:700; color:rgba(255,255,255,0.4); margin:0 0 6px; }
        .chat-empty-sub { font-size:14px; color:rgba(255,255,255,0.2); margin:0; }
        .chat-box { flex:1; overflow-y:auto; padding:20px 24px; }
        .chat-row { display:flex; margin-bottom:12px; }
        .chat-row.user { justify-content:flex-end; }
        .chat-row.ai { justify-content:flex-start; }
        .chat-avatar { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,#7c3aed,#ec4899); display:flex; align-items:center; justify-content:center; font-size:14px; color:#fff; flex-shrink:0; margin-right:10px; margin-top:2px; }
        .chat-bubble { padding:12px 16px; max-width:65%; font-size:14px; line-height:1.65; color:#f1f5f9; white-space:pre-wrap; }
        .chat-bubble.user { background:linear-gradient(135deg,#7c3aed,#ec4899); border-radius:18px 18px 4px 18px; }
        .chat-bubble.ai { background:rgba(255,255,255,0.05); border-radius:18px 18px 18px 4px; border:1px solid rgba(139,92,246,0.2); }
        .chat-attached-img { max-width:100%; border-radius:10px; margin-bottom:8px; display:block; }
        .chat-attached-file-tag { font-size:12px; background:rgba(255,255,255,0.1); padding:4px 10px; border-radius:8px; display:inline-block; margin-bottom:8px; }
        .chat-preview-bar { margin:0 24px 10px; display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.05); border:1px solid rgba(139,92,246,0.25); border-radius:10px; padding:8px 12px; }
        .chat-preview-img { width:36px; height:36px; object-fit:cover; border-radius:6px; }
        .chat-preview-name { flex:1; font-size:13px; color:rgba(255,255,255,0.7); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .chat-preview-remove { background:none; border:none; color:rgba(255,255,255,0.5); cursor:pointer; font-size:14px; }
        .chat-input-row { padding:16px 24px; border-top:1px solid rgba(255,255,255,0.06); display:flex; gap:10px; }
        .chat-attach-btn { width:46px; height:46px; border-radius:12px; border:1px solid rgba(139,92,246,0.25); background:rgba(255,255,255,0.06); color:#f1f5f9; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .chat-input { flex:1; background:rgba(255,255,255,0.06); border:1px solid rgba(139,92,246,0.25); border-radius:14px; padding:12px 18px; color:#f1f5f9; font-size:14px; outline:none; font-family:'Syne',sans-serif; }
        .chat-send-btn { width:46px; height:46px; border-radius:12px; border:none; background:linear-gradient(135deg,#7c3aed,#ec4899); color:#fff; font-size:20px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
      `}</style>

      {chat.length === 0 && (
        <div className="chat-empty">
          <div className="chat-empty-icon">◎</div>
          <p className="chat-empty-title">Ask me anything</p>
          <p className="chat-empty-sub">Your personal AI tutor is ready</p>
        </div>
      )}

      <div className="chat-box">
        {chat.map((c, i) => (
          <div key={i} className={`chat-row ${c.sender}`}>
            {c.sender === "ai" && <div className="chat-avatar">✦</div>}
            <div className={`chat-bubble ${c.sender}`}>
              {c.filePreview && (
                <img src={c.filePreview} alt="attachment" className="chat-attached-img" />
              )}
              {c.fileName && !c.filePreview && (
                <div className="chat-attached-file-tag">📎 {c.fileName}</div>
              )}
              {c.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {filePreview && (
        <div className="chat-preview-bar">
          <img src={filePreview} alt="preview" className="chat-preview-img" />
          <span className="chat-preview-name">{attachedFile?.name}</span>
          <button onClick={removeAttachment} className="chat-preview-remove">✕</button>
        </div>
      )}
      {attachedFile && !filePreview && (
        <div className="chat-preview-bar">
          <span style={{fontSize:18}}>📄</span>
          <span className="chat-preview-name">{attachedFile.name}</span>
          <button onClick={removeAttachment} className="chat-preview-remove">✕</button>
        </div>
      )}

      <div className="chat-input-row">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf,.docx,.txt"
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="chat-attach-btn"
          title="Attach file"
        >
          📎
        </button>
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key==="Enter" && sendMessage()}
          placeholder="Ask something..."
          className="chat-input"
        />
        <button onClick={sendMessage} className="chat-send-btn" disabled={loading}>
          {loading ? <span style={{fontSize:18}}>⋯</span> : "↑"}
        </button>
      </div>
    </div>
  );
}

// ─── Question Generator ───────────────────────────────────────────────────────
function QuestionGenerator() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState({});
  const [revealed, setRevealed] = useState({});

  const generate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setQuestions([]);
    setSelected({});
    setRevealed({});

    try {
      const res = await fetch(`${BASE}/api/ai/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Generate exactly ${count} multiple-choice questions on "${topic}" at ${difficulty} difficulty.
Return ONLY valid JSON array, no markdown, no explanation. Format:
[{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"answer":"A) ...","explanation":"..."}]`
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let full = "", buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop();
        for (let part of parts) {
          if (!part.startsWith("data: ")) continue;
          const js = part.replace("data: ", "").trim();
          if (js === "[DONE]") break;
          try {
            const p = JSON.parse(js);
            const c = p?.choices?.[0]?.delta?.content;
            if (c) full += c;
          } catch {}
        }
      }
      const clean = full.replace(/```json|```/g, "").trim();
      const start = clean.indexOf("[");
      const end = clean.lastIndexOf("]");
      if (start !== -1 && end !== -1) {
        const parsed = JSON.parse(clean.slice(start, end + 1));
        setQuestions(parsed);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const selectOpt = (qi, opt) => {
    if (revealed[qi]) return;
    setSelected(p => ({ ...p, [qi]: opt }));
  };

  const reveal = (qi) => setRevealed(p => ({ ...p, [qi]: true }));

  const score = questions.length
    ? questions.filter((q, i) => revealed[i] && selected[i] === q.answer).length
    : 0;

  return (
    <div style={qStyles.wrap}>
      {/* Controls */}
      <div style={qStyles.controls}>
        <div style={qStyles.ctrlTitle}>✦ Question Generator</div>
        <div style={qStyles.ctrlRow}>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Topic (e.g. Photosynthesis, Python, History...)"
            style={qStyles.topicInput}
            onKeyDown={e => e.key === "Enter" && generate()}
          />
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={qStyles.select}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select value={count} onChange={e => setCount(+e.target.value)} style={qStyles.select}>
            {[3,5,8,10].map(n => <option key={n} value={n}>{n} Qs</option>)}
          </select>
          <button onClick={generate} style={qStyles.genBtn} disabled={loading}>
            {loading ? "Generating..." : "Generate ✦"}
          </button>
        </div>
      </div>

      {/* Questions */}
      <div style={qStyles.list}>
        {loading && (
          <div style={qStyles.loadWrap}>
            <div style={qStyles.spinner}></div>
            <p style={qStyles.loadText}>Crafting your questions...</p>
          </div>
        )}

        {!loading && questions.length > 0 && (
          <div style={qStyles.scoreBar}>
            Score: <span style={{color:"#a78bfa"}}>{score}</span> / {Object.keys(revealed).length} answered
          </div>
        )}

        {questions.map((q, qi) => (
          <div key={qi} style={qStyles.card}>
            <div style={qStyles.qNum}>Q{qi + 1}</div>
            <p style={qStyles.qText}>{q.question}</p>
            <div style={qStyles.optGrid}>
              {q.options.map((opt, oi) => {
                const isSelected = selected[qi] === opt;
                const isCorrect = q.answer === opt;
                const isReveal = revealed[qi];
                let bg = "rgba(255,255,255,0.04)";
                let border = "1px solid rgba(255,255,255,0.08)";
                let color = "rgba(255,255,255,0.75)";
                if (isReveal && isCorrect) { bg="rgba(34,197,94,0.15)"; border="1px solid rgba(34,197,94,0.5)"; color="#86efac"; }
                else if (isReveal && isSelected && !isCorrect) { bg="rgba(239,68,68,0.15)"; border="1px solid rgba(239,68,68,0.4)"; color="#fca5a5"; }
                else if (isSelected && !isReveal) { bg="rgba(124,58,237,0.18)"; border="1px solid rgba(124,58,237,0.5)"; color="#c4b5fd"; }
                return (
                  <button key={oi} onClick={() => selectOpt(qi, opt)} style={{ ...qStyles.optBtn, background:bg, border, color }}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {selected[qi] && !revealed[qi] && (
              <button onClick={() => reveal(qi)} style={qStyles.revealBtn}>Check Answer</button>
            )}
            {revealed[qi] && (
              <div style={qStyles.explanation}>
                <span style={{color:"#a78bfa",fontWeight:700}}>Explanation: </span>{q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const qStyles = {
  wrap: { display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" },
  controls: { padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0 },
  ctrlTitle: { fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:"#f1f5f9", marginBottom:14, letterSpacing:".02em" },
  ctrlRow: { display:"flex", gap:10, flexWrap:"wrap" },
  topicInput: { flex:1, minWidth:200, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:10, padding:"10px 14px", color:"#f1f5f9", fontSize:13, outline:"none", fontFamily:"'Syne',sans-serif" },
  select: { background:"rgba(255,255,255,0.06)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:10, padding:"10px 12px", color:"#c4b5fd", fontSize:13, cursor:"pointer", outline:"none" },
  genBtn: { padding:"10px 20px", background:"linear-gradient(135deg,#7c3aed,#ec4899)", border:"none", borderRadius:10, color:"#fff", fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer" },
  list: { flex:1, overflowY:"auto", padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 },
  loadWrap: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:60, gap:16 },
  spinner: { width:40, height:40, border:"3px solid rgba(124,58,237,0.2)", borderTop:"3px solid #7c3aed", borderRadius:"50%", animation:"spin 0.8s linear infinite" },
  loadText: { color:"rgba(255,255,255,0.4)", fontFamily:"'Syne',sans-serif", fontSize:14 },
  scoreBar: { padding:"10px 16px", background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.2)", borderRadius:10, fontSize:13, fontFamily:"'Syne',sans-serif", color:"rgba(255,255,255,0.6)" },
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"18px 20px" },
  qNum: { fontSize:11, fontWeight:700, color:"#7c3aed", letterSpacing:".1em", marginBottom:8, fontFamily:"'Syne',sans-serif" },
  qText: { fontSize:14, color:"#f1f5f9", fontFamily:"'Syne',sans-serif", fontWeight:600, margin:"0 0 14px", lineHeight:1.6 },
  optGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 },
  optBtn: { padding:"10px 14px", borderRadius:10, cursor:"pointer", fontSize:13, fontFamily:"'Syne',sans-serif", textAlign:"left", transition:"all 0.15s", lineHeight:1.5 },
  revealBtn: { marginTop:12, padding:"8px 18px", background:"linear-gradient(135deg,#7c3aed,#ec4899)", border:"none", borderRadius:8, color:"#fff", fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, cursor:"pointer" },
  explanation: { marginTop:12, padding:"10px 14px", background:"rgba(167,139,250,0.08)", borderRadius:8, fontSize:13, color:"rgba(255,255,255,0.7)", lineHeight:1.65 },
};

// ─── Motivation Generator ─────────────────────────────────────────────────────
function MotivationGenerator() {
  const [mood, setMood] = useState("inspired");
  const [goal, setGoal] = useState("");
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const moods = [
    { id:"inspired",    label:"✨ Inspired",   color:"#a78bfa" },
    { id:"struggling",  label:"💪 Struggling", color:"#f97316" },
    { id:"confident",   label:"🔥 Confident",  color:"#22d3ee" },
    { id:"tired",       label:"😴 Tired",       color:"#ec4899" },
    { id:"focused",     label:"🎯 Focused",     color:"#34d399" },
  ];

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setCard(null);

    try {
      const res = await fetch(`${BASE}/api/ai/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Generate a powerful motivational message for a student feeling "${mood}"${goal ? ` working towards "${goal}"` : ""}.
Return ONLY valid JSON, no markdown:
{"quote":"...","author":"...","message":"...","affirmation":"...","emoji":"..."}`
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let full = "", buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop();
        for (let part of parts) {
          if (!part.startsWith("data: ")) continue;
          const js = part.replace("data: ", "").trim();
          if (js === "[DONE]") break;
          try {
            const p = JSON.parse(js);
            const c = p?.choices?.[0]?.delta?.content;
            if (c) full += c;
          } catch {}
        }
      }
      const clean = full.replace(/```json|```/g, "").trim();
      const start = clean.indexOf("{");
      const end = clean.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        const parsed = JSON.parse(clean.slice(start, end + 1));
        setCard(parsed);
        setHistory(p => [parsed, ...p].slice(0, 10));
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const moodColor = moods.find(m => m.id === mood)?.color || "#a78bfa";

  return (
    <div style={mStyles.wrap}>
      {/* Controls */}
      <div style={mStyles.top}>
        <div style={mStyles.title}>✦ Motivation Generator</div>
        <div style={mStyles.moodRow}>
          {moods.map(m => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              style={{
                ...mStyles.moodBtn,
                background: mood === m.id ? `${m.color}22` : "rgba(255,255,255,0.04)",
                border: `1px solid ${mood === m.id ? m.color : "rgba(255,255,255,0.08)"}`,
                color: mood === m.id ? m.color : "rgba(255,255,255,0.5)",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div style={mStyles.goalRow}>
          <input
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="Your goal (optional): e.g. crack JEE, learn coding..."
            style={mStyles.goalInput}
            onKeyDown={e => e.key === "Enter" && generate()}
          />
          <button onClick={generate} disabled={loading} style={{ ...mStyles.genBtn, background: `linear-gradient(135deg,${moodColor},#ec4899)` }}>
            {loading ? "✦ Creating..." : "Motivate Me ✦"}
          </button>
        </div>
      </div>

      <div style={mStyles.body}>
        {/* Main card */}
        <div style={mStyles.cardArea}>
          {loading && (
            <div style={mStyles.loadCard}>
              <div style={{fontSize:48, marginBottom:16}}>✦</div>
              <p style={{color:"rgba(255,255,255,0.4)", fontFamily:"'Syne',sans-serif"}}>Channeling inspiration...</p>
              <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
            </div>
          )}

          {!loading && !card && (
            <div style={mStyles.emptyCard}>
              <div style={{fontSize:56, marginBottom:16, opacity:0.2}}>✦</div>
              <p style={mStyles.emptyText}>Choose your mood & hit Motivate Me</p>
            </div>
          )}

          {!loading && card && (
            <div style={{ ...mStyles.motivCard, borderColor:`${moodColor}33` }}>
              <div style={{fontSize:48, marginBottom:16}}>{card.emoji}</div>
              <div style={{...mStyles.quoteText, color: moodColor}}>"{card.quote}"</div>
              <div style={mStyles.author}>— {card.author}</div>
              <div style={mStyles.divider} />
              <div style={mStyles.message}>{card.message}</div>
              <div style={{ ...mStyles.affirmation, background:`${moodColor}15`, borderColor:`${moodColor}30`, color: moodColor }}>
                💬 {card.affirmation}
              </div>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={mStyles.historyPanel}>
            <div style={mStyles.histTitle}>Recent ✦</div>
            {history.map((h, i) => (
              <div key={i} onClick={() => setCard(h)} style={mStyles.histItem}>
                <span style={{fontSize:18, marginRight:8}}>{h.emoji}</span>
                <span style={{fontSize:12, color:"rgba(255,255,255,0.5)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{h.quote.slice(0,50)}...</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const mStyles = {
  wrap: { display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" },
  top: { padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0 },
  title: { fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:"#f1f5f9", marginBottom:14, letterSpacing:".02em" },
  moodRow: { display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 },
  moodBtn: { padding:"8px 14px", borderRadius:20, cursor:"pointer", fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:600, transition:"all 0.2s" },
  goalRow: { display:"flex", gap:10 },
  goalInput: { flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:10, padding:"10px 14px", color:"#f1f5f9", fontSize:13, outline:"none", fontFamily:"'Syne',sans-serif" },
  genBtn: { padding:"10px 22px", border:"none", borderRadius:10, color:"#fff", fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" },
  body: { flex:1, overflowY:"auto", padding:"24px", display:"flex", gap:20 },
  cardArea: { flex:1, display:"flex", flexDirection:"column" },
  loadCard: { flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,0.02)", borderRadius:20, border:"1px solid rgba(255,255,255,0.06)", padding:40, animation:"pulse 1.5s ease infinite" },
  emptyCard: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:60, textAlign:"center" },
  emptyText: { color:"rgba(255,255,255,0.25)", fontFamily:"'Syne',sans-serif", fontSize:15 },
  motivCard: { background:"rgba(255,255,255,0.03)", border:"1px solid", borderRadius:20, padding:"32px", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:12 },
  quoteText: { fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700, lineHeight:1.5, fontStyle:"italic" },
  author: { fontSize:13, color:"rgba(255,255,255,0.4)", fontFamily:"'Syne',sans-serif" },
  divider: { width:60, height:2, background:"linear-gradient(90deg,#7c3aed,#ec4899)", borderRadius:2, margin:"8px 0" },
  message: { fontSize:14, color:"rgba(255,255,255,0.75)", lineHeight:1.75, fontFamily:"'Syne',sans-serif", maxWidth:600 },
  affirmation: { marginTop:8, padding:"12px 20px", borderRadius:12, fontSize:13, fontWeight:600, fontFamily:"'Syne',sans-serif", border:"1px solid", width:"100%", boxSizing:"border-box" },
  historyPanel: { width:220, flexShrink:0, display:"flex", flexDirection:"column", gap:8 },
  histTitle: { fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:".08em", marginBottom:4 },
  histItem: { display:"flex", alignItems:"center", padding:"10px 12px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, cursor:"pointer", transition:"background 0.15s", overflow:"hidden" },
};

// ─── Page header labels ────────────────────────────────────────────────────────
const PAGE_LABELS = {
  chat:       { icon:"◎", title:"AI Chat",           sub:"Your personal AI tutor" },
  questions:  { icon:"⊟", title:"Question Generator", sub:"Practice makes perfect" },
  motivation: { icon:"✦", title:"Motivation",         sub:"Stay driven, stay focused" },
};

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("chat");
  const pg = PAGE_LABELS[page];
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
        body { background:#080812; color:#f1f5f9; font-family:'Syne',sans-serif; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(124,58,237,0.3); border-radius:4px; }
        input::placeholder { color:rgba(255,255,255,0.25); }
        select option { background:#1e1b4b; }
      `}</style>

      <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"#080812" }}>
        <Sidebar activePage={page} setActivePage={setPage} />

        {/* Main content */}
        <div style={{ marginLeft:68, flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Top header */}
          <div style={{
            padding:"16px 28px",
            borderBottom:"1px solid rgba(255,255,255,0.06)",
            display:"flex", alignItems:"center", gap:12,
            background:"rgba(8,8,18,0.95)",
            backdropFilter:"blur(12px)",
            flexShrink:0,
          }}>
            <button
              onClick={() => navigate("/home")}
              title="Back to Home"
              style={{
                width:36, height:36, borderRadius:10,
                background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.08)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:16, color:"#cbd5e1", cursor:"pointer",
                flexShrink:0, transition:"background 0.2s, color 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.18)"; e.currentTarget.style.color = "#c4b5fd" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#cbd5e1" }}
            >
              ←
            </button>
            <div style={{
              width:36, height:36, borderRadius:10,
              background:"linear-gradient(135deg,#7c3aed22,#ec489922)",
              border:"1px solid rgba(124,58,237,0.3)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:18, color:"#a78bfa",
            }}>
              {pg.icon}
            </div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:"#f1f5f9", letterSpacing:".02em" }}>
                {pg.title}
              </div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:1 }}>{pg.sub}</div>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#34d399", boxShadow:"0 0 8px #34d399" }} />
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>AI Online</span>
            </div>
          </div>

          {/* Page */}
          <div style={{ flex:1, overflow:"hidden" }}>
            {page === "chat"       && <AIChat />}
            {page === "questions"  && <QuestionGenerator />}
            {page === "motivation" && <MotivationGenerator />}
          </div>
        </div>
      </div>
    </>
  );
}