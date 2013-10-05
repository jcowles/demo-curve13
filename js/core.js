var camera, scene, renderer;
var mesh, curve;
var stats;

// Global namespace
F = {}

// shortcut for console.log
function log(msg) {
    console.log(msg);
}

function init() {
    stats = new Stats();
    stats.domElement.style.position	= 'absolute';
    stats.domElement.style.bottom	= '0px';
    document.body.appendChild( stats.domElement );

    camera = new THREE.PerspectiveCamera( 75, 
                                window.innerWidth / window.innerHeight, 
                                1, 10000 );
    camera.position.z = 1000;

    scene = new THREE.Scene();


    initCube();
    initWarp();



    renderer = new THREE.WebGLRenderer({
            antialias               : true,                // to get smoother output
	        preserveDrawingBuffer   : true     // to allow screenshot
            });
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

}

function initCube() {
    geometry = new THREE.CubeGeometry( 200, 200, 200 );
    material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
}

function initWarp() {
    geometry = new THREE.Geometry();

    pts = [ new THREE.Vector3( -0.138231, 0.222749, 0.000000 ),new THREE.Vector3( -0.115424, 0.223475, 0.000000 ),new THREE.Vector3( -0.084204, 0.159594, 0.000000 ),new THREE.Vector3( -0.054426, 0.095046, 0.000000 ),new THREE.Vector3( -0.014720, 0.035934, 0.000000 ),new THREE.Vector3( 0.021958, -0.025057, 0.000000 ),new THREE.Vector3( 0.060144, -0.085139, 0.000000 ),new THREE.Vector3( 0.094180, -0.147603, 0.000000 ),new THREE.Vector3( 0.126803, -0.210799, 0.000000 ),new THREE.Vector3( 0.159426, -0.273994, 0.000000 ),new THREE.Vector3( 0.202838, -0.330507, 0.000000 ),new THREE.Vector3( 0.262858, -0.369467, 0.000000 ),new THREE.Vector3( 0.333951, -0.357164, 0.000000 ),new THREE.Vector3( 0.401142, -0.330556, 0.000000 ),new THREE.Vector3( 0.465390, -0.297369, 0.000000 ),new THREE.Vector3( 0.527541, -0.260358, 0.000000 ),new THREE.Vector3( 0.585306, -0.216756, 0.000000 ),new THREE.Vector3( 0.629910, -0.159704, 0.000000 ),new THREE.Vector3( 0.614339, -0.089263, 0.000000 ),new THREE.Vector3( 0.592720, -0.020499, 0.000000 ),new THREE.Vector3( 0.561394, 0.044302, 0.000000 ),new THREE.Vector3( 0.529772, 0.108955, 0.000000 ),new THREE.Vector3( 0.496738, 0.172880, 0.000000 ),new THREE.Vector3( 0.460917, 0.235244, 0.000000 ),new THREE.Vector3( 0.408222, 0.283814, 0.000000 ),new THREE.Vector3( 0.340383, 0.305722, 0.000000 ),new THREE.Vector3( 0.269878, 0.297656, 0.000000 ),new THREE.Vector3( 0.201056, 0.280684, 0.000000 ),new THREE.Vector3( 0.136929, 0.250714, 0.000000 ),new THREE.Vector3( 0.074225, 0.217912, 0.000000 ),new THREE.Vector3( 0.011522, 0.185110, 0.000000 ),new THREE.Vector3( -0.051182, 0.152308, 0.000000 ),new THREE.Vector3( -0.112307, 0.116687, 0.000000 ),new THREE.Vector3( -0.172632, 0.079741, 0.000000 ),new THREE.Vector3( -0.233533, 0.043743, 0.000000 ),new THREE.Vector3( -0.289916, 0.001074, 0.000000 ),new THREE.Vector3( -0.343666, -0.044844, 0.000000 ),new THREE.Vector3( -0.373005, -0.109141, 0.000000 ),new THREE.Vector3( -0.347769, -0.175542, 0.000000 ),new THREE.Vector3( -0.313746, -0.238015, 0.000000 ),new THREE.Vector3( -0.266520, -0.291459, 0.000000 ),new THREE.Vector3( -0.224420, -0.348932, 0.000000 ),new THREE.Vector3( -0.178821, -0.403738, 0.000000 ),new THREE.Vector3( -0.107590, -0.413711, 0.000000 ),new THREE.Vector3( -0.039660, -0.389096, 0.000000 ),new THREE.Vector3( 0.029966, -0.369955, 0.000000 ),new THREE.Vector3( 0.097785, -0.345029, 0.000000 ),new THREE.Vector3( 0.165111, -0.318773, 0.000000 ),new THREE.Vector3( 0.233132, -0.294416, 0.000000 ),new THREE.Vector3( 0.297552, -0.261569, 0.000000 ),new THREE.Vector3( 0.362722, -0.230260, 0.000000 ),new THREE.Vector3( 0.425654, -0.194609, 0.000000 ),new THREE.Vector3( 0.484309, -0.152222, 0.000000 ),new THREE.Vector3( 0.524243, -0.091807, 0.000000 ),new THREE.Vector3( 0.453848, -0.100718, 0.000000 ),new THREE.Vector3( 0.391145, -0.133520, 0.000000 ),new THREE.Vector3( 0.327713, -0.164911, 0.000000 ),new THREE.Vector3( 0.266549, -0.200467, 0.000000 ),new THREE.Vector3( 0.204604, -0.234662, 0.000000 ),new THREE.Vector3( 0.141901, -0.267464, 0.000000 ),new THREE.Vector3( 0.074616, -0.289632, 0.000000 ),new THREE.Vector3( 0.004683, -0.301477, 0.000000 ),new THREE.Vector3( -0.065470, -0.312027, 0.000000 ),new THREE.Vector3( -0.135217, -0.297731, 0.000000 ),new THREE.Vector3( -0.198854, -0.265299, 0.000000 ),new THREE.Vector3( -0.234376, -0.202758, 0.000000 ),new THREE.Vector3( -0.256656, -0.134212, 0.000000 ),new THREE.Vector3( -0.259221, -0.062010, 0.000000 ),new THREE.Vector3( -0.219337, -0.001563, 0.000000 ),new THREE.Vector3( -0.157900, 0.036637, 0.000000 ),new THREE.Vector3( -0.093470, 0.069463, 0.000000 ),new THREE.Vector3( -0.027070, 0.098023, 0.000000 ),new THREE.Vector3( 0.038564, 0.128332, 0.000000 ),new THREE.Vector3( 0.103146, 0.160855, 0.000000 ),new THREE.Vector3( 0.166839, 0.195109, 0.000000 ),new THREE.Vector3( 0.232608, 0.225118, 0.000000 ),new THREE.Vector3( 0.300208, 0.250645, 0.000000 ),new THREE.Vector3( 0.372243, 0.251844, 0.000000 ),new THREE.Vector3( 0.436510, 0.220147, 0.000000 ),new THREE.Vector3( 0.479897, 0.163616, 0.000000 ),new THREE.Vector3( 0.513920, 0.101143, 0.000000 ),new THREE.Vector3( 0.547943, 0.038671, 0.000000 ),new THREE.Vector3( 0.577703, -0.025885, 0.000000 ),new THREE.Vector3( 0.600679, -0.093076, 0.000000 ),new THREE.Vector3( 0.558656, -0.149886, 0.000000 ),new THREE.Vector3( 0.495952, -0.182688, 0.000000 ),new THREE.Vector3( 0.433249, -0.215490, 0.000000 ),new THREE.Vector3( 0.377442, -0.258904, 0.000000 ),new THREE.Vector3( 0.317039, -0.295723, 0.000000 ),new THREE.Vector3( 0.253661, -0.327220, 0.000000 ),new THREE.Vector3( 0.182741, -0.330746, 0.000000 ),new THREE.Vector3( 0.138847, -0.273914, 0.000000 ),new THREE.Vector3( 0.102271, -0.212000, 0.000000 ),new THREE.Vector3( 0.070683, -0.147330, 0.000000 ),new THREE.Vector3( 0.026960, -0.090363, 0.000000 ),new THREE.Vector3( -0.010284, -0.028859, 0.000000 ),new THREE.Vector3( -0.054056, 0.028068, 0.000000 ),new THREE.Vector3( -0.094151, 0.087707, 0.000000 ),new THREE.Vector3( -0.127750, 0.151328, 0.000000 ),new THREE.Vector3( -0.138231, 0.222749, 0.000000 )];

    for (i=0; i<pts.length; i++) {
        geometry.vertices.push(pts[i]); 
    }   

    material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 1, linewidth: 3} );

    line = new THREE.Line(geometry, material)
    line.scale.x = line.scale.y = line.scale.z = 200;
    scene.add( line );
}

function animateWarp() {
    for (i=0; i<line.geometry.vertices.length; i++) {
        //line.geometry.vertices[i] *= 1.001;
    }
    line.geometry.verticesNeedUpdate = true;
}

function animateCube() {
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;
}

function animate() {

    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame( animate );

    animateCube();
    animateWarp();

    renderer.render( scene, camera );

    stats.update();
}

