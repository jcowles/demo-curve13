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

F.PlanerRibbonGeometry.prototype.update = function(normal, curveVerts, widths, initialized) {
    this.dynamic = true;
    //this.buffersNeedUpdate = true;
    this.verticesNeedUpdate = true;
    this.elementsNeedUpdate = true;
    //this.colorsNeedUpdate = true;
    this.uvsNeedUpdate = true;
    this.normalsNeedUpdate = true;
    //this.tangentsNeedUpdate = true;
    //this.lineDistancesNeedUpdate = true;

    var width = widths[0];
    var count = 0;

    var start = 1//4;
    var end = curveVerts.length - 1;//24 
    var lastGoodCotangent = null;

    var vert_i = 0;
    var face_i = 0;
    var uv_i = 0;

    for(var index = start; index <= end; index++) {
        var vert = curveVerts[index].clone();
        //vert.z = 0;
        var lastVert = curveVerts[index-1].clone();
        //lastVert.z = 0;
        
        if (widths.length > 1) 
            width = widths[index];

        var tangent = new THREE.Vector3();

        tangent.subVectors(vert, lastVert);
        tangent.normalize();
        normal.normalize();
        
        // construct an ortho-normal basis using the normal and the tangent
        var cotangent1 = new THREE.Vector3();
        cotangent1.crossVectors(normal, tangent);
        if (cotangent1.length() < .0001) {
            cotangent1 = lastGoodCotangent.clone();
        }
        lastGoodCotangent = cotangent1.clone(); 
        var cotangentOrig = cotangent1.clone();
        var cotangent2 = cotangent1.clone();

        var zBump = new THREE.Vector3(0,0,0);
        // We generate two verts for the previous position on the curve.
        this._addVert(vert_i, cotangent1.multiplyScalar(width).add(lastVert).add(zBump)); vert_i++;
        this._addVert(vert_i, cotangent2.multiplyScalar(-width).add(lastVert).add(zBump)); vert_i++;
        count += 2;

        if (index > start) {
            // once we've generated a quad's worth of points, start adding faces
            this._addFace(face_i, count - 4, count - 3, count - 2, normal); face_i++;
            this._addFace(face_i, count - 3, count - 1, count - 2, normal); face_i++;

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

            if (index == end) {
                // We generate two verts for the last vert on the curve, using the
                // same tangent and width (since we can't calculate a cotangent
                // for the last vert).
                cotangent1 = cotangentOrig.clone();
                cotangent2 = cotangentOrig.clone();
                this._addVert(vert_i, cotangent1.multiplyScalar(width).add(vert).add(zBump)); vert_i++;
                this._addVert(vert_i, cotangent2.multiplyScalar(-width).add(vert).add(zBump)); vert_i++;
                count += 2;

                this._addFace(face_i, count - 4, count - 3, count - 2, normal); face_i++;
                this._addFace(face_i, count - 3, count - 1, count - 2, normal); face_i++;
                                
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
    }

    // not sure what this does, could comment out if we need speed boost
    this.computeCentroids();
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

F.PlanerRibbonGeometry.prototype._addUv= function(index, uva, uvb, uvc) {
    if (this.faceVertexUvs[0].length == index) {
        this.faceVertexUvs[0].push([uva, uvb, uvc]);
    } else {
        this.faceVertexUvs[0][index][0].copy(uva);
        this.faceVertexUvs[0][index][1].copy(uvb);
        this.faceVertexUvs[0][index][2].copy(uvc);
    }
}


