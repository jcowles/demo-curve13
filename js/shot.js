
//
// An object for storing shots
//
F.Shots = {};

//
// The Sequence object
//

F.Seq = function() {
    var autostart = false;
    this.clock = new THREE.Clock(autostart); 
    this.shots = [];
};

F.Seq.prototype = {
    play: function() {
        if (!this.shots.length) {
            warn("F.Seq cannot play: no shots added");
            return;
        }
        this.clock.start();
    },

    pause: function() {
        this.clock.stop();
    },

    update: function() {
        if (!this.clock.running)
            return;
    },

    addShot: function(shot) {
        this.shots.push(shot);
    }
};


//
// The Shot base class
//
F.Shot = function(name, duration) {
    log("Shots Fired: " + name);
    this.name = name;

    // The world time when the shot started, set by the renderer
    this.startTime = 0;

    // How long the shot will play for, set by the user
    this.duration = duration;

    // (worldTime - startTime) / duration
    this.progress = 0;
};


F.Shot.prototype = {
    onPreload: function() {
    },
    
    onBegin: function() {
    },

    onEnd: function() {
    },

    onDraw: function(time, lastTime, dt) {
    }
};



