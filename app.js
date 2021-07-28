const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const gameLogic = require('./game-logic')
const app = express()

/**
 * Flujo de back-end:
 * - comprueba si el ID de juego codificado en la URL pertenece a una sesión de juego válida en curso.
 * - en caso afirmativo, unir al cliente a ese juego.
 * - de lo contrario, crear una nueva instancia de juego.
 * - La ruta '/' debe conducir a una nueva instancia de juego.
 * - La ruta '/game/:gameid' primero debe buscar una instancia de juego y luego unirse a ella. De lo contrario, inicie el error 404..
 */


const server = http.createServer(app)
const io = socketio(server)

// obtener el gameID codificado en la dirección URL.
// compruebe si ese gameID coincide con todos los juegos actualmente en sesión.
// unirse a la sesión de juego existente
// crear una nueva sesión.
// Ejecutar cuando el cliente se conecta

io.on('connection', client => {
    gameLogic.initializeGame(io, client)
})

// por lo general, aquí es donde tratamos de conectarnos a nuestra base de datos.
server.listen(process.env.PORT || 3000)