"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const app = express();
const io = new Server(app);
io.on('connection', (socket) => {
    console.log('a user connented');
});
app.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
