// The Shots class is declared in shot.js

F.Shots.CircleSpline_4 = function(duration) {
    F.Shot.call(this, "CircleSpline_4", duration);
    this.lineGroup = null;
    this.geom = null;
    this.mat = null;
    this.ribbon = null;
    this.ribbons = [];
    this.points = [];
    this.origin  = new THREE.Vector2(100, -400);
    this.size = 200;
    this.rgbAmt = 0;
    this.reverse = false;

    this.settings = new (function() {
        this.rotateX = 0;
        this.rotateY = 0;
        this.camX = -1000;
        this.camY = -400;
        this.camZ = 1000;
        this.hue = .6;
        this.vinOff = .7;
        this.vinDark = 0.2;
    })();

    var me = this;
    this.seperator = new OnBeat(
                [28, 
                 29.3, 29.6, 
                 31.0, 31.2, 31.5, 31.7, 
                 33.3],
                function(time) { me.rgbAmt = .09; },
                function(time) {
                    me.rgbAmt = Math.max(0, me.rgbAmt*.8) + .001*Math.sin(time*40);
                });
};

proto = Object.create(F.Shot.prototype);

proto.onDraw = function(time, dt) {
    if (time > 34 && time < 39) 
        this.reverse = true;

    this.rgb.uniforms[ 'amount' ].value = 1.0;

    if (this.vignette) {
        this.vignette.uniforms[ "offset" ].value = this.settings.vinOff;
        this.vignette.uniforms[ "darkness" ].value = this.settings.vinDark;
    }

    if (this.rgb) {
        this.seperator.hit(time);
        this.rgb.uniforms[ 'amount' ].value = this.rgbAmt;
        if (time > 87 && time < 97) {
            this.rgb.uniforms[ 'amount' ].value = .09*Math.sin(100*Math.sin(time*10)*Math.sin(time*2));
        }
    }

    renderer.setClearColor(CircleSplineBg, 1);

    this.camera.position.x = -200 + this.progress*-1300; 
    this.camera.position.y = this.settings.camY;
    this.camera.position.z = 800;

    this.lineGroup.rotation.x = this.settings.rotateX;
    this.lineGroup.rotation.y = this.settings.rotateY;

    var me = this;
    var t = this.progress * 90*9;
    var x, y;
    this.ribbons.forEach(function(ribbonMesh, index) {
        var tracer = new Circ.ArcTracer(me.origin, me.size, ribbonMesh.ribbonOffset);
        tracer.iterations = 3;
        var ti = t*4 - ribbonMesh.ribbonOffset;
        if (ti < 0)
            ti = 0;
        if (ti == 0)
            ti = .001;

        me.arcDriver(tracer, ti, time);
        if (x == 0) {
            x = tracer.points[tracer.points.length - 1].x;
            y = tracer.points[tracer.points.length - 1].y;
        }
        
        ribbonMesh.geometry.vertices = tracer.points;
        ribbonMesh.geometry.verticesNeedUpdate = true;
    });
}

proto.arcDriver = function(tracer, angle, time) {
    var state = { lock: false,
              angle: angle,
              time: time};

    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,1,90,state);
    Circ.applyAngle(tracer,-1,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,-1,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,-1,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,-1,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,1,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,-1,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,1,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,-1,0,90,state);
}

proto.getGui = function() {
    //
    // GUI Init
    //
    var gui = new dat.GUI();
    gui.add(this.settings, 'rotateX', -Math.PI, Math.PI);
    gui.add(this.settings, 'rotateY', -Math.PI, Math.PI);
    gui.add(this.settings, 'camX', -10000, 10000);
    gui.add(this.settings, 'camY', -10000, 10000);
    gui.add(this.settings, 'camZ', -10000, 10000);
    gui.add(this.settings, 'vinOff', -2, 4);
    gui.add(this.settings, 'vinDark', 0, 10);

    return gui;
}

proto.onPreload = function() {
    // 
    // Setup Camera & Scene
    //
    this.camera = new THREE.PerspectiveCamera( 75, 
                                window.innerWidth / window.innerHeight, 
                                1, 10000 );
    this.camera.position.z = 1000;
    this.scene = new THREE.Scene();

    // 
    // Setup composer
    //
    this.composer = Circ.GetComposer(renderer, this.scene, this.camera);
    this.rgb = this.composer.rgb; 

    //
    // Add some geometry
    //
    this.lineGroup = new THREE.Object3D();

    var count = 70;
    var offsetStep = 5;
    var offset = -1 * offsetStep * Math.floor(count/2);
    var flipColor = false;
    var tracer = null;

    for (var i = 0; i < count; i++) {
        tracer = new Circ.ArcTracer(this.origin, this.size, offset);

        this.arcDriver(tracer, 9000, 0);
        flipColor = !flipColor;

        var mat = new THREE.LineBasicMaterial( { opacity: 1.0, 
                                                color: flipColor ? csLineA: csLineB,
                                                linewidth: 3 
                                                } ); 

        var geoRibbon = new THREE.Geometry();
        geoRibbon.vertices = tracer.points;

        this.points.push(tracer.points);

        var line, p, scale = 0.3*5.5, d = 10;
        var mesh = new THREE.Line(geoRibbon, mat);
        mesh.scale.x = mesh.scale.y = mesh.scale.z = .3*5.5;
        mesh.position.x = d;
        mesh.position.y = d;
        mesh.position.z = 0;
        mesh.ribbonOffset = offset;

        if (offset == 0) {
            this.geom = geoRibbon;
            this.mat = mat;
            this.ribbon = mesh;
        }
        this.lineGroup.add( mesh );
        this.ribbons.push(mesh);

        offset += offsetStep;
    }

    this.scene.add(this.lineGroup);
}

F.Shots.CircleSpline_4.prototype = proto;
delete proto;
