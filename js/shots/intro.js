// The Shots class is declared in shot.js

F.Shots.Intro = function(duration) {
    F.Shot.call(this, "Intro", duration);
    this.mesh = null;
    this.points = [];/*[new THREE.Vector3(-1900,0,0), 
                   new THREE.Vector3(-100,0,0), 
                   new THREE.Vector3(400,0,0), 
                   new THREE.Vector3(700,0,0),
                   new THREE.Vector3(1900,0,0),
                 ];*/
    for (var i = -1900; i <= 1900; i++) {
        this.points.push(new THREE.Vector3(i,0,0));
        var x = 200;
        i += (Math.sin(i) + 1) * x;
    }

};

proto = Object.create(F.Shot.prototype);

proto.onBegin = function() {
    renderer.setClearColor(0, 1);
}

proto.onDraw = function(time, dt) {
    if (time > 1.33) {
        this.mesh.visible = true;
    }
    var me = this;
    var pi2 = Math.PI*2;
    var speed = 10 + 20*(1.5+Math.sin(this.progress*pi2));
    var f = function() {
        return Math.max(me.progress*speed - .2, 0);
    }
    this.mesh.geometry.update(new THREE.Vector3(0,0,1), 
                              this.points, 
                             [this.progress * 200],
                             f(), 
                             this.progress*speed);
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

    // NEW ALGORITHM
    var geometry = new F.PlanerRibbonGeometry(new THREE.Vector3(0,0,1), 
                             this.points, 
                             [200]);

    var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    this.mesh = new THREE.Mesh( geometry, material );
    this.scene.add( this.mesh );
    this.mesh.visible = false;
}

F.Shots.Intro.prototype = proto;
delete proto;
