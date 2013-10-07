F.WarpSeries = function(camera, curvesList) {

    this.camera = camera;
    this.curvesList = curvesList;
    this.curvaturesList = [];
    this.restAngles = [];

    for (var i=0; i<this.curvesList.length; i++) {
        c = this.curvesList[i];
        this.curvaturesList.push(computeCurvatures(c));
        this.restAngles.push(computeBaseAngle(c));
    }

    // Init the "current" arrays with the first curve.
    this.curvatures = computeCurvatures(this.curvesList[0]);
    this.tangents = computeTangents(this.curvesList[0]);
    this.pts = this.curvesList[0].slice(0);

    //////////////////////

    // Set up two scenes, with 2 distinct meshes, each mesh sharing the same geometry
    // but different material.
    // XXX TODO Replace this with usage of render pass's overrideMaterial.

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
    
    var renderModel = new THREE.RenderPass(this.sceneColored, this.camera);
    this.composer.addPass( renderModel ); // render to buffer1
    
    var effectBloom = new THREE.BloomPass(2.3, 25, 4.0, 512);
    this.composer.addPass( effectBloom ); // render to internal buffers, finally to buffer1

    var renderModelWhite = new THREE.RenderPass(this.sceneWhite, this.camera);
    renderModelWhite.clear = false;
    this.composer.addPass(renderModelWhite); // render to buffer1

    var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    effectCopy.renderToScreen = true;
    this.composer.addPass( effectCopy ); // render to screen

    this.progress = 0;
};

proto = Object.create(F.WarpSeries.prototype);

proto.setColor = function(color) {
    this.meshColored.material.color.copy(color);
    this.meshColored.material.needsUpdate = true;
}

proto.setTime = function(time) {

    // Find the 2 curvature sets that represent the nearby shapes.
    var clampedTime = Math.min(Math.max(0,time), 1);
    var floatIdx = clampedTime * (this.curvesList.length-1);
    var curveAIdx = Math.floor(floatIdx);
    var curveBIdx = Math.min(curveAIdx+1, this.curvesList.length-1);
    var fracIdx = floatIdx - curveAIdx;
    fracIdx = smoothStep(fracIdx);

    //log(this.curvaturesList.length + " " + curveAIdx + " " + curveBIdx + " " + fracIdx);

    // Lerp curvatures according to time
    for (var cIdx=0; cIdx<this.curvatures.length; cIdx++) {
        this.curvatures[cIdx] = (1-fracIdx)*this.curvaturesList[curveAIdx][cIdx]
                                  + fracIdx*this.curvaturesList[curveBIdx][cIdx];
    }

    // Add some stressful perturbations
    for (var cIdx=0; cIdx<this.curvatures.length; cIdx++) {
        this.curvatures[cIdx] += 
            this.settings.sinAmp * Math.sin( 
            this.settings.sinPhv*time + cIdx/(this.curvatures.length-1.0) 
            *this.settings.sinFrq*2*Math.PI);
    }

    // Rebuild tangents from curvatures
    for (var tIdx=1; tIdx<this.tangents.length; tIdx++) {
        var angle = this.curvatures[tIdx];
        var t0 = this.tangents[tIdx-1];
        var newT = new THREE.Vector3();
        newT.copy(t0);
        newT.applyAxisAngle(new THREE.Vector3(0,0,1), angle);
        this.tangents[tIdx] = newT;
    }

    // Rebuild point positions from tangents
    for (var pIdx=1; pIdx<this.pts.length; pIdx++) {
        this.pts[pIdx].copy(this.pts[pIdx-1]);
        this.pts[pIdx].add(this.tangents[pIdx-1]);
    }

    // Terrible hack.  Look at error between first and last point and
    // distribute it positionally evenly amongst all the points.
    var totalErr = new THREE.Vector3()
    totalErr.subVectors(this.pts[0], this.pts[this.pts.length-1]);
    for (var i=0; i<this.pts.length; i++) {
        var t = i/(this.pts.length-1.0);
        var fracErr = new THREE.Vector3();
        fracErr.copy(totalErr);
        fracErr.multiplyScalar(t);
        this.pts[i].add(fracErr);
    }

    // Rebuild point positions from tangents
    var centroid = new THREE.Vector3();
    for (var pIdx=0; pIdx<this.pts.length; pIdx++) {
        centroid.add(this.pts[pIdx]);
    }
    centroid.multiplyScalar(1.0/this.pts.length);

    // Consider new point positions and rotate them about p0 so that
    // p0 -> p(n/2) matches the desired orientation.  This accounts for
    // the arbitrary rotations that arbitrary curvature operations cause.
    var currentAngle = computeBaseAngle(this.pts);
    var desiredAngle = (1-time)*this.restAngles[curveAIdx] + time*this.restAngles[curveBIdx];

    var centroidToOrigin = new THREE.Matrix4();
    centroidToOrigin.makeTranslation(-centroid.x, -centroid.y, -centroid.z);
    var originRotMat = new THREE.Matrix4();
    originRotMat.makeRotationZ(desiredAngle - currentAngle);
    var toOrigin = new THREE.Matrix4();
    toOrigin.makeTranslation(-this.pts[0].x, -this.pts[0].y, -this.pts[0].z);
    var fromOrigin = new THREE.Matrix4();
    fromOrigin.makeTranslation(this.pts[0].x, this.pts[0].y, this.pts[0].z);

    var fixMat = new THREE.Matrix4();
    fixMat.multiply(fromOrigin);
    fixMat.multiply(originRotMat);
    fixMat.multiply(toOrigin);
    fixMat.multiply(centroidToOrigin);

    // XXX TODO wtf r u kidding me
    this.meshWhite.matrix.identity();
    this.meshWhite.applyMatrix(fixMat);
    this.meshWhite.matrixWorldNeedsUpdate = true;

    this.meshColored.matrix.identity();
    this.meshColored.applyMatrix(fixMat);
    this.meshColored.matrixWorldNeedsUpdate = true;

    // commit new point positions
    this.geometry.update(
        new THREE.Vector3(0,0,1),
        this.pts,
        [0.02]);
}

F.WarpSeries.prototype = proto;
delete proto;

function computeTangents(pts) {
    // Compute numPts-1 tangent vectors,
    // the 0th tangent vector is between pts 0 and 1

    // TODO use native array
    var ts = [];
    for (var i=0; i<pts.length-1; i++) {
        var p = pts[i];
        var p1 = pts[i+1];
        var t = new THREE.Vector3();
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

    var ts = computeTangents(pts);

    var cs = [];

    for (var cIdx=0; cIdx<pts.length-1; cIdx++) {
        
        var t0Idx = cIdx - 1;
        if (t0Idx < 0) {
            t0Idx = ts.length-1;
        }
        
        var t0 = ts[t0Idx];
        var t1 = ts[cIdx];

        // Compute the rotation about Z that takes t0 to t1

        // transform t1 by the xf that would take t0 to +X, then use atan2 on the
        // result to give the angle to t1 from +X.
        var t0Norm = new THREE.Vector3();
        t0Norm.copy(t0);
        t0Norm.normalize();
        var m = new THREE.Matrix4(t0Norm.x, -t0Norm.y, 0, 0,
                              t0Norm.y, t0Norm.x, 0, 0,
                              0, 0, 1, 0,
                              0, 0, 0, 1);
        var mInv = new THREE.Matrix4();
        mInv.getInverse(m); // NOT REALLY REQUIRED, JUST INVERT BY REARRANGEMENT HERE

        var t1Norm = new THREE.Vector3();
        t1Norm.copy(t1);
        t1Norm.normalize();
        t1Norm.applyMatrix4(mInv);
        var angle = Math.atan2(t1Norm.y, t1Norm.x);

        cs[cIdx] = angle;
    }

    return cs;
}

function computeBaseAngle(pts) {
    var t = new THREE.Vector3();
    t.subVectors(pts[Math.floor((pts.length-1)/2)], pts[0]);
    t.normalize();
    return Math.atan2(t.y, t.x);
}

function smoothStep(t) {
    return 6*t*t*t*t*t - 15*t*t*t*t + 10*t*t*t;
}