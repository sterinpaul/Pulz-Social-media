import { Server,Socket } from "socket.io";
import {DefaultEventsMap} from 'socket.io/dist/typed-events'

interface User{
    userId:string,
    socketId:string
}

let activeUsers:User[] = []

const socketConfig = (
    io:Server<DefaultEventsMap>
)=>{
    io.on('connection',(socket:Socket)=>{
        // socket.emit('me',socket.id)
        // Socket.IO connection event: This function is executed when a new client connects to the server.
        socket.on('add-new-user',(newUserId:string)=>{
            // Event handler for "add-new-user" event: Adds a new user to the list of active users.
            if(!activeUsers.some((user)=>user.userId===newUserId)){
                activeUsers.push({userId:newUserId,socketId:socket.id})
                console.log(`new user connected: ${newUserId}, ${socket.id}`)
            }
            io.emit('get-users',activeUsers)
        })

        socket.on('send-message',(data)=>{
            const {receiverId} = data
            const user = activeUsers.find((user)=>user.userId===receiverId)
            if(user){
                io.to(user.socketId).emit('notification',data)
                io.to(user.socketId).emit('receive-message',data)
            }
        })

        socket.on('block-user',(userId)=>{
            const user = activeUsers.find((user)=>user.userId===userId)
            if(user){
                io.to(user.socketId).emit('user-blocked')
            }
        })

        socket.on('initialize-call',data=>{
            const user = activeUsers.find((user)=>user.userId===data.chatUserId)
            if(user){
                io.to(user.socketId).emit('offer-received',data)
            }
        })

        socket.on('another-call',id=>{
            const user = activeUsers.find((user)=>user.userId===id)
            if(user){
                io.to(user.socketId).emit('another-caller')
            }
        })

        socket.on('cancel-call',id=>{
            const user = activeUsers.find((user)=>user.userId===id)
            if(user){
                io.to(user.socketId).emit('call-cancelled')
            }
        })

        socket.on('reject-call',id=>{
            const user = activeUsers.find((user)=>user.userId===id)
            if(user){
                io.to(user.socketId).emit('call-rejected')
            }
        })
    

        socket.on('disconnect',()=>{
            socket.broadcast.emit('call-ended')
            // Event handler for "disconnect" event: Removes a user from the active users list when they disconnect.
            activeUsers = activeUsers.filter((user)=>user.socketId !== socket.id)
            console.log(`user disconnected: ${socket.id}`)
            io.emit("get-users", activeUsers)
        })
    })
}

export default socketConfig