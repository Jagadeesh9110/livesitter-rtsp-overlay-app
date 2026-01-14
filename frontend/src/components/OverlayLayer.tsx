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

export default function OverlayLayer({ overlays }: Props) {
    return (
        <>
            {overlays.map((overlay) => (
                <div
                    key={overlay._id}
                    style={{
                        position: "absolute",
                        top: overlay.position.y,
                        left: overlay.position.x,
                        width: overlay.size.width,
                        height: overlay.size.height,
                        cursor: "move",
                        pointerEvents: "auto",
                    }}
                >
                    {overlay.type === "text" ? (
                        <div style={{ color: "white", fontSize: 16 }}>
                            {overlay.content}
                        </div>
                    ) : (
                        <img
                            src={overlay.content}
                            alt="overlay"
                            style={{ width: "100%", height: "100%" }}
                        />
                    )}
                </div>
            ))}
        </>
    );
}
