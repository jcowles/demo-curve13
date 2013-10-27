// The Shots class is declared in shot.js

F.Shots.CircleSpline_2 = function(duration) {
    F.Shot.call(this, "CircleSpline_2", duration);
    this.lineGroup = null;
    this.geom = null;
    this.meshes = [];
    this.lines = [];

    this.settings = new (function() {
        this.rotateX = 0;
        this.rotateY = 0;
        this.hue = .6
    })();
};

proto = Object.create(F.Shot.prototype);

proto.onDraw = function(time, dt) {
    renderer.setClearColor(CircleSplineBg, 1);
    this.camera.position.x += Math.sin(time);
    this.camera.position.z += 10*Math.cos(time);

    this.lineGroup.rotation.x += this.settings.rotateX;
    this.lineGroup.rotation.y += .05*Math.cos(Math.sin(time));

    for (var i = 0; i < this.meshes.length; i++) {
        this.meshes[i].position.z = this.meshes[i].offset*.07 * this.progress;
        this.meshes[i].rotation.y = this.meshes[i].offset*.07 * this.progress;
    }

    for (var i = 0; i < this.lines.length; i++) {
        var p = Math.max(0, this.progress - .5);
        this.lines[i].position.z = this.meshes[i].offset*.07 * p;
        this.lines[i].rotation.y = this.meshes[i].offset*.07 * p;
    }
}

proto.getGui = function() {
    //
    // GUI Init
    //
    var gui = new dat.GUI();
    gui.add(this.settings, 'rotateX', -5, 5);
    gui.add(this.settings, 'rotateY', -5, 5);
    return gui;
}

proto.arcDriver = function (tracer, angle) {
    var state = { lock: false,
              angle: angle };

    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,1,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
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

    var points = [];
    var origin  = new THREE.Vector2(0, 0);
    var material = new THREE.LineBasicMaterial({ 
                        color: csLineB, 
                        opacity: 1, 
                        linewidth: 3, 
                        vertexColors: THREE.VertexColors });

    var count = 40;
    var size = 200;
    var offsetStep = 5;
    var offset = -1 * offsetStep * Math.floor(count/2);
    var flipColor = false;
    var tracer = null;
    var tcent = null;

    for (var i = 0; i < count; i++) {
        var geometry = new THREE.Geometry()
        this.geom = geometry;
        tracer = new Circ.ArcTracer(origin, size, offset);
        offset += offsetStep;
        if (offset == 0)
            tcent = tracer;
        this.arcDriver(tracer, 9000);

        points = tracer.points;

        colors = [];

        for (j = 0; j < points.length; j ++) {
            geometry.vertices.push(points[j]);
            colors[j] = new THREE.Color( csLineB );
            if (flipColor)
                colors[j].setHSL(0.6, 1.0, Math.max(0, ( 200 - points[j].z ) / 400) * 0.5 + 0.5);
        }
        geometry.colors = colors;
        flipColor = !flipColor;

        // lines
        var line, p, scale = 0.3*5.5, d = 10;
        parameters = []; 
        parameters.push([ material, scale, [d,d,0],  geometry ]);

        for ( k = 0; k < parameters.length; ++k ) {
            p = parameters[k];
            line = new THREE.Line( p[ 3 ],  p[ 0 ] );
            line.scale.x = line.scale.y = line.scale.z =  p[ 1 ];
            line.position.x = p[ 2 ][ 0 ];
            line.position.y = p[ 2 ][ 1 ];
            line.position.z = p[ 2 ][ 2 ];
            this.lineGroup.add(line);
            this.lines.push(line);
        }

        var geometry = new F.PlanerRibbonGeometry(new THREE.Vector3(0,0,1), 
                                 tracer.points, 
                                 [2]);

        var m = new THREE.MeshBasicMaterial( { 
                color: 0xff0000, 
                wireframe: true } );
        var mesh = new THREE.Mesh(geometry, m);
        mesh.scale.x = mesh.scale.y = mesh.scale.z = .3*5.5;
        mesh.position.x = d;
        mesh.position.y = d;
        mesh.position.z = 0;
        mesh.offset = offset;
        this.meshes.push(mesh);
        this.lineGroup.add( mesh );
    }

    this.scene.add(this.lineGroup);
}

F.Shots.CircleSpline_2.prototype = proto;
delete proto;
