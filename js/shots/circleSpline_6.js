// The Shots class is declared in shot.js

F.Shots.CircleSpline_6 = function(duration) {
    F.Shot.call(this, "CircleSpline_6", duration);
    this.lineGroup = null;
    this.geom = null;
    this.mat = null;
    this.ribbon = null;
    this.ribbons = [];
    this.points = [];
    this.size = 250;
    this.origin  = new THREE.Vector2(this.size, -this.size);
    this.tracer = new Circ.ArcTracer();
    this.bounce = 0;
    this.N = 2;
    this.O = 100;
    this.progOff = 0;

    var me = this;
    this.onBounce = new OnBeat(
                [
                9.28, 
                9.9, 10.0, 
                10.76,
                11.8,
                12.6,
                13.4,
                14.2,
                15.8,
                16.25, 16.3,

                18.0, 18.3, 18.5, 18.8,
                20.5, 20.8, 21.0, 21.3,
                ],
                function(time) { 
                    me.bounce = 1; 
                    me.progOff -= .01;
                },
                function(time) {
                    me.bounce= Math.max(0, me.bounce*.8) + .001*Math.sin(time*4);
                    if (me.bounce < .8) 
                        me.composer.setTiltEnabled(true);
                    if (me.bounce < .2)
                        me.composer.setTiltEnabled(false);
                });


    this.settings = new (function() {
        this.rotateX = -.5;
        this.rotateY = 0.0;
        this.camX = 0;
        this.camY = -200;
        this.camZ = 550;
        this.hue = .6
    })();
};

proto = Object.create(F.Shot.prototype);

proto.onDraw = function(time, dt) {
    var me = this;
    this.onBounce.hit(time);
    renderer.setClearColor(CircleSplineBg, 1);

    this.lineGroup.rotation.x = -(this.progress + .4);
    this.lineGroup.rotation.y = this.settings.rotateY;
    var p = Math.max(0, this.progress - .2);
    this.lineGroup.rotation.z += this.bounce*.3 + p*(.07 + .05*Math.sin(this.progress *2* Math.PI));

    this.lineGroup.scale.x = this.lineGroup.scale.y = this.lineGroup.scale.z = 1 + this.bounce;

    time = this.progress*190*10;
    var normal = new THREE.Vector3(0,0,1);

    this.ribbons.forEach(function(ribbonMesh, index) {
        ribbonMesh.visible = true;

        var w = 0;
        var prog = me.progress;
        if (ribbonMesh.ribbonOffset == 0) {
            w = 2.8 + 40*Math.sin(me.progress * me.bounce * Math.PI * 2) + 40;
        } else {
            w = 2.8 + 10*Math.sin(me.progress * me.bounce * Math.PI * 2) + 10;
            prog += me.progOff;
            prog = Math.max(0.0001, prog);
        }
        ribbonMesh.geometry.update(normal, 
                                 me.points[index], 
                                 [w],
                                 0,
                                 Math.min(1,prog*4 +.00000001));
        ribbonMesh.frustumCulled = false;

    });
    var lastVert = this.ribbon.geometry.vertices[this.ribbon.geometry.vertices.length-1];
}

proto.arcDriver = function (tracer, angle) {
    var state = { lock: false,
              angle: angle };

    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,1,90,state);
    Circ.applyAngle(tracer,-1,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,-1,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,1,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,1,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
    Circ.applyAngle(tracer,0,0,90,state);
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

    // 
    // Setup composer
    //
    this.composer = Circ.GetComposer(renderer, this.scene, this.camera);
    this.rgb = this.composer.rgb; 
    this.composer.setTiltEnabled(true);; 
    this.composer.setTiltDepth(0.15);
    this.composer.setTiltBlur(4, 5);

   //
    // Add some geometry
    //

    this.lineGroup = new THREE.Object3D();

    var count = this.N;
    var offsetStep = this.O;
    var offset = -1 * offsetStep * Math.floor(count/2);
    var tracer = null;

    for (var i = 0; i < count; i++) {
        tracer = new Circ.ArcTracer(this.origin, this.size, offset);
        tracer.zFactor = 0;
        tracer.iterations = 20;
        this.arcDriver(tracer, 90*200);


        var mat = new THREE.MeshBasicMaterial( { opacity: 1.0, 
                                                color: csLineB,
                                                } ); 

        var geoRibbon = new F.PlanerRibbonGeometry(new THREE.Vector3(0,0,1), 
                                 tracer.points, 
                                 [2.8]);
        this.points.push(tracer.points);
        
        var line, p, scale = 0.3*5.5, d = 10;
        var mesh = new THREE.Mesh(geoRibbon, mat);
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

F.Shots.CircleSpline_6.prototype = proto;
delete proto;
