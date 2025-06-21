import { updateGameState } from "../../store/slice/gameSlice";
import { handleError } from "../handleError";

export class Player {
    constructor(client, name, symbol, moveMade = ()=>{}) {
        this.client = client;
        this.name = name; // Player's name
        this.symbol = symbol; // Player's symbol (X or O)
        this.moveMade = moveMade
    }

    getData(){
        return {
            name : this.name,
            symbol : this.symbol
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

            this.client.dispatch(updateGameState({game_status : "finding_opponent"}));
            
        } catch (e) {
            handleError(e);
        }
    }

    matchFound() {
        this.client.dispatch(updateGameState({game_status : "match_found"}));

    }

    // move data should have { gameId, newposition, turn }
    makeMove(move_data){
        this.client.emitMessage({
            type : "makeMove",
             data : move_data
        })
    }

    // opponent move should have
    notifyMoveMade(opponent_move){
        this.moveMade(opponent_move);
    }
}