import { updateGameState } from '../../store/slice/gameSlice';
import { handleError, handleInfo } from '../handleError';


export class WebSocketCLient {
    constructor(url, dispatch, player_data, player, onOpenCallback) {
        this.websocket = new WebSocket(url);
        this.dispatch = dispatch;
        this.connectionClosed = false;
        this.player_data = player_data;
        this.player = player;
        this.onOpenCallback = onOpenCallback;
        this.init();
    }
    

    init() {
        this.websocket.onopen = () => {
            console.log("WebSocket connection established.");
            this.connectionClosed = false;
            this.emitMessage({ type: "add_user", data: this.player_data });
        
            if (this.onOpenCallback) {
                this.onOpenCallback(); // Notify React that connection is ready
            }
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
            // 'rematchReq', data: { gameId, info: "Rematch requested from the opponent", rematchBy: rematchBy } 
            if(message.type == "rematchReq") {
                handleInfo(message.data.info + " : " + message.data.rematchBy);
                this.player.notifyRematchReq(message.data);
            }

            if(message.type == "exit_game") {
                handleInfo("Exiting the current game.");
                this.player.notifyExitGame(message.data);
            }

            if(message.type == "user_added_error"){
                this.dispatch(updateGameState({error : message.data}));
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