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

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){

    console.log("Connection " + socket.id + " accepted.");

    socket.on('disconnect', function(){
        console.log("Connection " + socket.id + " terminated.");
    });

    socket.on('message', function(message){
		console.log("Received message: " + message + " - from client " + socket.id);
		io.sockets.emit('chat', socket.id, message);
	});

});

