// The Shots class is declared in shot.js

/*
CircleSplineBg = 0xFFFFFF;
csLineA = 0x30D6FF;
csLineB = 0x333333;
*/
CircleSplineBg = 0x111111;
csLineA = 0x30D6FF;
csLineB = 0xFFFFFF;


F.Shots.CircleSpline_6 = function(duration) {
    F.Shot.call(this, "CircleSpline_6", duration);
    this.lineGroup = null;
    this.geom = null;
    this.mat = null;
    this.ribbon = null;
    this.ribbons = [];
    this.points = [];
    this.size = 250;
    this.origin  = new THREE.Vector2(this.size, -this.size);
    this.tracer = new this.ArcTracer();
    this.bounce = 0;
    this.N = 2;
    this.O = 100;
    this.progOff = 0;

    var me = this;
    this.onBounce = new OnBeat(
                [
                9.28, 
                9.9, 10.0, 
                10.76,
                11.8,
                12.6,
                13.4,
                14.2,
                //15.1,
                15.8,
                16.25, 16.3,

                18.0, 18.3, 18.5, 18.8,
                20.5, 20.8, 21.0, 21.3,
                ],
                function(time) { 
                    me.bounce = 1; 
                    me.progOff -= .01;
                },
                function(time) {
                    me.bounce= Math.max(0, me.bounce*.8) + .001*Math.sin(time*4);
                    if (me.bounce < .8) 
                        me.composer.setTiltEnabled(true);
                    if (me.bounce < .2)
                        me.composer.setTiltEnabled(false);
                });


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
    //this.composer.tiltV.enabled = false;
    //this.composer.tiltH.enabled = false;
    var me = this;
    this.onBounce.hit(time);
    renderer.setClearColor(CircleSplineBg, 1);

    /*
    this.camera.position.x = this.settings.camX;
    this.camera.position.y = this.settings.camY;
    this.camera.position.z = this.settings.camZ;
    */

    this.lineGroup.rotation.x = -(this.progress + .4); //this.settings.rotateX;
    this.lineGroup.rotation.y = this.settings.rotateY;
    var p = Math.max(0, this.progress - .2);
    this.lineGroup.rotation.z += this.bounce*.3 + p*(.07 + .05*Math.sin(this.progress *2* Math.PI)); //this.progress*4;

    this.lineGroup.scale.x = this.lineGroup.scale.y = this.lineGroup.scale.z = 1 + this.bounce;

    time = this.progress*190*10;
    var normal = new THREE.Vector3(0,0,1);

    this.ribbons.forEach(function(ribbonMesh, index) {
        /*
        var p_cutoff = (Math.cos(me.progress*10)*.5 + .5) * (me.N*me.O);
        var n_cutoff = -1 * ((Math.sin(me.progress*10)*.5 + .5) * (me.N*me.O));
        if (ribbonMesh.ribbonOffset > 0 &&
            ribbonMesh.ribbonOffset > p_cutoff) {
            ribbonMesh.visible = false;
            return;
        }
        if (ribbonMesh.ribbonOffset < 0 &&
            ribbonMesh.ribbonOffset < n_cutoff) {
            ribbonMesh.visible = false;
            return;
        }*/
        
        ribbonMesh.visible = true;
        //me.tracer.reset(me.origin, me.size, ribbonMesh.ribbonOffset)
        //me.tracer.iterations = 20;

        var w = 0;
        var prog = me.progress;
        if (ribbonMesh.ribbonOffset == 0) {
            w = 2.8 + 40*Math.sin(me.progress * me.bounce * Math.PI * 2) + 40;
        } else {
            w = 2.8 + 10*Math.sin(me.progress * me.bounce * Math.PI * 2) + 10;
            prog += me.progOff;
            prog = Math.max(0.0001, prog);
        }
        ribbonMesh.geometry.update(normal, 
                                 me.points[index], //me.tracer.points, 
                                 [w],
                                 0,//me.progress*3.9,
                                 Math.min(1,prog*4 +.00000001));
        ribbonMesh.frustumCulled = false;

    });
    var lastVert = this.ribbon.geometry.vertices[this.ribbon.geometry.vertices.length-1];
    //this.camera.position.x = lastVert.x;
    //this.camera.position.y = lastVert.y;
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
    this.foo(tracer,0,1,90,state);
    this.foo(tracer,-1,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,-1,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,1,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,1,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);


    /*
    this.foo(tracer,1,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,-1,90,state);

    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,1,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);
    */
    /*
    this.foo(tracer,1,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,0,0,90,state);
    this.foo(tracer,-1,0,90,state);
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

    // 
    // Setup composer
    //
    this.composer = Circ.GetComposer(renderer, this.scene, this.camera);
    this.rgb = composer.rgb; 
    this.composer.setTiltEnabled(true);; 
    this.composer.setTiltDepth(0.15);
    this.composer.setTiltBlur(4, 5);

   //
    // Add some geometry
    //

    this.lineGroup = new THREE.Object3D();

    //points = hilbert3D( new THREE.Vector3( 0,0,0 ), 200.0, 2, 0, 1, 2, 3, 4, 5, 6, 7 ),


    var count = this.N;
    var offsetStep = this.O;
    var offset = -1 * offsetStep * Math.floor(count/2);
    var tracer = null;

    for (var i = 0; i < count; i++) {
        tracer = new this.ArcTracer(this.origin, this.size, offset);
        tracer.iterations = 20;
        this.arcDriver(tracer, 90*200);


        var mat = new THREE.MeshBasicMaterial( { opacity: 1.0, 
                                                color: csLineB,
                                                //vertexColors: THREE.VertexColors, 
                                                //wireframe: true 
                                                } ); 

        var geoRibbon = new F.PlanerRibbonGeometry(new THREE.Vector3(0,0,1), 
                                 tracer.points, 
                                 [2.8]);
        this.points.push(tracer.points);
        
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
                                0);//10*Math.sin(2*Math.PI*this.t/70));
            this.points.push(nextPoint);
        }

        this.xAngle += sweepRad;
        this.yAngle += sweepRad;
    }
};


F.Shots.CircleSpline_6.prototype = proto;
delete proto;