// The Shots class is declared in shot.js

F.Shots.Intro = function(duration) {
    F.Shot.call(this, "Intro", duration);
    this.mesh = null;
    this.points = [new THREE.Vector3(-400,0,0), 
                   new THREE.Vector3(-100,0,0), 
                   new THREE.Vector3(400,0,0), 
                   new THREE.Vector3(700,0,0),
                   new THREE.Vector3(900,0,0),
                 ];
    this.points = [new THREE.Vector3(-100,0,0), 
                   new THREE.Vector3(100,0,0),
                   new THREE.Vector3(200,0,0)
                 ];

};

proto = Object.create(F.Shot.prototype);

proto.onBegin = function() {
    renderer.setClearColor(0, 1);
}

iters = 0;

proto.onDraw = function(time, dt) {
    if (iters > 10000000) {
        seq.pause();
        return;
    }
    iters++;
    this.mesh.geometry.update(new THREE.Vector3(0,0,1), 
                              this.points, 
                             [200],
                             Math.max(this.progress- .2, 0), 
                             this.progress);
    log(this.progress);
    //log(this.mesh.geometry.vertices);
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
                             this.points, 
                             [200]);

    var geometry2 = new F.PlanerRibbonGeometry(new THREE.Vector3(0,0,1), 
                             this.points, 
                             [200]);

    var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    this.mesh = new THREE.Mesh( geometry, material );
    this.scene.add( this.mesh );

    var material = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } );
    var mesh2 = new THREE.Mesh( geometry2, material );
    this.scene.add( mesh2 );

    /*
    this.mesh.geometry.update(new THREE.Vector3(0,0,1), 
                              [new THREE.Vector3(-400,0,0), 
                               new THREE.Vector3(0,0,0), 
                               new THREE.Vector3(400,0,0)//,
                               //new THREE.Vector3(700,0,0), 
                               //new THREE.Vector3(900,0,0),
                             ], 
                             [200],
                             0.1, 
                             1);
    */

}

F.Shots.Intro.prototype = proto;
delete proto;
