export function WindowControls({ dark = false }: { dark?: boolean }) {
  const borderColor = dark ? "var(--bg-color)" : "var(--bg-color)"

  return (
    <div className="window-controls">
      <button className="window-btn" aria-label="Minimize" style={{ borderColor }}>
        <span className="minimize-icon" />
      </button>
      <button className="window-btn" aria-label="Maximize" style={{ borderColor }}>
        <span className="maximize-icon" />
      </button>
      <button className="window-btn window-close" aria-label="Close" style={{ borderColor }}>
        <span className="close-icon" />
      </button>
    </div>
  )
}
