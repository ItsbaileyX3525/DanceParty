const socket = new WebSocket("ws://"+window.location.host);

//Simple setup
socket.onopen = () => socket.send(encodeMessage("joinMessage", { colour: localStorage.getItem("colour")||"red", message: `Hi, I've connected from ${getUserAgent()}`}));
socket.onmessage = (event) => {handleMessage(event);successfulConnect();}
socket.onclose = () => {console.log("Connection closed");disconnected()};
socket.onerror = (error) => {console.error("WebSocket error:", error);disconnected()};