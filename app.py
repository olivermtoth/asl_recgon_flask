from flask import Flask, render_template, request
import cv2
import numpy as np
import base64
from io import BytesIO
import aslrecogn as aslr

app = Flask(__name__)

import mediapipe as mp

mp_pose = mp.solutions.pose
mp_draw = mp.solutions.drawing_utils


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    image_data = request.files['frame'].read()
    # Convert the image data to a numpy array
    np_data = np.fromstring(image_data, np.uint8)
    # Read the image data as a color image
    img = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
    # Convert the image to RGB format
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    # Detect the pose landmarks in the image
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        results = pose.process(img)
        if results.pose_landmarks:
            # Draw the pose landmarks on top of the image
            mp_draw.draw_landmarks(img, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
    # Convert the image back to BGR format
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    # Convert the image to a JPEG image
    _, buffer = cv2.imencode('.jpg', img)
    # Encode the JPEG image as a base64 string
    jpeg_data = base64.b64encode(buffer).decode('utf-8')
    return jpeg_data


if __name__ == "__main__":
    app.run(debug=True)
