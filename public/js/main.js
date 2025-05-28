document.addEventListener('mousemove', (event) => {
    if (!window.userID) {
        return; //Sliently fail if userID is not set
    }
    const playerDiv = document.getElementById('player-' + window.userID);
    const x = event.clientX - 20;
    const y = event.clientY - 20;
    if (playerDiv) {
        playerDiv.style.left = `${x}px`;
        playerDiv.style.top = `${y}px`;
    }
    socket.send(encodeMessage("moveMessage", { x: x, y: y}));
})