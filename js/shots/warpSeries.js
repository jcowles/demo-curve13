F.WarpSeriesSet = function(camera, seriesList) {
    this.camera = camera;
    this.seriesList = seriesList;

    //////////////////////

    // Set up two scenes, with distinct meshes, each mesh pair sharing the same geometry
    // but different material.
    this.sceneColored = new THREE.Scene();
    this.sceneWhite = new THREE.Scene();
    this.sceneSparks = new THREE.Scene();

    for (var i = 0; i < this.seriesList.length; i++) {

        var s = this.seriesList[i];

        this.sceneColored.add( s.meshColored );
        this.sceneWhite.add( s.meshWhite );
        this.sceneSparks.add(s.sparks);

    };

    this.composer = new THREE.EffectComposer( renderer );

    var renderModel = new THREE.RenderPass(this.sceneColored, this.camera);
    this.composer.addPass( renderModel ); // render to buffer1

    this.effectBloom = new THREE.BloomPass(2.3, 25, 4.0, 512);
    this.composer.addPass( this.effectBloom ); // render to internal buffers, finally to buffer1

    var renderSparks = new THREE.RenderPass(this.sceneSparks, this.camera);
    renderSparks.clear = false;
    this.composer.addPass(renderSparks); // render to buffer1

    var renderModelWhite = new THREE.RenderPass(this.sceneWhite, this.camera);
    renderModelWhite.clear = false;
    this.composer.addPass(renderModelWhite); // render to buffer1
    
    var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    effectCopy.renderToScreen = true;
    this.composer.addPass( effectCopy ); // render to screen
};

proto = Object.create(F.WarpSeriesSet.prototype);

proto.setTime = function(time) {
    for (var i = 0; i < this.seriesList.length; i++) {
        this.seriesList[i].setTime(time);
    }
}

proto.setNeon = function(amount) {
    for (var i = 0; i < this.seriesList.length; i++) {
        this.seriesList[i].setNeon(amount);
    }
    this.effectBloom.copyUniforms["opacity"].value = lerp(amount, 0, 2.3);
}


F.WarpSeriesSet.prototype = proto;
delete proto;

///////////////////////////////////////////////////////////////////////////////

F.WarpSeries = function(curvesList) {
    this.numCurves = curvesList.length;
    this.curvaturesList = [];
    this.restAngles = [];
    this.restCurvatureSums = [];
    this.restEdgeLens = [];

    for (var i=0; i<this.numCurves; i++) {
        c = curvesList[i];
        curvatures = computeCurvatures(c);
        this.curvaturesList.push(curvatures);
        this.restAngles.push(computeBaseAngle(c));
        this.restCurvatureSums.push(computeCurvatureSum(curvatures));
        this.restEdgeLens.push(computeEdgeLen(c));
    }

    // Init the "current" arrays with the first curve.
    this.curvatures = computeCurvatures(curvesList[0]);
    this.tangents = computeTangents(curvesList[0]);
    this.pts = curvesList[0].slice(0);

    //////////////////////

    this.geometry = new F.PlanerRibbonGeometry(
        new THREE.Vector3(0,0,1),
        this.pts,
        [0.02])

    //////////////////////

    var matColored = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: false } );
    this.meshColored = new THREE.Mesh( this.geometry, matColored );

    var matWhite = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false } );
    matWhite.depthTest = false;
    this.meshWhite = new THREE.Mesh( this.geometry, matWhite );

    //////////////////////

    //////////////////////

    this.nextSpawnIdx = 0;

    this.geometrySparks = new THREE.Geometry();
    this.numSparks = 1000;
    for (var i=0; i<this.numSparks; i++) {
        this.geometrySparks.vertices.push(new THREE.Vector3(10000,0,0));
    }
    for (var i=0; i<this.numSparks; i++) {
        this.geometrySparks.colors.push(new THREE.Color(0));
    }

    matSparks = new THREE.ParticleBasicMaterial( {size:0.01} );
    matSparks.depthTest = false;
    matSparks.vertexColors = THREE.VertexColors;
    this.sparks = new THREE.ParticleSystem(this.geometrySparks, matSparks);
};

proto = Object.create(F.WarpSeries.prototype);

proto.setColor = function(color) {
    this.meshColored.material.color.copy(color);
    this.meshColored.material.needsUpdate = true;
}

proto.setPos = function(pos) {
    this.meshColored.position.copy(pos);
    this.meshWhite.position.copy(pos);
}

proto.setRot = function(angle) {
    angle = angle / 180 * Math.PI;
    this.meshColored.rotation.z = angle;
    this.meshWhite.rotation.z = angle;
}

proto.setSize = function(size) {
    this.meshColored.scale.x = this.meshColored.scale.y = this.meshColored.scale.z = size;
    this.meshWhite.scale.x = this.meshWhite.scale.y = this.meshWhite.scale.z = size;
}

proto.setNeon = function(amount) {
    this.meshWhite.material.color.copy(new THREE.Color(0xFFFFFF));
    this.meshWhite.material.color.lerp(this.meshColored.material.color, 1-amount)
}

proto.setTime = function(time) {

    // Find the 2 curvature sets that represent the nearby shapes.
    var clampedTime = Math.min(Math.max(0,time), 1);
    var floatIdx = clampedTime * (this.numCurves-1);
    var curveAIdx = Math.floor(floatIdx);
    var curveBIdx = Math.min(curveAIdx+1, this.numCurves-1);
    var fracIdx = floatIdx - curveAIdx;
    fracIdx = smoothStep(fracIdx);

    // Lerp curvatures according to time
    for (var cIdx=0; cIdx<this.curvatures.length; cIdx++) {
        this.curvatures[cIdx] = (1-fracIdx)*this.curvaturesList[curveAIdx][cIdx]
                                  + fracIdx*this.curvaturesList[curveBIdx][cIdx];
    }

    // Add some sinusoidal perturbations
    for (var cIdx=0; cIdx<this.curvatures.length; cIdx++) {
        this.curvatures[cIdx] += 
            this.settings.sinAmp * Math.sin( 
            this.settings.sinPhv*time + cIdx/(this.curvatures.length-1.0) 
            *this.settings.sinFrq*2*Math.PI);
    }
    // Add some starlike dirac delta perurbations
    var cornerNum = Math.floor(this.settings.cornerNum);
    for (var i=0; i<cornerNum; i++) {
        var step = this.curvatures.length/cornerNum;
        this.curvatures[i*step] = this.settings.cornerAmp;
        this.curvatures[Math.floor((i+0.5)*step)] = -this.settings.cornerAmp;
    }
    
    // Enforce that the sum of the perturbed curvature is the same as the
    // rest curvature sum.  This prevents perturbation-induced discontinuity at
    // the endpoint.
    var posedCurvatureSum = computeCurvatureSum(this.curvatures);
    for (var cIdx=0; cIdx<this.curvatures.length; cIdx++) {
        var desiredCurvatureSum = (1-fracIdx)*this.restCurvatureSums[curveAIdx] + fracIdx*this.restCurvatureSums[curveBIdx];
        this.curvatures[cIdx] += (desiredCurvatureSum - posedCurvatureSum) / this.curvatures.length;
    }


    // Rebuild tangents from curvatures
    this.tangents[0].normalize();
    this.tangents[0].multiplyScalar((1-fracIdx)*this.restEdgeLens[curveAIdx] + fracIdx*this.restEdgeLens[curveBIdx]);
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

    // Compute centroid after fixing up positional continuity
    var centroid = new THREE.Vector3();
    for (var pIdx=0; pIdx<this.pts.length; pIdx++) {
        centroid.add(this.pts[pIdx]);
    }
    centroid.multiplyScalar(1.0/this.pts.length);

    // Move points so their centroid is at the origin
    // TODO do this to the obj matrix instead?
    for (var pIdx=0; pIdx<this.pts.length; pIdx++) {
        this.pts[pIdx].sub(centroid);
    }

    // Consider new point positions and rotate them about p0 so that
    // p0 -> p(n/2) matches the desired orientation.  This accounts for
    // the arbitrary rotations that arbitrary curvature operations cause.
    var currentAngle = computeBaseAngle(this.pts);
    var desiredAngle = (1-fracIdx)*this.restAngles[curveAIdx] + fracIdx*this.restAngles[curveBIdx];
    var originRotMat = new THREE.Matrix4();
    originRotMat.makeRotationZ(desiredAngle - currentAngle);
    for (var pIdx=0; pIdx<this.pts.length; pIdx++) {
        this.pts[pIdx].applyMatrix4(originRotMat);
    }

    // XXX TODO WTF Why do these lines need to be present?
    this.meshWhite.matrix.identity();
    this.meshWhite.applyMatrix(new THREE.Matrix4());
    this.meshColored.matrix.identity();
    this.meshColored.applyMatrix(new THREE.Matrix4());

    // commit new point positions
    this.geometry.update(
        new THREE.Vector3(0,0,1),
        this.pts,
        [0.02]);

    // Update particles.
    // "Spawn" a certain number of particles by resetting the
    // next few particles to be randomly positioned on the 
    // curve.

    for (var i=0; i<this.settings.spawnRate; i++) {
        var sparkIdx = this.nextSpawnIdx;
        var pIdx = Math.floor(Math.random()*this.pts.length-1);
        var spark = this.geometrySparks.vertices[sparkIdx];
        spark.copy(this.pts[pIdx]);

        this.nextSpawnIdx = (this.nextSpawnIdx+1) % this.geometrySparks.vertices.length;
    }
    // All other particles not just spawned will get updated.
    for (var i=0; i<this.geometrySparks.vertices.length - this.settings.spawnRate; i++) {
        var sparkIdx = (i + this.nextSpawnIdx) % this.geometrySparks.vertices.length;
        this.geometrySparks.vertices[sparkIdx].y += 0.003 + 0.01*Math.random();
        this.geometrySparks.vertices[sparkIdx].x += 0.001 * (Math.sin(time*20 + sparkIdx));

        var sparkColor = this.geometrySparks.colors[sparkIdx];
        var sparkAge = i/this.geometrySparks.vertices.length; // 0 to 1
        sparkColor.copy(this.meshColored.material.color);
        sparkColor.multiplyScalar(sparkAge);
    }

    this.geometrySparks.verticesNeedUpdate = true;
    this.geometrySparks.colorsNeedUpdate = true;

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
    if (isFunction(pts)) {
        var cs = [];
        for (var i=0; i<1000; i++) {
            cs[i] = pts(i, 1000);
        }
        return cs;
    }

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

/*
function computeBaseAngle1(pts) {
    var t = new THREE.Vector3();
    t.subVectors(pts[Math.floor((pts.length-1)/2)], pts[0]);
    t.normalize();
    return Math.atan2(t.y, t.x);
}

function computeBaseAngle2(pts) {
    var a = new THREE.Vector3();
    var b = new THREE.Vector3();
    a.subVectors(pts[1], pts[0]);
    b.subVectors(pts[pts.length-2], pts[pts.length-1]);
    a.normalize();
    b.normalize();
    a.add(b);
    a.normalize();
    return Math.atan2(a.y, a.x);
}
*/

function computeBaseAngle(pts) {
    var t = new THREE.Vector3();
    t.subVectors(pts[500], pts[0]);
    t.normalize();
    return Math.atan2(t.y, t.x);
}

function computeCurvatureSum(cs) {
    result = 0.0
    for (var i=0; i<cs.length; i++) {
        result += cs[i];
    }
    return result;
}

function computeEdgeLen(pts) {
    var e = new THREE.Vector3();
    e.subVectors(pts[1], pts[0]);
    return e.length();
}

// Thanks stackOverflow
function isFunction(x) {
    return Object.prototype.toString.call(x) == '[object Function]';
}