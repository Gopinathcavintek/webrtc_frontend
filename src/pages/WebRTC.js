import React, { useEffect, useRef } from "react";

const WebRTC = () => {
  const videoStreamRef = useRef();
  const remoteVideoStreamRef = useRef();
  const peer = useRef(
    new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    })
  );
  const textValue = useRef();

  async function getUserMedia(_peer) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });
    videoStreamRef.current.srcObject = stream;
    console.log(stream);

    stream.getTracks().forEach((track) => {
      _peer.addTrack(track, stream);
    });
  }

  async function CreateOffer() {
    const offer = await peer.current.createOffer({
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1,
    });
    console.log(JSON.stringify(offer));
    peer.current.setLocalDescription(offer);
  }

  async function CreateAnswer() {
    try {
      const answer = await peer.current.createAnswer({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1,
      });
      console.log(JSON.stringify(answer));
      peer.current.setLocalDescription(answer);
    } catch (err) {
      console.log(err);
    }
  }

  async function setRemoteDescription() {
    try {
      const sdp = JSON.parse(textValue.current.value);
      console.log(sdp);
      if (sdp) {
        await peer.current.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    } catch (err) {
      console.log(err);
    }
  }

  const addCandidate = () => {
    const candidate = JSON.parse(textValue.current.value);
    console.log(candidate);
    peer.current.addIceCandidate(new RTCIceCandidate(candidate));
  };

  useEffect(() => {
    const _peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    _peer.onicecandidate = (e) => {
      if (e.candidate) {
        console.log(JSON.stringify(e.candidate));
      }
    };

    _peer.oniceconnectionstatechange = (e) => {
      console.log(e);
    };

    _peer.ontrack = (e) => {
      remoteVideoStreamRef.current.srcObject = e.streams[0];
      console.log(e);
    };

    peer.current = _peer;
    if (localStorage.getItem("role") == "user") {
      getUserMedia(_peer);
    }
  }, []);

  return (
    <div>
      <video ref={videoStreamRef} autoPlay />
      <video ref={remoteVideoStreamRef} autoPlay />
      <div>
        <button onClick={CreateOffer}>Create Offer</button>
        <button onClick={CreateAnswer}>Create Answer</button>
        <br />
        <textarea ref={textValue}></textarea>
        <br />
        <button onClick={setRemoteDescription}>Set Remote Description</button>
        <button onClick={addCandidate}>Add candidate</button>
      </div>
    </div>
  );
};

export default WebRTC;
