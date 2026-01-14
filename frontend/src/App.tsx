import { useEffect, useState } from "react";
import VideoPlayer from "./components/VideoPlayer";
import OverlayLayer from "./components/OverlayLayer";
import { socket } from "./socket";

interface Overlay {
  _id: string;
  type: "text" | "image";
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export default function App() {
  const [overlays, setOverlays] = useState<Overlay[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/overlays")
      .then((res) => res.json())
      .then(setOverlays);
  }, []);

  useEffect(() => {
    socket.on("overlay_created", (overlay: Overlay) => {
      setOverlays((prev) => [...prev, overlay]);
    });

    socket.on("overlay_updated", (overlay: Overlay) => {
      setOverlays((prev) =>
        prev.map((o) => (o._id === overlay._id ? overlay : o))
      );
    });

    socket.on("overlay_deleted", ({ _id }: { _id: string }) => {
      setOverlays((prev) => prev.filter((o) => o._id !== _id));
    });

    return () => {
      socket.off("overlay_created");
      socket.off("overlay_updated");
      socket.off("overlay_deleted");
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "800px", margin: "auto" }}>
      <VideoPlayer src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" />
      <OverlayLayer overlays={overlays} />
    </div>
  );
}
