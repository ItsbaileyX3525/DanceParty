//const chatInput = document.getElementById('chatInput');
//const confirmChatButton = document.getElementById('confirmChatButton');

/*confirmChatButton.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if(message.length > 128) { //Simple length check, stops casual users from bypassing, saving a bit of resources. Still verifys on the server though.
        console.log('Message is too long. Please limit to 128 characters.');
        return;
    }
    if (message) {
        //Send the message to the server or handle it as needed
        socket.send(encodeMessage("chatMessage", message));
        chatInput.value = ''; //Clear the input field after sending
    } else {
        console.log('Please enter a message before sending.');
    }
});*/