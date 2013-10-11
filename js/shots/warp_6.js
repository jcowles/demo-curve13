// The Shots class is declared in shot.js

F.Shots.Warp_6 = function(duration, filenameA, filenameB) {
    F.Shot.call(this, "Warp_6", duration);
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
        new F.WarpSeries([CURVE_BABE]),
        ]);

    this.warpSeriesSet.seriesList[0].settings = new (function() {
        this.sinAmp = 0.3;
        this.sinFrq = 30;
        this.sinPhv = 8;
        this.spawnRate = 0;
        this.cornerAmp = 0;
        this.cornerNum = 0;
        })();

    this.warpSeriesSet.seriesList[0].setColor(new THREE.Color(0xFF00FF));

    this.warpSeriesSet.setNeon(1);

    this.composer = this.warpSeriesSet.composer;

    //////////////////////

    this.progress = 0;
}

proto.onDraw = function(time, dt) {

    renderer.setClearColor(0, 1);

    //this.camera.rotation.z = lerp(this.progress, 0, 6);
    this.camera.position.z = lerp(this.progress, 2, 1.5);

    // XXX Do a more complicated mapping here
    this.warpSeriesSet.setTime(this.progress);

    var girl = this.warpSeriesSet.seriesList[0];
    
    girl.setRot(0);
    girl.setPos(new THREE.Vector3(0, -0.2, 0));
    girl.setSize(1.5);

    var triggerTime = 77.1;
    var endTime = triggerTime + 0.5;
    if (time > triggerTime) {
        //girl.setPos(new THREE.Vector3(0, 0, 0));

        //girl.settings.sinAmp = 0.5;
        //girl.settings.sinFrq = 75;

        girl.settings.sinAmp = smoothMap(triggerTime, endTime,
                                        0.3, 0.01, time);

        girl.setSize(smoothMap(triggerTime, endTime,
                                        1.5, 1, time));
    }
    
}

proto._initWarp = function() {
}

F.Shots.Warp_6.prototype = proto;
delete proto;


