import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaUserAlt, FaSearch } from "react-icons/fa";

const pulseVariant = {
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      repeat: Infinity,
      duration: 1,
    },
  },
};

const FindingOpponent = ({
  player,
  gamedata = { opponent: { name: "" } },
}) => {
  const [opponent, setOpponent] = useState(null);

  useEffect(()=>{
    setOpponent(gamedata?.opponent);
  },[gamedata]);
  
  useEffect(() => {
    if (opponent?.name && opponent?.name != "") {
      setTimeout(() => {
        player.matchFound();
      }, 5000);
    }
  }, [opponent, player]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white p-4">

      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-4xl">
        <div className="text-center text-2xl font-bold mb-6">
          {opponent?.name ? "Match Found" : "Finding Opponent..."}
        </div>

        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Left - You */}
          <div className="flex flex-col items-center">
            <motion.div
              variants={pulseVariant}
              animate="animate"
              className="bg-blue-500 rounded-full p-4"
            >
              <FaUserAlt size={48} />
            </motion.div>
            <p className="mt-2 text-lg font-semibold">
              Me {opponent?.name ? "Playing with " + (gamedata?.symbol || "") : ""}
            </p>
          </div>

          {/* Middle - VS */}
          <div className="flex flex-col items-center justify-center">
            <motion.h2
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="text-4xl font-bold"
            >
              VS
            </motion.h2>
            {!opponent?.name && (
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="mt-4 text-yellow-400"
              >
                <FaSearch size={28} />
              </motion.div>
            )}
          </div>

          {/* Right - Opponent */}
          <div className="flex flex-col items-center">
            <motion.div
              variants={pulseVariant}
              animate="animate"
              className="bg-gray-600 rounded-full p-4"
            >
              <FaUserAlt size={48} />
            </motion.div>
            <p className="mt-2 text-lg font-semibold text-gray-400">
              {opponent?.name || "Searching..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindingOpponent;
