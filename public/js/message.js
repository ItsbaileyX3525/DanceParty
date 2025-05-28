function encodeMessage(type, message){
    return JSON.stringify({ type: type, message: message });
}

function handleJoinMessage(data) {
    console.log(data);//Client joined

    if(data.startsWith("Y")){
        return;
    }

    addPlayer(data[0]);
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
    //console.log(`User moved: ${parsedData.message}`);
}

const linked_functions = {
    joinMessage: handleJoinMessage,
    chatMessage: handleChatMessage,
    moveMessage: handleMoveMessage,
    clientDisconnect: (data) => {
        console.log(`Client disconnected: ${data.message}`);
        const playerDiv = document.getElementById(`player-${data.id}`);
        if (playerDiv) {
            playerDiv.remove();
        } else {
            console.warn(`Player div not found for ID: ${data.id}`);
        }
    },
    updateClients: (data) => {
        for(const clients of data){
            if(clients !== window.userID){
                addPlayer(clients);
            }
        }
    },
    assignID: (data) => {
        console.log(`Assigned ID: ${data}`);
        window.userID = data;
        addPlayer(data);
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