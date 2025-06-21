import { WebSocketServer } from 'ws';

class Socket {
    constructor(parameters) {
        this.socket = new WebSocketServer({ 
            port: 8081 
          });
    }

    onConnect(callback){
        this.socket.on('connection', (ws)=>{
            ws.id = Math.random().toString(36).substring(2, 15); // Assign a unique ID to each WebSocket connection
            callback(ws);
        })
    }

    onDisconnect(callback){
        this.socket.on('close', (ws)=>{
            console.log("Client disconnected : ",ws.id)
            callback(ws);
        })
    }

    onMessage(ws,callback){
        ws.on('message', (message)=>{
            console.log(`Received message from ${ws.id}: ${message}`);
            callback(ws, JSON.parse(message));
        })
    }

    getSocketById(id) {
        // This function should return the WebSocket instance by its ID
        for (const client of this.socket.clients) {
            if (client.id === id) {
                return client;
            }
        }
        return null;
    }
}

export const socket = new Socket();