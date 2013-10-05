
//
// The Sequence object
//

F.Seq = function(renderer) {
    var autostart = false;
    this.shots = [];
    this.shotIndex = -1;
    this.renderer = renderer;
    this._clock = new THREE.Clock(autostart); 
};

F.Seq.prototype = {
    play: function() {
        if (!this.shots.length) {
            warn("F.Seq cannot play: no shots added");
            return;
        }
        this._clock.start();
    },

    pause: function() {
        this._clock.stop();
    },

    getTime: function() {
        return this._clock.elapsedTime;
    },

    update: function() {
        if (!this._clock.running)
            return;

        // Update the clock.
        // Careful: calling clock methods update its state.
        var dt = this._clock.getDelta();

        if (this.shotIndex == -1) {
            this.shotIndex = 0;
            curShot = this.shots[this.shotIndex];
            curShot.startTime = this.getTime();
            curShot.onBegin();
        }

        // Is this the last shot?
        if (this.shotIndex < this.shots.length - 1) {
            curShot = this.shots[this.shotIndex];
            shotTime = this.getTime() - curShot.startTime;
            if (shotTime >= curShot.duration) {
                this.shotIndex++;
                curShot.onEnd();
                curShot = this.shots[this.shotIndex];
                curShot.startTime = this.getTime();
                curShot.onBegin();
            }
        }

        curShot.progress = (this.getTime() - curShot.startTime) / curShot.duration;
        curShot.onDraw(this.getTime(), dt);

        this.renderer.render( curShot.scene, curShot.camera );
    },

    addShot: function(shot) {
        shot.seq = this;
        this.shots.push(shot);
    },

    preload: function() {
        this.shots.forEach(function(shot) { shot.onPreload(); });
    }
};

