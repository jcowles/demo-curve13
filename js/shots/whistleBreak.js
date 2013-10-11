// The Shots class is declared in shot.js

F.Shots.WhistleBreak = function(duration) {
    F.Shot.call(this, "WhistleBreak", duration);
    this.mesh = null;
    this.meshes = [];
    this.N = 10;
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

    if (this.progress > 0.98) {
        this.meshes.forEach(function(m) { m.visible = false; });
        return;
        //this.mesh.visible = true;
    }
    var me = this;
    var pi2 = Math.PI*2;
    var prog = 1 - this.progress;
    var speed = 10 + 20*(1.5+Math.sin(prog*pi2));
    var f = function(a) {
        return Math.max(prog*speed - Math.sin(prog*a*Math.PI)*a/10, 0);
    }

    var me = this;
    this.meshes.forEach(function(m, i) { 
        var a = m.offset - (me.N / 2);
        var p = prog - .1;
        if (a != 0 && Math.abs(a) > p* (me.N / 2)) {
            m.visible = false;
            return;
        }
        m.visible = true;
        m.position.y = m.offset*150 - 750;
        m.geometry.update(new THREE.Vector3(0,0,1),
                          me.points, 
                          [(prog-.1) * 200],
                          f(a) -.2, 
                          f(a));
        m.material.wireframe = Math.random() > 0.5 + me.progress*.5;
    });
    /*
    this.mesh.geometry.update(new THREE.Vector3(0,0,1), 
                              this.points, 
                             [prog * 200],
                             f(), 
                             prog*speed);
                             */
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

    for (var i = 0; i < this.N; i++) {
        //var offset = i//(i/this.N) * (this.N / 2) - this.N/2;
        var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: false } );
        var geometry = new F.PlanerRibbonGeometry(new THREE.Vector3(0,0,1), 
                                 this.points, 
                                 [200]);

        var mesh = new THREE.Mesh( geometry, material );
        mesh.offset = i;
        this.meshes.push(mesh);
        this.scene.add(mesh);
    }

    /*
    var geometry = new F.PlanerRibbonGeometry(new THREE.Vector3(0,0,1), 
                             this.points, 
                             [200]);

    var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    this.mesh = new THREE.Mesh( geometry, material );
    this.scene.add(this.mesh);
    this.mesh.visible = false;
    */


}

F.Shots.WhistleBreak.prototype = proto;
delete proto;
