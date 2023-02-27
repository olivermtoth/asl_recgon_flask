// Load the MediaPipe Pose detection library
importScripts('https://cdn.jsdelivr.net/npm/@mediapipe/pose');

// Create a new instance of the MediaPipe Pose detection solution
const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  },
});

// Create an event listener for the message event
self.addEventListener('message', async (event) => {
  const frame = event.data;

  // Process the video frame with MediaPipe Pose detection
  const poseResults = await pose.estimateSinglePose(frame, {
    flipHorizontal: false
  });

  // Draw the pose landmarks on the video frame
  const canvas = new OffscreenCanvas(frame.width, frame.height);
  const context = canvas.getContext('2d');
  context.drawImage(frame, 0, 0);
  pose.draw(context, poseResults);

  // Post the processed image data back to the main thread
  canvas.toBlob((blob) => {
    const reader = new FileReader();
    reader.onload = () => {
      postMessage(reader.result);
    };
    reader.readAsDataURL(blob);
  }, 'image/png');
});
