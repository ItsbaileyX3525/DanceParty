const messagesDiv = document.getElementById('messages');
const chatInput = document.getElementById('chatInput');
const chatContainer = document.getElementById('chatContainer');
const chatToggleBtn = document.getElementById('chatToggleBtn');

function appendMessage(username, text) {
    const msg = document.createElement('div');
    msg.className = 'message-bubble';
    msg.textContent = username +": " +text;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

chatToggleBtn.addEventListener('click', () => {
    chatContainer.classList.toggle('collapsed');
    if (chatContainer.classList.contains('collapsed')) {
        chatToggleBtn.textContent = 'Show Chat';
        localStorage.setItem('chatCollapsed', 'true');
    } else {
        chatToggleBtn.textContent = 'Hide Chat';
        localStorage.setItem('chatCollapsed', 'false');
    }
});

const isCollapsed = localStorage.getItem('chatCollapsed') || "true";
console.log(isCollapsed);
if (isCollapsed === 'true') {
    chatContainer.classList.add('collapsed');
    chatToggleBtn.textContent = 'Show Chat';
} else {
    chatContainer.classList.remove('collapsed');
    chatToggleBtn.textContent = 'Hide Chat';
}

function appendMessage(username, text) {
    const msg = document.createElement('div');
    msg.className = 'message-bubble';
    msg.textContent = username +": " +text;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

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
        socket.send(encodeMessage("chatMessage", chatInput.value));
        chatInput.value = '';
    }
});