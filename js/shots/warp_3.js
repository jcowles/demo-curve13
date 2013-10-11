// The Shots class is declared in shot.js

F.Shots.Warp_3 = function(duration, filenameA, filenameB) {
    F.Shot.call(this, "Warp_3", duration);

    this.settings = new (function() {
        this.sinAmp = 0.01;
        this.sinFrq = 12;
        this.sinPhv = 160;
        this.spawnRate = 0;
        this.cornerAmp = 8.2;
        this.cornerNum = 9;
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

    this.warpSeriesSet.seriesList[0].setColor(new THREE.Color(0x0000FF));

    // XXX Do a more complicated mapping here
    this.warpSeriesSet.setTime(this.progress);
}

proto._initWarp = function() {
}

F.Shots.Warp_3.prototype = proto;
delete proto;


