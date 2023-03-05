import {startRender} from "./rt4_main_dr.js";
import {buildGoL} from "./rt4_Objects_dr.js";


let altView = 0;
let illumModel = 0;
let multiLights = 0;
let superSample = 0;
let useGoL = false;
let intervalID;

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

    if (key === '5') {
        useGoL = !useGoL;
        if (useGoL) {
            buildGoL();
            intervalID = setInterval(startRender, 750);
        } else {
            clearInterval(intervalID);
            startRender();
        }
    }

    if (key === 'r') {
        altView = 0;
        illumModel = 0;
        multiLights = 0;
        superSample = 0;
        useGoL = false;
        startRender();
    }
}

export {gotKey, altView, illumModel, multiLights, superSample, useGoL};
