// The Shots class is declared in shot.js

F.Shots.CircleSpline_3 = function(duration) {
    F.Shot.call(this, "CircleSpline_3", duration);
    this.lineGroup = null;
    this.geom = null;
    this.mat = null;
    this.ribbon = null;
    this.origin  = new THREE.Vector2(0, 0);
    this.size = 200;

    this.settings = new (function() {
        this.rotateX = 0;
        this.rotateY = 0;
        this.camX = 0;
        this.camY = 0;
        this.camZ = 1000;
        this.hue = .6
    })();

};

proto = Object.create(F.Shot.prototype);

proto.onDraw = function(time, dt) {
    renderer.setClearColor(CircleSplineBg, 0.5);
    this.camera.position.x = this.settings.camX;
    this.camera.position.y = this.settings.camY;
    this.camera.position.z = this.settings.camZ;
    this.lineGroup.rotation.x = this.settings.rotateX;
    this.lineGroup.rotation.y = this.settings.rotateY;

    var speed = 90000;
    var sizeAdj = 0;
    if (time > 14.4 && time < 15.8) {
        speed = 900*Math.cos(time);
        sizeAdj = 0;
    } else if (time > 16.0 && time < 17.5) {
        this.ribbon.rotation.z = time;
        speed = 70000;
        sizeAdj = 90*this.progress;
    } else {
        this.ribbon.rotation.z = time;
        speed = 90000;
        sizeAdj = 90*this.progress;
    }

    var tracer = new Circ.ArcTracer(this.origin, this.size + sizeAdj, 0);

    tracer.iterations = 30;
    tracer.arc(0,0,this.progress*speed); 

    this.geom.update(new THREE.Vector3(0,0,1), 
                             tracer.points, 
                             [2.8],
                             0,
                             1);
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
        offset += offsetStep;

        tracer.arc(0,0,90);
        tracer.arc(0,1,90);
        tracer.arc(-1,0,90);
        tracer.arc(0,0,90); 
        tracer.arc(0,0,90);
        tracer.arc(0,-1,90);

        flipColor = !flipColor;

        var mat = new THREE.MeshBasicMaterial({ 
                            opacity: 1.0, 
                            color: flipColor ? 0x30D6FF : 0xFFFFFF,
                            });

        var geoRibbon = new F.PlanerRibbonGeometry(new THREE.Vector3(0,0,1), 
                                 tracer.points, 
                                 [2.8]);
        var line, p, scale = 0.3*5.5, d = 10;
        var mesh = new THREE.Mesh(geoRibbon, mat);
        mesh.scale.x = mesh.scale.y = mesh.scale.z = .3*5.5;

        if (offset == 0) {
            this.geom = geoRibbon;
            this.mat = mat;
            this.ribbon = mesh;
            this.lineGroup.add( mesh );
        }
    }

    this.scene.add(this.lineGroup);
}

F.Shots.CircleSpline_3.prototype = proto;
delete proto;
