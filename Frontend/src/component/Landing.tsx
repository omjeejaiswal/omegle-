import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom";
import { Room } from "./Room";

export const Landing = () => {
    const [name, setName] = useState("");
    const [localAudioTrack, setlocalAudioTrack] = useState<MediaStreamTrack | null>(null)
    const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    const [joined, setJoined] = useState(false);

    const getCam = async () => {
        const stream = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
        // MediaStreams
        const audioTrack = stream.getAudioTracks()[0]
        const videoTrack = stream.getVideoTracks()[0]
        setlocalAudioTrack(audioTrack)
        setLocalVideoTrack(videoTrack)
        if(!videoRef.current) {
            return
        }

        videoRef.current.srcObject = new MediaStream([videoTrack]);
        // videoRef.current.srcObject = stream
        videoRef.current.play();
        //MediaStreams
    }   

    useEffect(() => {
        if(videoRef && videoRef.current){
            getCam()
        }
    }, [videoRef]);

    if(!joined) {
        return <div>
            <video autoPlay ref = {videoRef} ></video>
            <input type="text" onChange={(e)=> {
                setName(e.target.value);
            }}>
            </input>

            <button onClick={() => {
                setJoined(true);
            }} > JOIN
            </button>
        </div>
    }

    return <Room name = {name} localAudioTrack = {localAudioTrack} localVideoTrack = {localVideoTrack} />

    
}

