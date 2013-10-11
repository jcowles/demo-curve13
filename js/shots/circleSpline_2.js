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
    this.lineGroup.rotation.y += .05*Math.cos(Math.sin(time)); //this.settings.rotateY;
    /*
    */

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

proto.foo = function(tracer, a, b, max, state) {
    if (state.angle < max) {
        tracer.arc(a,b,state.angle,state.lock);
        state.lock = true;
    } else {
        tracer.arc(a,b,max,state.lock);
        state.angle -= max;
    }
    return state;
}

proto.arcDriver = function (tracer, angle) {
    var state = { lock: false,
              angle: angle };

    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,1,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);

    /*
    tracer.arc(0,1,90); // can only flip +y
    tracer.arc(-1,0,90); // can only flip -x
    tracer.arc(0,0,90); // can only flip y
    tracer.arc(0,0,90); // can only flip x

    tracer.arc(0,0,90); // can only flip x
    tracer.arc(1,0,90); // can only flip x
    tracer.arc(0,0,90); // can only flip x
    tracer.arc(0,0,90); // can only flip x
    */
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

    //points = hilbert3D( new THREE.Vector3( 0,0,0 ), 200.0, 2, 0, 1, 2, 3, 4, 5, 6, 7 ),

    var points = [];
    var origin  = new THREE.Vector2(0, 0);
    var material = new THREE.LineBasicMaterial( { color: csLineB, opacity: 1, linewidth: 3, vertexColors: THREE.VertexColors } );

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
        //origin.x += 5;
        //origin.y += 5;
        tracer = new this.ArcTracer(origin, size, offset);
        offset += offsetStep;
        if (offset == 0)
            tcent = tracer;
        this.arcDriver(tracer, 9000);

        //tracer.arc(0,-1,90); // can only flip x
        /*
        */

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

        /*
        */
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

    /*
    var geometry = new F.PlanerRibbonGeometry(new THREE.Vector3(0,0,1), 
                             tcent.points, 
                             [20]);

    var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    var mesh = new THREE.Mesh( geometry, material );
    mesh.scale.x = mesh.scale.y = mesh.scale.z = .3*5.5;
    mesh.position.x = d;
    mesh.position.y = d;
    mesh.position.z = 0;
    this.lineGroup.add( mesh );
    */


    this.scene.add(this.lineGroup);
}

// helper functions
var DegToRad = (Math.PI/180);

proto.ArcTracer = function (origin, size, offset) {

    var DegToRad = (Math.PI/180);

    this.reset = function(origin, size, offset) {
        this.origin = origin; 
        this.size = size;
        this.offset = offset;
        this.xLoc = 0;
        this.yLoc = 0;
        this.xAngle = 0;
        this.yAngle = 0;
        this.points = [];
        this.t = 0;
        this.iterations = 3;
    };


    this.reset(origin, size, offset);

    this.arc = function (xAdj, yAdj, sweepDeg, lock) {
        lock = lock || false;
        var start = this.points.length == 0 ? 0 : 1;

        if (lock) {
            if (this.points.length == 0) {
                console.error("Unable to lock with zero points!");
            }
            // lock all generated verts to the last generated vertex
            var point = this.points[this.points.length-1];
            for (var i = start; i < this.iterations; i++) {
                this.points.push(point);
            }
            return;
        }

        var sweepRad = sweepDeg * DegToRad; 
        
        if (xAdj != 0) {
            this.xLoc += xAdj;
            this.xAngle += Math.PI * xAdj;
            this.offset *= -1;
        }
        if (yAdj != 0) {
            this.yLoc += yAdj;
            this.yAngle += Math.PI * yAdj;
            this.offset *= -1;
        }

        var size = this.size + this.offset;

        // subtract one to close the circle at angle = 360
        var dtheta = sweepRad / (this.iterations-1);

        for (var i = start; i < this.iterations; i++) {
            this.t += 1;
            var nextPoint = new THREE.Vector3(
                                this.origin.x + (this.xLoc*2*this.size) + size*Math.cos(this.xAngle+(i*dtheta)), 
                                this.origin.y + (this.yLoc*2*this.size) + size*Math.sin(this.yAngle+(i*dtheta)), 
                                10*Math.sin(2*Math.PI*this.t/229));
            this.points.push(nextPoint);
        }

        this.xAngle += sweepRad;
        this.yAngle += sweepRad;
    }
};

F.Shots.CircleSpline_2.prototype = proto;
delete proto;
