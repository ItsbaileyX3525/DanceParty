const uWS = require('uWebSockets.js');
const fs = require('fs');
const path = require('path');

const clients = new Set(); //Broadcast to everyone regardless of room
const rooms = new Map(); //Map of rooms, each room has a set of clients
//Will configure rooms later

let nextID = 1; //Individual client ID, send single messages

function encodeMessage(type, message) {
	return JSON.stringify({ type: type, message: message });
}

uWS.App()
	.get('/', (res, req) => {
		const html = fs.readFileSync(path.join(__dirname, 'index.html'));
		res.writeHeader('Content-Type', 'text/html');
		res.end(html);
	})
.get('/public/*', (res, req) => {
	const urlPath = req.getUrl().replace('/public/', '');
	const filePath = path.join(__dirname, 'public', urlPath);

	// Check if file exists
	if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
		const ext = path.extname(filePath);
		const mimeTypes = {
			'.js': 'application/javascript',
			'.css': 'text/css',
			'.png': 'image/png',
			'.jpg': 'image/jpeg',
			'.jpeg': 'image/jpeg',
			'.svg': 'image/svg+xml',
			'.json': 'application/json'
		};

		res.writeHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
		res.end(fs.readFileSync(filePath));
	} else {
		res.writeStatus('404 Not Found').end('File not found');
	}
})

	.ws('/*', {
		open: (ws) => {
            ws.userData = {
                id: nextID++,
            };
            clients.add(ws);
		},
		message: (ws, message, isBinary) => {
            const id = ws.userData.id;
            const data = JSON.parse(Buffer.from(message).toString());
            if(data.type == "joinMessage"){
                for(const client of clients){
                    //Broadcast to all clients except the sender
                    if(client.userData.id !== id){
						client.send(encodeMessage("joinMessage", `${id}: ${data.message}`));
                    }else{
                        //Send a confirmation message to the sender
						client.send(encodeMessage("joinMessage", `You have joined the chat with ID: ${id}`));
						client.send(encodeMessage("assignID", id));
						client.send(encodeMessage("updateClients", Array.from(clients, c => c.userData.id)));
                    }
                }
            }
            if(data.type == "chatMessage"){
                if(data.message.length < 128){
                    for(const client of clients){
                        //Broadcast to all clients except the sender
                        client.send(encodeMessage("chatMessage", { message: data.message, id: id}));
                    }
                }
            }
			if (data.type == "moveMessage"){
				for(const client of clients){
					if(client.userData.id !== id){
						client.send(encodeMessage("moveMessage", { id: id, x: data.message.x, y: data.message.y }));
					}
				}
				return
			}
		},
		close: (ws) => {
            const id = ws.userData.id;
            clients.delete(ws);
			console.log('A client disconnected: ', id);
			for(const client of clients){
				if(client.userData.id !== id){
					client.send(encodeMessage("clientDisconnect", {message: `User ${id} has left the chat`, id: id}));
				}
			}
		}
	})

	.listen(80, (token) => {
		if (token) {
			console.log('Listening on http://localhost');
		} else {
			console.log('Failed to listen');
		}
	});
