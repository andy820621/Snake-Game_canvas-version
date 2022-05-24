class Vector {
	constructor(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}
	move(x_Value, y_Value) {
		this.x += x_Value;
		this.y += y_Value;
		return this;
	}
	add(obj) {
		return new Vector(this.x + obj.x, this.y + obj.y);
	}
	sub(obj) {
		return new Vector(this.x - obj.x, this.y - obj.y);
	}
	mul(value) {
		return new Vector(this.x * value, this.y * value);
	}
	equal(value) {
		return this.x == value.x && this.y == value.y;
	}
	clone() {
		return new Vector(this.x, this.y);
	}
	set(newX, newY) {
		this.x = newX;
		this.y = newY;
		return this;
	}
	toString() {
		return `(${this.x}, ${this.y})`;
	}
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	angle() {
		return Math.atan2(this.y, this.x);
	}
}

let synth;

class Snake {
	constructor() {
		this.body = [];
		this.maxLength = 5;
		this.head = new Vector();
		this.speed = new Vector(1, 0);
		this.direction = "Right";
		this.setDirection(this.direction);
	}
	update() {
		let newHead = this.head.add(this.speed);
		this.body.push(this.head);
		this.head = newHead;
		while (this.body.length > this.maxLength) this.body.shift();
	}
	setDirection(dir) {
		let target;
		switch (dir) {
			case "Up":
				target = new Vector(0, -1);
				break;
			case "Down":
				target = new Vector(0, 1);
				break;
			case "Left":
				target = new Vector(-1, 0);
				break;
			case "Right":
				target = new Vector(1, 0);
				break;
		}
		if (
			!target.equal(this.speed) &&
			!target.equal(this.speed.mul(-1)) &&
			!this.head.add(target).equal(this.body[this.body.length - 1])
		)
			this.speed = target;
	}
	checkBoundary(box_amount_value) {
		let xInRange = 0 <= this.head.x && this.head.x < box_amount_value;
		let yInRange = 0 <= this.head.y && this.head.y < box_amount_value;
		return xInRange && yInRange;
	}
}
class Game {
	constructor() {
		this.boxWidth = 12;
		this.boxGap = 2;
		this.boxAmount = 40;
		this.speed = 30;
		this.snake = new Snake();
		this.foods = [];
		this.generateFood();
		this.init();
		this.start = false;
	}
	init() {
		this.canvas = document.querySelector("#mycanvas");

		this.canvas.width =
			this.boxWidth * this.boxAmount + this.boxGap * (this.boxAmount - 1);
		this.canvas.height = this.canvas.width;
		this.ctx = this.canvas.getContext("2d");
		this.render();
		setTimeout(() => this.update(), 1000 / this.speed);
	}
	startGame() {
		this.start = true;
		this.snake = new Snake();
		document.querySelector(".panel").classList.add("hide");
		this.playSound("C#5", -20);
		this.playSound("E5", -20, 200);
	}
	endGame() {
		this.start = false;
		document.querySelector(".panel").classList.remove("hide");
		document.querySelector("h2 span").textContent =
			(this.snake.maxLength - 5) * 10;
		this.playSound("A3");
		this.playSound("E2", -10, 200);
		this.playSound("A2", -10, 400);
	}
	getPosition(x, y) {
		return new Vector(
			x * this.boxWidth + (x - 1) * this.boxGap,
			y * this.boxWidth + (y - 1) * this.boxGap
		);
	}
	drawBlock(newVector, color) {
		this.ctx.fillStyle = color;
		let pos = this.getPosition(newVector.x, newVector.y);
		this.ctx.fillRect(pos.x, pos.y, this.boxWidth, this.boxWidth);
	}
	drawEffect(x, y) {
		let r = 2,
			pos = this.getPosition(x, y);
		let effect = () => {
			r++;
			this.ctx.strokeStyle = `rgba(255,0,0,${(100 - r) / 100})`;
			this.ctx.beginPath();
			this.ctx.arc(
				pos.x + this.boxWidth / 2,
				pos.y + this.boxWidth / 2,
				r,
				0,
				Math.PI * 2
			);
			this.ctx.stroke();

			if (r < 100) requestAnimationFrame(effect);
		};

		requestAnimationFrame(effect);
	}
	render() {
		this.ctx.fillStyle = "hsl(140 81% 8% / 0.24)";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		for (let i = 0; i < this.boxAmount; i++) {
			for (let j = 0; j < this.boxAmount; j++) {
				this.drawBlock(new Vector(i, j), "hsl(0 0% 100% / 0.08)");
			}
		}
		this.snake.body.forEach((snakePos, i) => {
			this.drawBlock(snakePos, "white");
		});
		this.foods.forEach((food) => this.drawBlock(food, "#E83015"));

		requestAnimationFrame(() => this.render());
	}
	generateFood() {
		let x = parseInt(Math.random() * this.boxAmount);
		let y = parseInt(Math.random() * this.boxAmount);
		this.foods.push(new Vector(x, y));
		this.drawEffect(x, y);
		this.playSound("E5", -20);
		this.playSound("A5", -20, 200);
	}
	update() {
		if (this.start) {
			this.playSound("A2", -20);
			this.snake.update();
			this.foods.forEach((food, i) => {
				if (this.snake.head.equal(food)) {
					this.snake.maxLength++;
					this.foods.splice(i, 1);
					this.generateFood();
				}
			});
			this.snake.body.forEach((bodyPos) => {
				if (this.snake.head.equal(bodyPos)) {
					this.endGame();
				}
			});
			if (!this.snake.checkBoundary(this.boxAmount)) this.endGame();
		}

		this.speed = Math.sqrt(this.snake.body.length) + 5;
		setTimeout(() => this.update(), 1000 / this.speed);
	}
	playSound(note, volume, when) {
		setTimeout(function () {
			synth = new Tone.Synth().toMaster();
			synth.volume.value = volume || -12;
			synth.triggerAttackRelease(note, "8n");
		}, when || 0);
	}
}

const game = new Game();

window.addEventListener("keydown", (e) => {
	game.snake.setDirection(e.key.replace("Arrow", ""));
});
document
	.querySelector(".start")
	.addEventListener("click", () => game.startGame());
