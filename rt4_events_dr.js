import {startRender} from "./rt4_main_dr.js";

let altView = 0;
let illumModel = 0;
let multiLights = 0;
let superSample = 0;

function gotKey (event) {
    const key = event.key;

    //modify camera position
    if (key === '1') {
        altView = (altView === 0) ? 1 : 0;
        startRender();
    }

    if (key === '2') {
        illumModel = (illumModel === 0) ? 1 : 0;
        startRender();
    }

    if (key === '3') {
        multiLights = (multiLights === 0) ? 1 : 0;
        startRender();
    }

    if (key === '4') {
        superSample = (superSample === 0) ? 1 : 0;
        startRender();
    }

    if (key === 'r') {
        altView = 0;
        illumModel = 0;
        multiLights = 0;
        superSample = 0;
        startRender();
    }
}

export {gotKey, altView, illumModel, multiLights, superSample};
