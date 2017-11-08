
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);

let rooms = [];
let hbeat = [];
let count = [];
let colors = ['black', 'red', 'green', 'blue', 'orange', 'yellow'];

app.get('/:id', function (req, res) {
  res.sendFile(__dirname + '/index.html');
  // console.log(req.params.id);
});

io.on('connection', function (socket) {
	socket.emit('bind');
	socket.on('pair', function (data) {
		rooms[data.host] ? null : rooms[data.host] = [];
        count[data.host] ? count[data.host]=count[data.host]+1 : count[data.host] = 1;
        let int = rooms[data.host];
        int[data.id] = {con: true, pos: { x: null, u: null}, color: colors[count[data.host]-1] };
		// console.log(rooms);
		socket.emit('paired', count[data.host]-1)
	});
	socket.on('heartbeat', function(data) {
        // console.log('heartbeat called!');
        hbeat[socket.id] = Date.now();
        setTimeout(function() {
            var now = Date.now();
            if (now - hbeat[socket.id] > 5000) {
                // console.log('this socket id will be closed ' + socket.id);
                // console.log('Room: ', data.room,' id: ',data.id);
                try {
                    let buf = rooms[data.room];
                    delete buf[data.id];
                    count[data.room] = count[data.room]-1;
                    socket.broadcast.emit('removeclient', data.id); // TODO: Isso não deve ser um broadcast, e sim mandar apenas para a sala correta.
                    // console.log(rooms);
                } catch (error) {
                    console.log(error)
                }
            }
            now = null;
        }, 6000);
    });
    socket.on('pospool', function(data) {
        if (rooms && rooms[data.room] && rooms[data.room][data.id]) {
            rooms[data.room][data.id].pos = data.pos;
            let send = {};
            for (thing in rooms[data.room]) {

                send[thing] = { x: rooms[data.room][thing].pos.x, y: rooms[data.room][thing].pos.y, color: rooms[data.room][thing].color }
            }
            socket.emit('reposit', {room: send});
        }
    })

});
