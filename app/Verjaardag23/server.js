var fs = require('fs');
var http = require('http');
var express = require('express');
var app = express();

app.get('/', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(fs.readFileSync('./index.html'));
});

app.use(express.static('public'));

var server = http.createServer(app);
server.listen(8080);