var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var Input = require('./input.js');
var now = global.performance && global.performance.now ? function() {
    return performance.now()
} : Date.now || function () {
    return +new Date()
};

module.exports = Game;
inherits(Game, EventEmitter);

function Game(options) {
    this.setMaxListeners(1000);
    this.step = options.step || 1000/60;
    this.lastUpdate = 0;
    this.dt = 0;
    this.ticks = 0;
    
    this.input = new Input();
    this.input.on('keydown',this.keydown.bind(this));
    this.input.on('keyup',this.keyup.bind(this));
    this.centerMouseX = -999;
    this.centerMouseY = -999;
    this.entities = [];
    this.schedule = [];
    
    var self = this;
    this.interval = setInterval(function() {
        if(self.crashed) return;
        var rightNow = now();
        self.dt += rightNow - self.lastUpdate;
        //if((self.ticks & 7) == 0) console.log(delta);
        if(self.lastUpdate > 0 && self.dt > 60000) {
            console.log('too many updates missed! game crash...');
            self.crashed = true; self.paused = true;
        }
        if(self.dt > self.step) {
            while(self.dt >= self.step) {
                self.dt -= self.step; 
                if(self.paused) continue;
                self.ticks++; 
                self.update();
            }
        }
        self.lastUpdate = now();
    }, this.step);
}

var lastUpdateTime = 0;
Game.prototype.update = function() {
    var timeThis = this.timeUpdates && (this.ticks & 255) == 0;
    if(timeThis) console.time('update');
    //if(timeThis) console.log(this.mouseOver);
    //if(timeThis) var updateStart = now();
    //if(timeThis) console.log('entities:', this.entities.length);
    this.emit('update');
    for(var i = 0; i < this.schedule.length; i++) {
        var task = this.schedule[i];
        var endTick;
        if(task.type == 'repeat') {
            endTick = task.start + task.count;
            if(task.start <= this.ticks) {
                task.cb((this.ticks - task.start) / task.count)
            }
        } else {
            endTick = task.tick;
        }
        if(endTick <= this.ticks) {
            if(task.type == 'once') task.cb();
            this.schedule.splice(i,1);
            i--;
        }
    }
    this.emit('render');
    if(timeThis) console.timeEnd('update');
    //if(timeThis) var thisUpdateTime = now() - updateStart;
    //if(timeThis) var updateTimeChange = thisUpdateTime-lastUpdateTime;
    //if(timeThis && updateTimeChange <= 0) console.log('%c'+updateTimeChange, 'color: #00bb00');
    //if(timeThis && updateTimeChange > 0) console.log('%c'+updateTimeChange, 'color: #ff0000');
    //if(timeThis) lastUpdateTime = thisUpdateTime;
};

Game.prototype.bindCanvas = function(canvas) {
    this.input.bindCanvas(canvas);
    this.viewWidth = canvas.width;
    this.viewHeight = canvas.height;
    this.input.on('mousemove',this.mousemove.bind(this));
    this.input.on('mousedown',this.mousedown.bind(this));
    this.input.on('mouseup',this.mouseup.bind(this));
    this.input.on('mouseout',this.mouseout.bind(this));
    this.input.on('mouseover',this.mouseover.bind(this));
    this.input.on('mousewheel',this.mousewheel.bind(this));
    canvas.on('resize',this.viewResize.bind(this));
};

Game.prototype.viewResize = function(resize) {
    this.viewWidth = resize.width;
    this.viewHeight = resize.height;
    this.input.mouseScale = resize.scale;
};

Game.prototype.mousemove = function(mouseEvent) {
    if(this.mouseOut) return;
    //this.mouseOut = false;
    this.mouseX = mouseEvent.x;
    this.mouseY = mouseEvent.y;
    this.centerMouseX = Math.floor(mouseEvent.x - this.viewWidth / 2);
    this.centerMouseY = Math.floor(mouseEvent.y - this.viewHeight / 2);
    mouseEvent.centerMouseX = this.centerMouseX;
    mouseEvent.centerMouseY = this.centerMouseY;
    this.emit('mousemove',mouseEvent);
};

Game.prototype.mousedown = function(mouseEvent) {
    if(this.mouseOver) console.log(this.mouseOver);
    this.emit('mousedown',mouseEvent);
};

Game.prototype.mouseup = function(mouseEvent) {
    this.emit('mouseup',mouseEvent);
};

Game.prototype.mouseout = function(mouseEvent) {
    this.mouseOut = true;
    this.mouseOver = false;
    this.emit('mouseout',mouseEvent);
};

Game.prototype.mouseover = function(mouseEvent) {
    this.mouseOut = false;
    this.emit('mouseover',mouseEvent);
};

Game.prototype.mousewheel = function(mouseEvent) {
    this.emit('mousewheel',mouseEvent);
};

Game.prototype.keydown = function(keyEvent) {
    this.emit('keydown',keyEvent);
};

Game.prototype.keyup = function(keyEvent) {
    this.emit('keyup',keyEvent);
};