import { GameManager } from "./GameManager.js";
import { socket } from "./WebSocket.js";

class Main {

    constructor() {
        this.init();
        this.gameManager = new GameManager();
        this.playersConnectedToGame = [];
        this.gameState = {
            players_online: 0,
            players_in_queue: 0,
            players_playing: 0
        }
    }

    init() {
        socket.onConnect((ws) => {
            // this.gameManager.addUserToQueue(ws.id);
            // this.gameManager.pairUsers();
            console.log(`Client connected: ${ws.id}`);
            this.playersConnectedToGame.push(ws.id);
            this.notifyAll();

            ws.close = () => {
                console.log("Client disconnected : ", ws.id);
                this.gameManager.removeUserFromQueue(ws.id);
                this.gameManager.removePlayerSocketFromPlaying(ws.id);
                this.playersConnectedToGame = this.playersConnectedToGame.filter(playerId => playerId !== ws.id);
                this.notifyAll();
            }

            socket.onMessage(ws, (ws, message) => {
                // Handle incoming messages from clients
                // Here you can add logic to handle different types of messages

                if (message.type === 'reconnect') {
                    this.gameManager.reconnect(ws.id);
                    this.notifyAll();

                }

                if (message.type == "add_user") {
                    if(!message.data){
                        ws.send(JSON.stringify({
                            type: 'error',
                            data: 'Add user message.data can"t be null'
                        }))
                        return;
                    }
                    const playerData = this.gameManager.addUserData(message.data, ws.id);
                    ws.send(JSON.stringify({
                        type : "user_added",
                        data : playerData
                    }))

                    if(playerData.isPlaying){
                        this.gameManager.reconnectToGame(playerData);
                    }
                }

                if (message.type === 'joinQueue') {
                    if (this.gameManager.isPlayerPlaying(ws.id)) {
                        console.log("Player is playing te game : ", ws.id);
                        ws.send(JSON.stringify({
                            type: 'error',
                            data: 'You are already playing a game!'
                        }))
                        return;
                    }
                    if (!this.gameManager.checkIfUserInQueue(message.data)) {
                        console.log("User not found in the queue :", ws.id);
                        const { result, info } = this.gameManager.addUserToQueue(ws.id, message.data);
                        if (result == "error") {
                            ws.send(JSON.stringify({
                                type : "error",
                                data : info
                            }));
                            return;
                        };

                        this.gameManager.pairUsers();
                        this.notifyAll();
                    } else {

                        console.log("User already present in the queue :", ws.id);

                        ws.send(JSON.stringify({
                            type: 'error',
                            data: 'You are already in the queue!'
                        }))

                    }

                }

                if (message.type === 'leaveQueue') {
                    this.gameManager.removeUserFromQueue(ws.id);
                    this.notifyAll();


                }

                if (message.type === 'makeMove') {
                    this.gameManager.makeMove(ws.id, message.data);
                }

                if(message.type === "rematchReq"){
                    this.gameManager.rematch(ws.id, message.data);
                }
                
                if(message.type === "rematchAccept"){
                    this.gameManager.rematchAccept(ws.id, message.data);
                }

                if(message.type === "rematchReject"){
                    this.gameManager.rematchReject(ws.id, message.data);
                }

                if(message.type === "exitGame"){
                    this.gameManager.exitGame(ws.id, message.data);
                }

            });
        });

        socket.onDisconnect((ws) => {
            // Handle disconnection logic here
            this.gameManager.removeUserFromQueue(ws.id);
            this.gameManager.removePlayerSocketFromPlaying(ws.id);
            this.gameManager.reconnect(ws.id);
            console.log("Client disconnected");
            this.playersConnectedToGame = this.playersConnectedToGame.filter(playerId => playerId !== ws.id);
            this.notifyAll();
        });


    }


    notifyAll() {

        this.gameState.players_in_queue = this.gameManager.queue.length;
        this.gameState.players_playing = this.gameManager.playersplaying.length;
        this.gameState.players_online = this.playersConnectedToGame.length;
        console.log(JSON.stringify(this.gameState))
        // Notify all connected clients about the game state or any updates
        this.playersConnectedToGame.forEach(playerId => {
            const ws = socket.getSocketById(playerId);
            console.log(playerId)
            if (ws) {
                ws.send(JSON.stringify({
                    type: 'gameUpdate',
                    data: this.gameState
                }));
                console.log("Notified all about the current game status ", this.gameState);
            }
        });
    }

    static notifySocket(ws_id, data) {
        if (!ws_id) {
            throw new Error("Websocket id is required to send the info to the client");
        }
        const ws = socket.getSocketById(ws_id);
        if (ws) {
            ws.send(JSON.stringify({
                data
            }));
            console.log("Notified all about the current game status ", this.gameState);
        }
    }
}

const main = new Main();