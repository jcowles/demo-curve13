// The Shots class is declared in shot.js

F.Shots.Chase_1 = function(duration) {
    F.Shot.call(this, "Chase_1", duration);
    this.lineGroup = null;
    this.geom = null;
    this.mat = null;
    this.ribbon = null;
    this.ribbons = [];
    this.origin  = new THREE.Vector2(100, -400);
    this.size = 200;
    this.tracer = new F.ArcTracer();

    this.settings = new (function() {
        this.rotateX = .0;
        this.rotateY = 0.0;
        this.camX = 0;
        this.camRX = -0.3;
        this.camY = 90;
        this.camZ = 50;
        this.hue = .6
    })();
};

proto = Object.create(F.Shot.prototype);

proto.onDraw = function(time, dt) {
    var me = this;
    renderer.setClearColor(0, 1);

    this.camera.position.x = this.settings.camX;
    this.camera.position.y = this.settings.camY;
    this.camera.position.z = this.settings.camZ;
    this.camera.rotation.x = this.settings.camRX;

    this.lineGroup.rotation.x = this.settings.rotateX;
    this.lineGroup.rotation.y = this.settings.rotateY;
    //this.lineGroup.rotation.z = this.progress*4;

    /*
    time = this.progress*120*10;
    var normal = new THREE.Vector3(0,0,1);
    this.ribbons.forEach(function(ribbonMesh, index) {
        me.tracer.reset(me.origin, me.size, ribbonMesh.ribbonOffset)
        me.tracer.iterations = 20;
        t = (time - ribbonMesh.ribbonOffset) + Math.sin(me.progress * 2*Math.PI) * 100;
        if (t < 0) t = 0.001;
        me.arcDriver(me.tracer, t);
        
        ribbonMesh.geometry.update(normal, 
                                 me.tracer.points, 
                                 [2.8]);

    });
    var lastVert = this.ribbon.geometry.vertices[this.ribbon.geometry.vertices.length-1];
    //this.camera.position.x = lastVert.x;
    //this.camera.position.y = lastVert.y;
    */
}

function foo(tracer, a, b, max, state) {
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

    foo(tracer,0,0,90,state);
    foo(tracer,0,1,90,state);
    foo(tracer,-1,0,90,state);
    foo(tracer,0,0,90,state);
    foo(tracer,0,0,90,state);
    foo(tracer,0,-1,90,state);
    foo(tracer,0,0,90,state);
    foo(tracer,0,0,90,state);
    foo(tracer,0,0,90,state);
    foo(tracer,0,0,90,state);
}



proto.getGui = function() {
    //
    // GUI Init
    //
    var gui = new dat.GUI();
    gui.add(this.settings, 'rotateX', -Math.PI, Math.PI);
    gui.add(this.settings, 'rotateY', -Math.PI, Math.PI);
    gui.add(this.settings, 'camX', -10000, 10000);
    gui.add(this.settings, 'camRX', -5, 4);
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
    //this.camera.lookAt(THREE.Vector3(0,0,-1));
    this.scene = new THREE.Scene();

    var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
    dirLight.position.set( 0, 0, 1 ).normalize();
    this.scene.add( dirLight );

    //
    // Add some geometry
    //

    this.lineGroup = new THREE.Object3D();

    //points = hilbert3D( new THREE.Vector3( 0,0,0 ), 200.0, 2, 0, 1, 2, 3, 4, 5, 6, 7 ),


    var count = 1;
    var offsetStep = 5;
    var offset = -1 * offsetStep * Math.floor(count/2);
    var flipColor = false;
    var tracer = null;

    for (var i = 0; i < count; i++) {
        tracer = new THREE.Spline([
                            new THREE.Vector3(  0,0,0), 
                            new THREE.Vector3(  0,0,0),
                            new THREE.Vector3(  0,0,-100),
                            new THREE.Vector3(100,0,-100)]);
        var points = [];
        for (var i = 0; i < 100; i++) {
            var p = tracer.getPoint(i/100);
            points.push(new THREE.Vector3(p.x, p.y, p.z));
        }

        flipColor = !flipColor;

        var mat = new THREE.MeshBasicMaterial( { opacity: 1.0, 
                                                color: flipColor ? 0x30D6FF : 0xFFFFFF,
                                                //vertexColors: THREE.VertexColors, 
                                                //wireframe: true 
                                                } ); 

        var geoRibbon = new F.PlanerRibbonGeometry(new THREE.Vector3(0,1,0), 
                                 points, 
                                 [2.8]);
        /*
        geoRibbon.vertices.forEach(function(vert, j) {
            color = new THREE.Color( 0xff00ff );
            //if (flipColor)
            color.setHSL(0.6, 1.0, 0.5);
            geoRibbon.colors.push(color)
        });
        */

        //color: 0xff0000
        var line, p, scale = 0.3*5.5, d = 10;
        var mesh = new THREE.Mesh(geoRibbon, mat);
        //mesh.scale.x = mesh.scale.y = mesh.scale.z = .3*5.5;
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

F.Shots.Chase_1.prototype = proto;
delete proto;


// helper functions
var DegToRad = (Math.PI/180);

F.ArcTracer = function (origin, size, offset) {

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

        //log(sweepDeg);
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
                                10-(this.t/10));
            this.points.push(nextPoint);
        }

        //log(this.points[this.points.length-1])

        this.xAngle += sweepRad;
        this.yAngle += sweepRad;
    }
};

