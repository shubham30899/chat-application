const express= require('express')
const path= require('path')
const http= require('http')
const socketio= require('socket.io')
const Filter= require('bad-words')
const { generateMessage }= require('./utils/messages')
const { generateLocationMessage }= require('./utils/messages')
const { getUser,removeUser,addUser,getUsersInRoom } = require('./utils/users')

const app= express()
const server= http.createServer(app)
const io= socketio(server)

const viewPublicPath= path.join(__dirname, '../public')
const port= process.env.PORT || 4000

app.use(express.static(viewPublicPath))

io.on('connection',(socket) => {
    console.log("New Websocket Connection")

    // socket.emit('message', generateMessage('Welcome!'))
    // socket.broadcast.emit('message', generateMessage("A new user has joined!"))
    socket.on('sendMessage', (msg, callback) => {
        const filter= new Filter()
        const user= getUser(socket.id)
        if(user){ 
            if(filter.isProfane(msg)){
                return callback('Profanity Not Allowed')
            }
            io.to(user.room).emit('message', generateMessage(user.username, msg))
            callback()     
        }
    })
    socket.on('disconnect', () => {
        const user= removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage(user.username + ' has left!'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
    socket.on('sendLocation', (lat,long, callback) => {
        const user= getUser(socket.id)
        io.to(user.room).emit('sendLoc', generateLocationMessage(user.username, 'https://www.google.com/maps?q='+lat+','+long))
        callback('Location Shared!')
    })
    // socket.emit('countUpdate', count)
    // socket.on('increment', () => {
    //     count++
    //     // socket.emit('countUpdate', count)
    //     io.emit('countUpdate', count)
    // })
    socket.on('join', ({username, room}, callback) => {
        
        const { error, user }= addUser({id: socket.id, username: username, room: room})
        if (error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Server','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username + ' has joined!'))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

})

server.listen( port, () => {
    console.log('Server is successfully running at Port ' + port )
})