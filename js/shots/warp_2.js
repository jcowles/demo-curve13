// The Shots class is declared in shot.js

F.Shots.Warp_2 = function(duration, filenameA, filenameB) {
    F.Shot.call(this, "Warp_2", duration);

    this.settings = new (function() {
        this.sinAmp = 0.02;
        this.sinFrq = 24;
        this.sinPhv = 26;
        this.spawnRate = 10;
        this.cornerAmp = 1;
        this.cornerNum = 5;
    })();

};

proto = Object.create(F.Shot.prototype);

proto.getGui = function() {
    //
    // GUI Init
    //
    
    var gui = new dat.GUI();
    gui.add(this.settings, 'sinAmp', 0, 1);
    gui.add(this.settings, 'sinFrq', 0, 160);
    gui.add(this.settings, 'sinPhv', 0, 160);
    gui.add(this.settings,"spawnRate",  0, 100);
    gui.add(this.settings,"cornerAmp", 0,9);
    gui.add(this.settings,"cornerNum", 0,20);
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
        new F.WarpSeries([CURVE_HEART]),
        new F.WarpSeries([CURVE_ARROW]),
        ]);

    for (var i = 0; i < this.warpSeriesSet.seriesList.length; i++) {
        this.warpSeriesSet.seriesList[i].settings = this.settings;
    };

    this.composer = this.warpSeriesSet.composer;

    //////////////////////

    this.progress = 0;
}

proto.onDraw = function(time, dt) {

    renderer.setClearColor(0, 1);

    //this.warpSeriesSet.setColor(new THREE.Color(0xff44AA));

    // XXX Do a more complicated mapping here
    this.warpSeriesSet.setTime(this.progress);
}

proto._initWarp = function() {
}

F.Shots.Warp_2.prototype = proto;
delete proto;


