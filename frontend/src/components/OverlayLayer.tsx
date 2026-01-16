import { useState } from "react";

interface Overlay {
    _id: string;
    type: "text" | "image";
    content: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
}

interface Props {
    overlays: Overlay[];
}

type Mode = "move" | "resize" | null;

export default function OverlayLayer({ overlays }: Props) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [mode, setMode] = useState<Mode>(null);
    const [start, setStart] = useState({ x: 0, y: 0 });
    const [draft, setDraft] = useState<Overlay | null>(null);

    const handleMoveStart = (e: React.MouseEvent, overlay: Overlay) => {
        setActiveId(overlay._id);
        setMode("move");
        setStart({ x: e.clientX, y: e.clientY });
        setDraft(JSON.parse(JSON.stringify(overlay)));
    };

    const handleResizeStart = (e: React.MouseEvent, overlay: Overlay) => {
        e.stopPropagation();
        setActiveId(overlay._id);
        setMode("resize");
        setStart({ x: e.clientX, y: e.clientY });
        setDraft(JSON.parse(JSON.stringify(overlay)));
    };

    const handleDelete = async (e: React.MouseEvent, overlayId: string) => {
        e.stopPropagation();
        await fetch(`http://127.0.0.1:5000/api/overlays/${overlayId}`, {
            method: "DELETE",
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draft || !mode) return;

        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;

        if (mode === "move") {
            setDraft({
                ...draft,
                position: {
                    x: draft.position.x + dx,
                    y: draft.position.y + dy,
                },
            });
        }

        if (mode === "resize") {
            setDraft({
                ...draft,
                size: {
                    width: Math.max(30, draft.size.width + dx),
                    height: Math.max(20, draft.size.height + dy),
                },
            });
        }

        setStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = async () => {
        if (!draft || !activeId) return;

        await fetch(`http://127.0.0.1:5000/api/overlays/${activeId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                position: draft.position,
                size: draft.size,
            }),
        });

        setActiveId(null);
        setMode(null);
        setDraft(null);
    };

    return (
        <div
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  style={{
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  }}
>
            {overlays.map((overlay) => {
                const view = draft && overlay._id === activeId ? draft : overlay;
                const isActive = overlay._id === activeId;

                return (
                    <div
                        key={overlay._id}
                        onMouseDown={(e) => handleMoveStart(e, overlay)}
                        className={`overlay-item ${isActive ? "overlay-item--active" : ""}`}
                        style={{
                            position: "absolute",
                            top: view.position.y,
                            left: view.position.x,
                            width: view.size.width,
                            height: view.size.height,
                            border: `2px solid ${isActive ? "var(--accent-interaction)" : "var(--overlay-active)"}`,
                            borderRadius: "4px",
                            cursor: "move",
                            userSelect: "none",
                            pointerEvents: "auto",
                            backgroundColor: overlay.type === "text" ? "rgba(14, 10, 11, 0.8)" : "transparent",
                            transition: isActive ? "none" : "border-color 0.15s ease",
                        }}
                    >
                        {/* Delete Button */}
                        <button
                            onClick={(e) => handleDelete(e, overlay._id)}
                            className="overlay-item__delete"
                            style={{
                                position: "absolute",
                                top: -8,
                                right: -8,
                                width: 20,
                                height: 20,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "var(--danger)",
                                color: "var(--text-primary)",
                                borderRadius: "50%",
                                fontSize: "12px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                border: "none",
                                opacity: 0,
                                transition: "opacity 0.15s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                        >
                            ×
                        </button>

                        {/* Content */}
                        {overlay.type === "text" ? (
                            <div
                                className="overlay-item__content"
                                style={{
                                    color: "var(--text-primary)",
                                    padding: "0.5rem",
                                    fontSize: "0.9rem",
                                    fontWeight: 500,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {overlay.content}
                            </div>
                        ) : (
                            <img
                                src={overlay.content}
                                alt="overlay"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    pointerEvents: "none",
                                }}
                                draggable={false}
                            />
                        )}

                        {/* Resize Handle */}
                        <div
                            onMouseDown={(e) => handleResizeStart(e, overlay)}
                            className="overlay-item__resize-handle"
                            style={{
                                position: "absolute",
                                right: -4,
                                bottom: -4,
                                width: 12,
                                height: 12,
                                backgroundColor: "var(--accent-interaction)",
                                borderRadius: "2px",
                                cursor: "se-resize",
                            }}
                        />
                    </div>
                );
            })}

            {/* Inline styles for hover effects */}
            <style>{`
        .overlay-item:hover .overlay-item__delete {
          opacity: 1 !important;
        }
        .overlay-item:hover {
          border-color: var(--overlay-active) !important;
        }
        .overlay-item--active {
          border-color: var(--accent-interaction) !important;
        }
      `}</style>
        </div>
    );
}
