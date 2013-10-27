Circ = {};

CircleSplineBg = 0x111111;
csLineA = 0x30D6FF;
csLineB = 0xFFFFFF;
csIters = 10;

Circ.applyAngle = function(tracer, a, b, max, state) {
    if (state.angle < max) {
        tracer.arc(a,b,state.angle,state.lock);
        state.lock = true;
    } else {
        tracer.arc(a,b,max,state.lock);
        state.angle -= max;
    }
    return state;
}

Circ.ArcTracer = function (origin, size, offset) {

    var DegToRad = (Math.PI/180);

    this.reset = function(origin, size, offset) {
        this.origin = origin; 
        this.size = size;
        this.offset = offset;
        this.xLoc = 0;
        this.yLoc = 0;
        this.xAngle = 0;
        this.yAngle = 0;
        this.points = [];
        this.t = 0;
        this.iterations = 3;
        this.zFactor = 1.0;
    };


    this.reset(origin, size, offset);

    this.arc = function (xAdj, yAdj, sweepDeg, lock) {
        lock = lock || false;
        var start = this.points.length == 0 ? 0 : 1;

        if (lock) {
            if (this.points.length == 0) {
                console.error("Unable to lock with zero points!");
            }
            // lock all generated verts to the last generated vertex
            var point = this.points[this.points.length-1];
            for (var i = start; i < this.iterations; i++) {
                this.points.push(point);
            }
            return;
        }

        var sweepRad = sweepDeg * DegToRad; 
        
        if (xAdj != 0) {
            this.xLoc += xAdj;
            this.xAngle += Math.PI * xAdj;
            this.offset *= -1;
        }
        if (yAdj != 0) {
            this.yLoc += yAdj;
            this.yAngle += Math.PI * yAdj;
            this.offset *= -1;
        }

        var size = this.size + this.offset;

        // subtract one to close the circle at angle = 360
        var dtheta = sweepRad / (this.iterations-1);

        for (var i = start; i < this.iterations; i++) {
            this.t += 1;
            var nextPoint = new THREE.Vector3(
                                this.origin.x + (this.xLoc*2*this.size) + size*Math.cos(this.xAngle+(i*dtheta)), 
                                this.origin.y + (this.yLoc*2*this.size) + size*Math.sin(this.yAngle+(i*dtheta)), 
                                this.zFactor * (10*Math.sin(2*Math.PI*this.t/229)));
            this.points.push(nextPoint);
        }

        this.xAngle += sweepRad;
        this.yAngle += sweepRad;
    }
};


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

    composer.modelM = new THREE.RenderPass(maskedScene, maskedCamera);
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
