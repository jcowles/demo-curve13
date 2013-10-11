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
    //this.composer.film.uniforms['grayscale'].value = false;
    if (time > 14.4 && time < 15.8) {
        speed = 900*Math.cos(time);
        sizeAdj = 0;
        //this.composer.film.uniforms['grayscale'].value = true;
    } else if (time > 16.0 && time < 17.5) {
        this.ribbon.rotation.z = time;
        speed = 70000;
        sizeAdj = 90*this.progress;
    } else {
        this.ribbon.rotation.z = time;
        speed = 90000;
        sizeAdj = 90*this.progress;
    }

    var tracer = new this.ArcTracer(this.origin, this.size + sizeAdj, 0);
    tracer.iterations = 30;
    tracer.arc(0,0,this.progress*speed); // can flip either
    /*
    tracer.arc(0,1,90); // can only flip +y
    tracer.arc(-1,0,90); // can only flip -x
    tracer.arc(0,0,90); // can only flip y
    tracer.arc(0,0,90); // can only flip x
    tracer.arc(0,-1,90); // can only flip x
    */

    this.geom.update(new THREE.Vector3(0,0,1), 
                             tracer.points, 
                             [2.8],
                             0,
                             1);
    /*
    var geoRibbon = new F.PlanerRibbonGeometry(new THREE.Vector3(0,0,1), 
                             tracer.points, 
                             [2.8]);

    this.geom = geoRibbon;
    this.ribbon.setGeometry(geoRibbon);
    this.geom.buffersNeedUpdate = true;
    */
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

    var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
    dirLight.position.set( 0, 0, 1 ).normalize();
    this.scene.add( dirLight );

    this.composer = Circ.GetComposer(renderer, this.scene, this.camera);

    //
    // Add some geometry
    //

    this.lineGroup = new THREE.Object3D();

    //points = hilbert3D( new THREE.Vector3( 0,0,0 ), 200.0, 2, 0, 1, 2, 3, 4, 5, 6, 7 ),


    var count = 70;
    var offsetStep = 5;
    var offset = -1 * offsetStep * Math.floor(count/2);
    var flipColor = false;
    var tracer = null;

    for (var i = 0; i < count; i++) {
        tracer = new this.ArcTracer(this.origin, this.size, offset);
        offset += offsetStep;

        tracer.arc(0,0,90); // can flip either
        tracer.arc(0,1,90); // can only flip +y
        tracer.arc(-1,0,90); // can only flip -x
        tracer.arc(0,0,90); // can only flip y
        tracer.arc(0,0,90); // can only flip x
        tracer.arc(0,-1,90); // can only flip x

        flipColor = !flipColor;

        var mat = new THREE.MeshBasicMaterial( { opacity: 1.0, 
                                                color: flipColor ? 0x30D6FF : 0xFFFFFF,
                                                //vertexColors: THREE.VertexColors, 
                                                } ); //wireframe: true 

        var geoRibbon = new F.PlanerRibbonGeometry(new THREE.Vector3(0,0,1), 
                                 tracer.points, 
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
        mesh.scale.x = mesh.scale.y = mesh.scale.z = .3*5.5;
        /*
        mesh.position.x = 0;
        mesh.position.y = 0;
        mesh.position.z = 0;
        */

        if (offset == 0) {
            this.geom = geoRibbon;
            this.mat = mat;
            this.ribbon = mesh;
            this.lineGroup.add( mesh );
        }
    }

    this.scene.add(this.lineGroup);
}

// helper functions


// helper functions

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


F.Shots.CircleSpline_3.prototype = proto;
delete proto;
