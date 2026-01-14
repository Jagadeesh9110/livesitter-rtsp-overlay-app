from flask import Flask, jsonify, request
from flask_cors import CORS
from bson.objectid import ObjectId
from db import overlays_collection
from flask_socketio import SocketIO, emit


app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")


# Health Check
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

# CREATE Overlay
@app.route("/api/overlays", methods=["POST"])
def create_overlay():
    data = request.json

    overlay = {
        "type": data.get("type"),
        "content": data.get("content"),
        "position": data.get("position", {"x": 0, "y": 0}),
        "size": data.get("size", {"width": 100, "height": 50})
    }

    result = overlays_collection.insert_one(overlay)
    overlay["_id"] = str(result.inserted_id)

    socketio.emit("overlay_created", overlay)

    return jsonify(overlay), 201

# READ Overlays
@app.route("/api/overlays", methods=["GET"])
def get_overlays():
    overlays = []

    for overlay in overlays_collection.find():
        overlay["_id"] = str(overlay["_id"])
        overlays.append(overlay)

    return jsonify(overlays), 200

# UPDATE Overlay
@app.route("/api/overlays/<overlay_id>", methods=["PUT"])
def update_overlay(overlay_id):
    data = request.json

    updated_data = {
        "type": data.get("type"),
        "content": data.get("content"),
        "position": data.get("position"),
        "size": data.get("size")
    }

    updated_data = {k: v for k, v in updated_data.items() if v is not None}

    result = overlays_collection.update_one(
        {"_id": ObjectId(overlay_id)},
        {"$set": updated_data}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Overlay not found"}), 404

    overlay = overlays_collection.find_one({"_id": ObjectId(overlay_id)})
    overlay["_id"] = str(overlay["_id"])

    socketio.emit("overlay_updated", overlay)

    return jsonify(overlay), 200

# DELETE Overlay
@app.route("/api/overlays/<overlay_id>", methods=["DELETE"])
def delete_overlay(overlay_id):
    result = overlays_collection.delete_one({"_id": ObjectId(overlay_id)})

    if result.deleted_count == 0:
        return jsonify({"error": "Overlay not found"}), 404
    
    socketio.emit("overlay_deleted", {"_id": overlay_id})

    return jsonify({"message": "Overlay deleted"}), 200

@socketio.on("connect")
def handle_connect():
    print("Client connected")

@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")


if __name__ == "__main__":
    socketio.run(app, debug=True)
