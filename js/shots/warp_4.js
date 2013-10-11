// The Shots class is declared in shot.js

F.Shots.Warp_4 = function(duration, filenameA, filenameB) {
    F.Shot.call(this, "Warp_4", duration);
};

proto = Object.create(F.Shot.prototype);

proto.getGui = function() {
}

proto.onPreload = function() {

    this.camera = new THREE.PerspectiveCamera( 80, 
                                window.innerWidth / window.innerHeight, 
                                1, 10000 );
    //this.camera.position.x = 2;
    this.camera.position.z = 2;
    //this.camera.rotation.y = 0.7;

    //////////////////////

    
    this.warpSeriesSet = new F.WarpSeriesSet(this.camera, [
        new F.WarpSeries([CURVE_ARROW]),
        new F.WarpSeries([CURVE_ARROW]),
        ]);

    for (var i = 0; i < this.warpSeriesSet.seriesList.length; i++) {
        this.warpSeriesSet.seriesList[i].settings = new (function() {
            this.sinAmp = 0.01;
            this.sinFrq = 12;
            this.sinPhv = 8;
            this.spawnRate = 0;
            this.cornerAmp = 0;
            this.cornerNum = 0;
            })();


    };

    this.warpSeriesSet.seriesList[0].setColor(new THREE.Color(0x0000FF));
    this.warpSeriesSet.seriesList[1].setColor(new THREE.Color(0xFF00FF));

    this.warpSeriesSet.setNeon(1);

    this.composer = this.warpSeriesSet.composer;

    //////////////////////

    this.progress = 0;
}

proto.onDraw = function(time, dt) {

    renderer.setClearColor(0, 1);

    this.camera.rotation.z = lerp(this.progress, 0, 6);

    // XXX Do a more complicated mapping here
    this.warpSeriesSet.setTime(this.progress);

    boy = this.warpSeriesSet.seriesList[0];
    girl = this.warpSeriesSet.seriesList[1];
    
    boy.setRot(-90);
    boy.setPos(new THREE.Vector3(-1.2, 0, 0));

    girl.setRot(90);
    girl.setPos(new THREE.Vector3(1.2, 0, 0));
    girl.settings.sinFrq = 30;

    var triggerTime = 67.7;
    var endTime = 69.8;
    if (time > triggerTime) {
        //var endTime = this.startTime + this.duration;
        var x = smoothMap(triggerTime, endTime,
                          -1.2, 0.8, time);
        boy.setPos(new THREE.Vector3(x, 0, 0));
        girl.setPos(new THREE.Vector3(-x, 0, 0));

        //boy.settings.sinAmp = 0.5;
        //boy.settings.sinFrq = 75;

        boy.settings.sinAmp = smoothMap(triggerTime, endTime,
                                        0.01, 0.2, time);

        girl.settings.sinAmp = smoothMap(triggerTime, endTime,
                                        0.01, 0.3, time);

        boy.setSize(smoothMap(triggerTime, endTime,
                                        1, 1.5, time));

        girl.setSize(smoothMap(triggerTime, endTime,
                                        1, 1.5, time));
    }
    
}

proto._initWarp = function() {
}

F.Shots.Warp_4.prototype = proto;
delete proto;


