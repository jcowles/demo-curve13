// The Shots class is declared in shot.js

F.Shots.Warp_9 = function(duration, filenameA, filenameB) {
    F.Shot.call(this, "Warp_9", duration);
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
        new F.WarpSeries([CURVE_FLAME, CURVE_HEART]),
        ]);

    this.warpSeriesSet.seriesList[0].settings = new (function() {
        this.sinAmp = 0;
        this.sinFrq = 17;
        this.sinPhv = 8;
        this.spawnRate = 0;
        this.cornerAmp = 0;
        this.cornerNum = 0;
        })();

    this.warpSeriesSet.seriesList[0].setColor(new THREE.Color(0x0000FF));
    this.warpSeriesSet.seriesList[0].refIdx = 204;

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

    var triggerTime = 107;
    var endTime = triggerTime + 4;


    var red = new THREE.Color(0xFF0000);
    var yellow = new THREE.Color(0xFFFFFF);

        color = new THREE.Color();
        color.copy(red);
        var t = (Math.sin(time*24)+1)/2;
        color.lerp(yellow, t*t);
        boy.setColor(color);

        boy.settings.sinAmp = lerp(t*t, 0, 0.03) + smoothMap(110,113.5, 0, 15, time);


        boy.settings.spawnRate = 20;        

    // XXX Do a more complicated mapping here
    this.warpSeriesSet.setTime(linMap(triggerTime, endTime, 0, 1,time));


        boy.setSize(smoothMap(110,113.5, 1, 40, time));

    boy.setRot(0);
    boy.setPos(new THREE.Vector3(0, 0, 0));
}

proto._initWarp = function() {
}

F.Shots.Warp_9.prototype = proto;
delete proto;


