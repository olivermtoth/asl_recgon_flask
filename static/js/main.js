// Get the video element and the processed image element
const video = document.getElementById('video');
const processedImage = document.getElementById('processedImage');
const startButton = document.getElementById('startButton');

// Get access to the user's webcam
function startVideo() {
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then((stream) => {
            video.srcObject = stream;
            video.play();
            sendFrame();
        })
        .catch((err) => {
            console.log(`Error: ${err}`);
        });
}

startButton.addEventListener('click', () => {
    startVideo();
});

// Send the video frames to the Flask server
function sendFrame() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append('frame', blob);
        fetch('/process', {
            method: 'POST',
            body: formData
        })
        .then((response) => {
            return response.text();
        })
        .then((png_data) => {
            processedImage.src = 'data:image/png;base64,' + png_data;
            requestAnimationFrame(sendFrame);
        })
        .catch((err) => {
            console.log(`Error: ${err}`);
        });
    }, 'image/png');
}

setInterval(sendFrame, 1000/60);