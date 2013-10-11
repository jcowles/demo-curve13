function smoothStep(t) {
    return 6*t*t*t*t*t - 15*t*t*t*t + 10*t*t*t;
}

function lerp(t, a, b) {
	return (1-t)*a + t*b;
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
