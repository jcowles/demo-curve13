// The Shots class is declared in shot.js

F.Shots.Warp_2 = function(duration, filenameA, filenameB) {
    F.Shot.call(this, "Warp_2", duration);

    this.settings = new (function() {
        this.sinAmp = 0.01;
        this.sinFrq = 21;
        this.sinPhv = 3;
    })();

};

proto = Object.create(F.Shot.prototype);

proto.getGui = function() {
    //
    // GUI Init
    //
    
    var gui = new dat.GUI();
    gui.add(this.settings, 'sinAmp', 0, 0.2);
    gui.add(this.settings, 'sinFrq', 0, 160);
    gui.add(this.settings, 'sinPhv', 0, 160);
    return gui;
}

proto.onPreload = function() {

    this.camera = new THREE.PerspectiveCamera( 75, 
                                window.innerWidth / window.innerHeight, 
                                1, 10000 );
    this.camera.position.z = 2;

    //////////////////////

    this.warpSeries = new F.WarpSeries(this.camera, [CURVE_STAR, CURVE_STAR, CURVE_BABE, CURVE_BABE, CURVE_STAR]);

    this.warpSeries.settings = this.settings;

    this.composer = this.warpSeries.composer;

    //////////////////////

    this.progress = 0;
}

proto.onDraw = function(time, dt) {

    renderer.setClearColor(0, 1);

    this.warpSeries.setColor(new THREE.Color(0xff44AA));

    // XXX Do a more complicated mapping here
    this.warpSeries.setTime(this.progress);
}

proto._initWarp = function() {
}

F.Shots.Warp_2.prototype = proto;
delete proto;


