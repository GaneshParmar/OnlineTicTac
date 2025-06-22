import { updateGameState } from "../../store/slice/gameSlice";
import { handleError, askToast } from "../handleError";

export class Player {
    constructor(client, name, password, moveMade = () => { }, gameId = null) {
        this.client = client;
        this.name = name; // Player's name
        this.password = password
        this.symbol = "symbol"; // Player's symbol (X or O)
        this.moveMade = moveMade;
        this.currentGameId = gameId;

    }

    getData() {
        return {
            name: this.name,
            symbol: this.symbol,
            password : this.password
        }
    }

    PlayGame() {
        try {
            this.client.emitMessage({
                type: "joinQueue",
                data: {
                    name: this.name,
                    symbol: this.symbol
                }
            });

            this.client.dispatch(updateGameState({ game_status: "finding_opponent" }));

        } catch (e) {
            handleError(e);
        }
    }

    matchFound() {
        this.client.dispatch(updateGameState({ game_status: "match_found" }));

    }

    // move data should have { gameId, newposition, turn }
    makeMove(move_data) {
        this.client.emitMessage({
            type: "makeMove",
            data: move_data
        })
    }

    // opponent move should have
    notifyMoveMade(opponent_move) {
        this.moveMade(opponent_move);
    }

    // request for rematch

    reqRematch(rematchTo) {
        alert(this.currentGameId);
        this.client.emitMessage({
            type: "rematchReq",
            data: {
                gameId: this.currentGameId,
                rematchTo,
                rematchBy: this.name
            }
        });

    }


    // exit the current game

    exitCurrentGame() {
        this.client.emitMessage({
            type: "exitGame",
            data: {
                gameId: this.currentGameId
            }
        });
    }


    acceptRematchReq() {
        this.client.emitMessage({
            type: "rematchAccept",
            data: {
                gameId: this.currentGameId
            }
        });
    }

    rejectRematchReq() {
        this.client.emitMessage({
            type: "rematchReject",
            data: {
                gameId: this.currentGameId
            }
        });
    }

    notifyRematchReq(rematchReqData) {
        // this.client.dispatch(updateGameState({
        //     rematchRequests : [rematchReqData]
        // }));

        const { rematchBy } = rematchReqData;
        askToast("accept the rematch from " + rematchBy, this.acceptRematchReq.bind(this), this.rejectRematchReq.bind(this));
    }

    notifyExitGame(){
        this.client.dispatch(updateGameState({ game_status: "no_match" }));
    }
}