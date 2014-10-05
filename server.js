var Firebase = require("firebase");
var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fb = new Firebase("https://boiling-inferno-5821.firebaseio.com/Pawndr");
var dataBuffer = '';
var stats = [];

app.get('/reset', function(req, res){
    res.sendfile('reset.html');
});

app.get('/report', function(req, res){
    res.sendfile('report.html');
});

app.use('/', express.static(__dirname + '/'));

app.use('/media', express.static(__dirname + '/media'));

io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('Right', function(data) {
      console.log('RIGHT!!');
      fb.child(data.index).transaction(function(currVal) {
        return currVal + 1;
      });
      console.log(fb.child(data.index));
    });

    socket.on('Left', function(data) {
      console.log('Left!!');
      fb.child(data.index).transaction(function(currVal) {
        return currVal - 1;
      });
      console.log(fb.child(data.index));
    });
});

var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort("/dev/ttyACM0", {
    baudrate: 9600
});

var checkAction = function(stats) {
  if (stats[0] > 100) {
    return 'idk';
  }
  if (stats[1] > 50) {
    io.emit('update', {change: stats[1]/2});
  } else {
    io.emit('update', {change: (-100 + stats[1])/2});
  }
};

serialPort.on("open", function () {
  console.log('open');
  serialPort.on('data', function(data) {
    data = data + '';
    dataBuffer += data;
    if (data.indexOf(';') > -1) {
      stats = dataBuffer.substr(0, dataBuffer.length - 1).split(',');
      for (stat in stats) {stats[stat] = +stats[stat];}
      console.log(stats);
      dataBuffer = '';
    }
  });
});

http.listen(3000, function(){
    console.log('listening on port 3000');
});
