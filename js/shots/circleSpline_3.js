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
    if (time > 14.4 && time < 16.0) {
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

    var tracer = new F.ArcTracer(this.origin, this.size + sizeAdj, 0);
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
        tracer = new F.ArcTracer(this.origin, this.size, offset);
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

F.Shots.CircleSpline_3.prototype = proto;
delete proto;


// helper functions
var DegToRad = (Math.PI/180);

F.ArcTracer = function (origin, size, offset) {
    this.origin = origin; 
    this.size = size;
    this.offset = offset;
    this.xLoc = 0;
    this.yLoc = 0;
    this.xAngle = 0;
    this.yAngle = 0;
    this.points = [];
    this.t = 0;
    this.iterations = 10;

    this.arc = function (xAdj, yAdj, sweepDeg) {
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
        var start = this.points.length == 0 ? 0 : 1;
        for (var i = start; i < this.iterations; i++) {
            this.t += 1;
            this.points.push(new THREE.Vector3(
                                this.origin.x + (this.xLoc*2*this.size) + size*Math.cos(this.xAngle+(i*dtheta)), 
                                this.origin.y + (this.yLoc*2*this.size) + size*Math.sin(this.yAngle+(i*dtheta)), 
                                10-(this.t/100)));
        }

        this.xAngle += sweepRad;
        this.yAngle += sweepRad;
    }
};

function hilbert3D( center, side, iterations, v0, v1, v2, v3, v4, v5, v6, v7 ) {
    var half = side / 2,
            vec_s = [
            new THREE.Vector3( center.x - half, center.y + half, center.z - half ),
            new THREE.Vector3( center.x - half, center.y + half, center.z + half ),
            new THREE.Vector3( center.x - half, center.y - half, center.z + half ),
            new THREE.Vector3( center.x - half, center.y - half, center.z - half ),
            new THREE.Vector3( center.x + half, center.y - half, center.z - half ),
            new THREE.Vector3( center.x + half, center.y - half, center.z + half ),
            new THREE.Vector3( center.x + half, center.y + half, center.z + half ),
            new THREE.Vector3( center.x + half, center.y + half, center.z - half )
            ],
            vec = [ vec_s[ v0 ], vec_s[ v1 ], vec_s[ v2 ], vec_s[ v3 ], vec_s[ v4 ], vec_s[ v5 ], vec_s[ v6 ], vec_s[ v7 ] ];

    if( --iterations >= 0 ) {
        var tmp = [];
        Array.prototype.push.apply( tmp, hilbert3D ( vec[ 0 ], half, iterations, v0, v3, v4, v7, v6, v5, v2, v1 ) );
        Array.prototype.push.apply( tmp, hilbert3D ( vec[ 1 ], half, iterations, v0, v7, v6, v1, v2, v5, v4, v3 ) );
        Array.prototype.push.apply( tmp, hilbert3D ( vec[ 2 ], half, iterations, v0, v7, v6, v1, v2, v5, v4, v3 ) );
        Array.prototype.push.apply( tmp, hilbert3D ( vec[ 3 ], half, iterations, v2, v3, v0, v1, v6, v7, v4, v5 ) );
        Array.prototype.push.apply( tmp, hilbert3D ( vec[ 4 ], half, iterations, v2, v3, v0, v1, v6, v7, v4, v5 ) );
        Array.prototype.push.apply( tmp, hilbert3D ( vec[ 5 ], half, iterations, v4, v3, v2, v5, v6, v1, v0, v7 ) );
        Array.prototype.push.apply( tmp, hilbert3D ( vec[ 6 ], half, iterations, v4, v3, v2, v5, v6, v1, v0, v7 ) );
        Array.prototype.push.apply( tmp, hilbert3D ( vec[ 7 ], half, iterations, v6, v5, v2, v1, v0, v3, v4, v7 ) );
        return tmp;
    }
    return vec;
}

