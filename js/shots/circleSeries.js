Circ = {};

// Renders the scene & camera and makes a mask
// then renders the masked scene into that mask, only revealing areas
// that overlap with the scene/camera
Circ.GetMaskComposer = function(renderer, scene, camera, maskedScene, maskedCamera) {
    var rwidth = window.innerWidth || 1;
    var rheight = window.innerHeight || 1;
    var parameters = { minFilter: THREE.LinearFilter, 
                       magFilter: THREE.LinearFilter, 
                       format: THREE.RGBFormat, 
                       stencilBuffer: true };

    var renderTarget = new THREE.WebGLRenderTarget(rwidth, rheight, parameters);
    var composer = new THREE.EffectComposer(renderer, renderTarget)
    
    composer.model = new THREE.RenderPass(scene, camera);
    composer.addPass(composer.model);

    var mask = new THREE.MaskPass(scene, camera);
    //mask.inverse = true;
    composer.addPass(mask);

    composer.modelM = new THREE.RenderPass(maskScene, maskCamera);
    composer.modelM.clear = false;
    composer.addPass(composer.modelM);

    composer.clearMask = new THREE.ClearMaskPass();
    composer.addPass(composer.clearMask);
   
    var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    effectCopy.renderToScreen = true;
    composer.addPass(effectCopy);

    return composer;
};

Circ.GetComposer = function(renderer, scene, camera) {
    var composer = new THREE.EffectComposer( renderer );
    
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
