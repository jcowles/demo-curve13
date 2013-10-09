// The Shots class is declared in shot.js

F.Shots.Intro = function(duration) {
    F.Shot.call(this, "Intro", duration);
    this.mesh = null;
};

proto = Object.create(F.Shot.prototype);

proto.onBegin = function() {
    renderer.setClearColor(0, 1);
}

proto.onDraw = function(time, dt) {
    this.mesh.geometry.update(new THREE.Vector3(0,0,1), 
                              [new THREE.Vector3(-400,0,0), 
                               new THREE.Vector3(-100,0,0), 
                               new THREE.Vector3(400,0,0), 
                               new THREE.Vector3(700,0,0),
                               new THREE.Vector3(900,0,0),
                             ], 
                             [200],
                             this.progress*5, 
                             this.progress*10);
    //log(this.progress*10);
}

proto.getGui = function() {
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
    var geometry = new F.PlanerRibbonGeometry(new THREE.Vector3(0,0,1), 
                             [new THREE.Vector3(-400,0,0), 
                              new THREE.Vector3(-100,0,0), 
                              new THREE.Vector3(400,0,0), 
                              new THREE.Vector3(700,0,0),
                              new THREE.Vector3(900,0,0),
                              ], 
                             [200]);

    var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    this.mesh = new THREE.Mesh( geometry, material );
    this.scene.add( this.mesh );
}

F.Shots.Intro.prototype = proto;
delete proto;
