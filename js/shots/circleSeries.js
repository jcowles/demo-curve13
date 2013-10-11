Circ = {};
Circ.GetComposer = function(renderer, scene, camera) {
    composer = new THREE.EffectComposer( renderer );
    
    composer.model = new THREE.RenderPass(scene, camera);
    composer.addPass(composer.model); // render to buffer1

    composer.vignette = new THREE.ShaderPass(THREE.VignetteShader);
    composer.vignette.uniforms[ "offset" ].value = .7;
    composer.vignette.uniforms[ "darkness" ].value = 0.5;
    composer.vignette.renderToScreen = false;
    composer.vignette.enabled = false;
    composer.addPass(composer.vignette);

    composer.tiltH = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader );
    composer.addPass(composer.tiltH);

    composer.tiltV = new THREE.ShaderPass( THREE.VerticalTiltShiftShader );
    composer.addPass(composer.tiltV);

    composer.setTiltDepth = function(r) {
        composer.tiltH.uniforms[ 'r' ].value = r;
        composer.tiltH.uniforms[ 'r' ].value = r;
    };
    composer.setTiltBlur = function(b, f) {
        composer.tiltV.uniforms[ 'v' ].value = (b / window.innerWidth) * f;
        composer.tiltH.uniforms[ 'h' ].value = (b / window.innerWidth) * f;
    };
    composer.setTiltEnabled = function(en) {
        this.tiltV.enabled = en;
        this.tiltH.enabled = en;
    };

    composer.setTiltDepth(0.5);
    composer.setTiltBlur(4, 5);
    composer.setTiltEnabled(false);


    composer.rgb = new THREE.ShaderPass( THREE.RGBShiftShader );
    composer.rgb.uniforms[ 'amount' ].value = 0.0;
    composer.rgb.renderToScreen = true;
    composer.addPass(composer.rgb);

    composer.film = new THREE.FilmPass(.5, 0.25, 4096, false);
    composer.film.renderToScreen = true;
    composer.film.enabled = false;
    composer.addPass(composer.film);


    return composer;
}
