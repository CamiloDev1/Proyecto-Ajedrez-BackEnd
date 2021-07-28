

/**
 * Aquí es donde debemos registrar los detectores de eventos y emisores.
 */

var io
var gameSocket
// gamesInSession almacena una matriz de todas las conexiones de socket activas
var gamesInSession = []


const initializeGame = (sio, socket) => {
    /**
     * initializeGame configura todos los detectores de eventos de socket.
     */

    // inicializar variables globales.
    io = sio 
    gameSocket = socket 

    // inserta este socket en una matriz que almacena todos los sockets activos.
    gamesInSession.push(gameSocket)

    // Ejecute código cuando el cliente se desconecte de su sesión de socket.
    gameSocket.on("disconnect", onDisconnect)

    // Envía un nuevo movimiento a la otra sesión de socket en la misma sala.
    gameSocket.on("new move", newMove)

    // El usuario crea una nueva sala de juegos después de hacer clic en 'enviar' en el frontend
    gameSocket.on("createNewGame", createNewGame)

    // El usuario se une a gameRoom después de ir a una URL con '/game/:gameId'
    gameSocket.on("playerJoinGame", playerJoinsGame)

    gameSocket.on('request username', requestUserName)

    gameSocket.on('recieved userName', recievedUserName)


}
function playerJoinsGame(idData) {
    /**
     * Une el socket dado a una sesión con su gameId
     */

    // Una referencia al objeto socket Socket.IO del jugador
    var sock = this
    
    // Busque el identificador de sala en el objeto de administrador de Socket.IO.npm
    var room = io.sockets.adapter.rooms[idData.gameId]
   // consola.log(sala)

    // Si la habitación existe...
    if (room === undefined) {
        this.emit('status' , "This game session does not exist." );
        return
    }
    if (room.length < 2) {
        // adjunte el identificador de socket al objeto de datos.
        idData.mySocketId = sock.id;

        // Únete a la sala
        sock.join(idData.gameId);

        console.log(room.length)

        if (room.length === 2) {
            io.sockets.in(idData.gameId).emit('start game', idData.userName)
        }

        // Emita un evento notificando a los clientes que el jugador se ha unido a la sala.
        io.sockets.in(idData.gameId).emit('playerJoinedRoom', idData);

    } else {
        // De lo contrario, envíe un mensaje de error al reproductor.
        this.emit('status' , "There are already 2 people playing in this room." );
    }
}


function createNewGame(gameId) {
    // Devolver el identificador de sala (gameId) y el identificador de socket (mySocketId) al cliente del explorador
    this.emit('createNewGame', {gameId: gameId, mySocketId: this.id});

    // Únete a la habitación y espera al otro jugador
    this.join(gameId)
}


function newMove(move) {
    /**
     * En primer lugar, tenemos que obtener el identificador de la sala en la que enviar este mensaje.
     * A continuación, enviamos este mensaje a todos excepto al remitente
     * En la sala.
     */
    
    const gameId = move.gameId 
    
    io.to(gameId).emit('opponent move', move);
}

function onDisconnect() {
    var i = gamesInSession.indexOf(gameSocket);
    gamesInSession.splice(i, 1);
}


function requestUserName(gameId) {
    io.to(gameId).emit('give userName', this.id);
}

function recievedUserName(data) {
    data.socketId = this.id
    io.to(data.gameId).emit('get Opponent UserName', data);
}

exports.initializeGame = initializeGame