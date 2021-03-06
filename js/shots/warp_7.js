// The Shots class is declared in shot.js

F.Shots.Warp_7 = function(duration, filenameA, filenameB) {
    F.Shot.call(this, "Warp_7", duration);
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
        new F.WarpSeries([CURVE_ARROW, CURVE_HEART]),
        ]);

    this.warpSeriesSet.seriesList[0].settings = new (function() {
        this.sinAmp = 0;
        this.sinFrq = 30;
        this.sinPhv = 0;
        this.spawnRate = 10;
        this.cornerAmp = 0;
        this.cornerNum = 0;
        })();

    this.warpSeriesSet.seriesList[0].setColor(new THREE.Color(0x0000FF));
    this.warpSeriesSet.seriesList[0].refIdx = 10;

    this.warpSeriesSet.setNeon(1);

    this.composer = this.warpSeriesSet.composer;

    //////////////////////

    this.progress = 0;
}

proto.onDraw = function(time, dt) {

    renderer.setClearColor(0, 1);

    //this.camera.rotation.z = lerp(this.progress, 0, 6);
    this.camera.position.z = lerp(this.progress, 2, 1.5);

    var boy = this.warpSeriesSet.seriesList[0];

    var triggerTime = 95.8;
    var endTime = triggerTime + 0.3;

    // XXX Do a more complicated mapping here
    this.warpSeriesSet.setTime(smoothMap(94.3, 94.7+0.9, 0, 1, time) + Math.max(0, time - endTime));

    if (time > triggerTime) {
        this.warpSeriesSet.seriesList[0].refIdx = 500;

        //boy.setPos(new THREE.Vector3(0, 0, 0));

        //boy.settings.sinAmp = 0.5;
        //boy.settings.sinFrq = 75;

        boy.settings.sinAmp = smoothMap(triggerTime, endTime,
                                        0.0, 0.3, time);

        boy.settings.sinPhv = smoothMap(triggerTime, triggerTime+1,
                                        1, 5, time);
        
        boy.setSize(smoothMap(triggerTime, endTime,
                                        1, 2, time));
    }

    boy.setRot(0);
    boy.setPos(new THREE.Vector3(0, 0, 0));
}

proto._initWarp = function() {
}

F.Shots.Warp_7.prototype = proto;
delete proto;


