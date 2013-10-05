var camera, scene, renderer;
var mesh;
var curveA, curveB, line, warpTime;
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

    curveA = [ new THREE.Vector3( -0.138231, 0.222749, 0.000000 ),new THREE.Vector3( -0.115424, 0.223475, 0.000000 ),new THREE.Vector3( -0.084204, 0.159594, 0.000000 ),new THREE.Vector3( -0.054426, 0.095046, 0.000000 ),new THREE.Vector3( -0.014720, 0.035934, 0.000000 ),new THREE.Vector3( 0.021958, -0.025057, 0.000000 ),new THREE.Vector3( 0.060144, -0.085139, 0.000000 ),new THREE.Vector3( 0.094180, -0.147603, 0.000000 ),new THREE.Vector3( 0.126803, -0.210799, 0.000000 ),new THREE.Vector3( 0.159426, -0.273994, 0.000000 ),new THREE.Vector3( 0.202838, -0.330507, 0.000000 ),new THREE.Vector3( 0.262858, -0.369467, 0.000000 ),new THREE.Vector3( 0.333951, -0.357164, 0.000000 ),new THREE.Vector3( 0.401142, -0.330556, 0.000000 ),new THREE.Vector3( 0.465390, -0.297369, 0.000000 ),new THREE.Vector3( 0.527541, -0.260358, 0.000000 ),new THREE.Vector3( 0.585306, -0.216756, 0.000000 ),new THREE.Vector3( 0.629910, -0.159704, 0.000000 ),new THREE.Vector3( 0.614339, -0.089263, 0.000000 ),new THREE.Vector3( 0.592720, -0.020499, 0.000000 ),new THREE.Vector3( 0.561394, 0.044302, 0.000000 ),new THREE.Vector3( 0.529772, 0.108955, 0.000000 ),new THREE.Vector3( 0.496738, 0.172880, 0.000000 ),new THREE.Vector3( 0.460917, 0.235244, 0.000000 ),new THREE.Vector3( 0.408222, 0.283814, 0.000000 ),new THREE.Vector3( 0.340383, 0.305722, 0.000000 ),new THREE.Vector3( 0.269878, 0.297656, 0.000000 ),new THREE.Vector3( 0.201056, 0.280684, 0.000000 ),new THREE.Vector3( 0.136929, 0.250714, 0.000000 ),new THREE.Vector3( 0.074225, 0.217912, 0.000000 ),new THREE.Vector3( 0.011522, 0.185110, 0.000000 ),new THREE.Vector3( -0.051182, 0.152308, 0.000000 ),new THREE.Vector3( -0.112307, 0.116687, 0.000000 ),new THREE.Vector3( -0.172632, 0.079741, 0.000000 ),new THREE.Vector3( -0.233533, 0.043743, 0.000000 ),new THREE.Vector3( -0.289916, 0.001074, 0.000000 ),new THREE.Vector3( -0.343666, -0.044844, 0.000000 ),new THREE.Vector3( -0.373005, -0.109141, 0.000000 ),new THREE.Vector3( -0.347769, -0.175542, 0.000000 ),new THREE.Vector3( -0.313746, -0.238015, 0.000000 ),new THREE.Vector3( -0.266520, -0.291459, 0.000000 ),new THREE.Vector3( -0.224420, -0.348932, 0.000000 ),new THREE.Vector3( -0.178821, -0.403738, 0.000000 ),new THREE.Vector3( -0.107590, -0.413711, 0.000000 ),new THREE.Vector3( -0.039660, -0.389096, 0.000000 ),new THREE.Vector3( 0.029966, -0.369955, 0.000000 ),new THREE.Vector3( 0.097785, -0.345029, 0.000000 ),new THREE.Vector3( 0.165111, -0.318773, 0.000000 ),new THREE.Vector3( 0.233132, -0.294416, 0.000000 ),new THREE.Vector3( 0.297552, -0.261569, 0.000000 ),new THREE.Vector3( 0.362722, -0.230260, 0.000000 ),new THREE.Vector3( 0.425654, -0.194609, 0.000000 ),new THREE.Vector3( 0.484309, -0.152222, 0.000000 ),new THREE.Vector3( 0.524243, -0.091807, 0.000000 ),new THREE.Vector3( 0.453848, -0.100718, 0.000000 ),new THREE.Vector3( 0.391145, -0.133520, 0.000000 ),new THREE.Vector3( 0.327713, -0.164911, 0.000000 ),new THREE.Vector3( 0.266549, -0.200467, 0.000000 ),new THREE.Vector3( 0.204604, -0.234662, 0.000000 ),new THREE.Vector3( 0.141901, -0.267464, 0.000000 ),new THREE.Vector3( 0.074616, -0.289632, 0.000000 ),new THREE.Vector3( 0.004683, -0.301477, 0.000000 ),new THREE.Vector3( -0.065470, -0.312027, 0.000000 ),new THREE.Vector3( -0.135217, -0.297731, 0.000000 ),new THREE.Vector3( -0.198854, -0.265299, 0.000000 ),new THREE.Vector3( -0.234376, -0.202758, 0.000000 ),new THREE.Vector3( -0.256656, -0.134212, 0.000000 ),new THREE.Vector3( -0.259221, -0.062010, 0.000000 ),new THREE.Vector3( -0.219337, -0.001563, 0.000000 ),new THREE.Vector3( -0.157900, 0.036637, 0.000000 ),new THREE.Vector3( -0.093470, 0.069463, 0.000000 ),new THREE.Vector3( -0.027070, 0.098023, 0.000000 ),new THREE.Vector3( 0.038564, 0.128332, 0.000000 ),new THREE.Vector3( 0.103146, 0.160855, 0.000000 ),new THREE.Vector3( 0.166839, 0.195109, 0.000000 ),new THREE.Vector3( 0.232608, 0.225118, 0.000000 ),new THREE.Vector3( 0.300208, 0.250645, 0.000000 ),new THREE.Vector3( 0.372243, 0.251844, 0.000000 ),new THREE.Vector3( 0.436510, 0.220147, 0.000000 ),new THREE.Vector3( 0.479897, 0.163616, 0.000000 ),new THREE.Vector3( 0.513920, 0.101143, 0.000000 ),new THREE.Vector3( 0.547943, 0.038671, 0.000000 ),new THREE.Vector3( 0.577703, -0.025885, 0.000000 ),new THREE.Vector3( 0.600679, -0.093076, 0.000000 ),new THREE.Vector3( 0.558656, -0.149886, 0.000000 ),new THREE.Vector3( 0.495952, -0.182688, 0.000000 ),new THREE.Vector3( 0.433249, -0.215490, 0.000000 ),new THREE.Vector3( 0.377442, -0.258904, 0.000000 ),new THREE.Vector3( 0.317039, -0.295723, 0.000000 ),new THREE.Vector3( 0.253661, -0.327220, 0.000000 ),new THREE.Vector3( 0.182741, -0.330746, 0.000000 ),new THREE.Vector3( 0.138847, -0.273914, 0.000000 ),new THREE.Vector3( 0.102271, -0.212000, 0.000000 ),new THREE.Vector3( 0.070683, -0.147330, 0.000000 ),new THREE.Vector3( 0.026960, -0.090363, 0.000000 ),new THREE.Vector3( -0.010284, -0.028859, 0.000000 ),new THREE.Vector3( -0.054056, 0.028068, 0.000000 ),new THREE.Vector3( -0.094151, 0.087707, 0.000000 ),new THREE.Vector3( -0.127750, 0.151328, 0.000000 ),new THREE.Vector3( -0.138231, 0.222749, 0.000000 )];
    curveB = [ new THREE.Vector3( -0.138231, 0.222749, 0.000000 ), new THREE.Vector3( -0.115751, 0.222724, 0.000000 ), new THREE.Vector3( -0.093494, 0.219554, 0.000000 ), new THREE.Vector3( -0.071399, 0.215407, 0.000000 ), new THREE.Vector3( -0.049710, 0.209495, 0.000000 ), new THREE.Vector3( -0.027973, 0.203763, 0.000000 ), new THREE.Vector3( -0.006840, 0.196105, 0.000000 ), new THREE.Vector3( 0.014397, 0.188738, 0.000000 ), new THREE.Vector3( 0.032753, 0.175790, 0.000000 ), new THREE.Vector3( 0.050131, 0.161566, 0.000000 ), new THREE.Vector3( 0.066562, 0.146267, 0.000000 ), new THREE.Vector3( 0.075849, 0.125879, 0.000000 ), new THREE.Vector3( 0.084940, 0.105405, 0.000000 ), new THREE.Vector3( 0.079635, 0.083750, 0.000000 ), new THREE.Vector3( 0.064026, 0.067949, 0.000000 ), new THREE.Vector3( 0.048200, 0.052368, 0.000000 ), new THREE.Vector3( 0.031237, 0.038049, 0.000000 ), new THREE.Vector3( 0.014143, 0.023889, 0.000000 ), new THREE.Vector3( -0.006367, 0.015482, 0.000000 ), new THREE.Vector3( -0.027286, 0.008169, 0.000000 ), new THREE.Vector3( -0.048279, 0.001072, 0.000000 ), new THREE.Vector3( -0.069756, -0.004364, 0.000000 ), new THREE.Vector3( -0.090532, -0.012080, 0.000000 ), new THREE.Vector3( -0.110753, -0.021164, 0.000000 ), new THREE.Vector3( -0.128954, -0.033855, 0.000000 ), new THREE.Vector3( -0.146389, -0.047587, 0.000000 ), new THREE.Vector3( -0.164589, -0.060278, 0.000000 ), new THREE.Vector3( -0.183271, -0.072239, 0.000000 ), new THREE.Vector3( -0.202270, -0.083684, 0.000000 ), new THREE.Vector3( -0.221527, -0.094686, 0.000000 ), new THREE.Vector3( -0.239496, -0.107704, 0.000000 ), new THREE.Vector3( -0.256457, -0.122025, 0.000000 ), new THREE.Vector3( -0.272066, -0.137827, 0.000000 ), new THREE.Vector3( -0.287675, -0.153628, 0.000000 ), new THREE.Vector3( -0.302940, -0.169766, 0.000000 ), new THREE.Vector3( -0.315497, -0.188117, 0.000000 ), new THREE.Vector3( -0.328280, -0.206309, 0.000000 ), new THREE.Vector3( -0.334964, -0.227567, 0.000000 ), new THREE.Vector3( -0.339299, -0.249445, 0.000000 ), new THREE.Vector3( -0.339131, -0.271781, 0.000000 ), new THREE.Vector3( -0.338963, -0.294117, 0.000000 ), new THREE.Vector3( -0.338795, -0.316453, 0.000000 ), new THREE.Vector3( -0.332448, -0.337917, 0.000000 ), new THREE.Vector3( -0.324345, -0.358795, 0.000000 ), new THREE.Vector3( -0.310232, -0.376236, 0.000000 ), new THREE.Vector3( -0.292566, -0.390104, 0.000000 ), new THREE.Vector3( -0.270896, -0.396083, 0.000000 ), new THREE.Vector3( -0.248620, -0.399112, 0.000000 ), new THREE.Vector3( -0.226146, -0.398615, 0.000000 ), new THREE.Vector3( -0.203693, -0.397564, 0.000000 ), new THREE.Vector3( -0.181219, -0.397095, 0.000000 ), new THREE.Vector3( -0.158799, -0.395488, 0.000000 ), new THREE.Vector3( -0.136476, -0.392876, 0.000000 ), new THREE.Vector3( -0.114052, -0.391326, 0.000000 ), new THREE.Vector3( -0.091899, -0.387547, 0.000000 ), new THREE.Vector3( -0.070355, -0.381178, 0.000000 ), new THREE.Vector3( -0.048537, -0.375809, 0.000000 ), new THREE.Vector3( -0.027325, -0.368419, 0.000000 ), new THREE.Vector3( -0.006706, -0.359525, 0.000000 ), new THREE.Vector3( 0.014010, -0.350855, 0.000000 ), new THREE.Vector3( 0.030279, -0.335435, 0.000000 ), new THREE.Vector3( 0.041190, -0.315905, 0.000000 ), new THREE.Vector3( 0.044754, -0.293878, 0.000000 ), new THREE.Vector3( 0.040635, -0.272007, 0.000000 ), new THREE.Vector3( 0.026926, -0.254560, 0.000000 ), new THREE.Vector3( 0.015569, -0.235480, 0.000000 ), new THREE.Vector3( 0.000106, -0.219584, 0.000000 ), new THREE.Vector3( -0.017681, -0.206364, 0.000000 ), new THREE.Vector3( -0.037021, -0.195561, 0.000000 ), new THREE.Vector3( -0.056221, -0.184510, 0.000000 ), new THREE.Vector3( -0.073958, -0.171222, 0.000000 ), new THREE.Vector3( -0.093909, -0.161602, 0.000000 ), new THREE.Vector3( -0.113647, -0.151548, 0.000000 ), new THREE.Vector3( -0.133928, -0.142650, 0.000000 ), new THREE.Vector3( -0.154210, -0.133752, 0.000000 ), new THREE.Vector3( -0.173920, -0.123644, 0.000000 ), new THREE.Vector3( -0.192376, -0.111383, 0.000000 ), new THREE.Vector3( -0.209900, -0.097814, 0.000000 ), new THREE.Vector3( -0.225797, -0.082355, 0.000000 ), new THREE.Vector3( -0.241016, -0.066223, 0.000000 ), new THREE.Vector3( -0.256213, -0.050070, 0.000000 ), new THREE.Vector3( -0.271828, -0.034325, 0.000000 ), new THREE.Vector3( -0.285669, -0.016984, 0.000000 ), new THREE.Vector3( -0.295488, 0.002943, 0.000000 ), new THREE.Vector3( -0.302454, 0.024058, 0.000000 ), new THREE.Vector3( -0.308898, 0.045343, 0.000000 ), new THREE.Vector3( -0.310142, 0.067585, 0.000000 ), new THREE.Vector3( -0.313751, 0.089550, 0.000000 ), new THREE.Vector3( -0.317450, 0.111499, 0.000000 ), new THREE.Vector3( -0.317734, 0.133782, 0.000000 ), new THREE.Vector3( -0.314421, 0.155846, 0.000000 ), new THREE.Vector3( -0.303970, 0.175622, 0.000000 ), new THREE.Vector3( -0.288242, 0.191588, 0.000000 ), new THREE.Vector3( -0.269826, 0.204401, 0.000000 ), new THREE.Vector3( -0.249808, 0.214565, 0.000000 ), new THREE.Vector3( -0.227924, 0.219657, 0.000000 ), new THREE.Vector3( -0.205669, 0.222795, 0.000000 ), new THREE.Vector3( -0.183190, 0.222780, 0.000000 ), new THREE.Vector3( -0.160710, 0.222764, 0.000000 ), new THREE.Vector3( -0.138231, 0.222749, 0.000000 ) ]

    pts = curveA;

    for (i=0; i<pts.length; i++) {
        geometry.vertices.push(pts[i]); 
    }   

    material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 1, linewidth: 3} );

    line = new THREE.Line(geometry, material)
    line.scale.x = line.scale.y = line.scale.z = 200;
    scene.add( line );

    warpTime = 0;
}

function animateWarp() {
    for (i=0; i<line.geometry.vertices.length; i++) {
        p = line.geometry.vertices[i];

        pa = curveA[i];
        pb = curveB[i];
        p.set(pa.x, pa.y, pa.z);
        p.lerp(pb, warpTime);
    }
    line.geometry.verticesNeedUpdate = true;

    if (warpTime < 1) {
        warpTime += 1.0/(60*60);
    }
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

