# RTSP Livestream Overlay Web Application

Assignment submission for **Livesitter – AI Full Stack Developer Internship**.

**Demo Video:** [Watch on Google Drive](https://drive.google.com/file/d/19l-nDF4E-JUl8_h3oizKukJTsxZTwd28/view?usp=sharing)

This application plays a livestream video and allows users to create, manage, and display real-time overlays (text or image) on top of the video. Overlay updates are synchronized across all connected clients using WebSockets.

---

## Tech Stack

**Frontend**
- React 19 with TypeScript
- Vite (build tool and dev server)
- Socket.IO Client (real-time communication)
- hls.js (HLS video playback)

**Backend**
- Python with Flask
- Flask-SocketIO (WebSocket integration)
- MongoDB with PyMongo

---

## RTSP Streaming Approach

Browsers do not natively support RTSP streams. The standard approach is:

```
RTSP → FFmpeg → HLS (.m3u8) → Browser Video Player
```

For demonstration, a public HLS stream is used. The same implementation works with any RTSP stream converted to HLS via FFmpeg.

---

## Features

- **Livestream Playback** – HLS video streaming using hls.js
- **Text Overlays** – Add customizable text overlays on the video
- **Image Overlays** – Add image overlays on the video
- **Drag-and-Drop** – Reposition overlays by dragging
- **Resizable Overlays** – Resize overlays as needed
- **Real-time Sync** – Instant updates across clients via WebSockets
- **Persistent Storage** – Overlays stored in MongoDB
- **Full CRUD API** – Create, Read, Update, Delete operations

---

## Real-Time Architecture

1. Client performs a CRUD operation via REST API
2. Backend updates MongoDB
3. Backend emits a WebSocket event
4. All connected clients receive the update instantly

---

## Project Structure

```
livesitter-rtsp-overlay-app/
├── backend/
│   ├── app.py              # Flask server + Socket.IO
│   ├── db.py               # MongoDB connection
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoPlayer.tsx    # HLS video player
│   │   │   └── OverlayLayer.tsx   # Overlay management
│   │   ├── App.tsx                # Main application
│   │   ├── socket.ts              # Socket.IO client
│   │   └── main.tsx               # Entry point
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## Running Locally

### Prerequisites

- Python 3.8+
- Node.js 18+
- MongoDB (local or cloud)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\Activate      # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python app.py
```

Create a `.env` file in the `backend` folder:

```
MONGODB_URI=your_mongodb_connection_string
```

Backend runs at: `http://127.0.0.1:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## API Endpoints

| Method   | Endpoint             | Description            |
|----------|----------------------|------------------------|
| `GET`    | `/health`            | Health check           |
| `GET`    | `/api/overlays`      | Fetch all overlays     |
| `POST`   | `/api/overlays`      | Create new overlay     |
| `PUT`    | `/api/overlays/:id`  | Update overlay by ID   |
| `DELETE` | `/api/overlays/:id`  | Delete overlay by ID   |

### Overlay Schema

```json
{
  "_id": "string",
  "type": "text | image",
  "content": "string",
  "position": { "x": 0, "y": 0 },
  "size": { "width": 100, "height": 50 }
}
```

---

## WebSocket Events

| Event             | Direction         | Payload              |
|-------------------|-------------------|----------------------|
| `overlay_created` | Server → Client   | Overlay object       |
| `overlay_updated` | Server → Client   | Updated overlay      |
| `overlay_deleted` | Server → Client   | `{ "_id": "..." }`   |

---

## Demo Video

A demo video is included demonstrating:

- Application startup
- Livestream playback
- Creating text and image overlays
- Dragging and repositioning overlays
- Resizing overlays
- Real-time synchronization across multiple clients
- Persistent storage verification

---

## Repository

GitHub: [Jagadeesh9110/livesitter-rtsp-overlay-app](https://github.com/Jagadeesh9110/livesitter-rtsp-overlay-app)

---

## Author

**Jagadeeswar**  
AI Full Stack Developer Internship Candidate  
Livesitter Assignment Submission
