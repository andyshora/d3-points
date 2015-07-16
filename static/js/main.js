
console.log('main');

var socket = io('http://localhost:8081');

var parallaxScale = 20;
var mouseScale = 40;

// Create a symbol, which we will place instances of later
var path = new Path.Circle({
  center: [0, 0],
  radius: 10,
  fillColor: 'white',
  strokeColor: 'black'
});
/*var path2 = new Path.Circle({
  center: [0, 0],
  radius: 10,
  fillColor: 'red',
  strokeColor: 'black'
});*/

var symbol = new Symbol(path);
// var symbol2 = new Symbol(path2);

var vector = new Point(0, 0);
var rotation = new Point(0, 0);
var keyVector = new Point(0, 0);

var numPoints = 0;

var updateQueue = [];
var addQueue = [];
var resetScaleQueue = [];
var points = [];

socket.on('point:new', function (data) {
  // console.log('point:new', data);

  addQueue.push(data)

  // var placedSymbol = symbol.place(new Point(data.x, data.y));
  // placedSymbol.scale(0.2 + ((data.z / 500) * 0.8));
  // numPoints++;
});

socket.on('point:update', function (data) {
  // console.log('point:update');

  updateQueue.push(data);
});

// Place each symbol in a random point in the view
/*for (var i = 0; i < nCircles; i++) {
  var symbolCenter = Point.random() * view.size;
  if (i == nCircles-1) {
    var placedSymbol = symbol2.place(symbolCenter);
  }
  else {
    var placedSymbol = symbol.place(symbolCenter);
    placedSymbol.scale(i / nCircles);
  }
}*/

// The onFrame function is called up to 60 times a second
function onFrame(event) {
  // If the item has exited the view on one side, move it to the other side
  /*function checkOutOfBounds(item){
    if (item.bounds.left > view.size.width) {
      item.position.x = 0;
    }
    if (item.bounds.top > view.size.height) {
      item.position.y = 0;
    }
    if (item.bounds.right < 0) {
      item.position.x = view.size.width;
    }
    if (item.bounds.bottom < 0) {
      item.position.y = view.size.height;
    }
  }*/

  // Run through the active layer's children list and change
  // the position of the placed symbols
  /*for (var i = 0; i < numPoints; i++) {
    var item = project.activeLayer.children[i];
    // Each item moves a fraction of its width
    // so that larger circles move faster than smaller circles
    item.position.x += vector.x * (item.bounds.width / parallaxScale) - rotation.x + keyVector.x;
    item.position.y += vector.y * (item.bounds.width / parallaxScale) - rotation.y + keyVector.y;
  }*/

  while (addQueue.length > 0) {
    var data = addQueue.shift();
    
    var placedSymbol = symbol.place(new Point(data.x, data.y));
    placedSymbol.scale(0.2 + ((data.z / 500) * 0.8));

    placedSymbol.set({ index: data.index });

    placedSymbol.onMouseDown = function(event) {
      console.log('clicked point', event.target.index);
    }

    numPoints++;
    points.push(placedSymbol);
  }
  
  if (updateQueue.length > 0) {
    console.log('updateQueue.length', updateQueue.length);
  }

  // apply queued updates
  while (updateQueue.length > 0) {
    var data = updateQueue.shift();
    // console.log('updating point', data);
    // console.log('data', data);
    var item = points[data.index];

    if ('x' in data) {
      item.position.x += data.x;
    }
    if ('y' in data) {
      item.position.y += data.y;
    }

    if ('newZ' in data) {
      item.scale(0.2 + ((data.newZ / 500) * 0.8));
    }

    if ('z' in data) {
      // reset scale
      resetScaleQueue.push(data);
    }
  }

  // reset scale first, update scale on next frame
  while (resetScaleQueue.length > 0) {
    var data = resetScaleQueue.shift();

    var item = points[data.index];
    item.scale(1 / item.scaling.x);

    updateQueue.push({ index: data.index, newZ: data.z })
  }
}

// mouse movement controls rotation of view
/*function onMouseMove(event) {
  var d = (event.point - view.center) / view.center;

  function polarize(val) {
    return -1 + 2 * val;
  }
  vector.x = polarize(d.x < 0);
  rotation.x = polarize(d.x < 0);
  vector.y = polarize(d.y < 0);
  rotation.y = polarize(d.y < 0);

  var da = new Point(Math.abs(d.x), Math.abs(d.y));
  da *= mouseScale;
  var vectorScale = da;
  var rotationScale = da;

  vector *= vectorScale;
  rotation *= rotationScale;
}*/

// keys control center of view
function onKeyDown(event) {
  if(event.key == 'left') {
    keyVector.x = 2;
  }
  if(event.key == 'right') {
    keyVector.x = -2;
  }
  if(event.key == 'up') {
    keyVector.y = 2;
  }
  if(event.key == 'down') {
    keyVector.y = -2;
  }
}
function onKeyUp(event) {
  if(event.key == 'left' || event.key == 'right') {
    keyVector.x = 0;
  }
  else if(event.key == 'up' || event.key == 'down') {
    keyVector.y = 0;
  }
}
