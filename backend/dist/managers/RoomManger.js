"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
let GLOBAL_ROOM_ID = 1;
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(user1, user2) {
        const roomId = this.generate().toString();
        this.rooms.set(roomId.toString(), {
            user1,
            user2,
        });
        user1.socket.emit("send-offer", {
            roomId
        });
        user2.socket.emit("send-offer", {
            roomId
        });
    }
    onOffer(roomId, sdp, senderSocketid) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const recievingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        recievingUser === null || recievingUser === void 0 ? void 0 : recievingUser.socket.emit("offer", {
            sdp,
            roomId
        });
    }
    onAnswer(roomId, sdp, senderSocketid) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const recievingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        recievingUser === null || recievingUser === void 0 ? void 0 : recievingUser.socket.emit("answer", {
            sdp,
            roomId
        });
    }
    onIceCandidates(roomId, senderSocketid, candidate, type) {
        console.log("-------------------");
        console.log(roomId);
        console.log(senderSocketid);
        console.log(candidate);
        console.log(type);
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const recievingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        recievingUser.socket.emit("add-ice-candidate", ({ candidate }));
    }
    generate() {
        return GLOBAL_ROOM_ID++;
    }
}
exports.RoomManager = RoomManager;
