import { socket } from "./WebSocket.js";

export class GameManager {
    constructor() {
        this.playersplaying = [];
        this.queue = [];
        this.socketInQueue = [];
        this.socketInPlaying = [];
        this.games = {};
        this.users = {

        };
    }

    addUserData(player, ws_id) {

        // these are the usernames already present in game.
        const users_names = Object.keys(this.users);

        console.log("Player just logged in to the game");
        console.log(player);
        if (users_names.includes(player.name)) {
            this.users[player.name] = {
                sockets: [...this.users[player.name].sockets, ws_id],
                data: (this.users[player.name].isPlaying || this.users[player.name].isInQueue) ?
                    player
                    : this.users[player.name].data,
                isPlaying: this.users[player.name].isPlaying,
                isInQueue: this.users[player.name].isInQueue,
                playingAgainst: this.users[player.name].playingAgainst,
                games: this.users[player.name].games,
            }

            if (this.users[player.name].isInQueue) {
                this.socketInQueue.push(ws_id);
            }

            if (this.users[player.name].isPlaying) {
                this.socketInPlaying.push(ws_id);
            }

            return {
                isPlaying: this.users[player.name].isPlaying,
                isInQueue: this.users[player.name].isInQueue,
                playingAgainst: this.users[player.name].playingAgainst,
                games: this.users[player.name].games
            };
        };

        this.users[player.name] = {
            sockets: [ws_id],
            data:
                player
            ,
            games: [],
            isPlaying: false,
            isInQueue: false,
            playingAgainst: null
        };

        return {
            isPlaying: false,
            isInQueue: false,
            playingAgainst: null
        };

    }

    reconnectToGame(playerData) {

    }

    addUserToQueue(ws_id, player) {
        if (!player?.name) {
            return {
                result: "error",
                info: "To join the room the player need to have a valid name"
            }
        }

        console.log("User want to join room");
        console.log(player.name)
        console.log(this.users);
        if (!this.users[player?.name]) {
            return {
                result: "error",
                info: "You are not connected to the game. Please refresh the page!"
            }
        }

        this.users[player?.name].isInQueue = true;
        this.queue.push(this.users[player?.name]);
        this.socketInQueue.push(ws_id);
        console.log("User added to queue: ", ws_id);

        return {
            result: "Success",
            info: "User added to the queue"
        };
    }

    removeUserSocketFromQueue(ws_id, player_name = '') {
        const index = this.socketInQueue.indexOf(ws_id);
        if (index > -1) {
            this.socketInQueue.splice(index, 1);
        }
    }

    // this funciton removes all the user sockets from queue
    removePlayerSocketsFromQueue(sockets) {
        sockets.forEach((ws_id) => {
            removeUserSocketFromQueue(ws_id);
        });

        // this is return function to undo
        return () => {
            this.socketInQueue.push(...sockets);
        };
    };


    checkIfUserInQueue(ws_id) {
        return this.socketInQueue.includes(ws_id);
    }

    isPlayerPlaying(ws_id) {
        return this.socketInPlaying.includes(ws_id);
    }

    removePlayerSocketFromPlaying(ws_id) {
        const index = this.playersplaying.indexOf(ws_id);
        if (index > -1) {
            this.playersplaying.splice(index, 1);
        };

    }

    // removePlayerSocket(player, ws_id) {
    //     const index = player.sockets.indexOf(ws_id);
    //     if (index > -1) {
    //         player.sockets.splice(index, 1);
    //     };

    //     this.users[player.name] = player;

    //     this.removeUserFromQueue(ws_id);
    //     this.removePlayerSocketFromPlaying(ws_id)
    // }

    pairUsers() {
        let player_1, player_2;
        let addSocketToQueueIfFail = null;
        try {

            if (this.queue.length > 1) {
                console.log("Queue before pairing: ", this.queue);

                player_1 = this.queue.shift();
                player_2 = this.queue.shift();

                console.log("Pairing users: ", player_1?.data, player_2?.data);

                player_1.isPlaying = true;
                player_1.playingAgainst = player_2.data;
                player_2.isPlaying = true;
                player_2.playingAgainst = player_1.data;

                // create unique game id
                const gameId = "game_" + Date.now();

                this.games[gameId] = {
                    player_1: player_1,
                    player_2: player_2,
                    game_state: "waiting",
                }

                // crete room
                this.createRoom(gameId, player_1, player_2);

                addSocketToQueueIfFail = removePlayerSocketsFromQueue([...player_1?.sockets, ...player_2?.sockets]);
                // [...player_1?.sockets, ...player_2?.sockets].forEach((ws_id) => {
                //     // this.removePlayerSocketFromPlaying(ws_id);
                // })

                this.playersplaying.push(player_1, player_2);
                this.socketInPlaying.push(...(player_1?.sockets || []), ...(player_2.sockets || []));

                this.users[player_1?.data?.name].isPlaying = true;
                this.users[player_2?.data?.name].isPlaying = true;

                this.users[player_1?.data?.name].games.push(gameId);
                this.users[player_2?.data?.name].games.push(gameId);


            };
        } catch (error) {
            console.log("Error occoured while pairing users : ", error.message);
            // console.log("Player 1 is : ", player_1)
            // console.log("Player 2 is : ", player_2)

            [...(player_1?.sockets || []), ...(player_2?.sockets || [])].forEach((ws_id) => {
                socket.getSocketById(ws_id).send(JSON.stringify({
                    type: 'error',
                    data: `Error occurred while pairing users: ${error.message}`
                }));
            })


            this.queue.push(player_1);
            this.queue.push(player_2);

            if (addSocketToQueueIfFail) {
                addSocketToQueueIfFail();
            }

        }
    }


    reconnect(ws_id) {
        // This function should handle reconnections of players.
        // It should check if the player was in a game and rejoin them.
        const io = socket.socket;

        if (this.isPlayerPlaying(ws_id)) {
            // Find the game the player was in
            for (const gameId in this.games) {
                const game = this.games[gameId];
                if (game.player_1 === ws_id || game.player_2 === ws_id) {
                    // Rejoin the player to the game room
                    io.sockets.socket(ws_id).join(gameId);
                    io.to(gameId).emit('reconnected', { gameId, ws_id });
                    return;
                }
            }
        }

        // If not found, add to queue
        this.addUserToQueue(ws_id);
    }

    createRoom(gameId, player_1, player_2) {
        // This function should create a room for the game
        // and notify the players about their game start.
        console.log(`Room created for game ${gameId} with players ${player_1} and ${player_2}`);

        // Here you would typically emit an event to the players
        // to notify them about the game start, e.g. using WebSocket.
        const io = socket.socket;

        // io.sockets.socket(player_1).join(gameId);
        // io.sockets.socket(player_2).join(gameId);

        // Notify players
        // io.to(gameId).emit('match-found', {
        //     gameId,
        //     symbol: io.id === player_1 ? "X" : "O",
        //     opponent: io.id === player_1 ? player_2 : player_1
        // });

        this.games[gameId].game_state = "in_progress";
        this.games[gameId].players = {
            player1: {
                name: player_1?.data?.name,
                symbol: "X"
            },
            player2: {
                name: player_2?.data?.name,
                symbol: "O"
            }
        }
        this.games[gameId].turn = "O";

        player_1?.sockets.forEach(ws => {
            try {
                const Player1 = socket.getSocketById(ws);
                Player1.send(JSON.stringify({
                    type: 'match-found',
                    data: {
                        gameId,
                        symbol: "X",
                        opponent: { ...player_2?.data, symbol: "X" },
                        turn: "O"
                    }
                }))


            } catch (e) {
                // means the socket is not valid

            }
        });

        player_2?.sockets?.forEach(ws => {
            const Player2 = socket.getSocketById(ws);
            Player2.send(JSON.stringify({
                type: 'match-found',
                data: {
                    gameId,
                    symbol: "O",
                    opponent: { ...player_1?.data, symbol: "O" },
                    turn: "O"
                }
            }));
        })
    }

    notifySocketsOfPlayers(player_name, message) {

        const player = this.users[player_name];

        if (!player) {
            throw new Error("Player to be notified not found! : ", player_name);
        }

        player?.sockets?.forEach(ws => {
            try {
                const Player = socket.getSocketById(ws);
                Player.send(JSON.stringify(message));
            } catch (e) {
                console.log("socket not found!");
            }
        })
    }

    makeMove(ws_id, { gameId, newposition, turn }) {
        const io = socket.socket;
        // io.to(gameId).emit('move-made', {
        //     gameId,
        //     board
        // });

        if (!this.games[gameId]) {
            console.error(`Game with ID ${gameId} does not exist.`);
            io.to(ws_id).emit('error', {
                message: `Game with ID ${gameId} does not exist.`
            })
            return;
        }

        const game = this.games[gameId];
        if (!game.positon || game.position == '') {
            game.position = '---------';
        }

        game.turn = turn;

        game.position = newposition;

        console.log("Game id : ", gameId);
        console.log("Next turn : ", turn);
        console.log("New position : ", newposition);
        // io.to(gameId).emit('move-made', {
        //     gameId,
        //     newposition
        // });

        const player_to_notify = game.players.player1.symbol == turn ? game.players.player1 : game.players.player2;

        this.notifySocketsOfPlayers(player_to_notify.name, { type: 'move-made', data: { gameId, newposition, turn } });
    }

    rematch(ws_id, { gameId, rematchTo, rematchBy }) {

        if (this.games[gameId].game_state == "finished") {
            console.error(`Game with ID ${gameId} does not exist.`);
            io.to(ws_id).emit('error', {
                message: `Game with ID ${gameId} is already finished. Start new game!`
            })
            return;
        }

        const io = socket.socket;
        // io.to(gameId).emit('move-made', {
        //     gameId,
        //     board
        // });

        if (!this.games[gameId]) {
            console.error(`Game with ID ${gameId} does not exist.`);
            io.to(ws_id).emit('error', {
                message: `Game with ID ${gameId} does not exist.Start new game!`
            })
            return;
        }

        const game = this.games[gameId];
        if (!game.positon || game.position == '') {
            game.position = '---------';
        }

        const player_to_notify = game.players.player1.name == rematchTo ? game.players.player1 : game.players.player2;

        this.notifySocketsOfPlayers(player_to_notify.name, { type: 'rematchReq', data: { gameId, info: "Rematch requested from the opponent", rematchBy: rematchBy } });

    }

    rematchAccept(ws_id, { gameId }) {

        if (this.games[gameId].game_state == "finished") {
            console.error(`Game with ID ${gameId} does not exist.`);
            io.to(ws_id).emit('error', {
                message: `Game with ID ${gameId} is already finished. Start new game!`
            })
            return;
        }

        const io = socket.socket;
        // io.to(gameId).emit('move-made', {
        //     gameId,
        //     board
        // });

        if (!this.games[gameId]) {
            console.error(`Game with ID ${gameId} does not exist.`);
            io.to(ws_id).emit('error', {
                message: `Game with ID ${gameId} does not exist.`
            })
            return;
        }

        const game = this.games[gameId];

        game.turn = "X";

        game.position = '---------';

        const Player_1 = game.players.player1;

        this.notifySocketsOfPlayers(Player_1.name, { type: 'move-made', data: { gameId, newposition: game.position, turn: "X" } });

        const Player_2 = game.players.player2;
        this.notifySocketsOfPlayers(Player_2.name, { type: 'move-made', data: { gameId, newposition: game.position, turn: "X" } });

    }


    rematchReject(ws_id, { gameId, rejectTo }) {
        if (!this.games[gameId]) {
            console.error(`Game with ID ${gameId} does not exist.`);
            io.to(ws_id).emit('error', {
                message: `Game with ID ${gameId} does not exist.`
            })
            return;
        }

        if (this.games[gameId].game_state == "finished") {
            console.error(`Game with ID ${gameId} does not exist.`);
            io.to(ws_id).emit('error', {
                message: `Game with ID ${gameId} is already finished.`
            })
            return;
        }

        const game = this.games[gameId];
        this.games[gameId].game_state = "finished";
        const Player_2 = game.players.player2.name == rejectTo ? game.players.player2 : game.players.player1;
        this.notifySocketsOfPlayers(Player_2.name, { type: 'exit-game', data: { gameId } });

    }

    exitGame(ws_id, { gameId }) {
        if (!this.games[gameId]) {
            console.error(`Game with ID ${gameId} does not exist.`);
            io.to(ws_id).emit('error', {
                message: `Game with ID ${gameId} does not exist.`
            })
            return;
        }

        if (this.games[gameId].game_state == "finished") {
            console.error(`Game with ID ${gameId} does not exist.`);
            io.to(ws_id).emit('error', {
                message: `Game with ID ${gameId} is already finished.`
            })
            return;
        }

        this.games[gameId].game_state == "finished";

        const Player_1 = game.players.player1;

        this.notifySocketsOfPlayers(Player_1.name, { type: 'exit_game', data: { gameId } });

        const Player_2 = game.players.player2;
        this.notifySocketsOfPlayers(Player_2.name, { type: 'exit_game', data: { gameId } });

        this.users[Player_1.name] = {
            ...this.users[Player_1.name],
            isPlaying: false,
            isInQueue: false,
            playingAgainst: null
        };

        this.users[Player_2.name] = {
            ...this.users[Player_2.name],
            isPlaying: false,
            isInQueue: false,
            playingAgainst: null
        };


    }
}