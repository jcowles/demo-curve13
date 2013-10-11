
//
// The Sequence object
//

F.Seq = function(renderer, audio) {
    var autostart = false;
    this.shots = [];
    this.shotIndex = -1;
    this.renderer = renderer;
    this.audio = audio;
    this.gui = null;
    this._lastTime = 0;
    this.offsetSecs = 0;
};

F.Seq.prototype = {
    isPlaying: function() {
        return !this.audio.paused;
    },

    play: function() {
        if (!this.shots.length) {
            warn("F.Seq cannot play: no shots added");
            return;
        }
        log("Playing");
        this.audio.currentTime = this.offsetSecs;
        this.audio.play();
    },

    pause: function() {
        log("Paused");
        this.audio.pause();
    },

    getTime: function() {
        return this._lastTime;
    },

    setShot: function(index) {
        // Update the old shot first
        if (this.shotIndex > -1) {
            curShot = this.shots[this.shotIndex];
            curShot.onEnd();
        }

        // Setup the new shot
        this.shotIndex = index;
        curShot = this.shots[this.shotIndex];
        // This overwrites the ideal start time with the actual start time.
        curShot.startTime = this.getTime(); 
        curShot.onBegin();
        if (this.gui)
            this.gui.destroy();
        delete this.gui;
        this.gui = curShot.getGui();
    },

    update: function() {
        if (!this.isPlaying())
            return;

        // Checkpoint the current time
        var newTime = this.audio.currentTime;
        var dt = newTime - this._lastTime;
        this._lastTime = newTime;

        if (this.shotIndex == -1) {
            this.setShot(0);
        }

        // Is this the last shot?
        if (this.shotIndex < this.shots.length - 1) {
            curShot = this.shots[this.shotIndex];
            nextShot = this.shots[this.shotIndex+1];

            if (this.getTime() >= nextShot.startTime) {
                this.setShot(this.shotIndex+1);
            }
        }

        curShot.progress = (this.getTime() - curShot.startTime) / curShot.duration;
        curShot.onDraw(this.getTime(), dt);

        // Render, optionally using the per-shot EffectComposer.
        if (curShot.composer != null) {
            this.renderer.clear();
            curShot.composer.render();
        } else {
            this.renderer.clear();
            this.renderer.render( curShot.scene, curShot.camera );
        }
    },

    addShots: function(shotEditList) {
        for (var i=0; i<shotEditList.length; i++) {
            shotEdit = shotEditList[i];

            shot = shotEdit[0];
            shot.startTime = shotEdit[1];

            if (i==shotEditList.length-1) {
                // It's the last shot, which runs til the song is over.
                shot.duration = this.audio.duration - shot.startTime;    
            } else {
                // It's not the last shot, so it runs til the next shot starts.
                shot.duration = shotEditList[i+1][1] - shot.startTime;
            }
            
            shot.seq = this;
            this.shots.push(shot);
        }
    },

    preload: function() {
        this.shots.forEach(function(shot) { shot.onPreload(); });
    },

    setOffset: function(offsetSecs) {
        this.offsetSecs = offsetSecs;
        this._lastTime = offsetSecs;
        var shotsElapsedTime = 0;
        for (var i=0; i<this.shots.length; i++) {
            if ((offsetSecs >= shotsElapsedTime) &&
                (offsetSecs < (shotsElapsedTime + this.shots[i].duration))) {

                this.setShot(i);

                log("Starting on shot " + i);

                return;
            }

            shotsElapsedTime += this.shots[i].duration;
        }
    }
};

