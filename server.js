var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// app settings
app.set('port', process.env.PORT || 8081);

app.use('/', express.static(__dirname + '/static', { maxAge: 86400 }));

io.on('connection', function (socket) {

  var count = 0;
  var maxCount = 50;

  var updatesCount = 0;
  var maxUpdates = 200;

  function getRandomDiff() {
    return Math.floor(Math.random() * 20) - 10;
  }

  function getRandomPoint() {
    return Math.floor(Math.random() * 500);
  }

  function getRandomIndex() {
    return Math.floor(Math.random() * maxCount);
  }

  function sendUpdates() {
    console.log('sending updates');

    var updatesInterval = setInterval(function() {
      socket.emit('point:update', { index: getRandomIndex(), x: getRandomDiff(), y: getRandomDiff()/*, z: getRandomDiff()*/ });
      updatesCount++;

      if (updatesCount > maxUpdates) {
        clearInterval(updatesInterval);
      }
    }, 60);
  }

  // console.log('connectedCount', connectedCount);
  // socket.emit('room:count', { count: connectedCount });

  /*socket.on('game:trigger-wave', function(data) {
    socket.emit('game:trigger-wave', data);
    console.log('game:trigger-wave');
  });*/

  var interval = setInterval(function() {
    socket.emit('point:new', { x: getRandomPoint(), y: getRandomPoint(), z: getRandomPoint() });
    count++;

    if (count > maxCount) {
      clearInterval(interval);

      sendUpdates();
    }
  }, 20);

});


server.listen(app.get('port'));
console.log('Listening on port %s', app.get('port'));
