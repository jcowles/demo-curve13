
Circ.Settings = function() {
    this.composer = new THREE.EffectComposer( renderer );
    
    var renderModel = new THREE.RenderPass(this.sceneColored, this.camera);
    this.composer.addPass( renderModel ); // render to buffer1

    var effectBloom = new THREE.BloomPass(2.3, 25, 4.0, 512);
    this.composer.addPass( effectBloom ); // render to internal buffers, finally to buffer1

    this.composer.addPass(renderSparks); // render to buffer1

    var renderModelWhite = new THREE.RenderPass(this.sceneWhite, this.camera);
    renderModelWhite.clear = false;
    this.composer.addPass(renderModelWhite); // render to buffer1
    
    var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    effectCopy.renderToScreen = true;
    this.composer.addPass( effectCopy ); // render to screen
}
