const connectionText = document.querySelector(".connectionText");
const reconnectButton = document.querySelector(".reconnectButton");

function getUserAgent(){
    const userAgent = navigator.userAgent;
    if(userAgent.includes("Chrome") && !userAgent.includes("Chromium") && !userAgent.includes("Edg")) {
        // Exclude Chromium to avoid confusion with Chrome
        return "Chrome - The bog-standard browser!";
    }
    else if(userAgent.includes("Firefox")) {
        return "Firefox - The best browser!";
    }
    else if(userAgent.includes("Safari") && !userAgent.includes("Edg")) {
        return "Safari - The apple browser!";
    }
    else if(userAgent.includes("Edg")) {
        return "Edge - The suprisingly good browser!";
    }
    else if(userAgent.includes("Opera") || userAgent.includes("OPR")) {
        return "Opera - The worst browser!";
    }else{
        return "idk - The cool unknown browser";
    }
}

function successfulConnect(){
    connectionText.innerHTML = "Connected";
    connectionText.style.color = "green";
    document.body.style.cursor = "none";
    reconnectButton.style.visibility = "hidden";
}

function disconnected(){
    connectionText.innerHTML = "Disconnected";
    connectionText.style.color = "red";
    reconnectButton.style.visibility = "visible";
    reconnectButton.style.display = "absolute";
    document.body.style.cursor = "auto";
}

function addPlayer(playerID, x = 0, y = 0, colour = 'red') {
    const playerDiv = document.createElement('div');
    playerDiv.style.position = 'absolute';
    playerDiv.style.width = '40px';
    playerDiv.style.height = '40px';
    playerDiv.style.backgroundColor = colour;
    playerDiv.style.borderRadius = '4px';
    playerDiv.style.zIndex = '1000';
    playerDiv.id = `player-${playerID}`;
    document.body.appendChild(playerDiv);
    if(x !== 0 && y !== 0) {
        playerDiv.style.left = `${x}px`;
        playerDiv.style.top = `${y}px`;
    }
}

let localList = [];

fetch("public/lang.json")
    .then(res => res.json())
    .then(data => {
        localList = data.words;

        window.filter = new Filter({
            localList: localList,
            baseList: window.badwordsList
        });
    });