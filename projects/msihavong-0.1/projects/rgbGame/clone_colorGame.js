var numSquare = 6;
var colors = [];

var squares = document.querySelectorAll(".squares");
var rgbDisplay = document.querySelector("#rgbDisplay");
var messageDisplay = document.querySelector("#messageDisplay");
var h1 = document.querySelector("h1");
var resetButton = document.querySelector("#resetButton");
var modeButton = document.querySelectorAll(".modeButton");

resetButton.addEventListener("click", function(){
	reset();
});

init();

function init(){
	modeFunction();
	squaresFunction();
	reset();
}

function modeFunction(){
	for (var i = 0; i < modeButton.length; i++){
		modeButton[i].addEventListener("click", function(){
			modeButton[0].classList.remove("selected");
			modeButton[1].classList.remove("selected");
			this.classList.add("selected");
			this.textContent === "Easy" ? numSquare = 3: numSquare = 6;
			reset();
		});
	}
}

function squaresFunction(){
	for (var i = 0; i < squares.length; i++){
		squares[i].addEventListener("click", function(){
			// if you correct color clicked
			var clickedColor = this.style.backgroundColor;
			if (clickedColor === winningColor){
				// change all color to winning color
				this.style.backgroundColor = changeColor();
				// change messageDisplay to correct!
				messageDisplay.textContent = "Correct!";
				// change h1 to winningcolor
				h1.style.backgroundColor = winningColor;
				// change reset button to say Play Again?
				resetButton.textContent = "Play Again?"
			}
			else {
				// make incorrect square disappear
				this.style.backgroundColor = "#232323";
				// change messageDisplay to try again!
				messageDisplay.textContent = "Try Again!";
			}
		});
	}
}

function reset(){
	// reset array
	colors = colorArrayGenerator(numSquare);
	// reset winning color
	winningColor = winningColorGenerator();
	// reset messageDisplay, h1, rgbDisplay, resetButton
	messageDisplay.textContent = "";
	rgbDisplay.textContent = winningColor;
	h1.style.backgroundColor = "steelblue";
	resetButton.textContent = "New Color";
	// reset color of squares from new rgb of colors[]
	for (var i = 0; i < squares.length; i++){
		if (colors[i]){
			squares[i].style.backgroundColor = colors[i];
			squares[i].style.display = "block";
		}
		else {
			squares[i].style.display = "none";
		}
	}
	
}

// change all color to winningColor
function changeColor(){
	for (var i = 0; i < squares.length; i++){
		squares[i].style.backgroundColor = winningColor;
	}
}

// choose winningColor out of the index inside colors[]
function winningColorGenerator(){
	for (var i = 0; i < colors.length; i++){
		var randNum = Math.floor(Math.random() * numSquare);
	}
	return colors[randNum];
}

// push generated RGB into colors array
function colorArrayGenerator(num){
	var arr = [];
	for (var i = 0; i < num; i++){
		arr.push(rgbGenerator());
	}
	return arr;
}

// generate random colors of RGB
function rgbGenerator(){
	var r = Math.floor(Math.random() * 256);
	var g = Math.floor(Math.random() * 256);
	var b = Math.floor(Math.random() * 256);
	return "rgb(" + r + ", " + g + ", " + b + ")";
}