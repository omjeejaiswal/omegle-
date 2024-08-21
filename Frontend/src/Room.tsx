// import { useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom"
// import { Socket, io } from "socket.io-client";

// const URL = "http://localhost:3000";

// export const Room = () => {
//     const [searchParams, setSearchParams] = useSearchParams();
//     const name = searchParams.get('name');
//     const [lobby, setLobby] = useState(true)
//     const [socket, setSocket] = useState<null | Socket>(null);

//     useEffect(()=> {
//         // logic to init user to the room
//         const socket = io(URL);

//         socket.on('send-offer', (roomId) => {
//             alert("send offer please ")
//             setLobby(false)
//             socket.emit("offer", {
//                 sdp: "",
//                 roomId
//             })
//         });
        
//         socket.on("offer", (roomId, offer) => {
//             alert("send answer please")
//             setLobby(false)
//             socket.emit("answer", {
//                 roomId,
//                 sdp: ""
//             });
//         })

//         socket.on("answer", ({roomId, answer}) => {
//             setLobby(false);
//             alert("connection Done")
//         })

//         socket.on("lobby", () => {
//             setLobby(true);
//         })

//         setSocket(socket)
//     }, [name]) 

//     if (lobby){
//         return <div>
//             waiting to connect someone
//         </div>
//     }

//     return <div>
//         HI {name}
//         <video width={400} height={400} />
//         <video width={400} height={400} />
//     </div>

    
// }