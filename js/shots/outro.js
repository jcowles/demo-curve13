// The Shots class is declared in shot.js

F.Shots.Outro = function(duration) {
    F.Shot.call(this, "Outro", duration);
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
    // CREDITS NAMES
    var jShift = smoothMap(0.1, 0.2, 0, -3000, this.progress) +
                 smoothMap(0.3, 0.4, 0, -3000, this.progress);

    var aShift = smoothMap(0.1, 0.2, 0, 3000, this.progress) +
                 smoothMap(0.3, 0.4, 0, 3000, this.progress);
   
    this.mj.position.set(2500 + jShift,200,0);

    this.ma.position.set(-2500 + aShift,-200,0);

    this.mt.scale.y = smoothMap(0.62,0.77, 0.0001, 1, this.progress);

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
    // Textured quads for credits
    //
    var text = new THREE.ImageUtils.loadTexture("tex/title.png");
    var texj = new THREE.ImageUtils.loadTexture("tex/jcowles.png");
    var texa = new THREE.ImageUtils.loadTexture("tex/andru.png");
    var matt = new THREE.MeshBasicMaterial({map:text, transparent:true});
    var matj = new THREE.MeshBasicMaterial({map:texj, transparent:true});
    var mata = new THREE.MeshBasicMaterial({map:texa, transparent:true});
    var textsize = 1500;
    var gt = new THREE.PlaneGeometry(textsize,textsize);
    var gj = new THREE.PlaneGeometry(textsize,textsize);
    var ga = new THREE.PlaneGeometry(textsize,textsize);
    this.mt = new THREE.Mesh(gt, matt);
    this.mj = new THREE.Mesh(gj, matj);
    this.ma = new THREE.Mesh(ga, mata);

    //this.scene.add(mt);
    this.scene.add(this.mt);
    this.scene.add(this.mj);
    this.scene.add(this.ma);

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

F.Shots.Outro.prototype = proto;
delete proto;
