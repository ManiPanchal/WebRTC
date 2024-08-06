
import React, { useEffect, useState, useMemo } from "react";
import io from "socket.io-client";
import { useSocket } from "./sockets";
const PeerContext = React.createContext();
// const socket = io.connect("http://localhost:8000");

export const usePeer = () => React.useContext(PeerContext);

export const PeerProvider = (props) => {
    const [remoteStream, setRemoteStream] = useState(null);
    const {socket}=useSocket();
    const peer = useMemo(() => new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:global.stun.twilio.com:3478",
                ]
            }
        ]
    }), []);

    const createOffer = async () => {
        console.log("create offerfunction");
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;
    };

    const createAnswer = async (offer) => {
        console.log("create answer function");
        // await peer.setRemoteDescription(offer);
        console.log(offer);
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    };

    const setRemoteAns = async (answer) => {
        console.log(answer);
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
        // await peer.setRemoteDescription(answer);
    };

    const sendStream = async (stream) => {
        console.log("sendstream function");
        console.log(stream);
        const tracks = stream.getTracks();
        console.log(tracks);
        for (const track of tracks) {
            console.log(track);
            peer.addTrack(track, stream);
        }
    };

    const handleTrackEvent = (event) => {
        console.log("handleTrack function");
        const streams = event.streams;
        console.log(streams[0]);
        setRemoteStream(streams[0]);
    };
   const handleNegotiation =(event)=>{
      console.log('negotiation');
   }
    useEffect(() => {
        console.log("useEffect function");
        peer.addEventListener('track', handleTrackEvent);
        // peer.addEventListener('negotiationneeded',handleNegotiation);
        // Handle ICE candidate events
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate, targetSocketId:socket.id });
            }
        };
        return () => {
            peer.removeEventListener('track', handleTrackEvent);
            peer.removeEventListener('negotiationneeded',handleNegotiation);
        };
    }, [peer]);

    return (
        <PeerContext.Provider value={{ peer, createOffer, createAnswer, setRemoteAns, sendStream, remoteStream,setRemoteStream }}>
            {props.children}
        </PeerContext.Provider>
    );
};
