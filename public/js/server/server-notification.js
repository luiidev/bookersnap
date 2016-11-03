var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var jwtDecode = require('jwt-decode');

var fs = require('fs');

app.listen(1337, "127.0.0.1");

function handler(req, res) {

  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  res.end('Hello World');

}

io.on('connection', function(socket) {

  console.log("usuario conectado");

  //Creamos un canal para las notificaciones, segun micrositio y modulo
  socket.on('create-room-micrositio', function(data) {
    console.log("create room micrositio " + JSON.stringify(data));
    //console.log("rooms " + JSON.stringify(socket.rooms));
    //console.log(jwtDecode(data));
    socket.join(data);
  });

  //Cuando se envian notas desde Floor
  socket.on('b-mesas-floor-notes', function(data) {
    io.to(data.room).emit('b-mesas-floor-notes', data);
  });

  //Cuando se actualiza una reserva desde Floor
  socket.on('b-mesas-floor-upd-res', function(data) {
    console.log("b-mesas-floor-upd-res " + JSON.stringify(data));
    io.to(data.room).emit('b-mesas-floor-upd-res', data);
  });

  //Cuando se actualiza la configuracion (turnos,zonas,tags,etc)
  socket.on('b-mesas-config-update', function(data) {
    console.log("b-mesas-config-update " + JSON.stringify(data));
    io.to(data.room).emit('b-mesas-config-update', data);
  });

  socket.on('delete-room-micrositio', function(data) {
    console.log("delete room micrositio  " + JSON.stringify(data));
    //socket.leave(id);
  });


});