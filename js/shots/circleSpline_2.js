// The Shots class is declared in shot.js

F.Shots.CircleSpline_1 = function(duration) {
    F.Shot.call(this, "CircleSpline_1", duration);
    this.lineGroup = null;
    this.geom = null;

    this.settings = new (function() {
        this.rotateX = 0;
        this.rotateY = 0;
        this.hue = .6
    })();
};

proto = Object.create(F.Shot.prototype);

proto.onDraw = function(time, dt) {
    this.camera.position.x += Math.sin(time);
    this.camera.position.z += 10*Math.cos(time);
    this.lineGroup.rotation.x += this.settings.rotateX;
    this.lineGroup.rotation.y += .05*Math.cos(Math.sin(time)); //this.settings.rotateY;
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
    // Add some geometry
    //

    this.lineGroup = new THREE.Object3D();

    //points = hilbert3D( new THREE.Vector3( 0,0,0 ), 200.0, 2, 0, 1, 2, 3, 4, 5, 6, 7 ),

    var points = [];
    var origin  = new THREE.Vector2(100, -400);
    var material = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 1, linewidth: 3, vertexColors: THREE.VertexColors } );

    var count = 70;
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
        tracer = new F.ArcTracer(origin, size, offset);
        offset += offsetStep;
        if (offset == 0)
            tcent = tracer;
        tracer.arc(0,0,90); // can flip either
        tracer.arc(0,1,90); // can only flip +y
        tracer.arc(-1,0,90); // can only flip -x
        tracer.arc(0,0,90); // can only flip y
        tracer.arc(0,0,90); // can only flip x
        tracer.arc(0,-1,90); // can only flip x
        /*
        */

        points = tracer.points;

        colors = [];

        for (j = 0; j < points.length; j ++) {
            geometry.vertices.push(points[j]);
            colors[j] = new THREE.Color( 0xffffff );
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
        }

        /*
        */
        var geometry = new F.PlanerRibbonGeometry(new THREE.Vector3(0,0,1), 
                                 tracer.points, 
                                 [2]);

        var m = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
        var mesh = new THREE.Mesh(geometry, m);
        mesh.scale.x = mesh.scale.y = mesh.scale.z = .3*5.5;
        mesh.position.x = d;
        mesh.position.y = d;
        mesh.position.z = 0;
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

F.Shots.CircleSpline_1.prototype = proto;
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

    this.arc = function (xAdj, yAdj, sweepDeg) {
        var iterations = 20.0;
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
        var dtheta = sweepRad / (iterations-1);
        var start = this.points.length == 0 ? 0 : 1;
        for (var i = start; i < iterations; i++) {
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

