var http = require('http'),
	url = require('url'),
	fs = require('fs');

var server = http.createServer(function (req, res) {

	var path = url.parse(req.url).pathname; 
	
    switch (path){
	case '/':
		fs.readFile(__dirname + '/chatclient.html', function(err, data) {
		if (err) return send404(res);
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(data, 'utf8');
		res.end();
	});
	break;
							   
	default: send404(res);
	}
}),

send404 = function(res){	
	res.writeHead(404);	
	res.write('404');	
	res.end();	
};

server.listen(8080, "127.0.0.1");
console.log('Server running at http://127.0.0.1:8080/');

var io = require('socket.io').listen(server), users = {}, rooms = {general: {}};

io.sockets.on('connection', function(socket) {

    console.log("Connection " + socket.id + " accepted.");

    socket.on('addUser', function (username) {
    	if (!users[username]) {
    		socket.username = username;
    		users[username] = socket.id; 
    		socket.join('general');
    		socket.room = 'general';
    		rooms.general[username] = username;
    		io.sockets.emit('addToList', users);
    	} else {
			socket.emit('invalidName');
    	}
    });

    socket.on('disconnect', function() {
        console.log("Connection " + socket.id + " terminated.");
        if (socket.username) {
        	io.sockets.emit('goodbye', socket.username);
        	delete users[socket.username];
        	delete rooms[socket.room][socket.username];
        	socket.leave(socket.room);
        	io.sockets.emit('addToList', users);
        }
    });

    socket.on('message', function(message) {
		console.log("Received message: " + message + " - from client " + socket.username);
		if (message[0] === '@') {
			var to = message.slice(1, message.indexOf(' '));
			if (typeof rooms[to] === 'object') {
				io.sockets.in(to).emit('chat', socket.username, message);
			} else {
				io.sockets.emit('privateMessage', socket.username, users[to], socket.id, message);
			}
		} else {
			io.sockets.emit('chat', socket.username, message);
		}
	});

});

