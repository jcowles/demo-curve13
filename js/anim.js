function smoothStep(t) {
    return 6*t*t*t*t*t - 15*t*t*t*t + 10*t*t*t;
}

function lerp(t, a, b) {
	return (1-t)*a + t*b;
}

function vlerp(t, a, b) {
	r = new THREE.Vector3();
	r.copy(a);
	r.lerp(b,t);
	return r;
}

function linMap(t0, t1, v0, v1, t) {
	if (t<=t0) {
		return v0;
	}
	if (t>=t1) {
		return v1;
	}

	// map t so that t0 goes to 0 and t1 goes to 1
	t = (t - t0) / (t1 - t0);
	return lerp(t, v0, v1);
}

function smoothMap(t0, t1, v0, v1, t) {
	if (t<=t0) {
		return v0;
	}
	if (t>=t1) {
		return v1;
	}

	// map t so that t0 goes to 0 and t1 goes to 1
	t = (t - t0) / (t1 - t0);
	return lerp(smoothStep(t), v0, v1);
}

// Usage:
// initialize with 
//  this.doStuff = new OnBeat([1, 2, 3],
//        function (time) { log("Hey, it works at t = " + time) },
//        function (time) { /* turn stuff off */ });
//
//  then call
//  this.doStuff.hit(time)
//
//
OnBeat = function(times, onFunc, offFunc) {
    this.times = times;
    this.onFunc = onFunc;
    this.offFunc = offFunc;

    this.hit = function(time) {
        var didHit = false;
        for (var i = 0; i < this.times.length; i++) {
            if (time >= this.times[i]) {
                times.splice(i, 1);
                log(times);
                this.onFunc(time);
                didHit = true;
            }
        }

        if (didHit)
            return;

        this.offFunc(time);
    }
}
