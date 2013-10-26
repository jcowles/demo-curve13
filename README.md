curve13
======================================
Created by Andrew Butts and Jeremy Cowles for 2013 Pixar demo party.

This demo was written in 7 days, which is reflected in the state of the code.

**/index.html**
 * The main entry point of the demo 

**/curves/...**
 * The various shapes used with the neon effect

**/js**
 * anim.js: animation helpers (lerp, smoothstep, etc)
 * core.js: init, shot ordering, animation loop
 * seq.js: shot sequencer
 * shot.js: shot base class, sub-classes live in /js/shots/...

**/js/extern** -- external libraries
 * Three.js: Render engine
 * Stats.js: FPS tracker
 * dat.GUI: Interactive parameter noodling

**/js/geom**
 * ribbon.js: curve-to-triangle strip algorithm, implemented as Three.js Geometry object
 ** Used in every effect

**/js/shots/...**
 * Various effects and shared settings; the real production code. 
 * See /js/core.js for order of how these shots are sequenced. 
