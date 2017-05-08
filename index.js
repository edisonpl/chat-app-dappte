// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

var numUsers = 0;
var nombres = new Array();
var fecha = new Array();


io.on('connection', function (socket) {
  var addedUser = false;
  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
  var hora = new Date();
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data,
      time: hora
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username,fecha) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;

    nombres.push(socket.username);
    fecha.push(fecha);

    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers,
      nombres: nombres
    });

    socket.emit('get', {
      numUsers: numUsers,
      nombres: nombres
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers,
      nombres: nombres
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;
      var index = nombres.indexOf(socket.username);
      nombres.splice(index, 1);
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers,
        nombres: nombres
      });
    }
  });
});
