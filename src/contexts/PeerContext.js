// PeerContext.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from "react";

import { useSocket } from "./SocketContext";

export const PeerContext = createContext();

export const usePeer = () => useContext(PeerContext);

const PeerProvider = (props) => {
  const [remoteStream, setRemoteStream] = useState();
  const { socket } = useSocket();
  const peer = useMemo(() => {
    return new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });
  }, []);

  const createOffer = async () => {
    const offer = await peer.createOffer({
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1,
    });
    peer.setLocalDescription(offer);
    return offer;
  };

  const setRemoteDescription = async (offer) => {
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer({
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1,
    });
    peer.setLocalDescription(answer);
    console.log(answer);
    return answer;
  };

  useEffect(() => {
    const onIceCandidate = (e) => {
      console.log("onicecandidate event triggered");
      console.log(e.candidate);
      if (e.candidate) {
        window.ice_candidate = e.candidate;
      }
    };

    peer.onicecandidate = onIceCandidate;

    peer.addEventListener("icecandidateerror", (error) => {
      console.error("ICE candidate error:", error);
    });

    peer.addEventListener("iceconnectionstatechange", () => {
      console.log("ICE connection state:", peer.iceConnectionState);
    });

    return () => {
      peer.onicecandidate = null;
    };
  }, [peer]);

  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        remoteStream,
        setRemoteDescription,
      }}
    >
      {props.children}
    </PeerContext.Provider>
  );
};

export default PeerProvider;
