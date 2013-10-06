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

    //new F.PlanerRibbonGeometry(THREE.Vector3(0,0,1), [THREE.Vector3(0,0,0), THREE.Vector3(0,1,0)], [1.0])

    this.widths = widths;
    this.normal = normal;
    
    var width = widths[0];
    var count = 0;

    //
    // TODO: INCLUDE THE LAST QUAD PATCH
    //

    var start = 1//4;
    var end = curveVerts.length - 1;//24 
    for(var index = start; index < end; index++) {
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
        //log(tangent);
        
        // construct an ortho-normal basis using the normal and the tangent
        var cotangent1 = new THREE.Vector3();
        cotangent1.crossVectors(normal, tangent);
        // HACK: Because we know this is planer, we can take liberties
        /*
        if (cotangent1.y < 0 && cotangent1.y > 0) {
            var t = cotangent1.y;
            cotangent1.y = cotangent1.x;
            cotangent1.x = t;
        }
        */

        var cotangent2 = cotangent1.clone();

        var zBump = new THREE.Vector3(0,0,0);
        // We generate two verts for the last position on the curve.
        this.vertices.push(cotangent1.multiplyScalar(width).add(lastVert).add(zBump));
        this.vertices.push(cotangent2.multiplyScalar(-width).add(lastVert).add(zBump));
        count += 2;

        if (index > start) {
            // once we've generated a quad's worth of points, start adding faces
            var face1 = new THREE.Face3(count - 4, count - 3, count - 2);
            face1.normal.copy(normal);
            face1.vertexNormals.push(normal.clone(), normal.clone(), normal.clone());
            this.faces.push(face1);
            this.faceVertexUvs[0].push( [new THREE.Vector2(0, 0), 
                                         new THREE.Vector2(0, 0),
                                         new THREE.Vector2(0, 1)]);

            var face2 = new THREE.Face3(count - 3, count - 1, count - 2);
            face2.normal.copy(normal);
            face2.vertexNormals.push(normal.clone(), normal.clone(), normal.clone());
            this.faces.push(face2);
            this.faceVertexUvs[0].push( [new THREE.Vector2(0, 0), 
                                         new THREE.Vector2(0, 1),
                                         new THREE.Vector2(0, 1)]);
        }
    }

    this.computeCentroids();
};

F.PlanerRibbonGeometry.prototype = Object.create( THREE.Geometry.prototype );

