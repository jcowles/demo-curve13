/**
 * Given a curve, in a single 2d plane, generates a triangle strip ribbon.
 * With a little effort, this could be generalized to a 3-space curve/ribbon.
 *
 * @normal -- a single THREE.Vector3d
 * @curveVerts -- the Vector3d vertices of the curve
 * @widths -- either a single width or one width per vert
 *
 */
F.PlanerRibbonGeometry = function(normal, curveVerts, widths) {
    THREE.Geometry.call(this);
    this._lookup = [];
    this.update(normal, curveVerts, widths);
};

F.PlanerRibbonGeometry.prototype = Object.create( THREE.Geometry.prototype );

F.PlanerRibbonGeometry.prototype.update = function(normal, curveVerts, widths, alphaStart, alphaEnd) {
    alphaStart = alphaStart || 0.0;
    alphaEnd = alphaEnd || 1.0;

    if (alphaStart > 1) alphaStart = alphaStart % 1;
    if (alphaEnd > 1) alphaEnd = alphaEnd % 1;

    if (curveVerts.length < 2) 
        return;

    if (alphaStart != 0 || alphaEnd != 1)
        this._computeLookup(curveVerts);
    
    this.dynamic = true;
    this.verticesNeedUpdate = true;

    var start;
    var end;

    var face_i = 0;
    var uv_i = 0;

    function _blend(curveVerts, idxMix) {
        var mix = idxMix % 1;
        var idx = Math.floor(idxMix);
        if (mix == 0) return curveVerts[idx];
        var blended = curveVerts[idx].clone();
        return blended.lerp(curveVerts[idx+1], mix);
    }

    var idxMix = this._interPoint(curveVerts, alphaStart);
    var vert_0 = _blend(curveVerts, idxMix);
    start = Math.floor(idxMix);

    idxMix = this._interPoint(curveVerts, alphaEnd);
    var vert_N = _blend(curveVerts, idxMix); 
    end = Math.ceil(idxMix);
    var max = curveVerts.length-1;

    if (alphaStart <= alphaEnd) {
        // this is a normal subset of the curve, nothing fancy needed
        this._updateVerts(normal, curveVerts, widths, start, end, face_i, uv_i, vert_0, vert_N);        
        // collapse the remaing verts
        this._collapse(0, start-1, start);
        this._collapse(end+1, curveVerts.length+1, end);
    } else {
        // client has requested to loop around the entire curve, so we need another
        // disjoint set of faces.
    
        // For the first strip, we explicitly pin the end point to the end of the curve
        var temp = vert_N;
        vert_N = curveVerts[curveVerts.length-1].clone();
        this._updateVerts(normal, curveVerts, widths, start, curveVerts.length-1, face_i, uv_i, vert_0, vert_N);

        // For the second strip, we explicitly pin the start point to the beginning of the curve
        vert_N = temp;
        vert_0 = curveVerts[0].clone();
        this._updateVerts(normal, curveVerts, widths, curveVerts.length, curveVerts.length+1, face_i, uv_i, vert_0, vert_N);
        this._collapse(0, start-1, start);

        // Since we're inverted, we collapse the points between start and end
        //this._collapse(end+1, start-1, vert_0);
    }
    
    // We didn't need this, but may be desirable if this code is reused
    //this.computeCentroids();
}

F.PlanerRibbonGeometry.prototype._collapse = function(startCurveIndex, endCurveIndex, fixedIndex) {
    for(var i = startCurveIndex; i <= endCurveIndex; i++) {
        // each vertex on the curve corresponds to two face vertices
        this.vertices[i*2] = this.vertices[fixedIndex*2].clone();
        this.vertices[i*2+1] = this.vertices[fixedIndex*2 +1].clone();
    }
}

F.PlanerRibbonGeometry.prototype._interPoint = function(curveVerts, alpha) {
    if (alpha == 0)
        return 0;
    if (alpha == 1)
        return curveVerts.length - 1;

    if (this._lookup.length == 0) {
        console.error("No lookup table");
        return 0;
    }

    var tbl = this._lookup;
    var targ = alpha * tbl[tbl.length - 1];
    var idx = -1;

    for (var i = 0; i < tbl.length; i++) {
        if (tbl[i] > targ) {
            idx = i;
            break;
        }
    }

    if (idx == -1) { 
        console.error("Lookup value (" + targ + ") was too great");
        log(tbl);
        log(alpha);
        return 0;
    }

    var d = tbl[0];
    var localTarg = targ;

    if (idx > 0) {
        // segment length
        d = tbl[idx] - tbl[idx - 1];
        localTarg = targ - tbl[idx - 1];
    }

    var mix = localTarg / d;
    return idx + mix;
}

F.PlanerRibbonGeometry.prototype._interPoint_old = function(verts, alpha) {
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

F.PlanerRibbonGeometry.prototype._computeLookup = function(verts) {
    var me = this;
    var accum = 0;
    var lastVert = verts[0].clone();
    var isFirst = me._lookup.length == 0;

    for (var i = 1; i < verts.length; i++) {
        accum += lastVert.sub(verts[i]).length();

        if (isFirst)
            me._lookup.push(accum);
        else
            me._lookup[i-1] = accum;

        lastVert.copy(verts[i]);
    }
}

F.PlanerRibbonGeometry.prototype._updateVerts = function(normal, curveVerts, 
                                    widths, 
                                    start, end, 
                                    face_i, uv_i, 
                                    vert_0, vert_N) 
{
    var genFaces = this.faces.length == 0;
    var width = widths[0];
    var lastGoodCotangent = null;

    function get(index) {
        if (index == end)
            return vert_N;
        if (index == start)
            return vert_0;
        return curveVerts[index];
    }

    for(var index = start; index <= end; index++) {
        var vert;
        var nextVert;

        vert = get(index).clone();
        if (index == end) {
            nextVert = get(index-1).clone();
        } else {
            nextVert = get(index+1).clone();
        }

        if (widths.length > 1) 
            width = widths[index];

        var tangent = new THREE.Vector3();

        if (index == end) {
            tangent.subVectors(nextVert, vert);
        } else {
            tangent.subVectors(vert, nextVert);
        }
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

        this._addVert(index*2, cotangent1.multiplyScalar(-width).add(vert).add(zBump));
        this._addVert(index*2+1, cotangent2.multiplyScalar(width).add(vert).add(zBump));

        if (index > start && genFaces) {
            // once we've generated a quad's worth of points, start adding faces
            var vi = index*2 + 2;
            this._addFace(face_i, vi - 4, vi - 3, vi - 2, normal); face_i++;
            this._addFace(face_i, vi - 3, vi - 1, vi - 2, normal); face_i++;
        }
    }

    // Add one last quad, for wrapping
    // Note: this only works for trivial cases, but was enough for our purposes.
    if (genFaces) {
        this._addVert(index*2, cotangent1.clone().multiplyScalar(-width).add(vert).add(zBump));
        this._addVert(index*2+1, cotangent2.clone().multiplyScalar(width).add(vert).add(zBump));
        index++;
        this._addVert(index*2, cotangent1.clone().multiplyScalar(-width).add(vert).add(zBump));
        this._addVert(index*2+1, cotangent2.clone().multiplyScalar(width).add(vert).add(zBump));
        vi = index*2+2;
        this._addFace(face_i, vi - 4, vi - 3, vi - 2, normal); face_i++;
        this._addFace(face_i, vi - 3, vi - 1, vi - 2, normal); face_i++;
    }
};


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

