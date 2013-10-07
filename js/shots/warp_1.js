// The Shots class is declared in shot.js

F.Shots.Warp_1 = function(duration, filenameA, filenameB) {
    F.Shot.call(this, "Warp_1", duration);
};

proto = Object.create(F.Shot.prototype);

proto.onPreload = function() {

    curveA = CURVE_STAR;
    curveB = CURVE_BABE;

    this.curvaturesA = computeCurvatures(curveA);
    this.curvaturesB = computeCurvatures(curveB);

    this.curvatures = computeCurvatures(curveA);
    this.tangents = computeTangents(curveA);
    this.pts = curveA.slice(0);

    //////////////////////

    this.camera = new THREE.PerspectiveCamera( 75, 
                                window.innerWidth / window.innerHeight, 
                                1, 10000 );
    this.camera.position.z = 1000;

    this.sceneColored = new THREE.Scene();
    this.sceneWhite = new THREE.Scene();


    this.geometry = new F.PlanerRibbonGeometry(
        new THREE.Vector3(0,0,1),
        this.pts,
        [0.02])

    //////////////////////

    var matColored = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: false } );
    this.meshColored = new THREE.Mesh( this.geometry, matColored );
    this.meshColored.scale.x = this.meshColored.scale.y = 400;
    this.sceneColored.add( this.meshColored );

    var matWhite = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false } );
    matWhite.depthTest = false;
    this.meshWhite = new THREE.Mesh( this.geometry, matWhite );
    this.meshWhite.scale.copy(this.meshColored.scale);
    this.sceneWhite.add( this.meshWhite );

    //////////////////////

	this.composer = new THREE.EffectComposer( renderer );
    
    renderModel = new THREE.RenderPass(this.sceneColored, this.camera);
	this.composer.addPass( renderModel ); // render to buffer1
	
    effectBloom = new THREE.BloomPass(2.3, 25, 4.0, 512);
    this.composer.addPass( effectBloom ); // render to internal buffers, finally to buffer1

    renderModelWhite = new THREE.RenderPass(this.sceneWhite, this.camera);
    renderModelWhite.clear = false;
    this.composer.addPass(renderModelWhite); // render to buffer1

    effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    effectCopy.renderToScreen = true;
    this.composer.addPass( effectCopy ); // render to screen

    this.progress = 0;
}

proto.onDraw = function(time, dt) {

	renderer.setClearColor(0, 1);

	time = this.progress
	time = Math.min(1,time*1.5)

    // Lerp curvatures according to time or transition
    for (cIdx=0; cIdx<this.curvatures.length; cIdx++) {
        this.curvatures[cIdx] = (1-time)*this.curvaturesA[cIdx] + time*this.curvaturesB[cIdx];
    }

    // Rebuild tangents from curvatures
    for (tIdx=1; tIdx<this.tangents.length; tIdx++) {
        angle = this.curvatures[tIdx];
        t0 = this.tangents[tIdx-1];
        newT = new THREE.Vector3();
        newT.copy(t0);
        newT.applyAxisAngle(new THREE.Vector3(0,0,1), angle);
        this.tangents[tIdx] = newT;
    }

    // Rebuild point positions from tangents
    for (pIdx=1; pIdx<this.pts.length; pIdx++) {
        this.pts[pIdx].copy(this.pts[pIdx-1]);
        this.pts[pIdx].add(this.tangents[pIdx-1]);
    }

    // Terrible hack.  Look at error between first and last point and
    // distribute it positionally evenly amongst all the points.
    totalErr = new THREE.Vector3()
    totalErr.subVectors(this.pts[0], this.pts[this.pts.length-1]);
    for (i=0; i<this.pts.length; i++) {
        t = i/(this.pts.length-1.0);
        fracErr = new THREE.Vector3();
        fracErr.copy(totalErr);
        fracErr.multiplyScalar(t);
        this.pts[i].add(fracErr);
    }

    // commit new point positions
    this.geometry.update(
        new THREE.Vector3(0,0,1),
        this.pts,
        [0.02]);
}

proto._initWarp = function() {
}

F.Shots.Warp_1.prototype = proto;
delete proto;


function computeTangents(pts) {
    // Compute numPts-1 tangent vectors,
    // the 0th tangent vector is between pts 0 and 1

    // TODO use native array
    ts = [];
    for (i=0; i<pts.length-1; i++) {
        p = pts[i];
        p1 = pts[i+1];
        t = new THREE.Vector3();
        t.subVectors(p1,p);
        ts.push(t);
    }

    return ts;
}

function computeCurvatures(pts) {
    // compute numPts-1 curvatures, one per point
    // excluding the final point, whose curvature
    // is identical to the first point's, because
    // we assume closed curves with pts[-1]==pts[0]

    ts = computeTangents(pts);

    cs = [];

    for (cIdx=0; cIdx<pts.length-1; cIdx++) {
        
        t0Idx = cIdx - 1;
        if (t0Idx < 0) {
            t0Idx = ts.length-1;
        }
        
        t0 = ts[t0Idx];
        t1 = ts[cIdx];

        // Compute the rotation about Z that takes t0 to t1

        // transform t1 by the xf that would take t0 to +X, then use atan2 on the
        // result to give the angle to t1 from +X.
        t0Norm = new THREE.Vector3();
        t0Norm.copy(t0);
        t0Norm.normalize();
        m = new THREE.Matrix4(t0Norm.x, -t0Norm.y, 0, 0,
                              t0Norm.y, t0Norm.x, 0, 0,
                              0, 0, 1, 0,
                              0, 0, 0, 1);
        mInv = new THREE.Matrix4();
        mInv.getInverse(m); // NOT REALLY REQUIRED, JUST INVERT BY REARRANGEMENT HERE

        t1Norm = new THREE.Vector3();
        t1Norm.copy(t1);
        t1Norm.normalize();
        t1Norm.applyMatrix4(mInv);
        angle = Math.atan2(t1Norm.y, t1Norm.x);

        cs[cIdx] = angle;
    }

    return cs;
}


