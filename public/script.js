const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideos = document.getElementById('remoteVideos');
const captionsDiv = document.getElementById('captions');
const languageSelect = document.getElementById('languageSelect');

const peers = {};
let localStream;

(async function init() {
  const roomId = prompt("Enter Room ID:");
  const userId = Math.random().toString(36).substring(2);

  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;

  socket.emit('join-room', roomId, userId);

  socket.on('users-in-room', users => {
    users.forEach(remoteId => {
      const pc = createPeer(remoteId);
      peers[remoteId] = pc;
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    });
  });

  socket.on('user-joined', remoteId => {
    const pc = createPeer(remoteId);
    peers[remoteId] = pc;
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  });

  socket.on('offer', async ({ from, offer }) => {
    const pc = createPeer(from);
    peers[from] = pc;
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('answer', { to: from, answer });
  });

  socket.on('answer', async ({ from, answer }) => {
    await peers[from].setRemoteDescription(new RTCSessionDescription(answer));
  });

  socket.on('ice-candidate', ({ from, candidate }) => {
    peers[from].addIceCandidate(new RTCIceCandidate(candidate));
  });

  socket.on('user-left', id => {
    if (peers[id]) {
      peers[id].close();
      delete peers[id];
    }
  });

  setupCaptioning();
})();

function createPeer(remoteId) {
  const pc = new RTCPeerConnection();
  pc.onicecandidate = e => {
    if (e.candidate) socket.emit('ice-candidate', { to: remoteId, candidate: e.candidate });
  };
  pc.ontrack = e => {
    const video = document.createElement('video');
    video.autoplay = true;
    video.srcObject = e.streams[0];
    remoteVideos.appendChild(video);
  };
  pc.onnegotiationneeded = async () => {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', { to: remoteId, offer });
  };
  return pc;
}

function setupCaptioning() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.lang = 'en-US';

  recognition.onresult = async e => {
    const text = Array.from(e.results)
      .map(result => result[0].transcript)
      .join('');
    const selectedLang = languageSelect.value;

    if (text.trim()) {
      const translated = await translateText(text, selectedLang);
      captionsDiv.innerText = translated;
    }
  };

  recognition.start();
}

async function translateText(text, targetLang) {
  const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
  const data = await res.json();
  return data.responseData.translatedText;
}