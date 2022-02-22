const socket = io("/");
const myPeer = new Peer();
const videoGrid = document.getElementById("video-grid");
const meetIdE = document.getElementById("meet-id");
const createMeet = document.getElementById("create-meet");
const copy = document.getElementById("copy");
let localStream;
//
let MEET_ID;
let MY_ID;
const { href } = location;
//
const myVideo = document.createElement("video");
myVideo.muted = true;
//
const peers = {};

copy.onclick = () => {
  navigator.clipboard.writeText(`${href}${MEET_ID}`);
  const msg = copy.parentElement.querySelector(".msg");
  msg.classList.remove("hidden");
  setTimeout(() => {
    msg.classList.add("hidden");
  }, 2000);
};

createMeet.onclick = async () => {
  const res = await fetch("/new");
  let { meetId } = await res.json();
  MEET_ID = meetId;
  console.log(MEET_ID);
  socket.emit("join-room", MEET_ID, MY_ID);
  createMeet.classList.add("hidden");

  meetIdE.classList.remove("hidden");
  meetIdE.querySelector("h3").textContent = `${href}${MEET_ID}`;

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  addVideoStream(myVideo, localStream);
};

myPeer.on("call", (call) => {
  console.log("answer localStream ");
  call.answer(localStream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
});

socket.on("user-connected", (userId) => {
  console.log("user-connected");
  console.log(localStream);
  connectToNewUser(userId, localStream);
});

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", async (id) => {
  MY_ID = id;
  console.log("peer open MY_ID", MY_ID);
  const { pathname } = location;
  if (pathname != "/") {
    MEET_ID = pathname.replace("/", "");

    console.log("peer open meetId:", MEET_ID);
    socket.emit("join-room", MEET_ID, MY_ID);
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    addVideoStream(myVideo, localStream);
  }
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    console.log("recibiendo stream");
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}
