
//
// An object for storing shots
//
F.Shots = {};

//
// The Shot base class
//
F.Shot = function(name) {
    log("Shots Fired: " + name);
    this.name = name;

    // The world time when the shot is supposed to start, set by the user
    // and later reset by the sequence when the shot really does start.
    this.startTime = 0;

    // (worldTime - startTime) / duration
    this.progress = 0;

    this.gui = null;

    // Unfettered access to the sequencer, renderer: careful.
    this.seq = null;
    this.renderer = null;
    this.composer = null;

    // Local scene
    this.scene = null;
    this.camera = null;
};


F.Shot.prototype = {
    onPreload: function() {
        log("Preload shot: " + this.name);
    },
    
    onBegin: function() {
        log(" ");
        log(this.name + ":");
        log("\tstart time: " + this.startTime.toFixed(3).toString());
    },

    onEnd: function() {
        t = seq.getTime() - this.startTime;
        t = t.toFixed(3);
        log("End shot: " + this.name); 
        log("\tran for " + t.toString() +
            " (" + ((this.duration - t) / this.duration * 100).toFixed(1).toString()  +
            " %err)");
        log("\tend time: " + this.seq.getTime().toFixed(3).toString());
    },

    onDraw: function(time, dt) {
    },

    getGui: function() {
        return null;
    }

};



