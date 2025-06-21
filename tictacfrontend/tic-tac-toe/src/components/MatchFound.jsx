import React from "react";
import { motion } from "framer-motion";
import TicTacToe from "./TicTacToe";

export default function MatchFound({ animate, player, gameData }) {

  return (
    <>
      <div className="header fixed top-0 ">
        Players online : {gameData?.players_online}
    </div>
      <div className="flex items-center justify-center h-screen text-white">
        {animate && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="text-4xl font-bold text-green-400 w-screen"
          >
            <TicTacToe gameData={gameData}  player={player}/>

          </motion.div>
        )}
      </div>
    </>
  );
}
