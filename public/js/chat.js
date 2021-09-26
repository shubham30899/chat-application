const socket= io()

const messageFormInput= document.querySelector('#msg')
const messageFormButton= document.querySelector('#msgb')
const sendLocationButton= document.querySelector('#sendLocation')
const messages= document.querySelector('#messages')

const messageTemplate= document.querySelector('#message-template').innerHTML
const locationTemplate= document.querySelector('#location-template').innerHTML
const sidebarTemplate= document.querySelector('#sidebar-template').innerHTML

const { username, room }= Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll= () => {
    const newMessage= messages.lastElementChild

    const newMessageStyles= getComputedStyle(newMessage)
    const newMessageMargin= parseInt(newMessageStyles.marginBottom)
    const newMessageHeight= newMessage.offsetHeight + newMessageMargin

    const visibleHeight= messages.offsetHeight

    const containerHeight= messages.scrollHeight

    const scrollOffset= messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop= messages.scrollHeight
    } 
}
// socket.on('countUpdate', (count) => {
//     console.log('count is '+ count)
// })

// const q= document.querySelector('#increment')
// q.addEventListener('click', () => {
//     console.log('Clicked!')
//     socket.emit('increment')
// })

socket.on('message', (msg) => {
    console.log(msg)
    const html= Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('sendLoc', (msgL) => {
    console.log(msgL)
    const html2= Mustache.render(locationTemplate, {
        username: msgL.username,
        location: msgL.text,
        createdAt: moment(msgL.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html2)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html3= Mustache.render(sidebarTemplate, {
        room,
        users   
    })
    document.querySelector('#sidebar').innerHTML= html3
})

const q1= document.querySelector('#msg')
const q2= document.querySelector('#msgb')

q2.addEventListener('click', () => {
    messageFormButton.setAttribute('disabled','Disabled')
    
    socket.emit('sendMessage', q1.value, (error) => {
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value= ""
        messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})

document.querySelector('#sendLocation').addEventListener('click', () => {
    
    if(!navigator.geolocation){
        return alert('Geolocation is not supported')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        sendLocationButton.setAttribute('disabled','disabled')
        socket.emit('sendLocation', position.coords.latitude, position.coords.longitude, (m) => {
            sendLocationButton.removeAttribute('disabled')
            console.log(m)
        } )
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href= '/'
    }
})