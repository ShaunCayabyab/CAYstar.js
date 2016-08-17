$(document).ready(function(){
	$('#world-button').click(function(){
		newMap();
	});

	$('#astar-button').click(function(){
		checkPoints();
	});

	$('input:radio[name=pointStatus]').change(function(){
		setPointStatus(this.value);
	});

	$('#animate-check').click(function(){
		setAnimateStatus();
	});

	$('#dynamic-check').click(function(){
		setSearchType();
	});

});

//GLOBAL VARIABLES
//================
//================
var pointStatus;
var isNew = true;
var isAnimate = true;
var isDynamic = true;
var isSearching = false;
var startLastClicked = null;
var endLastClicked = null;
var startPoint = null;
var endPoint = null;
var world = null;

var WORLDWIDTH = parseInt((screen.width * .8) / 20);
var WORLDHEIGHT = parseInt((screen.height * .5) / 20);
var WORLDSIZE = WORLDWIDTH * WORLDHEIGHT;
//================
//================

function resetVars(){
	startLastClicked = null;
	endLastClicked = null;
	startPoint = null;
	endPoint = null;
};

function toggleUI(){
	if(isSearching){
		document.getElementById("world-button").disabled = true;
		document.getElementById("astar-button").disabled = true;
		document.getElementById("dynamic-check").disabled = true;
		document.getElementById("animate-check").disabled = true;
	}else{
		document.getElementById("world-button").disabled = false;
		document.getElementById("astar-button").disabled = false;
		document.getElementById("dynamic-check").disabled = false;
		document.getElementById("animate-check").disabled = false;
	};
};


function setPointStatus(pointInput){
	pointStatus = pointInput;
};

function setAnimateStatus(){
	if(document.getElementById("animate-check").checked){
		isAnimate = true;
	}else{
		isAnimate = false;
	};
};

function setSearchType(){
	if(document.getElementById("dynamic-check").checked){
		isDynamic = true;
	}else{
		isDynamic = false;
	};
};

/**
* Used to create a new world map.
* Calls on updateMap to update the display.
*/
function newMap(){
	resetVars();
	isNew = true;

	world = new Array(WORLDHEIGHT);

	updateMap();
	isNew = false;
};

/**
* updateCells is used to create the "animation" of the A* algorithm.
* Using setTimeout, the search cloud is displayed one by one. by the 
* end of the setTimeout, the found path will be displayed.
*
* UPDATES:
* 01/27 - 
* -Changed cloud setTimeout to update cells individually instead of updating whole map.
* -Changed path setTimout to update cells individually instead of updating whole map
*/
function updateCells(path, cloud){
	var pathCheck = path;

	if(isAnimate){
		var f = 50;
		var wait = f * cloud.length;
	}else{
		var f = 0;
		var wait = 0;
	};

	toggleUI();

	for(var i = 0; i < cloud.length; i++){
		(function(c){
			setTimeout(function(){
				world[c.y][c.x].cloud = true;
				var m = document.getElementsByClassName(c.y + ',' + c.x);
				m[0].className += ' cloud';
			}, f*i);
		}(cloud[i]));
	};

	setTimeout(function(){
		while(pathCheck.length !== 0){
			var c = {y: pathCheck[0].y, x: pathCheck[0].x};
			world[c.y][c.x].cloud = true;
			world[c.y][c.x].aStarPath = true;
			var m = document.getElementsByClassName(c.y + ',' + c.x);
			m[0].className = c.y + ',' + c.x + ' path';
			pathCheck.splice(0,1);
		};

		isSearching = false;
		toggleUI();
	}, wait);
};

/**
* updateMap used to change the map display
* either for creating the points and search paths,
* or for creating a new world.
*/
function updateMap(){
	var x = WORLDWIDTH;
	var y = WORLDHEIGHT;

	//If map already exsists, remove to replace with new map.
	if(document.getElementById("map").hasChildNodes()){
		document.getElementById("map").innerHTML = '';
	}

	//Creates table to display the map grid.
	//Gives it a class name 'grid'.
	grid = document.createElement('table');
	grid.className = 'grid';

	//Loops through 2D array to create map on window.
	//Node information of each cell is passed to it's corresponding grid cell.
	for(var i = 0; i < WORLDHEIGHT; i++){

		//Add new row array and create table row
		if(isNew){ world[i] = new Array(x); };

		var tr = grid.appendChild(document.createElement('tr'));

		//Loops through each cell in the currnet row to perform operations.
		for(var j = 0; j < WORLDWIDTH; j++){

			//Add new MapCell for each cell in the row
			//append td element to table row
			if(isNew){ world[i][j] = new MapCell(j, i); };

			var cell = tr.appendChild(document.createElement('td'));
			cell.className = i + ',' + j;

			//Check if the MapCell is wall, A* path, start point, or end point
			if(!world[i][j].walkable){
				cell.className += ' wall';
			}
			else if(startPoint !== null && world[i][j].x == startPoint.x && world[i][j].y == startPoint.y){
				cell.className += ' start-clicked';
			}
			else if(endPoint !== null && world[i][j].x == endPoint.x && world[i][j].y == endPoint.y){
				cell.className += ' end-clicked';
			};

			cell.innerHTML = " ";

			//Add click event listener to each cell
			cell.addEventListener('click', (function(cell, i, j){
				return function(){
					if(!isSearching){ cellClicked(cell, i, j); };
				};
			})(cell, i, j), false);
		};
	};

	//Appends grid to map HTML element as its child.
	document.getElementById("map").appendChild(grid);
};
//end updateMap


/**
* Function that the cell event listener calls
*
* Depending on the radio input, function will set the start and
* end points to global variables, and will store the start and
* end MapCells to global variables.
*
* @param {MapCell} cell - cell HTML element
* @param {Number} cellY - cell Y coordinate
* @param {Number} cellX - cell X coordinate
*/
function cellClicked(cell, cellY, cellX){
	if(pointStatus == 0 && world[cellY][cellX].walkable){
		cell.className += 'start-clicked';
		if (startLastClicked){
			startLastClicked.className = cellY + ',' + cellX;
		};
		startLastClicked = cell;

		//store the start MapCell
		startPoint = world[cellY][cellX];
	}
	else if(pointStatus == 1 && world[cellY][cellX].walkable){
		cell.className += 'end-clicked';
		if (endLastClicked){
			endLastClicked.className = cellY + ',' + cellX;
		};
		endLastClicked = cell;

		//store the end MapCell
		endPoint = world[cellY][cellX];
	};

	for(var i = 0; i < world.length; i++){
		for(var j = 0; j < world[i].length; j++){
			world[i][j].aStarPath = false;
			world[i][j].cloud = false;
		};
	};

	updateMap();
};
//end cellClicked

function checkPoints(){
	if(startPoint !== null && endPoint !== null){
		aStarPath();
	}else{
		alert("Please place start and end points on map");
	};
};

/**
* =====================================================================
* ASTAR PATH FINDER
* =====================================================================
*
* Will execute the A* pathfinding algorithm if start and end points
* are chosen. Once the A* algorithm is finished and has found the best
* path, it will then call the buildPath function with the result array,
* which contains the Nodes of the best path cells.
*
* @return {Nodes} buildPath(result) - returns the found path
*/
function aStarPath(){
	isSearching = true;
	//Save the start and end cells. Create Nodes for them.
	//Also create the openSet and closedSet for the A* search.
	var pathStart = Node(null, {x: startPoint.x, y: startPoint.y});
	var pathEnd = Node(null, {x: endPoint.x, y: endPoint.y});
	var visitedCloud = new Array();
	var openSet = new Array();
	var closedSet = new Array();

	//Set the default f and g scores as the world dimensions.
	var tentativeGScore = WORLDSIZE;
	var tentativeFScore = WORLDSIZE;

	//push the start Node to the openSet. This is the starting point for the search.
	openSet.push(pathStart);

	//Loop as long as there are Nodes in the openSet.
	while(openSet.length !== 0){
		var minF = WORLDSIZE;
		var minIndex = 0;
		var current = null;
		var currentNeighbors = [];

		//Loop through the openSet Nodes.
		for(var i = 0; i < openSet.length; i++){
			//if the current openSet Node has the smallest f score, record it.
			if(openSet[i].f < minF){
				minF = openSet[i].f;	//store the current openSet Node's f score.
				current = openSet[i];	//store the openSet Node to current Node.
				minIndex = i;			//store the index of the smallest cost Node.
			};
		};

		//If this current Node is the end Node, build path and break while loop.
		if(current.x == pathEnd.x && current.y == pathEnd.y){ return buildPath(current, visitedCloud); };

		//Move the smallest cost Node from the openSet to the closedSet.
		//Then get the current Node's neighbors
		openSet.splice(minIndex, 1);
		closedSet.push(current);
		visitedCloud.push({y: current.y, x: current.x});
		currentNeighbors = getCurrentNeighbors(current);

		//Iterate through the current neighboring Nodes
		for(var i = 0; i < currentNeighbors.length; i++){
			//if the current neighbor is in closedSet, then skip
			if(isIn(closedSet, currentNeighbors[i])){
				continue;
			};

			//Calculate and record the currentNeighbor's g score.
			//Record that this Node has been visited.
			tentativeGScore = current.g + ManhattanDistance(current, currentNeighbors[i]);
			
			//If the currentNeighbor is not in the openSet, push it into openSet.
			//Else, skip if the currentNeighbor's stored g score is less than the tentative g score.
			//Because the path would be backtracking if otherwise.
			if(!isIn(openSet, currentNeighbors[i])){
				openSet.push(currentNeighbors[i]);
			}
			else if(tentativeGScore >= currentNeighbors[i].g){
				continue;
			};

			// set up used for dynamic weighting.
			// cost f(n) = g(n) + (((1 + e) + w(n)) * h(n)), where w(n) is the dynamic weight for the Node.
			// if the search depth (ManhattanDistance from start to currentNeighbor) is less than
			// or equal to the anticipated path length N (ManhattanDistance from start to end),
			// then w(n) = 1 - (w(n) / N).
			// else, w(n) = 0.
			var w;
			var e = 5;
			var wEstimate = ManhattanDistance(pathStart, currentNeighbors[i]);
			if(wEstimate <= ManhattanDistance(pathStart, pathEnd)){
				w = 1 - (wEstimate / ManhattanDistance(pathStart, pathEnd));
			}else{
				w = 0;
			};

			//Record the calculated costs of the currentNeighbor Node.
			currentNeighbors[i].Parent = current;
			currentNeighbors[i].g = tentativeGScore;
			currentNeighbors[i].h = ManhattanDistance(currentNeighbors[i], pathEnd);
			if(isDynamic){
				currentNeighbors[i].f = tentativeGScore + (((1 + e) + w) * ManhattanDistance(currentNeighbors[i], pathEnd));
			}else{
				currentNeighbors[i].f = tentativeGScore + ManhattanDistance(currentNeighbors[i], pathEnd);
			};
		};
		//end neighbor Nodes loop
	};
	//end A* while loop

	//Path could not be found. Return an alert.
	return alert("Path could not be found");
	isSearching = false;
	toggleUI();
};
//end aStarPath


/**
* buildPath is called when aStarPath has found a path.
* Function will print the path coordinates to console.
* Coordinates will be passed to updateMap as an array.
* Visited cells will also be passed as a "search cloud".
*
* @param {Nodes} Path - the set of Nodes of the found path.
* @param {Nodes} Cloud - the "search cloud" to show the breadth of the search.
*/
function buildPath(Path, Cloud){
	var Way = Path;
	var pathArray = [];
	var searchCloud = Cloud;

	while(Way.Parent !== null){
		pathArray.push({y: Way.y, x: Way.x});
		Way = Way.Parent;
	};

	pathArray.splice(0, 1);
	searchCloud.splice(0, 1);

	updateCells(pathArray, searchCloud);
};
//end buildPath

/**
* isIn is used to check if a Node is in a set of Nodes.
*
* @param {Nodes} array - the set of Nodes to check.
* @param {Node} entry - the Node to check if it is in the array.
* @return {bool} bool - result of the check.
*/
function isIn(array, entry){
	var bool = false;

	for(var i = 0; i < array.length; i++){
		if(array[i].x == entry.x && array[i].y == entry.y){
			bool = true;
			break;
		}else{
			bool = false;
		};
	};

	return bool;
};
//end isIn

/**
* =====================================================================================================
* DISTANCE FUNCTIONS
* =====================================================================================================
*
* The three functions below are used to calculate the distance between cells.
* ManhattanDistance deals with cells in north, south, east, and west of given cell.
* DiagonalDistance deals with cells diagonal to the given cell
* EuclideanDistance deals with diagonal cells, but treats them as larger distance than cardinal cells.
*
* Currently, ManhattanDistance is the function implemented in the A* algorithm.
*
* @param {Node} Point - starting point for distance calculation
* @param {Node} Goal - end point for distance calculation
* @return {Number} - calculated distance from both Nodes
*/
function ManhattanDistance(Point, Goal){
	return Math.abs(Point.x - Goal.x) + Math.abs(Point.y - Goal.y);
};

function DiagonalDistance(Point, Goal){
	return Math.max(Math.abs(Point.x - Goal.x), Math.abs(Point.y - Goal.y));
};

function EuclideanDistance(Point, Goal){
	return Math.sqrt(Math.pow(Point.x - Goal.x, 2) + Math.pow(Point.y - Goal.y, 2));
};
//end DISTANCE FUNCTIONS


/**
* Used to get the neighbor Nodes of the current Node in aStarPath.
*
* @param {Node} currentNode - the current Node to get Neighbors
* @return {Array} neighbor Return - an array of walkable Nodes that neighbor currentNode
*/
function getCurrentNeighbors(currentNode){
	var temp = [];
	var neighborReturn = [];

	if(currentNode.x + 1 < WORLDWIDTH){
		temp[0] = Node(currentNode, {x: currentNode.x + 1, y: currentNode.y}); //Right
	}
	else{ temp[0] = null; };

	if(currentNode.x - 1 >= 0){
		temp[1] = Node(currentNode, {x: currentNode.x - 1, y: currentNode.y}); //Left
	}
	else{ temp[1] = null; };

	if(currentNode.y + 1 < WORLDHEIGHT){
		temp[2] = Node(currentNode, {x: currentNode.x, y: currentNode.y + 1}); //Bottom
	}
	else{ temp[2] = null; };

	if(currentNode.y - 1 >= 0){
		temp[3] = Node(currentNode, {x: currentNode.x, y: currentNode.y - 1}); //Top
	}
	else{ temp[3] = null; };

	for(var i = 0; i < temp.length; i++){
		if(temp[i] == null){ continue; };

		var x = temp[i].x;
		var y = temp[i].y;

		if(world[y][x].walkable){
			neighborReturn.push(temp[i]);
		}else{
			continue;
		};
	};

	return neighborReturn;
};
//end getCurrentNeighbors


/** 
* MapCell object for the world.
*
* Used for displaying the cells and for
* storing its state (walkable, wall, etc.).

* @param {Number} x - x coordinate of MapCell
* @param {Number} y - y coordinate of MapCell
* @param {boolean} isClear - used to determine MapCell's walkability
*/
function MapCell(x, y, isClear){
	this.x = x;
	this.y = y;
	this.aStarPath = false;
	this.cloud = false;
	if(Math.random() > 0.75){
		this.walkable = false;
	}else{
		this.walkable = true;
	};
};


/**
* Node object for the A* algorithm
*
* @param {Node} ParentNode - stores parent for each node
* @param {Object} Point - gives each Node its coordinates
* @return {Node} newNode - returns set Node to aStarPath
*/
function Node(ParentNode, Point){
	var newNode = {
		Parent: ParentNode,
		x: Point.x,
		y: Point.y,
		f: 0,
		g: 0,
		h: 0
	};

	return newNode;
};