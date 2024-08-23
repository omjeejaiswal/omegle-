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
    onOffer(roomId, sdp) {
        var _a;
        const user2 = (_a = this.rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.user2;
        console.log("onoffer");
        console.log("user2 is " + user2);
        user2 === null || user2 === void 0 ? void 0 : user2.socket.emit("offer", {
            sdp,
            roomId
        });
    }
    onAnswer(roomId, sdp) {
        var _a;
        const user1 = (_a = this.rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.user1;
        console.log("user1 is " + user1);
        console.log("onAnswer");
        user1 === null || user1 === void 0 ? void 0 : user1.socket.emit("answer", {
            sdp,
            roomId
        });
    }
    onIceCandidates(roomId, senderSocketid, candidate, type) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const recievingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        recievingUser.socket.send("add-ice-candidate", ({ candidate }));
    }
    generate() {
        return GLOBAL_ROOM_ID++;
    }
}
exports.RoomManager = RoomManager;
