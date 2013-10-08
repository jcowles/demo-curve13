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
}

F.Shots.Intro.prototype = proto;
delete proto;
