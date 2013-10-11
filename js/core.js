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
        [new F.Shots.Intro(), 0],

        [new F.Shots.CircleSpline_3(), 9.23],

        // Cold neon intro
        [new F.Shots.Warp_1(), 22.2],
        
        [new F.Shots.CircleSpline_4(), 28.5],

        // L has dwell and hard out
        [new F.Shots.Warp_3(), 35.0],

        [new F.Shots.CircleSpline_2(), 46.2],

        // M Sizzle strings 1
        [new F.Shots.Warp_2(), 52.5],

        [new F.Shots.CircleSpline_1(), 59.0],

        // M Sizzle strings 2
        [new F.Shots.Warp_2(), 65.27],

        [new F.Shots.CircleSpline_5(), 71.8],

        // S Beat 1
        [new F.Shots.Warp_2(), 73.4],

        [new F.Shots.CircleSpline_1(), 75.0],

        // S Beat 2
        [new F.Shots.Warp_2(), 76.6],

        // Whistle break
        [new F.Shots.CircleSpline_3(), 78.2],
            [new F.Shots.CircleSpline_2(), 86.5],
            [new F.Shots.CircleSpline_4(), 88.0],
            [new F.Shots.CircleSpline_5(), 89.5],
            [new F.Shots.CircleSpline_3(), 91.0],

        // M Beats 1
        [new F.Shots.Warp_2(), 93.7],

        [new F.Shots.CircleSpline_1(), 97.0],

        // M Beats 2
        [new F.Shots.Warp_2(), 100.1],

        [new F.Shots.CircleSpline_1(), 103.2],

        // L Neon beats and crescendo with hard out to outro
        [new F.Shots.Warp_2(), 106.4],
        
        [new F.Shots.CircleSpline_1(), 113.1],

        ]);

    seq.preload();

    // EDIT ME FOR CHOREOGRAPHY PURPOSES.
    // The number of seconds into the playlist we actually start playback.
    seq.setOffset(78.2);
}

function animate() {
    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame( animate );

    stats.update();
    seq.update();
}

