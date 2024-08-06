const express = require('express');
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"],
    },
});

app.use(cors());

server.listen(8000, () => {
    console.log("server started on port 8000");
});
const arr=new Set();
io.on("connection", (socket) => {
    console.log("New user connected");

    socket.on('user-joined', (data) => {
        console.log(data);
        console.log("id"+data.meetingId);
        const { meetingId } = data;
        console.log(meetingId);
        socket.join(meetingId);
        arr.add(socket.id);
        console.log(arr);
        console.log(`User joined meeting ${meetingId}`);
        socket.broadcast.to(meetingId).emit('user-joined', { meetingId, socketId: socket.id });
    });

    socket.on('call-user', (data) => {
        const { offer, targetSocketId } = data;
        console.log('call-user');
        io.to(targetSocketId).emit('incoming-call', { socketId: socket.id, offer });
    });

    socket.on("call-accepted", (data) => {
        const { answer, targetSocketId } = data;
        console.log("call-accepted");
        io.to(targetSocketId).emit("call-accepted", { answer, socketId: socket.id });
    });

    socket.on("ice-candidate", (data) => {
        const { candidate, targetSocketId } = data;
        console.log("iceCandidate");
        io.to(targetSocketId).emit("ice-candidate", { candidate, socketId: socket.id });
    });
    socket.on('end-call',(data)=>{
       const {meetingId}=data;
       console.log('User left the meeting');
       console.log(meetingId);
       socket.leave(meetingId);
       io.emit('user-left', { meetingId });
    //    io.emit('handleuserleft',{meetingId});
    })

    socket.on("send-message",(data)=>{
        console.log('send-message');
        const {meetingId,message}=data;
        //socket.join(meetingId);
        console.log(meetingId);
        io.to(meetingId).emit('new-message',{mesg:message});
    })
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});
