import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom"
import { Socket, io } from "socket.io-client";

const URL = "http://localhost:3000"

export const Room = ({
    name,
    localAudioTrack,
    localVideoTrack
}: { 
    name: string,
    localAudioTrack: MediaStreamTrack,
    localVideoTrack: MediaStreamTrack,

}) => {
    const [ searchParams, setSearchParams] = useSearchParams();
    const name = searchParams.get('name');
    const [lobby, setLobby] = useState(true);
    const [socket, setSocket] = useState<null | Socket>(null);
    const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null)
    const [recevingPc, setReceivingPC] = useState<null | RTCPeerConnection>(null)
    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null)
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null)
    const [remoteMediaStream, setremoteMediaStream] = useState<MediaStream | null>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>();
 

    useEffect(() => {
        const socket = io(URL);
        socket.on('send-offer', async ({roomId}) => {
            setLobby(false);
            const pc = new RTCPeerConnection();
            setSendingPc(pc);
            pc.addTrack(localAudioTrack)
            pc.addTrack(localVideoTrack)

            
            pc.onicecandidate= async () => {
                const sdp = await pc.createOffer();
                socket.emit("offer", {
                    sdp, 
                    roomId
                })
            }
        });

        socket.on("offer", async ({roomId, offer}) =>{
            setLobby(false);
            const pc = new RTCPeerConnection();
            pc.setRemoteDescription({sdp: offer, type: "offer"})
            const sdp = await pc.createAnswer();
            const stream = new MediaStream()
            if(remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }
            setremoteMediaStream(stream);
            // trickle ice
            setReceivingPC(pc);
            pc.ontrack = (({track, type}) => {
                if(type == 'audio') {
                    setRemoteAudioTrack(track);
                }
                else{
                    setRemoteVideoTrack(track);
                }
            })
            socket.emit("answer", {
                roomId,
                sdp: sdp
            });
        });

        socket.on("answer", ({roomId, answer}) => {
            setLobby(false);
            setSendingPc(pc => {
                pc?.setRemoteDescription({
                    type: "answer",
                    sdp: answer
                })
                return pc;
            })
        })

        socket.on("lobby", () => {
            setLobby(true);
        })

        setSocket(socket)
    },[name])

    if(lobby) {
        return <div>
            waiting to connect you to someone
        </div>
    }

    return <div>
        hi{name}
        <video width={400} height={400} />
        <video width={400} height={400} ref={remoteVideoRef} />
    </div>
}