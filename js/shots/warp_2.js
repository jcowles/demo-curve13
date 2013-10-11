// The Shots class is declared in shot.js

F.Shots.Warp_2 = function(duration, filenameA, filenameB) {
    F.Shot.call(this, "Warp_2", duration);

    this.settings = new (function() {
        this.sinAmp = 0.01;
        this.sinFrq = 12;
        this.sinPhv = 16;
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
        ]);

    for (var i = 0; i < this.warpSeriesSet.seriesList.length; i++) {
        this.warpSeriesSet.seriesList[i].settings = this.settings;
    };

    this.warpSeriesSet.seriesList[0].setColor(new THREE.Color(0xAAAAFF));

    this.composer = this.warpSeriesSet.composer;

    //////////////////////

    this.progress = 0;
}

proto.onDraw = function(time, dt) {

    var black = new THREE.Color(0x000022);

    // XXX Do a more complicated mapping here
    this.warpSeriesSet.setTime(this.progress);

    var y = linMap(0,1,  1,-1.5,this.progress) +
        0.1*Math.sin(this.progress*40)
        ;

    var x = -1 + lerp(this.progress, 0, 1) + 0.1*Math.sin(this.progress*40);

    ///
    var warp = this.warpSeriesSet.seriesList[0];
    warp.setPos(new THREE.Vector3(0, -1, 0));

    warp.setRot(30);

    var color = new THREE.Color(0x5555FF);
    var gray = new THREE.Color(0x1122);
        
    if (time > 55.7) {
        renderer.setClearColor(0, 1);
        this.warpSeriesSet.setNeon(1);
        warp.settings.spawnRate = 10;
    } else {
        color.lerp(black, this.progress * (Math.sin(this.progress*40)+1) );
        renderer.setClearColor(black, 1);
        this.warpSeriesSet.setNeon(0);
    }

    warp.setColor(color);
}

proto._initWarp = function() {
}

F.Shots.Warp_2.prototype = proto;
delete proto;


