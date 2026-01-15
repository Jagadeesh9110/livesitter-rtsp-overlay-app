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
            style={{ position: "absolute", inset: 0 }}
        >
            {overlays.map((overlay) => {
                const view = draft && overlay._id === activeId ? draft : overlay;

                return (
                    <div
                        key={overlay._id}
                        onMouseDown={(e) => handleMoveStart(e, overlay)}
                        style={{
                            position: "absolute",
                            top: view.position.y,
                            left: view.position.x,
                            width: view.size.width,
                            height: view.size.height,
                            border: "1px dashed white",
                            cursor: "move",
                            userSelect: "none",
                        }}
                    >
                        {overlay.type === "text" ? (
                            <div style={{ color: "white" }}>{overlay.content}</div>
                        ) : (
                            <img
                                src={overlay.content}
                                alt="overlay"
                                style={{ width: "100%", height: "100%" }}
                            />
                        )}

                        {/* Resize handle */}
                        <div
                            onMouseDown={(e) => handleResizeStart(e, overlay)}
                            style={{
                                position: "absolute",
                                right: 0,
                                bottom: 0,
                                width: 10,
                                height: 10,
                                background: "white",
                                cursor: "nwse-resize",
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
}
