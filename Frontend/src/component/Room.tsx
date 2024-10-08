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
    localAudioTrack: MediaStreamTrack | null,
    localVideoTrack: MediaStreamTrack | null,

}) => {
    const [ searchParams, setSearchParams] = useSearchParams();
    const [lobby, setLobby] = useState(true);
    const [socket, setSocket] = useState<null | Socket>(null);
    const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null)
    const [recevingPc, setReceivingPc] = useState<null | RTCPeerConnection>(null)
    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null)
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null)
    const [remoteMediaStream, setremoteMediaStream] = useState<MediaStream | null>(null)
    const remoteVideoRef = useRef<HTMLVideoElement | undefined>();
    const localVideoRef = useRef<HTMLVideoElement>()
 

    useEffect(() => {
        const socket = io(URL);
        socket.on('send-offer', async ({roomId}) => {
            console.log("sending offer")
            setLobby(false);
            const pc = new RTCPeerConnection();
            setSendingPc(pc);
            if(localVideoTrack) {
                console.error("added track")
                console.log(localVideoTrack)
                pc.addTrack(localVideoTrack)
            }

            if(localAudioTrack) {
                console.error("added track")
                console.log(localAudioTrack)
                pc.addTrack(localAudioTrack)
            }
            

            
            pc.onicecandidate = async (e) => {
                console.log("receiving ice candidate locally")
                if(e.candidate) {
                    socket.emit("add-ice-candidate",{
                        candidate: e.candidate,
                        type: "sender",
                        roomId 
                    })
                } 
            }

            pc.onnegotiationneeded = async () => {
                console.log("on negogtiation needed, sending offer")
                const sdp = await pc.createOffer();
                // @ts-ignore
                pc.setLocalDescription(sdp)
                socket.emit("offer", {
                    sdp, 
                    roomId
                })
            }

        });

        socket.on("offer", async ({roomId, sdp: remoteSdp}) =>{
            console.log("received offer")
            setLobby(false);
            const pc = new RTCPeerConnection();
            pc.setRemoteDescription(remoteSdp)
            const sdp = await pc.createAnswer();
            // @ts-ignore
            pc.setLocalDescription(sdp)
            const stream = new MediaStream()
            if(remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }

            setremoteMediaStream(stream);
            // trickle ice
            setReceivingPc(pc);

            // pc.onconnectionstatechange = (e) => {
            //     console.error(e);
            //     console.log(pc.iceConnectionState)
            // }
            window.pcr = pc;
            pc.ontrack = (e) => {
                alert("ontrack")
                
            }
            // console.log(pc.ontrack)


            pc.onicecandidate = async(e) => {
                if(!e.candidate){
                    return;
                }
                console.log("on ice candidate on reciving side")
                if(e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "receiver",
                        roomId
                    })
                }
            }

            
            socket.emit("answer", {
                roomId,
                sdp: sdp
            });

            setTimeout(() => {
                const track1 =  pc.getTransceivers()[0].receiver.track
                const track2 =  pc.getTransceivers()[1].receiver.track
                console.log(track1);
                if(track1.kind === "video") {
                    setRemoteAudioTrack(track1);
                    setRemoteVideoTrack(track2);
                } else {
                    setRemoteAudioTrack(track2);
                    setRemoteVideoTrack(track1);
                }
                // @ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track1)
                // @ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track2)
                // @ts-ignore
                remoteVideoRef.current.play();

                
                // if(type == 'audio') {
                //     // setRemoteAudioTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // }
                // else{
                //     // setRemoteVideoTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // }
                // // @ts-ignore
                // remoteVideoRef.current.play();
            }, 5000)
        });

        socket.on("answer", ({roomId, sdp: remoteSdp}) => {
            setLobby(false);
            setSendingPc(pc => {
                pc?.setRemoteDescription(remoteSdp)
                return pc;
            });
            console.log("loop closed")
        })

        socket.on("lobby", () => {
            setLobby(true);
        })

        socket.on("add-ice-candidate", ({candidate, type}) => {
            console.log("add ice candidate from remote")
            console.log({candidate, type})
            if(type == "sender") {
                setReceivingPc(pc => {
                    if(!pc){
                        console.log("receiving pc not found")
                    } else{
                        console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate)
                    return pc;
                })
            } else{
                setSendingPc(pc => {
                    if(!pc){
                        console.log("sending pc not found")
                    } else{
                        // console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate)
                    return pc;
                })
            }
        })

        setSocket(socket)
    },[name])


    useEffect(() => {
        if(localVideoRef.current) {
            if(localVideoTrack) {
                localVideoRef.current.srcObject = new MediaStream([localVideoTrack])
                localVideoRef.current.play();
            }
        }
    }, [localVideoRef])

    
    return <div>
        hi{name}
        <video autoPlay width={400} height={400} ref={localVideoRef} />
        {lobby ? "waiting to connect you to someone " : null }
        <video autoPlay width={400} height={400} ref={remoteVideoRef} />
    </div>
}