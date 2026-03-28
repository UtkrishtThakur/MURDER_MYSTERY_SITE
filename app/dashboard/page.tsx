'use client'
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type TaskStatus = "completed" | "active" | "locked";

interface Task {
  id: number;
  name: string;
  fullName: string;
  desc: string;
  status: TaskStatus;
  linkedFile?: string;
}

interface ChatMessage {
  id: string;
  role: "ghost" | "user" | "query" | "hint";
  text: string;
  hintNote?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    name: "Logs",
    fullName: "Log Analysis",
    desc: "Analyze internal server access logs from the night of the incident. Cross-reference timestamps with employee badge data and identify anomalies — files accessed outside normal hours, unusual API calls, or signs of data exfiltration.",
    status: "locked",
    linkedFile: "/Tasks/task1",
  },
  {
    id: 2,
    name: "CCTV Reconstruction",
    fullName: "CCTV Reconstruction",
    desc: "Multiple camera feeds from the laboratory corridor are being processed. Carefully observe the available surveillance footage — movement patterns, access attempts, and whether the subject acted alone.",
    status: "locked",
    linkedFile: "/Tasks/task2",
  },
  {
    id: 3,
    name: "Code Audit",
    fullName: "Code Audit",
    desc: "Deep audit of the proprietary NeuroBand firmware codebase. Look for unauthorized commits, obfuscated backdoors, tampered version history, or code segments that could facilitate data extraction without triggering security alerts.",
    status: "locked",
    linkedFile: "/Tasks/task3",
  },
  {
    id: 4,
    name: "Chip Telemetry",
    fullName: "Chip Telemetry",
    desc: "Access and reconstruct neural chip telemetry records associated with the subject. Telemetry data can reveal physical location, cognitive stress signatures, and whether the neural interface was used to extract protected data at a hardware level.",
    status: "locked",
    linkedFile: "/Tasks/task4",
  },
  {
    id: 5,
    name: "Movement Forensics",
    fullName: "Movement Forensics",
    desc: "Reconstruct the subject's last known movements using all available data — cell tower pings, building access logs, transit records, and NeuroBand GPS telemetry. Determine whether the disappearance was planned, forced, or something else entirely.",
    status: "locked",
    linkedFile: "/Tasks/task5",
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m0",
    role: "ghost",
    text: "Your mission: Examine the logs carefully. Cross-reference access, endpoint transfer, and VPN tunnel records to reconstruct the breach.",
  },
  {
    id: "m1",
    role: "ghost",
    text: "Once you have analyzed the data — come back and tell me what you found.",
  },
];

// ─── Ghost SVG ────────────────────────────────────────────────────────────────

const GhostPixelIcon = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="4" width="16" height="2" fill="#e8e8e8" />
    <rect x="6" y="6" width="2" height="2" fill="#e8e8e8" />
    <rect x="24" y="6" width="2" height="2" fill="#e8e8e8" />
    <rect x="4" y="8" width="2" height="16" fill="#e8e8e8" />
    <rect x="26" y="8" width="2" height="16" fill="#e8e8e8" />
    <rect x="6" y="8" width="20" height="14" fill="#e8e8e8" />
    {/* eyes */}
    <rect x="10" y="12" width="4" height="4" fill="#1a2235" />
    <rect x="18" y="12" width="4" height="4" fill="#1a2235" />
    <rect x="11" y="13" width="2" height="2" fill="#4af0d8" />
    <rect x="19" y="13" width="2" height="2" fill="#4af0d8" />
    {/* bottom wavy */}
    <rect x="4" y="24" width="4" height="4" fill="#e8e8e8" />
    <rect x="10" y="22" width="4" height="2" fill="#e8e8e8" />
    <rect x="14" y="24" width="4" height="4" fill="#e8e8e8" />
    <rect x="20" y="22" width="4" height="2" fill="#e8e8e8" />
    <rect x="24" y="24" width="4" height="4" fill="#e8e8e8" />
    <rect x="6" y="22" width="4" height="2" fill="#e8e8e8" />
    <rect x="22" y="22" width="4" height="2" fill="#e8e8e8" />
  </svg>
);

// ─── Ghost Chat Panel ─────────────────────────────────────────────────────────

interface GhostChatProps {
  onClose: () => void;
  points: number;
  onPointsChange: (delta: number) => void;
  tasks: Task[];
}

function GhostChat({ onClose, points, onPointsChange, tasks }: GhostChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dotPage, setDotPage] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addGhostReply = useCallback(
    (text: string, hintNote?: string, deductPoints = false) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: hintNote ? "hint" : "ghost",
            text,
            hintNote,
          },
        ]);
        if (deductPoints) onPointsChange(-10);
      }, 1000 + Math.random() * 500);
    },
    [onPointsChange]
  );

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "query",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const lower = trimmed.toLowerCase();

    // ── Hint: Task 1 ──
    if (/\btask\s*1\b|log analysis|logs/.test(lower)) {
      const t = tasks.find((t) => t.id === 1);
      if (t?.status === "completed") {
        addGhostReply("Task 1 is already complete. The evidence is extracted.", undefined, false);
      } else {
        addGhostReply(
          "names are encrypted in affine cipher",
          "Affine cipher: each letter maps to (a·x + b) mod 26. Find a and b from context.",
          true
        );
      }
      return;
    }

    // ── Hint: Task 3 ──
    if (/\btask\s*3\b|code audit/.test(lower)) {
      const t = tasks.find((t) => t.id === 3);
      if (t?.status === "locked") {
        addGhostReply("Task 3 is still locked. Complete the prior tasks first — the chain matters.");
      } else if (t?.status === "completed") {
        addGhostReply("Task 3 is complete. You extracted the patch data already.");
      } else {
        addGhostReply(
          "check for which patch has overrides and which stops",
          "Look at patch version deltas. An override without a corresponding stop is the anomaly.",
          true
        );
      }
      return;
    }

    // ── Hint: Task 4 ──
    if (/\btask\s*4\b|chip telemetry|telemetry/.test(lower)) {
      const t = tasks.find((t) => t.id === 4);
      if (t?.status === "locked") {
        addGhostReply("Task 4 is locked. Finish what's ahead of you first.");
      } else if (t?.status === "completed") {
        addGhostReply("Task 4 is complete. The device signature is already logged.");
      } else {
        addGhostReply(
          "device id is NB-PROD-41-HF",
          "Cross-reference NB-PROD-41-HF telemetry against the access window timestamps.",
          true
        );
      }
      return;
    }

    // ── Task 2 generic ──
    if (/\btask\s*2\b|cctv|surveillance/.test(lower)) {
      addGhostReply(
        "Focus on the corridor feed gap. The camera wasn't down — it was paused. Someone with access did that."
      );
      return;
    }

    // ── Task 5 generic ──
    if (/\btask\s*5\b|movement|forensics/.test(lower)) {
      addGhostReply(
        "Movement logs say midnight. The chip says 3:47 AM. One of those was edited. Physical evidence doesn't lie."
      );
      return;
    }

    // ── Points query ──
    if (/\bpoint|score|deduct/.test(lower)) {
      addGhostReply(`You currently have ${points} points. Each hint I give costs 10 points. Choose wisely.`);
      return;
    }

    // ── Greeting ──
    if (/\bhello|hi\b|hey\b/.test(lower)) {
      addGhostReply(
        "Ghost41_ID online. I observe everything inside this network.\n\nAsk about a specific task if you're stuck. Each hint costs 10 points."
      );
      return;
    }

    // ── Generic fallback ──
    const fallbacks = [
      "State your query with a task number. I don't have time for ambiguity.",
      "The breach didn't happen in the dark. Someone left a trail. Look closer.",
      "Not everything the company logged is true. Not everything they deleted is gone.",
      "Specify a task number — 1 through 5. I'll tell you what I can.",
    ];
    addGhostReply(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9500,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.25s ease",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          height: "min(88vh, 820px)",
          background: "#0d1117",
          border: "1px solid rgba(74,240,216,0.15)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Courier Prime', 'Courier New', monospace",
          overflow: "hidden",
          boxShadow: "0 0 80px rgba(74,240,216,0.08), 0 30px 60px rgba(0,0,0,0.9)",
          animation: "slideUp 0.3s cubic-bezier(.4,0,.2,1)",
          position: "relative",
        }}
      >
        {/* top accent line */}
        <div style={{ height: 2, background: "linear-gradient(90deg, #4af0d8, transparent 60%)", flexShrink: 0 }} />

        {/* ── HEADER ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 20px",
            borderBottom: "1px solid rgba(74,240,216,0.12)",
            background: "#111720",
            flexShrink: 0,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 64,
              height: 64,
              background: "#1a2235",
              border: "1px solid rgba(74,240,216,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <GhostPixelIcon size={40} />
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: "#4af0d8",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.22em",
                lineHeight: 1.2,
              }}
            >
              GHOST41_ID
            </div>
            <div
              style={{
                color: "rgba(74,240,216,0.55)",
                fontSize: 10,
                letterSpacing: "0.18em",
                marginTop: 4,
                textTransform: "uppercase",
              }}
            >
              Investigation Assistant · Online
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 6,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#4af0d8",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: "0.1em" }}>
                SECURE CHANNEL
              </span>
            </div>
          </div>

          {/* Points */}
          <div
            style={{
              textAlign: "right",
              marginRight: 12,
            }}
          >
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase" }}>Score</div>
            <div style={{ color: points > 50 ? "#4af0d8" : points > 20 ? "#c9a84c" : "#d42020", fontSize: 22, fontWeight: 700, letterSpacing: "0.05em", lineHeight: 1.2, marginTop: 2 }}>
              {points}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid #d42020",
              color: "#d42020",
              fontFamily: "'Courier Prime', monospace",
              fontSize: 11,
              letterSpacing: "0.22em",
              padding: "8px 14px",
              cursor: "pointer",
              textTransform: "uppercase",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212,32,32,0.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            × Close
          </button>
        </div>

        {/* ── MESSAGES ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 20px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(74,240,216,0.2) transparent",
          }}
        >
          {messages.map((msg) => {
            if (msg.role === "ghost") {
              return (
                <div
                  key={msg.id}
                  style={{
                    background: "#1a2235",
                    border: "1px solid rgba(74,240,216,0.08)",
                    padding: "14px 18px",
                    borderRadius: 4,
                    animation: "fadeSlideIn 0.3s ease",
                  }}
                >
                  <p
                    style={{
                      color: "#d8dce6",
                      fontSize: 13,
                      lineHeight: 1.75,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.text.split(/(\*\*.*?\*\*)/).map((part, i) =>
                      part.startsWith("**") ? (
                        <strong key={i} style={{ color: "#fff", fontWeight: 700 }}>
                          {part.slice(2, -2)}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </p>
                </div>
              );
            }

            if (msg.role === "query") {
              return (
                <div
                  key={msg.id}
                  style={{
                    background: "#1a2235",
                    border: "1px solid rgba(74,240,216,0.1)",
                    padding: "14px 18px",
                    borderRadius: 4,
                    animation: "fadeSlideIn 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      color: "#4af0d8",
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      marginBottom: 8,
                      textTransform: "uppercase",
                    }}
                  >
                    GHOST41_ID &nbsp;›&nbsp; QUERY
                  </div>
                  <p style={{ color: "#d8dce6", fontSize: 13, lineHeight: 1.7 }}>{msg.text}</p>
                </div>
              );
            }

            if (msg.role === "hint") {
              return (
                <div key={msg.id} style={{ animation: "fadeSlideIn 0.3s ease" }}>
                  <div
                    style={{
                      background: "#1a2235",
                      border: "1px solid rgba(74,240,216,0.08)",
                      padding: "14px 18px",
                      borderRadius: 4,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ width: 6, height: 6, background: "#d42020", borderRadius: "50%", flexShrink: 0 }} />
                      <span
                        style={{
                          color: "#d42020",
                          fontSize: 9,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                        }}
                      >
                        HINT ISSUED — 10 PTS DEDUCTED
                      </span>
                    </div>
                    <p style={{ color: "#d8dce6", fontSize: 13, lineHeight: 1.75 }}>{msg.text}</p>
                  </div>
                  {msg.hintNote && (
                    <p
                      style={{
                        color: "rgba(216,220,230,0.38)",
                        fontSize: 11,
                        fontStyle: "italic",
                        lineHeight: 1.6,
                        padding: "8px 4px 0",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {msg.hintNote}
                    </p>
                  )}
                </div>
              );
            }

            return null;
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div
              style={{
                background: "#1a2235",
                border: "1px solid rgba(74,240,216,0.08)",
                padding: "14px 18px",
                borderRadius: 4,
                display: "flex",
                gap: 6,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    background: "#4af0d8",
                    borderRadius: "50%",
                    animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── BOTTOM DOTS ── */}
        <div
          style={{
            padding: "8px 20px 0",
            display: "flex",
            gap: 6,
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              onClick={() => setDotPage(i)}
              style={{
                width: i === dotPage ? 8 : 6,
                height: i === dotPage ? 8 : 6,
                borderRadius: "50%",
                background: i === dotPage ? "#4af0d8" : "rgba(74,240,216,0.25)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            />
          ))}
        </div>

        {/* ── INPUT ROW ── */}
        <div
          style={{
            padding: "12px 20px 16px",
            borderTop: "1px solid rgba(74,240,216,0.1)",
            display: "flex",
            gap: 10,
            flexShrink: 0,
            background: "#0d1117",
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your answer..."
            style={{
              flex: 1,
              background: "#111720",
              border: "1px solid rgba(74,240,216,0.15)",
              color: "#d8dce6",
              fontFamily: "'Courier Prime', monospace",
              fontSize: 13,
              padding: "10px 14px",
              outline: "none",
              letterSpacing: "0.04em",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(74,240,216,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(74,240,216,0.15)")}
          />
          <button
            onClick={handleSend}
            disabled={isTyping}
            style={{
              background: "transparent",
              border: "1px solid rgba(74,240,216,0.3)",
              color: "#4af0d8",
              fontFamily: "'Courier Prime', monospace",
              fontSize: 12,
              letterSpacing: "0.22em",
              padding: "10px 18px",
              cursor: isTyping ? "not-allowed" : "pointer",
              opacity: isTyping ? 0.5 : 1,
              textTransform: "uppercase",
              transition: "background 0.2s, border-color 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (!isTyping) {
                e.currentTarget.style.background = "rgba(74,240,216,0.08)";
                e.currentTarget.style.borderColor = "rgba(74,240,216,0.6)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(74,240,216,0.3)";
            }}
          >
            [ Send ]
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  index: number;
  onOpen: (task: Task) => void;
}

function TaskCard({ task, index, onOpen }: TaskCardProps) {
  const isCompleted = task.status === "completed";
  const isActive = task.status === "active";
  const isLocked = task.status === "locked";

  const borderLeft = isCompleted
    ? "3px solid #0c9080"
    : isActive
      ? "3px solid #c9a84c"
      : "3px solid rgba(176,18,24,0.15)";

  return (
    <div
      style={{
        background: "rgba(14,0,0,0.95)",
        border: `1px solid ${isCompleted ? "rgba(12,144,128,0.3)" : isActive ? "rgba(201,168,76,0.3)" : "rgba(176,18,24,0.2)"}`,
        borderLeft,
        position: "relative",
        overflow: "hidden",
        opacity: isLocked ? 0.55 : 1,
        transition: "box-shadow 0.3s, opacity 0.3s",
        cursor: isLocked ? "not-allowed" : "pointer",
        animation: `slideUp 0.5s ${index * 0.1}s both`,
      }}
      onClick={() => !isLocked && onOpen(task)}
      onMouseEnter={(e) => {
        if (!isLocked) {
          e.currentTarget.style.boxShadow = "0 0 40px rgba(180,15,18,0.12), 0 8px 30px rgba(0,0,0,0.4)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* scrolling bg text for locked */}
      {isLocked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
            opacity: 0.055,
            fontFamily: "'Courier Prime', monospace",
            fontSize: 10,
            color: "#b01218",
            letterSpacing: "0.12em",
            lineHeight: 1.6,
            whiteSpace: "nowrap",
            animation: "scrollBg 20s linear infinite",
            padding: "8px 0",
          }}
        >
          {Array(6)
            .fill(`UNLOCKS AFTER TASK ${task.id - 1} · MONSTERS NEARBY · YOU MAY NOT SLEEP · `)
            .join("")}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "stretch" }}>
        {/* Number col */}
        <div
          style={{
            width: 70,
            minHeight: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRight: "1px solid rgba(176,18,24,0.18)",
            background: "rgba(0,0,0,0.25)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 22,
              fontWeight: 700,
              color: isCompleted
                ? "#0c9080"
                : isActive
                  ? "#c9a84c"
                  : "rgba(176,18,24,0.3)",
              lineHeight: 1,
            }}
          >
            {String(task.id).padStart(2, "0")}
          </span>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            padding: "16px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 17,
                fontWeight: 700,
                color: isLocked ? "rgba(138,96,96,0.8)" : "#f2e4e0",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              {task.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isActive && (
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#c9a84c",
                    boxShadow: "0 0 0 2px rgba(201,168,76,0.3)",
                    animation: "pulse 1.6s ease-in-out infinite",
                  }}
                />
              )}
              <span
                style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  color: "rgba(138,96,96,0.7)",
                  textTransform: "uppercase",
                }}
              >
                Status:
              </span>
              <span
                style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  color: isCompleted
                    ? "#0c9080"
                    : isActive
                      ? "#c9a84c"
                      : "rgba(138,96,96,0.6)",
                }}
              >
                {isCompleted
                  ? "COMPLETED"
                  : isActive
                    ? "TASK IN PROGRESS…"
                    : `UNLOCKS AFTER TASK ${task.id - 1}`}
              </span>
            </div>
          </div>

          {/* Right action */}
          <div style={{ flexShrink: 0 }}>
            {isCompleted ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  color: "#0c9080",
                  background: "rgba(12,144,128,0.1)",
                  border: "1px solid rgba(12,144,128,0.3)",
                  padding: "8px 14px",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0c9080" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Evidence Unlocked
              </div>
            ) : isLocked ? (
              <div
                style={{
                  width: 34,
                  height: 34,
                  border: "1px solid rgba(176,18,24,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.5,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(138,96,96,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#b01218",
                  color: "#fff",
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  padding: "9px 16px",
                }}
              >
                Open Task
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Task Modal ───────────────────────────────────────────────────────────────

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onComplete: (id: number) => void;
}

function TaskModal({ task, onClose, onComplete }: TaskModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 8000,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#0e0000",
          border: "1px solid rgba(176,18,24,0.28)",
          maxWidth: 560,
          width: "100%",
          position: "relative",
          boxShadow: "0 0 80px rgba(180,15,18,0.25), 0 30px 60px rgba(0,0,0,0.8)",
          animation: "slideUp 0.3s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div style={{ height: 2, background: "linear-gradient(90deg, #b01218, transparent 70%)" }} />

        {/* corner brackets */}
        {["tl", "tr", "bl", "br"].map((pos) => (
          <div
            key={pos}
            style={{
              position: "absolute",
              width: 16,
              height: 16,
              top: pos.includes("t") ? 10 : undefined,
              bottom: pos.includes("b") ? 10 : undefined,
              left: pos.includes("l") ? 10 : undefined,
              right: pos.includes("r") ? 10 : undefined,
              borderTop: pos.includes("t") ? "1px solid #b01218" : undefined,
              borderBottom: pos.includes("b") ? "1px solid #b01218" : undefined,
              borderLeft: pos.includes("l") ? "1px solid #b01218" : undefined,
              borderRight: pos.includes("r") ? "1px solid #b01218" : undefined,
            }}
          />
        ))}

        <div style={{ padding: "20px 26px 0", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: "0.22em", color: "rgba(138,96,96,0.7)" }}>
            TASK 0{task.id} — NS-77
          </span>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid rgba(176,18,24,0.28)",
              color: "rgba(138,96,96,0.7)",
              fontFamily: "'Courier Prime', monospace",
              fontSize: 15,
              width: 28,
              height: 28,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#f2e4e0"; e.currentTarget.style.borderColor = "rgba(200,20,24,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(138,96,96,0.7)"; e.currentTarget.style.borderColor = "rgba(176,18,24,0.28)"; }}
          >
            ×
          </button>
        </div>

        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 700, color: "#f2e4e0", padding: "8px 26px 0", textTransform: "uppercase" }}>
          {task.name}
        </div>
        <div style={{ margin: "14px 26px", height: 1, background: "linear-gradient(to right, rgba(176,18,24,0.28), transparent 80%)" }} />
        <div style={{ padding: "0 26px 22px", fontFamily: "'Crimson Text', Georgia, serif", fontSize: 16, color: "#ddc8c0", lineHeight: 1.8 }}>
          {task.desc}
        </div>

        <div style={{ padding: "14px 26px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid rgba(176,18,24,0.28)",
              color: "#ddc8c0",
              fontFamily: "'Courier Prime', monospace",
              fontSize: 10,
              letterSpacing: "0.16em",
              padding: "9px 18px",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              if (task.linkedFile) window.location.href = task.linkedFile;
              else onComplete(task.id);
            }}
            style={{
              background: "#b01218",
              border: "none",
              color: "#fff",
              fontFamily: "'Courier Prime', monospace",
              fontSize: 10,
              letterSpacing: "0.16em",
              padding: "9px 20px",
              cursor: "pointer",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {task.status === "completed" ? "Review Evidence" : "Begin Task"}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function NeuroBandDashboard() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [points, setPoints] = useState(100);
  const [chatOpen, setChatOpen] = useState(false);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [hasNotification, setHasNotification] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data && data.team) {
          setTasks((prev: Task[]) => prev.map((t: Task, idx: number) => {
            if (idx < data.team.progress) return { ...t, status: "completed" };
            if (idx === data.team.progress) return { ...t, status: "active" };
            return { ...t, status: "locked" };
          }));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const progressPct = (completedCount / 5) * 100;

  const handleCompleteTask = (id: number) => {
    setTasks((prev) => {
      const next = [...prev];
      const idx = next.findIndex((t) => t.id === id);
      if (idx >= 0) {
        next[idx] = { ...next[idx], status: "completed" };
        if (idx + 1 < next.length && next[idx + 1].status === "locked") {
          next[idx + 1] = { ...next[idx + 1], status: "active" };
        }
      }
      return next;
    });
  };

  const handlePointsChange = (delta: number) => {
    setPoints((p) => Math.max(0, p + delta));
  };

  const handleOpenChat = () => {
    setChatOpen(true);
    setHasNotification(false);
  };

  // Cursor
  const [curPos, setCurPos] = useState({ x: 0, y: 0 });
  const [curSmooth, setCurSmooth] = useState({ x: 0, y: 0 });
  const curRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      curRef.current = { x: e.clientX, y: e.clientY };
      setCurPos({ x: e.clientX, y: e.clientY });
    };
    document.addEventListener("mousemove", onMove);
    const loop = () => {
      setCurSmooth((prev) => ({
        x: prev.x + (curRef.current.x - prev.x) * 0.12,
        y: prev.y + (curRef.current.y - prev.y) * 0.12,
      }));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      style={{
        background: "#070000",
        minHeight: "100vh",
        color: "#ddc8c0",
        fontFamily: "'Crimson Text', Georgia, serif",
        overflowX: "hidden",
        cursor: "none",
      }}
    >
      {/* Keyframe injector */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Courier+Prime:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { cursor: none; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scrollBg { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes grain-a { 0%{transform:translate(0,0)} 25%{transform:translate(-1%,-2%)} 50%{transform:translate(2%,1%)} 75%{transform:translate(-1%,2%)} 100%{transform:translate(1%,-1%)} }
        @keyframes ghostFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes ringPulse { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.2);opacity:0} }
        @keyframes typingBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        @keyframes progressGrow { from{width:0} to{width:${progressPct}%} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(176,18,24,0.3); }
      `}</style>

      {/* Grain overlay */}
      <div
        style={{
          position: "fixed",
          inset: "-100%",
          width: "300%",
          height: "300%",
          pointerEvents: "none",
          zIndex: 9000,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          animation: "grain-a 0.35s steps(2) infinite",
        }}
      />

      {/* Custom cursor */}
      <div
        style={{
          position: "fixed",
          width: 28,
          height: 28,
          border: "1px solid #b01218",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
          left: curSmooth.x,
          top: curSmooth.y,
          transform: "translate(-50%,-50%)",
        }}
      />
      <div
        style={{
          position: "fixed",
          width: 4,
          height: 4,
          background: "#d42020",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 10000,
          left: curPos.x,
          top: curPos.y,
          transform: "translate(-50%,-50%)",
        }}
      />

      {/* ── NAV ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 40px",
          background: scrolled ? "rgba(5,0,0,0.97)" : "linear-gradient(to bottom, rgba(4,0,0,0.97), transparent)",
          borderBottom: scrolled ? "1px solid rgba(176,18,24,0.28)" : "1px solid transparent",
          transition: "background 0.3s, border-color 0.3s",
        }}
      >
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: "#f2e4e0", lineHeight: 1.25 }}>
          Supari<br /><span style={{ color: "#b01218" }}>Agency</span>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {["HOME", "CASES", "EVIDENCE", "ABOUT"].map((l) => (
            <a key={l} href="#" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: "0.2em", color: "rgba(138,96,96,0.8)", textDecoration: "none" }}>
              {l}
            </a>
          ))}
        </div>
        <div style={{ width: 30, height: 30, background: "#b01218", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          minHeight: "58vh",
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
        }}
      >
        {/* BG */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse 55% 65% at 72% 38%, rgba(100,6,6,0.55) 0%, transparent 55%),
              radial-gradient(ellipse 35% 50% at 14% 68%, rgba(120,8,8,0.42) 0%, transparent 55%),
              radial-gradient(ellipse 80% 35% at 50% 100%, rgba(70,0,0,0.75) 0%, transparent 55%),
              linear-gradient(160deg, #0a0000 0%, #1a0303 42%, #0c0000 70%, #060000 100%)
            `,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.38,
            background: "repeating-linear-gradient(0deg, transparent 0px, transparent 24px, rgba(0,0,0,0.5) 24px, rgba(0,0,0,0.5) 30px)",
          }}
        />
        <div style={{ position: "absolute", inset: 0, bottom: 0, height: "50%", background: "linear-gradient(to bottom, transparent, #070000)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 2, padding: "100px 60px 68px", maxWidth: 820 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 34, height: 1, background: "#b01218" }} />
            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: "0.28em", color: "#b01218", textTransform: "uppercase" }}>Active Investigation</span>
          </div>
          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: "0.22em", color: "rgba(138,96,96,0.7)", marginBottom: 10 }}>
            CASE FILE — NS-77 &nbsp;/&nbsp; NEUROBAND DIVISION
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 50px)", fontWeight: 900, color: "#f2e4e0", lineHeight: 1.1, letterSpacing: "-0.01em", marginBottom: 22 }}>
            NeuroBand<br /><span style={{ color: "#b01218" }}>Investigation</span>
          </h1>
          <p style={{ fontFamily: "'Crimson Text', serif", fontSize: 16.5, color: "#ddc8c0", lineHeight: 1.85, maxWidth: 580, marginBottom: 30, borderLeft: "2px solid rgba(176,18,24,0.28)", paddingLeft: 18 }}>
            A software engineer is missing.<br />
            The company says he stole critical NeuroBand data and disappeared overnight.<br />
            Internal logs support the accusation.<br /><br />
            <strong style={{ color: "#f2e4e0", fontWeight: 600 }}>But some records do not.</strong><br /><br />
            Investigate the evidence, question the systems, and determine whether this is a clean insider theft, or something the official report does not explain.
          </p>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 34 }}>
            {[
              { k: "Priority", v: "CRITICAL", c: "#b01218" },
              { k: "Subject", v: "Software Engineer", c: "#ddc8c0" },
              { k: "Company", v: "NeuroBand Technologies", c: "#ddc8c0" },
              { k: "Status", v: "⚡ ACTIVE", c: "#c9a84c" },
            ].map(({ k, v, c }) => (
              <div key={k}>
                <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: "0.18em", color: "rgba(138,96,96,0.7)", textTransform: "uppercase", marginBottom: 3 }}>{k}</div>
                <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, color: c }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => document.getElementById("tasks")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "#b01218", color: "#fff",
                fontFamily: "'Courier Prime', monospace", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase",
                padding: "12px 24px", border: "none", cursor: "pointer",
                transition: "background 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#d42020"; e.currentTarget.style.boxShadow = "0 0 28px rgba(200,20,20,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#b01218"; e.currentTarget.style.boxShadow = "none"; }}
            >
              Start Investigation
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            <button
              style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "transparent", color: "#ddc8c0",
                fontFamily: "'Courier Prime', monospace", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase",
                padding: "11px 22px", border: "1px solid rgba(176,18,24,0.28)", cursor: "pointer",
                transition: "border-color 0.2s",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              View Evidence
            </button>
          </div>
        </div>
      </section>

      {/* ── PROGRESS ── */}
      <div style={{ padding: "0 60px", background: "#070000" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0 18px", borderBottom: "1px solid rgba(176,18,24,0.28)" }}>
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: "0.24em", color: "rgba(138,96,96,0.7)", textTransform: "uppercase" }}>Investigation Tasks</span>
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: "#ddc8c0" }}>
            Case Progress &nbsp;<span style={{ color: "#b01218", fontWeight: 700 }}>{completedCount}</span> / 5 &nbsp; Tasks Completed
          </span>
        </div>
        <div style={{ height: 2, background: "rgba(255,255,255,0.06)", marginTop: 10, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, #b01218, #d42020)",
              boxShadow: "0 0 12px rgba(200,20,20,0.5)",
              transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
            }}
          />
        </div>
      </div>

      {/* ── TASKS ── */}
      <section id="tasks" style={{ padding: "38px 60px 100px", background: "#070000" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 42 }}>
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10.5, letterSpacing: "0.22em", color: "rgba(138,96,96,0.7)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            Investigation Tasks
          </span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, rgba(176,18,24,0.28), transparent)" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 900 }}>
          {tasks.map((task, i) => (
            <TaskCard key={task.id} task={task} index={i} onOpen={setModalTask} />
          ))}
        </div>
      </section>

      {/* ── GHOST BTN ── */}
      <button
        onClick={handleOpenChat}
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 8000,
          width: 64,
          height: 64,
          background: "rgba(5,0,0,0.9)",
          border: "1px solid rgba(176,18,24,0.28)",
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 30px rgba(180,15,18,0.3), 0 8px 24px rgba(0,0,0,0.6)",
          animation: "ghostFloat 3.5s ease-in-out infinite",
          outline: "none",
        }}
      >
        {hasNotification && (
          <div
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              width: 18,
              height: 18,
              background: "#b01218",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Courier Prime', monospace",
              fontSize: 9,
              color: "#fff",
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            !
          </div>
        )}
        {/* floating ghost ring */}
        <div
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: "50%",
            border: "1px solid rgba(176,18,24,0.3)",
            animation: "ringPulse 2s ease-out infinite",
          }}
        />
        <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 0 10px rgba(220,30,30,0.7))" }}>
          <path d="M32 6C18.7 6 8 16.7 8 30v26l8-8 8 8 8-8 8 8 8-8 8 8V30C56 16.7 45.3 6 32 6z" fill="rgba(180,18,20,0.12)" stroke="#b01218" strokeWidth="1.5" />
          <circle cx="24" cy="28" r="4" fill="#d42020" opacity="0.8" />
          <circle cx="40" cy="28" r="4" fill="#d42020" opacity="0.8" />
          <circle cx="25" cy="27" r="1.5" fill="#fff" />
          <circle cx="41" cy="27" r="1.5" fill="#fff" />
          <path d="M26 36 q6 5 12 0" stroke="#d42020" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      </button>

      {/* ── GHOST CHAT ── */}
      {chatOpen && (
        <GhostChat
          onClose={() => setChatOpen(false)}
          points={points}
          onPointsChange={handlePointsChange}
          tasks={tasks}
        />
      )}

      {/* ── TASK MODAL ── */}
      {modalTask && (
        <TaskModal
          task={modalTask}
          onClose={() => setModalTask(null)}
          onComplete={handleCompleteTask}
        />
      )}
    </div>
  );
}
