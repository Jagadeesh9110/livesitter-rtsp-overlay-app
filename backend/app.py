import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# MongoDB Connection (GLOBAL)
load_dotenv()
client = MongoClient(os.getenv("MONGODB_URI"))
db = client["rtsp_overlay_db"]
overlays_collection = db["overlays"]

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

    return jsonify(overlay), 201

# -----------------------------
# READ Overlays
# -----------------------------
@app.route("/api/overlays", methods=["GET"])
def get_overlays():
    overlays = []

    for overlay in overlays_collection.find():
        overlay["_id"] = str(overlay["_id"])
        overlays.append(overlay)

    return jsonify(overlays), 200

# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)
