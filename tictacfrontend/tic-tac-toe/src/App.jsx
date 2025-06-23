import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import { WebSocketCLient } from "./utils/ClientSocket/Client";
import { useEffect, useRef, useState } from "react";
import { Player } from "./utils/PlayerFunctions/Player";
import toast, { toastConfig } from "react-simple-toasts";
import "react-simple-toasts/dist/style.css";
import "react-simple-toasts/dist/theme/dark.css";
import FindingOpponent from "./components/FindingOpponent";
import MatchFound from "./components/MatchFound";

function App() {
  const dispatch = useDispatch();

  const gameState = useSelector((state) => state.game.gameState);

  const [player, setPlayer] = useState(null);
  const client = useRef(null);

  const setUpPlayer = () => {
    const player_name = prompt("Enter yout name : ");
    if (!player_name) {
      alert("Please enter a valid name to play the game.");
      setUpPlayer();
      return;
    }
    // const symbol = prompt("Enter your symbol (X or O): ");
    // if (!symbol || (symbol !== "X" && symbol !== "O")) {
    //   alert("Please enter a valid symbol (X or O) to play the game.");
    //   setUpPlayer();
    //   return;
    // }
    // }
    const password = prompt("Enter your password: ");
    if (!password || password.trim() == "") {
      alert("Please enter a valid password.");
      setUpPlayer();
      return;
    }
    setPlayer(new Player(client.current, player_name, password));
  };

  useEffect(() => {
    toastConfig({
      theme: "dark",
    });

    if (!player && client) {
      setUpPlayer();
    }
  }, []);

  useEffect(() => {
    if (player) {
      try {
        if (!client.current) {
          client.current = new WebSocketCLient(
            "wss://onlinetictac-1.onrender.com",
            dispatch,
            player.getData(),
            player
          );

          player.client = client.current;
        }
        toast("Connected to the server");
      } catch (e) {
        console.error("Error while connecting to server : ", e.message);
      }
    }
  }, [player]);

  if (gameState?.game_status == "finding_opponent") {
    return <FindingOpponent player={player} gamedata={gameState} />;
  }

  if (gameState?.game_status == "match_found") {
    player.currentGameId = gameState.gameId;

    return <MatchFound animate={true} player={player} gameData={gameState} />;
  }

  if (gameState?.error) {
    if(player){
      setPlayer(null);
    }
    return (
      <>
        <p>{gameState.error}</p>
        <button onClick={setUpPlayer}>Retry</button>
      </>
    );
  }

  return (
    <div className="App">
      <h1>Tic Tac Toe Game</h1>
      <div className="game-info">
        <p>Players Online: {gameState.players_online}</p>
        <p>Players in Queue: {gameState.players_in_queue}</p>
        <p>Players Playing: {gameState.players_playing}</p>

        <button
          onClick={() => {
            player.PlayGame();
            toast("Searching for the opponent");
          }}
        >
          Play game
        </button>

        {JSON.stringify(gameState)}
      </div>
    </div>
  );
}

export default App;
