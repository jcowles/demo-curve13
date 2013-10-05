
//
// An object for storing shots
//
F.Shots = {};

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
}


F.Shot.prototype = {
    onPreload: function() {
    },
    
    onBegin: function() {
    },

    onEnd: function() {
    },

    onDraw: function(time, dt) {
    }
};

