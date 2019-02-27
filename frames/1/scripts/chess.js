"use strict";
let id,
	highlight,
    currentPath,
    finalPath,
    div,
	turn,
    check = false,
    piece = [],
    board = [];

const d = document,
      WHITE = "w",
      BLACK = "b",
      QUEEN = "Q",
      KING = "K",
      BISHOP = "B",
      KNIGHT = "N",
      ROOK = "R",
      PAWN = "P",
      convertColor = ["w", "b"], //used to give white and black number values (handy for finding the right coordinates on "pieces.png")
      convertType = [null, "P", "N", "B", "R", "Q", "K"], // same as above but for piece names (Pawn, kNight, Bishop, etc.)
      convertX = [0, "a", "b", "c", "d", "e", "f", "g", "h"],
      MOVE_DATA = {
          "K": [{x: 0, y: 1},
                {x: 0, y: -1},
                {x: 1, y: 0},
                {x: -1, y: 0},
                {x: 1, y: 1},
                {x: 1, y: -1},
                {x: -1, y: 1},
                {x: -1, y: -1}],
  
          "Q": [{x: 0, y: 1},
                {x: 0, y: -1},
                {x: 1, y: 0},
                {x: -1, y: 0},
                {x: 1, y: 1},
                {x: 1, y: -1},
                {x: -1, y: 1},
                {x: -1, y: -1}],
  
          "B": [{x: 1, y: 1},
                {x: 1, y: -1},
                {x: -1, y: 1},
                {x: -1, y: -1}],
  
          "N": [{x: 2, y: 1},
                {x: 2, y: -1},
                {x: -2, y: 1},
                {x: -2, y: -1},
                {x: 1,  y: 2},
                {x: 1, y: -2},
                {x: -1, y: 2},
                {x: -1, y: -2}],
  
          "R": [{x: 0, y: 1},
                {x: 0, y: -1},
                {x: 1, y: 0},
                {x: -1, y: 0}]
      };

//creates a multidimensional object of 8 arrays each containing 8 arrays that will be used to store and access piece location and color on the chess board
//styles each div element of the chess board on the html page with a blank portion of the pieces.png sprite
for (let y = 1; y < 9; y += 1) {
    board[y] = [];
    for (let x = 1; x < 9; x += 1) {
        board[y][x] = {"id": convertX[x] + y, "piece": []};
        div = d.createElement("DIV");
        div.setAttribute("class", "square");
        d.getElementById(board[y][x].id).style.backgroundImage = "url('sprites/pieces.png')";
        d.getElementById(board[y][x].id).style.backgroundPosition = "0 -200";
    }
}

//similar to indexOf, except it compares x and y properties of an object
Array.prototype.objectIndexOf = function (object) {
    for (let i = 0; i < this.length; i += 1) {
        if (this[i].x == object.x && this[i].y == object.y) {
            return i;
        }
    }
    return -1;
}

//logs the contents of an array
function logArray(element, index) {
    console.log(index + 1 + ". " + element.x + "" + element.y)
}


function switchColor(color) {
    return color === "w" ? "b" : (color === "b" ? "w" : -1);
}


//Needs to be reworked
function switchTurn() {
    let kingY = piece[(convertColor.indexOf(turn) + 1) * 8 - 1].y,
        kingX = piece[(convertColor.indexOf(turn) + 1) * 8 - 1].x,
        check, 
        checkmate;

    if (isAttacked(kingY, kingX, turn)) {
        check = true,
        checkmate = true;
        piece.forEach( (pieceCoordinates) => {
            let path = findPath(pieceCoordinates.y, pieceCoordinates.x),
                pieceValue = board[pieceCoordinates.y][pieceCoordinates.x].pieceValue;

                console.log(pieceValue);
            if (path) {
                for (let move in path) {
                    if (!allowsCheck(pieceValue, move.y, move.x)) {
                        checkmate = false;
                    }
                }
            }
        });
        if (checkmate) {
            console.log('Checkmate');
        } else {
            console.log('Check');
            turn = switchColor(turn);
        }
    } else {
        turn = switchColor(turn);
    }
}

//checks if a given move fails to stop a king check or if by moving, allows a king check
function allowsCheck(pieceValue, moveY, moveX) {
	let color = piece[pieceValue].color,
		attackerColor = (color === "w" ? "b" : "w"),
        kingY,
        kingX,
		previousTurn = turn, 
		kingAttacked, 
		a = piece[pieceValue].x,
		b = piece[pieceValue].y,
		oldPieceValue = board[moveY][moveX].pieceValue;
	turn = null;
    board[moveY][moveX].pieceValue = pieceValue;
    piece[pieceValue].x = moveX;
    piece[pieceValue].y = moveY;
    board[b][a].pieceValue = 0;
    kingY = piece[(convertColor.indexOf(attackerColor) + 1) * 8 - 1].y;
    kingX = piece[(convertColor.indexOf(attackerColor) + 1) * 8 - 1].x;
    kingAttacked = isAttacked(kingY, kingX, attackerColor);
    board[b][a].pieceValue = pieceValue;
    piece[pieceValue].x = a;
    piece[pieceValue].y = b;
    board[moveY][moveX].pieceValue = oldPieceValue;
    turn = previousTurn;
    return kingAttacked;
}

//finds all legal paths of a piece when given its x and y coordinates
function findPath(y, x) {
    let legalPath = [],
        clear,
        moves,
        type,
        color,
        hasMoved,
        a,
        b;
    if (board[y] === undefined) {
        console.log("Doesn't exist");
    } else if (board[y][x] === undefined) {
        console.log("Doesn't exist");
    } else if (board[y][x].pieceValue === 0) {
        console.log("Nothing here");
    } else {
        type = piece[board[y][x].pieceValue].type;
        color = piece[board[y][x].pieceValue].color;
        hasMoved = piece[board[y][x].pieceValue].moved;
        if (type === "B") {
            moves = [{x: 1, y: 1},
                     {x: 1, y: -1},
                     {x: -1, y: 1},
                     {x: -1, y: -1}];
            for (let i = 0; i < moves.length; i += 1) {
				clear = true;
				a = x + (moves[i].x);
				b = y + (moves[i].y);
				while (board[b] !== undefined && board[b][a] !== undefined) {
                    if (clear === true) {
                        if (board[b][a].pieceValue === 0) {
                            legalPath.push({x: convertX[a], y: b});
                        } else if (piece[board[b][a].pieceValue].color !== color) {
                            legalPath.push({x: convertX[a], y: b});
                            clear = false;
                        } else {
                            clear = false;
                        }
                    }
                    //store "empty board path" to board
                    a += (moves[i].x);
                    b += (moves[i].y);
				}
            }
        } else if (type === "R") {
            moves = [{x: 0, y: 1},
                     {x: 0, y: -1},
                     {x: 1, y: 0},
                     {x: -1, y: 0}];
            for (let i = 0; i < moves.length; i += 1) {
                clear = true;
				a = x;
				b = y;
				while (clear === true) {
					a += (moves[i].x);
					b += (moves[i].y);
					if (board[b] === undefined) {
                        clear = false;
					} else if (board[b][a] === undefined) {
                        clear = false;
					} else if (board[b][a].pieceValue === 0) {
                        legalPath.push({x: convertX[a], y: b});
                    } else if (piece[board[b][a].pieceValue].color !== color) {
                        legalPath.push({x: convertX[a], y: b});
                        clear = false;
                    } else {
                        clear = false;
					}
                }
            }
        } else if (type === "Q") {
			moves = [{x: 0, y: 1},
					 {x: 0, y: -1},
					 {x: 1, y: 0},
					 {x: -1, y: 0},
					 {x: 1, y: 1},
					 {x: 1, y: -1},
					 {x: -1, y: 1},
					 {x: -1, y: -1}];
			for (let i = 0; i < moves.length; i += 1) {
				clear = true;
				a = x;
				b = y;
				while (clear === true) {
					a += (moves[i].x);
					b += (moves[i].y);
					if (board[b] === undefined) {
						clear = false;
					} else if (board[b][a] === undefined) {
						clear = false;
					} else if (board[b][a].pieceValue === 0) {
						legalPath.push({x: convertX[a], y: b});
					} else if (piece[board[b][a].pieceValue].color !== color) {
						legalPath.push({x: convertX[a], y: b});
						clear = false;
					} else {
						clear = false;
					}
				}
			}
		} else if (type === "N") {
			moves = [{x: 2, y: 1},
					 {x: 2, y: -1},
					 {x: -2, y: 1},
					 {x: -2, y: -1},
					 {x: 1,  y: 2},
					 {x: 1, y: -2},
					 {x: -1, y: 2},
					 {x: -1, y: -2}];
			for (let i = 0; i < moves.length; i += 1) {
				a = x + (moves[i].x);
				b = y + (moves[i].y);
                if (board[b] === undefined) {
				} else if (board[b][a] === undefined) {
				} else if (board[b][a].pieceValue === 0) {
					legalPath.push({x: convertX[a], y: b});
				} else if (piece[board[b][a].pieceValue].color !== color) {
					legalPath.push({x: convertX[a], y: b});
				}
			}
        } else if (type === "P") {
			a = (2 * convertColor.indexOf(color)) - 1;
			if (board[y] === undefined) {
			} else if (board[y][x + a] === undefined) {
			} else if (board[y][x + a].pieceValue === 0) {
				legalPath.push({x: convertX[x + a], y: y});
			}
			if (!hasMoved && board[y][x + 2 * a].pieceValue === 0) {
				legalPath.push({x: convertX[x + 2 * a], y: y});
			}
			if (board[y + 1] === undefined) {
			} else if (board[y + 1][x + a] === undefined) {
			} else if (board[y + 1][x + a].pieceValue === 0) {
			} else if (piece[board[y + 1][x + a].pieceValue].color !== color) {
				legalPath.push({x: convertX[x + a], y: (y + 1)});
			}
			if (board[y - 1] === undefined) {
			} else if (board[y - 1][x + a] === undefined) {
			} else if (board[y - 1][x + a].pieceValue === 0) {
			} else if (piece[board[y - 1][x + a].pieceValue].color !== color) {
				legalPath.push({x: convertX[x + a], y: (y - 1)});
			}
		} else if (type === "K") {
			moves = [{x: 0, y: 1},
					{x: 0, y: -1},
					{x: 1, y: 0},
					{x: -1, y: 0},
					{x: 1, y: 1},
					{x: 1, y: -1},
					{x: -1, y: 1},
					{x: -1, y: -1}];
			for (let i = 0; i < moves.length; i += 1) {
				a = x + (moves[i].x);
				b = y + (moves[i].y);
				if (board[b][a] === undefined) {
				} else if (board[b][a].pieceValue === 0) {
					legalPath.push({x: convertX[a], y: b});
				} else if (piece[board[b][a].pieceValue].color !== color) {
					legalPath.push({x: convertX[a], y: b});
				}
			}
		}
		// console.log("Legal moves for " + color + type + " at " + board[y][x].id + ":\n");
		// legalPath.forEach(logArray);
		return legalPath;
	}
}

//checks if a square is attacked by pieces of the chosen color
function isAttacked(y, x, attackerColor) {
    let attacked = false,
    	path,
        id;
    for (let i = 0; i < piece.length; i += 1) {
    	if (piece[i].x !== 0 && piece[i].color === attackerColor) {
    		path = findPath(piece[i].y, piece[i].x);
            id = {x: convertX[x], y: y};
            if (path !== undefined) {
                attacked = ((path.objectIndexOf(id) + 1) ? true : false);
                if (attacked) {
		        	break;
		    	}
            }
        }
    }
    return attacked;
}

//stores input data to corresponding board coordinates (board[y][x].pieceValue = {...}),
//and finds the right location for it
function spawn(y, x, type, color, pieceValue) {
    let t = convertType.indexOf(type),
        c = convertColor.indexOf(color),
        bgY = Math.round(t / 2) * -50 + "px",
        bgX = ((((t) - 1) % 2) + ((c) * 2)) * -50 + "px",
        bg = bgX + " " + bgY;
    if (pieceValue === undefined) {
        board[y][x].pieceValue = piece.length;
        piece[board[y][x].pieceValue] = { x: x, y: y };
        piece[board[y][x].pieceValue].moved = false;
    } else {
        board[y][x].pieceValue = pieceValue;
        piece[board[y][x].pieceValue] = { x: x, y: y };
        piece[board[y][x].pieceValue].moved = true;
    }
    piece[board[y][x].pieceValue].color = color;
    piece[board[y][x].pieceValue].type = type;
    d.getElementById(board[y][x].id).style.backgroundPosition = bg;
    return;
}

function clear(y, x) {
    board[y][x].pieceValue = 0;
    d.getElementById(board[y][x].id).style.backgroundPositionX = "-200";
	d.getElementById(board[y][x].id).style.backgroundPositionY = "0";
}

function clearHighlight() {
	for (let a = 0; a < 8; a += 1) {
		for (let b = 0; b < 8; b += 1) {
            id = board[a + 1][b + 1].id;
            d.getElementById(id).style.backgroundColor = "";
        }
    }
}

function clicked(y, almostX) {
    let isPathSquare = false,
        x = convertX.indexOf(almostX),
        color = piece[board[y][x].pieceValue].color,
        type;
	//check if the clicked square is a potential move
    console.log("Pressed " + almostX + "" + y + " square")
    if (finalPath) {
        for (let i = 0; i < finalPath.length && !isPathSquare; i += 1) {
            isPathSquare = finalPath[i].x + finalPath[i].y === (almostX + y);
		}
		if (isPathSquare) {
            type = piece[board[highlight.y][highlight.x].pieceValue].type;
			color = piece[board[highlight.y][highlight.x].pieceValue].color;
            //If this move puts a pawn at one of edges, offer a promotion
            if (type === "P" && (x === 8 || x === 1)) {
                //[offer selection of pieces]
                type = "Q";
            }
            spawn(y, x, type, color, board[highlight.y][highlight.x].pieceValue);
            clear(highlight.y, highlight.x);
			switchTurn();
            if (turn !== null) {
                d.getElementById(turn + "Turn").classList.remove("hidden");
                d.getElementById(switchColor(turn) + "Turn").classList.add("hidden");
            }
		}
		clearHighlight();
		finalPath = "";
    } else if (color === turn) {
		highlight = {"x": x, "y": y};
        currentPath = findPath(y, x);
        finalPath = [];
		if (currentPath) {
     		for (let z = 0; z < currentPath.length; z += 1) {
     			if(!allowsCheck(board[y][x].pieceValue, currentPath[z].y, convertX.indexOf(currentPath[z].x))) {
					finalPath.push(currentPath[z]);
				}
     		}
     		currentPath = "";
            for (let i = 0; i < finalPath.length; i += 1) {
                d.getElementById(finalPath[i].x + finalPath[i].y).style.backgroundColor = "white";
            }
        }
    } else if (color === switchColor(turn)){
        console.log("The turn belongs to " + (turn === "w" ? "white" : "") + (turn === "b" ? "black" : ""));
	} else if (board[y][x].pieceValue === 0 || undefined) {
		console.log("There's nothing here")
	}
	return;
}

//begins a new game with pieces spawned in their starting position
function newGame() {
	for (let a = 1; a < 9; a += 1) {
		for (let b = 1; b < 9; b += 1) {
            clear(b, a);
		}
	}
	turn = "w";
    spawn(1, 1, "R", "b");
    spawn(8, 1, "R", "b");
    spawn(2, 1, "N", "b");
    spawn(7, 1, "N", "b");
    spawn(3, 1, "B", "b");
    spawn(6, 1, "B", "b");
    spawn(4, 1, "Q", "b");
    spawn(5, 1, "K", "b");
    spawn(1, 8, "R", "w");
    spawn(8, 8, "R", "w");
    spawn(2, 8, "N", "w");
    spawn(7, 8, "N", "w");
    spawn(3, 8, "B", "w");
    spawn(6, 8, "B", "w");
    spawn(4, 8, "Q", "w");
    spawn(5, 8, "K", "w");
    for (let i = 1; i < 9; i += 1) {
        spawn(i, 2, "P", "b");
        spawn(i, 7, "P", "w");
    }
}

newGame();
