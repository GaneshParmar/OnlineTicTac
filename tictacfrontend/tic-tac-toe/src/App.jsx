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
import { Timer } from "./components/TicTacToe";

function App() {
  const dispatch = useDispatch();

  const gameState = useSelector((state) => state.game.gameState);

  const [countdown, setCountdown] = useState(60); // 60 seconds

  const [connectionTimedOut, setConnectionTimedOut] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("idle");
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

  // useEffect(() => {
  //   if (player) {
  //     try {
  //       if (!client.current) {
  //         client.current = new WebSocketCLient(
  //           "wss://onlinetictac-1.onrender.com",
  //           dispatch,
  //           player.getData(),
  //           player
  //         );

  //         player.client = client.current;
  //       }
  //       toast("Connected to the server");
  //     } catch (e) {
  //       console.error("Error while connecting to server : ", e.message);
  //     }
  //   }
  // }, [player]);
  useEffect(() => {
    let interval;
    let timeout;
  
    if (connectionStatus === "connecting") {
      setCountdown(60);
      setConnectionTimedOut(false);
  
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
  
      // Timeout after 60 seconds
      timeout = setTimeout(() => {
        setConnectionStatus("error");
        setConnectionTimedOut(true);
      }, 60000);
    }
  
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [connectionStatus]);
  
  

  useEffect(() => {
    if (player) {
      try {
        if (!client.current) {
          setConnectionStatus("connecting");

          client.current = new WebSocketCLient(
            "wss://onlinetictac-1.onrender.com",
            dispatch,
            player.getData(),
            player,
            () => {
              toast("Connected to the server");
              setConnectionStatus("connected");
            }
          );
          

          player.client = client.current;
        }
      } catch (e) {
        console.error("Error while connecting to server : ", e.message);
        setConnectionStatus("error");
      }
    }
  }, [player]);

  if (connectionStatus === "connecting") {
    return (
      <div className="App">
        <h2>Connecting to server...</h2>
        <p>This may take a few seconds as we are running on a free server (max wait time - 1 min).</p>
        <strong> <Timer /> Time left: {countdown}s</strong>
      </div>
    );
  }

  if (connectionStatus === "error") {
    return (
      <div className="App">
        <h2>Connection Failed</h2>
        {connectionTimedOut ? (
          <p>Server is taking too long to respond. Please try again later or reload.</p>
        ) : (
          <p>An unexpected error occurred while trying to connect.</p>
        )}
        <button onClick={() => {
          setConnectionStatus("idle");
          setPlayer(null);
          setUpPlayer();
        }}>Retry</button>
      </div>
    );
  }

  if (gameState?.game_status == "finding_opponent") {
    return <FindingOpponent player={player} gamedata={gameState} />;
  }

  if (gameState?.game_status == "match_found") {
    player.currentGameId = gameState.gameId;

    return <MatchFound animate={true} player={player} gameData={gameState} />;
  }

  if (gameState?.error) {
    if (player) {
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
      </div>
    </div>
  );
}

export default App;
