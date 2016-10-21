var app = require('http').createServer(handler);
var io = require('socket.io')(app);
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
  socket.emit('news', {
    hello: 'world'
  });
  socket.on('my other event', function(data) {
    console.log(data);
  });
});