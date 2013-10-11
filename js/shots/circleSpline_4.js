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
                [9.5, 10.32, 11.13, 11.9, 12.6, 13.4, 14.29],
                function(time) {
                    log("hit: " + time)
                    me.rgb.uniforms[ 'amount' ].value = .09*Math.sin(100*Math.sin(time*10)*Math.sin(time*2));
                },
                function(time) {
                    me.rgb.uniforms[ 'amount' ].value = .0;
                });
};

proto = Object.create(F.Shot.prototype);

proto.onDraw = function(time, dt) {

    this.rgb.uniforms[ 'amount' ].value = 1.0;
    if (this.vignette) {
        this.vignette.uniforms[ "offset" ].value = this.settings.vinOff;
        this.vignette.uniforms[ "darkness" ].value = this.settings.vinDark;
    }
    if (this.rgb) {
        this.seperator.hit(time);
    }



    renderer.setClearColor(CircleSplineBg, 1);

    this.camera.position.x = -500 + this.progress*-1500; //this.settings.camX;
    this.camera.position.y = this.settings.camY;
    this.camera.position.z = 800;//1000+ 200*Math.sin(time/2);//dt*20;
    //this.camera.position.z = this.settings.camZ;

    this.lineGroup.rotation.x = this.settings.rotateX;
    this.lineGroup.rotation.y = this.settings.rotateY;

    var me = this;
    var t = this.progress * 90*9;
    var x, y;
    this.ribbons.forEach(function(ribbonMesh, index) {
        var tracer = new me.ArcTracer(me.origin, me.size, ribbonMesh.ribbonOffset);
        tracer.iterations = 3;
        var ti = t*4 - ribbonMesh.ribbonOffset;// + Math.cos(time*2)*90;
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
        /*
        ribbonMesh.geometry.update(new THREE.Vector3(0,0,1), 
                                 tracer.points, 
                                 [1]);
                                 */

    });


    //x = this.geom.vertices[this.geom.vertices.length - 1].x;
    //y = this.geom.vertices[this.geom.vertices.length - 1].y;
    //this.camera.position.x = .9* this.camera.position.x + .1 *x;//-500 + this.progress*-1500; //this.settings.camX;
    //this.camera.position.y = .9* this.camera.position.y + .1 *y;//-500 + this.progress*-1500; //this.settings.camX;
    //this.camera.position.x = x-500;//-500 + this.progress*-1500; //this.settings.camX;
    //this.camera.position.y = y;//-500 + this.progress*-1500; //this.settings.camX;

}

proto.applyTrace = function(tracer, a, b, max, state) {
    if (state.angle < max) {
        tracer.arc(a,b,state.angle,state.lock,state.time);
        state.lock = true;
    } else {
        tracer.arc(a,b,max,state.lock,state.time);
        state.angle -= max;
    }
    return state;
}

proto.arcDriver = function(tracer, angle, time) {
    var state = { lock: false,
              angle: angle,
              time: time};

    this.applyTrace(tracer,0,0,90,state);
    this.applyTrace(tracer,0,1,90,state);
    this.applyTrace(tracer,-1,0,90,state);
    this.applyTrace(tracer,0,0,90,state);
    this.applyTrace(tracer,0,0,90,state);
    this.applyTrace(tracer,0,-1,90,state);
    this.applyTrace(tracer,0,0,90,state);
    this.applyTrace(tracer,0,0,90,state);
    this.applyTrace(tracer,-1,0,90,state);
    this.applyTrace(tracer,0,0,90,state);
    this.applyTrace(tracer,-1,0,90,state);
    this.applyTrace(tracer,0,0,90,state);
    this.applyTrace(tracer,0,0,90,state);
    this.applyTrace(tracer,0,1,90,state);
    this.applyTrace(tracer,0,0,90,state);
    this.applyTrace(tracer,0,0,90,state);
    this.applyTrace(tracer,-1,0,90,state);
    this.applyTrace(tracer,0,0,90,state);
    this.applyTrace(tracer,0,0,90,state);
    this.applyTrace(tracer,0,1,90,state);
    this.applyTrace(tracer,0,0,90,state);
    this.applyTrace(tracer,0,0,90,state);
    this.applyTrace(tracer,-1,0,90,state);

    //this.applyTrace(tracer,0,0,90,state);
    //this.applyTrace(tracer,0,0,90,state);
    //this.applyTrace(tracer,1,0,90,state);
    //this.applyTrace(tracer,0,0,90,state);

    /*
    state = this.applyTrace(tracer,0,0,90,state);
    state = this.applyTrace(tracer,0,1,90,state);
    state = this.applyTrace(tracer,-1,0,90,state);
    state = this.applyTrace(tracer,0,0,90,state);
    state = this.applyTrace(tracer,0,0,90,state);
    state = this.applyTrace(tracer,0,-1,90,state);

    state = this.applyTrace(tracer,1,0,90,state);
    state = this.applyTrace(tracer,0,0,90,state);
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

    var dirLight = new THREE.DirectionalLight( csLineB, 0.125 );
    dirLight.position.set( 0, 0, 1 ).normalize();
    this.scene.add( dirLight );

    // 
    // Setup composer
    //
    this.composer = Circ.GetComposer(renderer, this.scene, this.camera);
    this.composer.vignette.renderToScreen = true;

    this.rgb = new THREE.ShaderPass( THREE.RGBShiftShader );
    this.rgb.uniforms[ 'amount' ].value = 0.0;
    this.rgb.renderToScreen = true;
    this.composer.addPass( this.rgb );

    /*
    */

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

        this.arcDriver(tracer, 9000, 0);
        /*
        tracer.arc(0,0,90); // can flip either
        tracer.arc(0,1,90); // can only flip +y
        tracer.arc(-1,0,90); // can only flip -x
        tracer.arc(0,0,90); // can only flip y
        tracer.arc(0,0,90); // can only flip x
        tracer.arc(0,-1,90); // can only flip x
        */
        flipColor = !flipColor;

        var mat = new THREE.LineBasicMaterial( { opacity: 1.0, 
                                                color: flipColor ? csLineA: csLineB,
                                                linewidth: 3 
                                                //vertexColors: THREE.VertexColors, 
                                                //wireframe: true 
                                                } ); 

        /*
        var geoRibbon = new F.PlanerRibbonGeometry(new THREE.Vector3(0,0,1), 
                                 tracer.points, 
                                 [2.8]);
        */
        var geoRibbon = new THREE.Geometry();
        geoRibbon.vertices = tracer.points;


        this.points.push(tracer.points);
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
        //var mesh = new THREE.Mesh(geoRibbon, mat);
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



// helper functions
var DegToRad = (Math.PI/180);

proto.ArcTracer = function (origin, size, offset) {
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

    this.arc = function (xAdj, yAdj, sweepDeg, lock, time) {
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
                                10);
            this.points.push(nextPoint);
        }


        this.xAngle += sweepRad;
        this.yAngle += sweepRad;
    }
};

F.Shots.CircleSpline_4.prototype = proto;
delete proto;
