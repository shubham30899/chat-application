const users= []

const addUser= ({id, username, room}) => {
    username= username.trim().toLowerCase()
    room= room.trim().toLowerCase()

    if (!username || !room){
        return {
            error: 'Username and Room are required'
        }
    }

    const existingUser= users.find((user) => {
        return user.room=== room && user.username=== username
    })
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    const user= {id, username, room}
    users.push(user)
    return {user}

}

// addUser({ id:2, username:'Andrew', room:'r1'})
// addUser({ id:4, username:'Jay', room:'r1'})
// console.log(users)

const removeUser= (id) => {
    const index= users.findIndex((user) => {
        return user.id= id
    })
    if (index!== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser= (id) => {
    const user= users.find((user) => {
        return user.id=== id
    })
    if (user){
        return user
    }
    else{
        return undefined
    }
}

const getUsersInRoom= (room) => {
    const iusers= users.filter((user) => {
        return user.room=== room
    })
    return iusers
}

// const u= getUsersInRoom('r1')
// console.log(u)

module.exports= {
    addUser,
    getUser,
    getUsersInRoom,
    removeUser
}