var renderer;
var stats, seq;

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

    renderer = new THREE.WebGLRenderer({
            antialias               : true,    // to get smoother output
            preserveDrawingBuffer   : true     // to allow screenshot
            });
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;

    document.body.appendChild( renderer.domElement );

    seq = new F.Seq(renderer, document.getElementById("soundtrack"));

    // Time units are ms
    //seq.addShot(new F.Shots.Warp_2(3));
    seq.addShot(new F.Shots.Intro(9.05));
    seq.addShot(new F.Shots.CircleSpline_1(10));
    seq.addShot(new F.Shots.Chase_1(5));
    seq.addShot(new F.Shots.Warp_2(5));
    seq.addShot(new F.Shots.CircleSpline_5(2));
    seq.addShot(new F.Shots.Warp_2(2));
    seq.addShot(new F.Shots.CircleSpline_3(10));
    seq.addShot(new F.Shots.Warp_2(2));
    seq.addShot(new F.Shots.CircleSpline_4(4));
    seq.addShot(new F.Shots.Warp_2(2));
    seq.addShot(new F.Shots.CircleSpline_2(5));
    seq.addShot(new F.Shots.Warp_2(2));
    seq.addShot(new F.Shots.CircleSpline_1(5));

    seq.preload();
}

function animate() {
    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame( animate );

    stats.update();
    seq.update();
}

