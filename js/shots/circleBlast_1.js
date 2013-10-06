// The Shots class is declared in shot.js

F.Shots.CircleBlast_1 = function(duration) {
    F.Shot.call(this, "CircleBlast_1", duration);
    this.mesh = null;
};

proto = Object.create(F.Shot.prototype);

proto.onDraw = function(time, dt) {
    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.02;

    this.mesh.geometry.update(new THREE.Vector3(0,0,1), 
                             [new THREE.Vector3(0,0,0), 
                              new THREE.Vector3(this.progress*100,2*100,0), 
                              new THREE.Vector3(400,2*200,0), 
                              new THREE.Vector3(900,2*300,0),
                              new THREE.Vector3(700,2*500,0),
                              ], 
                             [200]);
}

proto.getGui = function() {
    //
    // GUI Init
    //
    var FizzyText = function() {
        this.speed = 0.8;
        this.displayOutline = false;
    };
    var gui = new dat.GUI();
    text = new FizzyText();
    gui.add(text, 'speed', -5, 5);
    gui.add(text, 'displayOutline');
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
//    var geometry = new THREE.CubeGeometry( 200, 200, 200 );
    var geometry = new F.PlanerRibbonGeometry(new THREE.Vector3(0,0,1), 
                             [new THREE.Vector3(0,0,0), 
                              new THREE.Vector3(100,2*100,0), 
                              new THREE.Vector3(400,2*200,0), 
                              new THREE.Vector3(900,2*300,0),
                              new THREE.Vector3(700,2*500,0),
                              ], 
                             [200]);

    var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    this.mesh = new THREE.Mesh( geometry, material );
    this.scene.add( this.mesh );

    /*
    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1500);
    this.camera.position.set(0, 400, 700);
    cameraTarget = new THREE.Vector3(0, 150, 0);
    this.scene = new THREE.Scene();

    // LIGHTS
    var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
    dirLight.position.set( 0, 0, 1 ).normalize();
    this.scene.add( dirLight );

    var pointLight = new THREE.PointLight( 0xffffff, 1.5 );
    pointLight.position.set( 0, 100, 90 );
    this.scene.add( pointLight );

    pointLight.color.setHSL( Math.random(), 1, 0.5 );

    material = new THREE.MeshFaceMaterial([ 
        new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // front
        new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // side
    ]);

    var text = "three.js",
        height = 20,
        size = 70,
        hover = 30,

        curveSegments = 4,

        bevelThickness = 2,
        bevelSize = 1.5,
        bevelSegments = 3,
        bevelEnabled = true,

        font = "sans", // helvetiker, optimer, gentilis, droid sans, droid serif
        weight = "normal", // normal bold
        style = "normal"; // normal italic

    textGeo = new THREE.TextGeometry( text, {
            size: size,
            height: height,
            curveSegments: curveSegments,

            font: font,
            weight: weight,
            style: style,

            bevelThickness: bevelThickness,
            bevelSize: bevelSize,
            bevelEnabled: bevelEnabled,

            material: 0,
            extrudeMaterial: 1
    });

    textGeo.computeBoundingBox();
    textGeo.computeVertexNormals();

    var triangleAreaHeuristics = 0.1 * ( height * size );

    for ( var i = 0; i < textGeo.faces.length; i ++ ) {
        var face = textGeo.faces[ i ];
        if ( face.materialIndex == 1 ) {

            for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
                face.vertexNormals[ j ].z = 0;
                face.vertexNormals[ j ].normalize();
            }

            var va = textGeo.vertices[ face.a ];
            var vb = textGeo.vertices[ face.b ];
            var vc = textGeo.vertices[ face.c ];

            var s = THREE.GeometryUtils.triangleArea( va, vb, vc );

            if ( s > triangleAreaHeuristics ) {

                for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
                    face.vertexNormals[ j ].copy( face.normal );
                }
            }
        }
    }

    var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

    textMesh1 = new THREE.Mesh( textGeo, material );

    textMesh1.position.x = centerOffset;
    textMesh1.position.y = hover;
    textMesh1.position.z = 0;

    textMesh1.rotation.x = 0;
    textMesh1.rotation.y = Math.PI * 2;

    group.add( textMesh1 );
    */
}

F.Shots.CircleBlast_1.prototype = proto;
delete proto;
