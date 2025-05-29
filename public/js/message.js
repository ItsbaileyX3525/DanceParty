function encodeMessage(type, message){
    return JSON.stringify({ type: type, message: message });
}

function handleJoinMessage(data) {
    if(data.id === window.userID){
        return;
    }

    addPlayer(data.id, 10, 10, data.colour); //Add new player
}

function handleChatMessage(data) {
    appendMessage(data.id, data.message)
}

function handleMoveMessage(data) {
    const id = data.id;
    const x = data.x;
    const y = data.y;
    const playerDiv = document.getElementById('player-' + id);
    if (!playerDiv) {
        console.warn(`Player div not found for ID: ${id}`);
        return;
    }
    playerDiv.style.left = `${x}px`;
    playerDiv.style.top = `${y}px`;
    return
}

const linked_functions = {
    joinMessage: handleJoinMessage,
    chatMessage: handleChatMessage,
    moveMessage: handleMoveMessage,
    clientDisconnect: (data) => {
        const playerDiv = document.getElementById(`player-${data.id}`);
        if (playerDiv) {
            playerDiv.remove();
        } else {
            console.warn(`Player div not found for ID: ${data.id}`);
        }
    },
    updateClients: (data) => {        
        for(const clients of data){
            if(clients.id !== window.userID){
                addPlayer(clients.id, clients.x, clients.y, clients.colour);
            }
        }
    },
    assignID: (data) => {
        window.userID = data;
        addPlayer(data, 10, 10, localStorage.getItem("colour")||"red") ;//The player that is joining
        socket.send(encodeMessage('updateData', {
            x: 20,
            y: 20,
            colour: localStorage.getItem("colour") || 'red'
        }))
    }
}

function handleMessage(data){
    //for now just consolelog
    let parsedData = data.data;

    if(typeof data.data === 'string'){
        parsedData = JSON.parse(parsedData);
    }
    if(parsedData.type === undefined || parsedData.message === undefined){
        console.warn("Received malformed message:", data);
        return;
    }

    if(linked_functions[parsedData.type]){
        linked_functions[parsedData.type](parsedData.message);
    } else {
        console.warn(`No handler for message type: ${parsedData.type}`);
    }

}