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