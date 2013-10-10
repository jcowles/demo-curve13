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
    seq.addShots([
        [new F.Shots.CircleSpline_1(), 0],
        [new F.Shots.Chase_1(), 9.23],
        [new F.Shots.Intro(), 22.2],
        [new F.Shots.Chase_1(), 28.5],
        [new F.Shots.Intro(), 35.0],
        [new F.Shots.Chase_1(), 46.2],
        [new F.Shots.Intro(), 52.5],
        [new F.Shots.Chase_1(), 59.0],
        [new F.Shots.Intro(), 65.27],

        [new F.Shots.Chase_1(), 71.8],
        [new F.Shots.Intro(), 73.4],
        [new F.Shots.Chase_1(), 75.0],
        [new F.Shots.Intro(), 76.6],
        [new F.Shots.Chase_1(), 78.2],
        [new F.Shots.Intro(), 93.7],

        [new F.Shots.Chase_1(), 97.0],
        [new F.Shots.Intro(), 100.1],
        [new F.Shots.Chase_1(), 103.2],
        [new F.Shots.Intro(), 106.4],
        [new F.Shots.Chase_1(), 113.1],
        ]);

    seq.preload();

    // EDIT ME FOR CHOREOGRAPHY PURPOSES.
    // The number of seconds into the playlist we actually start playback.
    seq.setOffset(0);
}

function animate() {
    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame( animate );

    stats.update();
    seq.update();
}

