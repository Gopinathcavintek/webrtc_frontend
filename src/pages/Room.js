import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { usePeer } from "../contexts/PeerContext";

const Room = () => {
  const connectUserRef = useRef();
  const { socket } = useSocket();
  const [remoteStream, setRemoteStream] = useState();
  const videoStreamRef = useRef();
  const remoteVideoStreamRef = useRef();
  const { peer, createOffer, setRemoteDescription } = usePeer();
  const location = useParams();

  async function getUserMedia(peer) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });
    videoStreamRef.current.srcObject = stream;
    console.log(stream);

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });
  }

  const handleNewUser = (data) => {
    console.log(data);
  };

  const iceCndidateInfo = useCallback(async (data) => {
    await peer.addIceCandidate(new RTCIceCandidate(data.iceCandidate));
    // console.log("call Accepted");
    // console.log(data);
  }, []);

  const acceptCall = useCallback(async (data) => {
    await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
    await peer.addIceCandidate(new RTCIceCandidate(window.ice_candidate));
    console.log("call Accepted");
    // socket.emit("connectCall", {
    //   ice_candidate: window.ice_candidate,
    //   to: data.from,
    // });
  }, []);

  const handlePeerOfffer = useCallback(async (data) => {
    const answer = await setRemoteDescription(data.offer);
    socket.emit("peerAccept", {
      to: data.from,
      answer: answer,
    });
  }, []);

  const onSubmit = async () => {
    const formdata = new FormData(connectUserRef.current);
    const offer = await createOffer();
    socket.emit("createOffer", {
      toEmail: formdata.get("toemail"),
      offer: offer,
    });
  };

  useEffect(() => {
    const handleRemoteTrack = (event) => {
      try {
        if (event.streams) {
          console.log("Remote track received:", event);
          remoteVideoStreamRef.current.srcObject = event.streams[0];
        } else {
          console.error("No stream found in the event:", event);
        }
      } catch (err) {
        console.log(err);
      }
    };

    peer.addEventListener("track", handleRemoteTrack);

    return () => {
      remoteVideoStreamRef.current.srcObject = null;
      peer.removeEventListener("track", handleRemoteTrack);
    };
  }, [peer]);

  useEffect(() => {
    socket.emit("userConnect", {
      emailId: localStorage.getItem("email"),
      roomId: location.roomId,
    });

    socket.on("peerOffer", handlePeerOfffer);

    socket.on("userMessage", handleNewUser);

    socket.on("callUser", acceptCall);

    socket.on("iceCndidateInfo", iceCndidateInfo);

    if (localStorage.getItem("role") == "user") {
      getUserMedia(peer);
    }

    return () => {
      socket.off("userMessage", handleNewUser);
      socket.off("peerOffer", handlePeerOfffer);
      socket.off("callUser", acceptCall);
      socket.off("iceCndidateInfo", iceCndidateInfo);
    };
  }, []);

  return (
    <div>
      <h1>Room</h1>
      <video ref={videoStreamRef} autoPlay />
      <video ref={remoteVideoStreamRef} autoPlay />
      {localStorage.getItem("role") == "admin" && (
        <form ref={connectUserRef}>
          <input type="text" name="toemail" />
          <button type="button" onClick={onSubmit}>
            connect
          </button>
        </form>
      )}
    </div>
  );
};

export default Room;
