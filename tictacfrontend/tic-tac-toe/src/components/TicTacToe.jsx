import React, { useEffect, useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import timerVideo from "../assets/timer.mp4"; // Adjust the path as needed

function stringToBoard(pos) {
  // Split the string by commas to get an array
  const cells = pos.split(",");
  if (cells?.length < 9) {
    cells.unshift("-");
    cells.push("-");
  }

  if (cells?.length > 9) {
    cells.pop();
  }

  // Create a 3x3 board
  const board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];

  // Fill the board with values from the string
  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    board[row][col] = cells[i] || ""; // Use empty string if undefined
  }

  return board;
}

function WinnerDetail({ winnerSymbol, me, opponent }) {
  const RematchRequest = () => {
    try {
      me.reqRematch(opponent.name);
    } catch (e) {
      alert(e.message);
    }
  };

  const ExitGame = () => {
    try {
      me.exitCurrentGame();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-40 min-h-full overflow-y-auto overflow-x-hidden transition flex items-center">
      <div
        aria-hidden="true"
        className="fixed inset-0 w-full h-full bg-black/50 cursor-pointer"
      ></div>

      <div className="relative w-full cursor-pointer pointer-events-none transition my-auto p-4">
        <div className="w-full py-2 bg-white cursor-default pointer-events-auto dark:bg-gray-800 relative rounded-xl mx-auto max-w-sm">
          <div className="space-y-2 p-2">
            <div className="p-4 space-y-2 text-center dark:text-white">
              <h2
                className="text-xl font-bold tracking-tight"
                id="page-action.heading"
              >
                {winnerSymbol != "D"
                  ? !(winnerSymbol == opponent.symbol)
                    ? "Opponent won :("
                    : "You won :)"
                  : "Match Drawn"}
              </h2>

              <p className="text-gray-500">Do you want a rematch?</p>
            </div>
          </div>

          <div className="space-y-2">
            <div
              aria-hidden="true"
              className="border-t dark:border-gray-700 px-2"
            ></div>

            <div className="px-6 py-2">
              <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
                <button
                  onClick={ExitGame}
                  type="button"
                  className="inline-flex items-center justify-center py-1 gap-1 font-medium rounded-lg border transition-colors outline-none focus:ring-offset-2 focus:ring-2 focus:ring-inset dark:focus:ring-offset-0 min-h-[2.25rem] px-4 text-sm text-gray-800 bg-white border-gray-300 hover:bg-gray-50 focus:ring-primary-600 focus:text-primary-600 focus:bg-primary-50 focus:border-primary-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200 dark:focus:text-primary-400 dark:focus:border-primary-400 dark:focus:bg-gray-800"
                >
                  <span className="flex items-center gap-1">
                    <span className="">Exit Game</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={RematchRequest}
                  className="inline-flex items-center justify-center py-1 gap-1 font-medium rounded-lg border transition-colors outline-none focus:ring-offset-2 focus:ring-2 focus:ring-inset dark:focus:ring-offset-0 min-h-[2.25rem] px-4 text-sm text-white shadow focus:ring-white border-transparent bg-red-600 hover:bg-red-500 focus:bg-red-700 focus:ring-offset-red-700"
                >
                  <span className="flex items-center gap-1">
                    <span className="">Ask for rematch?</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Timer() {
  return (
    <video width="60" height="60" loop autoPlay muted>
      <source src={timerVideo} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

function TicTacToeBoard({ player, gameData }) {
  const [currentSymbol, setCurrentSymbol] = useState(gameData?.turn);
  const [winnerSymbol, setWinnerSymbol] = useState("");
  const [winnerCondition, setWinnerCondition] = useState("");
  // const [movesPlayed, setMovesPlayed] = useState(0);
  const [movesPlayed, setMovesPlayed] = useState(0);

  const [isMyTurn, setIsMyTurn] = useState(currentSymbol == gameData?.symbol);

  useEffect(() => {
    setIsMyTurn(currentSymbol == gameData?.symbol);
  }, [gameData, currentSymbol]);

  const [board, setBoard] = useState([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ]);

  const winningConditions = [
    ["00", "01", "02"], // Top row
    ["10", "11", "12"], // Middle row
    ["20", "21", "22"], // Bottom row
    ["00", "10", "20"], // Left column
    ["01", "11", "21"], // Middle column
    ["02", "12", "22"], // Right column
    ["00", "11", "22"], // Main diagonal
    ["02", "11", "20"], // Anti-diagonal
  ];

  const checkWinner = (updatedBoard) => {
    for (let condition of winningConditions) {
      const [a, b, c] = condition.map((pos) => [
        parseInt(pos[0]),
        parseInt(pos[1]),
      ]);

      const symbol = updatedBoard[a[0]][a[1]];
      if (
        symbol !== "" &&
        symbol === updatedBoard[b[0]][b[1]] &&
        symbol === updatedBoard[c[0]][c[1]]
      ) {
        setWinnerSymbol(symbol);
        setWinnerCondition(condition.join("-"));
        setMovesPlayed(0);

        return;
      }
    }

    if (movesPlayed >= 9) {
      setWinnerSymbol("D");
      setMovesPlayed(0);
    }
  };

  const makeMove = (row, col) => {
    if (board[row][col] !== "" || winnerSymbol !== "") return;

    const next_turn = currentSymbol === "O" ? "X" : "O";

    let newposition = "";
    const updatedBoard = board.map((r, i) =>
      r.map((val, j) => {
        newposition += (i === row && j === col ? currentSymbol : val) + ",";
        return i === row && j === col ? currentSymbol : val;
      })
    );

    // const newposition =
    //   updatedBoard[0]?.join(",") +
    //   updatedBoard[1]?.join(",") +
    //   updatedBoard[2]?.join(",");
    player.makeMove({ gameId: gameData?.gameId, newposition, turn: next_turn });
    setBoard(updatedBoard);
    setMovesPlayed((prev) => prev + 1);
    // checkWinner(updatedBoard);
    setCurrentSymbol(next_turn);
  };

  player.moveMade = ({ gameId, newposition, turn }) => {
    const updatedBoard = stringToBoard(newposition);
    setBoard(updatedBoard);
    setCurrentSymbol(turn);
    setMovesPlayed((prev) => prev + 1);
    // checkWinner(updatedBoard);
    if (newposition == "---------") {
      restartGame();
    }
  };


  useEffect(()=>{
    checkWinner(board);
  },[movesPlayed, board]);
  
  const restartGame = () => {
    setBoard([
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ]);
    setWinnerSymbol("");
    setWinnerCondition("");
    // setCurrentSymbol("O");
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-4">
      {winnerSymbol && (
        <WinnerDetail
          winnerSymbol={winnerSymbol}
          opponent={gameData?.opponent}
          me={player}
        />
      )}
      <h6 className="font-bold text-white">
        {!winnerSymbol &&
          (isMyTurn ? "Your turn" : "Waiting for opponent to play")}
      </h6>
      <div className="text-white flex items-center gap-2 text-right w-full">
        <FaUserAlt size={24} /> {gameData?.opponent?.name}
        {!isMyTurn && <Timer />}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => makeMove(r, c)}
              disabled={cell !== "" || winnerSymbol !== "" || !isMyTurn}
              className="w-24 h-24 text-4xl font-bold rounded bg-green-400 text-black shadow-md hover:bg-gray-200 transition"
            >
              {cell}
            </button>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 text-green-400 text-right w-full">
        <FaUserAlt size={24} /> {player?.name} (Me)
        {isMyTurn && <Timer />}
      </div>

      {/* <button
        onClick={restartGame}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Restart
      </button> */}
    </div>
  );
}

function TicTacToe({ player, gameData }) {
  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center">
      <TicTacToeBoard player={player} gameData={gameData} />
    </div>
  );
}

export default TicTacToe;
