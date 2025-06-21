import { updateGameState } from '../../store/slice/gameSlice';
import { handleError } from '../handleError';


export class WebSocketCLient {
    constructor(url, dispatch, player_data,player) {
        this.websocket = new WebSocket(url);
        this.init();
        this.dispatch = dispatch;
        this.connectionClosed = false;
        this.player_data = player_data;
        this.player = player;
    }

    init() {
        this.websocket.onopen = () => {
            console.log("WebSocket connection established.");
            this.connectionClosed = false;
            this.emitMessage({type : "add_user", data : this.player_data})
        };

        this.websocket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if(message.type == "match-found") {
                this.dispatch(updateGameState({...message.data}))
            }

            if (message.type == "gameUpdate") {
                this.dispatch(updateGameState(message.data));
            }

            if (message.type == "error") {
                handleError(message.data);
            }

            if(message.type == "move-made") {
                this.player.notifyMoveMade(message.data);
            }

        };

        this.websocket.onclose = () => {
            console.log("WebSocket connection closed.");
            handleError("Connection to the server is terminated");
            this.connectionClosed = true;
        };

        this.websocket.onerror = (error) => {
            const message = JSON.parse(error.data);

            console.error("WebSocket error:", error);
            handleError(message.data);

        };
    }

    emitMessage({ type, data }) {
        try{

            if(this.connectionClosed){
                handleError("You are not connected to the server. Refresh the page!")
            }

            const message = JSON.stringify({ type, data });
            this.websocket.send(message);
        } catch(e){
            console.error("Error emiting message : ",e.message);
            handleError("Try refreshing the page : ",e.message);
        }
    }

}