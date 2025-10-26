const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", e => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
})

let wave = [];
let time = 0;
let waveComponents = [];

let scroll = {
	x: 0,
	y: 0,
	yPosition: 0,
	xPosition: 0
}

// Discrete Fourier Transform

function dft(vals) {

	let out = [];
	const N = vals.length;

	for (let k = 0; k < N; k++) {

		let re = 0;
		let imagine = 0;

		for (let n = 0; n < N; n++) {
			const phi = (2 * Math.PI * k * n) / N;

			re += vals[n] * Math.cos(phi);
			imagine -= vals[n] * Math.sin(phi);
		}

		re = re / N;
		imagine = imagine / N;

		let freq = k;
		let radius = Math.sqrt((re * re) + (imagine * imagine));
		let phase = Math.atan2(imagine, re);

		out[k] = {
			real: re,
			imagine: imagine,
			freq: freq,
			radius: radius,
			phase: phase
		};

	}

	return out;
}

// Draw circles

function epiCycles(x, y, fourier, rotation) {

	for (let i = 0; i < fourier.length; i++) {

		let prevX = x;
		let prevY = y;

		let freq = fourier[i].freq;
		let radius = fourier[i].radius;
		let phase = fourier[i].phase;

		x += radius * Math.cos((freq * time) + phase + rotation);
		y += radius * Math.sin((freq * time) + phase + rotation);

		ctx.strokeStyle = "#FFFFFF";
		ctx.lineCap = 'round';
		ctx.lineWidth = 1;
		ctx.globalAlpha = 0.6;

		ctx.beginPath();
		ctx.arc(prevX, prevY, radius, 0, 2 * Math.PI);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(prevX, prevY);
		ctx.lineTo(x, y);
		ctx.stroke();

	}

	return { x: x, y: y };
}

// Draw components of the grah

function components(fourier, rotation, type) {

	for (let i = 0; i < fourier.length; i++) {

		// Draw sine wave based on fourier transform
		let freq = fourier[i].freq;
		let radius = fourier[i].radius;
		let phase = fourier[i].phase;

		let x = radius * Math.cos((freq * time) + phase + rotation);
		let y = radius * Math.sin((freq * time) + phase + rotation);

		if (waveComponents.length - 1 < i) waveComponents.push([]);

		waveComponents[i].unshift({
			x: x,
			y: y
		})

		let offsetY = (i * 100) + 100 + scroll.y;

		// Draw circle
		ctx.strokeStyle = "#FFFFFF";
		ctx.lineCap = 'round';
		ctx.lineWidth = 1;
		ctx.globalAlpha = 0.6;

		ctx.beginPath();
		ctx.arc(100, offsetY, radius, 0, 2 * Math.PI);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(100, offsetY);
		ctx.lineTo(100 + x, offsetY + y);
		ctx.stroke();

		// Draw graphs
		drawGraph(waveComponents[i], type, 0, offsetY - (canvas.height * 0.5));
		if (waveComponents[i].length > 300) waveComponents[i].pop();
	}
}

function drawWave(wavePositions, offX, offY) {
	let offsetX = canvas.width * 0.5;
	let offsetY = canvas.height * 0.5;

	offsetX += offX;
	offsetY += offY;

	for (let i = 0; i < wavePositions.length - 1; i++) {
		let n = i + 1;

		let currentX = wavePositions[i].x;
		let currentY = wavePositions[i].y;

		let nextX = wavePositions[n].x;
		let nextY = wavePositions[n].y;

		ctx.strokeStyle = "#FFFFFF";
		ctx.lineCap = 'round';
		ctx.lineWidth = 2;
		ctx.globalAlpha = 1;

		ctx.beginPath();
		ctx.moveTo(currentX + offsetX, currentY + offsetY);
		ctx.lineTo(nextX + offsetX, nextY + offsetY);
		ctx.stroke();
	}

}

function drawGraph(wavePositions, type, offX, offY) {
	let offsetX = canvas.width * 0.5;
	let offsetY = canvas.height * 0.5;

	offsetX += offX;
	offsetY += offY;

	for (let i = 0; i < wavePositions.length - 1; i++) {

		let n = i + 1;

		let currentY = wavePositions[i].y;
		let nextY = wavePositions[n].y;

		if (type == "x") {
			currentY = wavePositions[i].x;
			nextY = wavePositions[n].x;
		}

		ctx.strokeStyle = "#FFFFFF";
		ctx.lineCap = 'round';
		ctx.lineWidth = 2;
		ctx.globalAlpha = 1;

		// Draw the x movement graph
		ctx.beginPath();
		ctx.moveTo(i + offsetX, currentY + offsetY);
		ctx.lineTo(n + offsetX, nextY + offsetY);
		ctx.stroke();

	}
}

function drawLine(startX, startY, endX, endY) {
	ctx.strokeStyle = "#FFFFFF";
	ctx.lineCap = 'round';
	ctx.lineWidth = 0.5;
	ctx.globalAlpha = 0.4;

	ctx.beginPath();
	ctx.moveTo(startX, startY);
	ctx.lineTo(endX, endY);
	ctx.stroke();
}

// Listen for mouse movements
let mouse = {
	x: 0,
	y: 0,
	isDown: false
}

canvas.addEventListener("mousedown", e => {
	mouse.isDown = true;
	mouse.x = e.offsetX;
	mouse.y = e.offsetY;
	reset();
})

canvas.addEventListener("mousemove", e => {
	mouse.x = e.offsetX;
	mouse.y = e.offsetY;

	if (mouse.isDown) {
		mouseXPositions.push(mouse.x - (canvas.width * 0.5));
		mouseYPositions.push(mouse.y - (canvas.height * 0.5));

		if (state == "draw") {
			wave.push({
				x: mouse.x - (canvas.width * 0.5),
				y: mouse.y - (canvas.height * 0.5)
			})
		}
	}

})

canvas.addEventListener("mouseup", e => {
	mouse.isDown = false;
	mouse.x = e.offsetX;
	mouse.y = e.offsetY;

	if (state == "draw") {
		state = "transform";
	}
})

canvas.addEventListener("touchstart", e => {
	mouse.isDown = true;
	mouse.x = e.touches[0].clientX;
	mouse.y = e.touches[0].clientY;

	reset();
})

canvas.addEventListener("touchmove", e => {

	mouse.x = e.touches[0].clientX;
	mouse.y = e.touches[0].clientY;

	if (mouse.isDown) {
		mouseXPositions.push(mouse.x - (canvas.width * 0.5));
		mouseYPositions.push(mouse.y - (canvas.height * 0.5));

		if (state == "draw") {
			wave.push({
				x: mouse.x - (canvas.width * 0.5),
				y: mouse.y - (canvas.height * 0.5)
			})
		}
	}

})

canvas.addEventListener("touchend", e => {
	mouse.isDown = false;
	mouse.x = e.changedTouches[0].clientX;
	mouse.y = e.changedTouches[0].clientY;

	if (state == "draw") {
		state = "transform";
	}
})

// Listen for scrollwheel
window.addEventListener("wheel", e => {
	scroll.yPosition -= e.deltaY * 0.5;
});

function scrollMouse(delta) {
	scroll.y = lerp(scroll.y, scroll.yPosition, delta * 10);
}

function lerp( a, b, alpha ) {
	return a + alpha * ( b - a );
}


document.getElementById("modeSelect").addEventListener("change", e => {
	state = document.getElementById("modeSelect").value;

	wave = [];
	waveComponents = [];

	scroll.x = 0;
	scroll.y = 0;

	scroll.yPosition = 0;
	scroll.xPosition = 0;

	time = 0;
})


// Game Loop
let state = "draw";

let fourierXData = [];
let fourierYData = [];

let mouseXPositions = [];
let mouseYPositions = [];

let lastDate = 0;
let timeStep = 0;

function reset() {
	state = "draw";

	fourierXData = [];
	fourierYData = [];

	mouseXPositions = [];
	mouseYPositions = [];

	waveComponents = [];

	scroll.x = 0;
	scroll.y = 0;

	scroll.yPosition = 0;
	scroll.xPosition = 0;

	wave = [];

	time = 0;
}

function loop(t) {
	// Clear and colour canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = "#131313";
	ctx.globalAlpha = 1;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	let deltaTime = (t - lastDate) / 1000;
	lastDate = t;

	if (state == "draw") {
		drawWave(wave, 0, 0);
	}
	else if (state == "transform") {
		// Transform the mouse x and y positions
		wave = [];

		fourierXData = dft(mouseXPositions);
		fourierYData = dft(mouseYPositions);

		timeStep = (2 * Math.PI) / mouseXPositions.length;

		state = document.getElementById("modeSelect").value;
	}
	else if (state == "render") {
		// Render epiCycles and draw user input
		// y positions are outputs - y then x axis
		let left = epiCycles(100, canvas.height / 2, fourierYData, Math.PI * 0.5);
		let top = epiCycles(canvas.width / 2, 100, fourierXData, 0);

		let pointPosition = {
			x: top.x,
			y: left.y
		}

		drawLine(top.x, top.y, pointPosition.x, pointPosition.y);
		drawLine(left.x, left.y, pointPosition.x, pointPosition.y);

		wave.push({
			x: top.x - (canvas.width * 0.5),
			y: left.y - (canvas.height * 0.5)
		})

		drawWave(wave, 0, 0);

		time += timeStep;

		if (time > Math.PI * 2) {
			time = 0;
			wave = [];
		}

	}
	else if (state == "graphs") {
		let top = epiCycles(100, 100, fourierXData, Math.PI * 0.5);
		let left = epiCycles(100, canvas.height - 150, fourierYData, Math.PI * 0.5);

		wave.unshift({
			x: left.y - (canvas.height * 0.5),
			y: top.y - (canvas.height * 0.5)
		})

		drawGraph(wave, "y", 0, 0);
		drawGraph(wave, "x", 0, 0);

		drawLine(top.x, top.y, canvas.width / 2, wave[0].y + canvas.height / 2);
		drawLine(left.x, left.y, canvas.width / 2, wave[0].x + canvas.height / 2);

		time += timeStep;

		if (wave.length > 500) {
			wave.pop();
		}
	}
	else if (state == "xComponents") {
		scrollMouse(deltaTime);
		components(fourierXData, Math.PI * 0.5, "x");
		time += timeStep;
	}
	else if (state == "yComponents") {
		scrollMouse(deltaTime);
		components(fourierYData, Math.PI * 0.5, "y");
		time += timeStep;
	}

	requestAnimationFrame(loop);
}

loop();
