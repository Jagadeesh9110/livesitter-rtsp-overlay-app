import { useEffect, useState } from "react";
import VideoPlayer from "./components/VideoPlayer";
import OverlayLayer from "./components/OverlayLayer";
import { socket } from "./socket";
import "./App.css";

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

  const handleAddTextOverlay = async () => {
    const overlay = {
      type: "text",
      content: "New Text Overlay",
      position: { x: 50, y: 50 },
      size: { width: 200, height: 50 },
    };

    await fetch("http://127.0.0.1:5000/api/overlays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(overlay),
    });
  };

  const handleAddImageOverlay = async () => {
    const overlay = {
      type: "image",
      content: "https://via.placeholder.com/150x80/704F50/F1EDEE?text=Logo",
      position: { x: 100, y: 100 },
      size: { width: 150, height: 80 },
    };

    await fetch("http://127.0.0.1:5000/api/overlays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(overlay),
    });
  };

  const STREAM_URL =
  "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";


  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <h1 className="header__title">LiveStream Overlay Studio</h1>
        <p className="header__tagline">
          Real-time overlays for livestreams — add, move, resize, and sync instantly.
        </p>
      </header>

      {/* Main Stage */}
      <main className="main-stage">
        {/* Live Indicator */}
        <div className="live-indicator">
          <span className="live-indicator__dot"></span>
          Live Stream
        </div>

        {/* Video Container */}
        <div className="video-container">
          <VideoPlayer src={STREAM_URL} />
          <OverlayLayer overlays={overlays} />
        </div>

        {/* Controls */}
        <div className="controls-panel">
          <span className="controls-panel__label">Add overlay:</span>
          <button className="btn btn--primary" onClick={handleAddTextOverlay}>
            + Text
          </button>
          <button className="btn btn--secondary" onClick={handleAddImageOverlay}>
            + Image
          </button>
        </div>

        {/* Guidance */}
        <div className="guidance">
          <p className="guidance__text">
            <span className="guidance__highlight">Try it:</span> Add an overlay, drag it to reposition,
            resize from the corner, and open another tab to see{" "}
            <span className="guidance__highlight">real-time sync</span>.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p className="footer__text">
          Built for{" "}
          <a
            href="https://livesitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__link"
          >
            Livesitter
          </a>{" "}
          — AI Full Stack Developer Internship
        </p>
      </footer>
    </div>
  );
}
