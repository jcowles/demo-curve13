// The Shots class is declared in shot.js

F.Shots.CircleSpline_1 = function(duration) {
    F.Shot.call(this, "CircleSpline_1", duration);
    this.lineGroup = null;
    this.geom = null;
    this.mat = null;
    this.ribbon = null;
    this.ribbons = [];
    this.points = [];
    this.origin  = new THREE.Vector2(100, -400);
    this.size = 200;
    this.tracer = new Circ.ArcTracer();

    this.settings = new (function() {
        this.rotateX = -.5;
        this.rotateY = 0.0;
        this.camX = 0;
        this.camY = -200;
        this.camZ = 550;
        this.hue = .6
    })();
};

proto = Object.create(F.Shot.prototype);

proto.onDraw = function(time, dt) {
    var me = this;
    renderer.setClearColor(CircleSplineBg, 1);

    if (time > 78 && time < 85) {
        this.composer.setTiltEnabled(true);
    } else {
        this.composer.setTiltEnabled(false);

    }

    this.camera.position.x = this.settings.camX;
    this.camera.position.y = this.settings.camY;
    this.camera.position.z = this.settings.camZ;

    this.lineGroup.rotation.x = -(this.progress - .1);
    this.lineGroup.rotation.y = this.settings.rotateY;
    this.lineGroup.rotation.z = Math.sin(this.progress * Math.PI);

    time = this.progress*190*10;
    var normal = new THREE.Vector3(0,0,1);

    this.ribbons.forEach(function(ribbonMesh, index) {
        var p_cutoff = (Math.cos(me.progress*10)*.5 + .5) * (70*5);
        var n_cutoff = -1 * ((Math.sin(me.progress*10)*.5 + .5) * (70*5));
        if (ribbonMesh.ribbonOffset > 0 &&
            ribbonMesh.ribbonOffset > p_cutoff) {
            ribbonMesh.visible = false;
            return;
        }
        if (ribbonMesh.ribbonOffset < 0 &&
            ribbonMesh.ribbonOffset < n_cutoff) {
            ribbonMesh.visible = false;
            return;
        }
        
        ribbonMesh.visible = true;
        ribbonMesh.geometry.update(normal, 
                                 me.points[index], 
                                 [2.8],
                                 me.progress*.5,
                                 me.progress+.00000001);
        ribbonMesh.frustumCulled = false;

    });
}

proto.arcDriver = function (tracer, angle) {
    var state = { lock: false,
              angle: angle };

    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,1,90,state);
    Circ.applyAngle(tracer,-1,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,-1,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,1,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
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
        tracer.iterations = csIters;
        this.arcDriver(tracer, 90*12);

        flipColor = !flipColor;

        var mat = new THREE.MeshBasicMaterial( { opacity: 1.0, 
                                                color: flipColor ? csLineA : csLineB,
                                                } ); 

        var geoRibbon = new F.PlanerRibbonGeometry(new THREE.Vector3(0,0,1), 
                                 tracer.points, 
                                 [2.8]);
        this.points.push(tracer.points);

        var line, p, scale = 0.3*5.5, d = 10;
        var mesh = new THREE.Mesh(geoRibbon, mat);
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

F.Shots.CircleSpline_1.prototype = proto;
delete proto;
