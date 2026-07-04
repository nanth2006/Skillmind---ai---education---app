import { useEffect, useState } from "react"

let alertListeners = []
let alertId = 0

export const showAlert = (
  type,
  title,
  message = ""
) => {
  const id = ++alertId

  alertListeners.forEach((fn) =>
    fn({
      id,
      type,
      title,
      message,
    })
  )
}

function AlertItem({
  id,
  type,
  title,
  message,
  onRemove,
}) {
  const [exiting, setExiting] =
    useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true)

      setTimeout(() => {
        onRemove(id)
      }, 300)
    }, 4000)

    return () => clearTimeout(timer)
  }, [id, onRemove])

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  }

  const bgColors = {
    success: "#f0fdf4",
    error: "#fef2f2",
    warning: "#fefce8",
    info: "#eff6ff",
  }

  const borderColors = {
    success: "#22c55e",
    error: "#ef4444",
    warning: "#eab308",
    info: "#3b82f6",
  }

  return (
    <div
      style={{
        background:
          bgColors[type],
        borderLeft: `5px solid ${borderColors[type]}`,
        borderRadius: "12px",
        padding: "14px 16px",
        display: "flex",
        gap: "12px",
        boxShadow:
          "0 8px 24px rgba(0,0,0,0.12)",
        opacity: exiting ? 0 : 1,
        transform: exiting
          ? "translateX(40px)"
          : "translateX(0)",
        transition:
          "all .3s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontSize: "18px",
        }}
      >
        {icons[type]}
      </span>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontWeight: 600,
            color: "#111827",
          }}
        >
          {title}
        </div>

        {message && (
          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: "#6b7280",
            }}
          >
            {message}
          </div>
        )}
      </div>

      <button
        onClick={() => {
          setExiting(true)

          setTimeout(() => {
            onRemove(id)
          }, 300)
        }}
        style={{
          border: "none",
          background: "none",
          cursor: "pointer",
        }}
      >
        ✕
      </button>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "3px",
          width: "100%",
          background:
            borderColors[type],
          animation:
            "progress 4s linear forwards",
        }}
      />
    </div>
  )
}

export default function AlertContainer() {
  const [alerts, setAlerts] =
    useState([])

  useEffect(() => {
    const handler = (alert) => {
      setAlerts((prev) => [
        ...prev,
        alert,
      ])
    }

    alertListeners.push(handler)

    return () => {
      alertListeners =
        alertListeners.filter(
          (fn) => fn !== handler
        )
    }
  }, [])

  const remove = (id) => {
    setAlerts((prev) =>
      prev.filter(
        (a) => a.id !== id
      )
    )
  }

  return (
    <>
      <style>
        {`
        @keyframes progress {
          from { width:100%; }
          to { width:0%; }
        }
      `}
      </style>

      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          width: 350,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {alerts.map((alert) => (
          <AlertItem
            key={alert.id}
            {...alert}
            onRemove={remove}
          />
        ))}
      </div>
    </>
  )
}