/**
 * given a curve, in a single 2d plane, generates a triangle strip ribbon.
 *
 * @normal -- a single THREE.Vector3d
 * @curveVerts -- the vertices of the curve
 * @widths -- either a single width or one width per vert
 *
 */
F.PlanerRibbonGeometry = function(normal, curveVerts, widths) {
    THREE.Geometry.call(this);
    this.update(normal, curveVerts, widths);
};

F.PlanerRibbonGeometry.prototype = Object.create( THREE.Geometry.prototype );

F.PlanerRibbonGeometry.prototype.update = function(normal, curveVerts, widths, alphaStart, alphaEnd) {
    alphaStart = Math.max(alphaStart || 0.0, 0.0);
    alphaEnd = Math.min(alphaEnd || 1.0, 1.0);

    if (curveVerts.length < 2) 
        return;

    this.dynamic = true;
    //this.buffersNeedUpdate = true;
    this.verticesNeedUpdate = true;
    this.elementsNeedUpdate = true;
    //this.colorsNeedUpdate = true;
    this.uvsNeedUpdate = true;
    this.normalsNeedUpdate = true;
    //this.tangentsNeedUpdate = true;
    //this.lineDistancesNeedUpdate = true;

    //var start = 1//4;
    //var end = curveVerts.length - 1;//24 
    var start = Math.floor((curveVerts.length-1)*alphaStart) + 1;
    var end = Math.floor(((curveVerts.length-1)*alphaEnd));
    end = Math.max(start, end);
    //log("Start: " + start + " end: " + end);
    //log("a-Start: " + alphaStart + " a-end: " + alphaEnd);

    var vert_i = 0;
    var face_i = 0;
    var uv_i = 0;

    var vert_0 = this._interPoint(curveVerts, alphaStart);
    var vert_N = this._interPoint(curveVerts, alphaEnd);

    var max = curveVerts.length-1;

    if (alphaStart <= alphaEnd) {
        // this is a normal subset of the curve, nothing fancy needed
        this._updateVerts(normal, curveVerts, widths, start, end, vert_i, face_i, uv_i, vert_0, vert_N);
        // collapse the remaing verts
        this._collapse(0, Math.max(start-2, 0), start-1);
        this._collapse(end, curveVerts.length-1, end);
    } else {
        // client has requested to loop around the entire curve, so we need another
        // disjoint set of faces.
    
        // For the first strip, we explicitly pin the end point to the end of the curve
        var temp = vert_N;
        vert_N = curveVerts[curveVerts.length-1];
        this._updateVerts(normal, curveVerts, widths, start, end, vert_i, face_i, uv_i, vert_0, vert_N);

        // For the second strip, we explicitly pin the start point to the beginning of the curve
        vert_N = temp;
        vert_0 = curveVerts[0];
        this._updateVerts(normal, curveVerts, widths, start, end, vert_i, face_i, uv_i, vert_0, vert_N);

        // Since we're inverted, we collapse the points between start and end
        this._collapse(start, curveVerts.length-1, vert_0);
        this._collapse(0, end, vert_N);
    }
    
    // not sure what this does, seems related to culling
    //this.computeCentroids();
}

F.PlanerRibbonGeometry.prototype._collapse = function(startCurveIndex, endCurveIndex, fixedIndex) {
    for(var i = startCurveIndex; i <= endCurveIndex; i++) {
        // each vertex on the curve corresponds to two face vertices
        this.vertices[i*2] = this.vertices[fixedIndex*2].clone();
        this.vertices[i*2+1] = this.vertices[fixedIndex*2 +1].clone();
    }
}

F.PlanerRibbonGeometry.prototype._updateVerts = function(normal, curveVerts, 
                                    widths, 
                                    start, end, 
                                    vert_i, face_i, uv_i, 
                                    vert_0, vert_N) 
{
    var width = widths[0];
    var lastGoodCotangent = null;
    for(var index = start; index <= end; index++) {
        var vert = curveVerts[index].clone();
        //vert.z = 0;
        var lastVert = curveVerts[index-1].clone();
        //lastVert.z = 0;
        
        if (index == start) {
            lastVert.copy(vert_0);
        } 
        if (index == end) {
            vert.copy(vert_N);
        }

        if (widths.length > 1) 
            width = widths[index];

        var tangent = new THREE.Vector3();

        tangent.subVectors(vert, lastVert);
        tangent.normalize();
        
        // construct an ortho-normal basis using the normal and the tangent
        var cotangent1 = new THREE.Vector3();
        cotangent1.crossVectors(normal, tangent);
        if (lastGoodCotangent && cotangent1.length() < .0001) {
            cotangent1 = lastGoodCotangent.clone();
        }
        lastGoodCotangent = cotangent1.clone(); 
        var cotangentOrig = cotangent1.clone();
        var cotangent2 = cotangent1.clone();

        var zBump = new THREE.Vector3(0,0,0);
        // We generate two verts for the previous position on the curve.
        this._addVert(vert_i, cotangent1.multiplyScalar(width).add(lastVert).add(zBump)); vert_i++;
        this._addVert(vert_i, cotangent2.multiplyScalar(-width).add(lastVert).add(zBump)); vert_i++;

        if (index > start) {
            // once we've generated a quad's worth of points, start adding faces
            this._addFace(face_i, vert_i - 4, vert_i - 3, vert_i - 2, normal); face_i++;
            this._addFace(face_i, vert_i - 3, vert_i - 1, vert_i - 2, normal); face_i++;

            // XXX: UVs have not been tested!
            // v1 is the V-coord for the previous vert on the curve
            // v2 is the V-coord for the current vert on the curve
            var v2 = (index-2)/(curveVerts.length-1);
            var v1 = (index-1)/(curveVerts.length-1);
            this._addUv(uv_i, new THREE.Vector2(0, v2), 
                              new THREE.Vector2(1, v2),
                              new THREE.Vector2(0, v1)); uv_i++;
            this._addUv(uv_i, new THREE.Vector2(1, v2), 
                              new THREE.Vector2(1, v1),
                              new THREE.Vector2(0, v1)); uv_i++;
        }

        if (index == end) {
            // We generate two verts for the last vert on the curve, using the
            // same tangent and width (since we can't calculate a cotangent
            // for the last vert).
            cotangent1 = cotangentOrig.clone();
            cotangent2 = cotangentOrig.clone();
            this._addVert(vert_i, cotangent1.multiplyScalar(width).add(vert).add(zBump)); vert_i++;
            this._addVert(vert_i, cotangent2.multiplyScalar(-width).add(vert).add(zBump)); vert_i++;

            this._addFace(face_i, vert_i - 4, vert_i - 3, vert_i - 2, normal); face_i++;
            this._addFace(face_i, vert_i - 3, vert_i - 1, vert_i - 2, normal); face_i++;
                            
            // XXX: UVs have not been tested!
            // v1 is the V-coord for the last vert on the curve
            // v2 is the V-coord for the last-1 vert on the curve
            var v2 = (index-1)/(curveVerts.length-1);
            var v1 = (index)/(curveVerts.length-1);
            this._addUv(uv_i, new THREE.Vector2(0, v1), 
                              new THREE.Vector2(1, v1),
                              new THREE.Vector2(0, v2)); uv_i++;
            this._addUv(uv_i,new THREE.Vector2(1, v1), 
                             new THREE.Vector2(1, v2),
                             new THREE.Vector2(0, v2)); uv_i++;
        }
    }
};


F.PlanerRibbonGeometry.prototype._interPoint = function(verts, alpha) {
    var val = (verts.length-1)*alpha;
    var p0 = Math.floor(val);
    var p1 = Math.ceil(val);
    if (p0 == p1)
        return verts[p0];
    var v = new THREE.Vector3();
    v.copy(verts[p0]);
    v.lerp(verts[p1], val % 1);
    return v;
}

//
// In-place updates to avoid thrashing the garbage collector.
//
F.PlanerRibbonGeometry.prototype._addVert = function(index, vert) {
    if (this.vertices.length == index) {
        this.vertices.push(vert);
    } else {
        this.vertices[index].copy(vert);
    }
}

F.PlanerRibbonGeometry.prototype._addFace = function(index, a, b, c, normal) {
    if (this.faces.length == index) {
        var face1 = new THREE.Face3(a, b, c);
        face1.normal.copy(normal);
        face1.vertexNormals.push(normal.clone(), normal.clone(), normal.clone());
        this.faces.push(face1);
    } else {
        this.faces[index].a = a;
        this.faces[index].b = b;
        this.faces[index].c = c;
        // Leveraging the fact that we know normals are fixed 
    }
}

F.PlanerRibbonGeometry.prototype._addUv= function(index, uva, uvb, uvc) {
    if (this.faceVertexUvs[0].length == index) {
        this.faceVertexUvs[0].push([uva, uvb, uvc]);
    } else {
        this.faceVertexUvs[0][index][0].copy(uva);
        this.faceVertexUvs[0][index][1].copy(uvb);
        this.faceVertexUvs[0][index][2].copy(uvc);
    }
}


