// The Shots class is declared in shot.js

F.Shots.Warp_1 = function(duration, filenameA, filenameB) {
    F.Shot.call(this, "Warp_1", duration);

    this.settings = new (function() {
        this.sinAmp = 0.0;
        this.sinFrq = 0;
        this.sinPhv = 0;
        this.spawnRate = 0;
        this.cornerAmp = 0;
        this.cornerNum = 0;
    })();

};

proto = Object.create(F.Shot.prototype);

proto.getGui = function() {
    //
    // GUI Init
    //
    
    var gui = new dat.GUI();
    gui.add(this.settings, 'sinAmp', 0, 1.1);
    gui.add(this.settings, 'sinFrq', 0, 160.1);
    gui.add(this.settings, 'sinPhv', 0, 160.1);
    gui.add(this.settings,"spawnRate",  0, 100.1);
    gui.add(this.settings,"cornerAmp", 7,9.1);
    gui.add(this.settings,"cornerNum", 8,12.1);
    return gui;
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
        new F.WarpSeries([CURVE_ARROW]),
        new F.WarpSeries([CURVE_ARROW]),
        ]);

    for (var i = 0; i < this.warpSeriesSet.seriesList.length; i++) {
        this.warpSeriesSet.seriesList[i].settings = this.settings;
    };

    
    this.warpSeriesSet.seriesList[0].setColor(new THREE.Color(0xFF00FF));
    this.warpSeriesSet.seriesList[1].setColor(new THREE.Color(0x00FFFF));

    this.composer = this.warpSeriesSet.composer;

    //////////////////////

    this.progress = 0;
}

proto.onDraw = function(time, dt) {

    renderer.setClearColor(0, 1);

    // XXX Do a more complicated mapping here
    this.warpSeriesSet.setTime(this.progress);

    this.warpSeriesSet.seriesList[0].setRot(-90);
    this.warpSeriesSet.seriesList[0].setPos(
        vlerp(this.progress,
            new THREE.Vector3(-2,1,0),
            new THREE.Vector3(20,1,0) ) );

    this.warpSeriesSet.seriesList[1].setRot(90);
    this.warpSeriesSet.seriesList[1].setPos(
        vlerp(this.progress,
            new THREE.Vector3(2,-1,0),
            new THREE.Vector3(-20,-1,0) ) );

    this.warpSeriesSet.seriesList[2].setRot(180);
    this.warpSeriesSet.seriesList[2].setPos(
        vlerp(this.progress,
            new THREE.Vector3(1,2,0),
            new THREE.Vector3(1,-20,0) ) );

    this.warpSeriesSet.seriesList[3].setRot(0);
    this.warpSeriesSet.seriesList[3].setPos(
        vlerp(this.progress,
            new THREE.Vector3(-1,-2,0),
            new THREE.Vector3(-1,20,0) ) );

    this.warpSeriesSet.setNeon(0);
}

proto._initWarp = function() {
}

F.Shots.Warp_1.prototype = proto;
delete proto;


