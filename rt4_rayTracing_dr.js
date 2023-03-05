import {bgColor} from "./rt4_main_dr.js";
import {World, Quad, Sphere, LightSource} from "./rt4_Objects_dr.js";
import {Color, IntersectData, Ray} from "./rt4_AuxObjects_dr.js";
import {Phong_Pure, Phong_Blinn} from "./rt4_illumModels_dr.js";
import {altView, illumModel, superSample} from "./rt4_events_dr.js";

let theWorld;
let camPosition = [[0.0, 0.0, 7.0], [-7.0, 0.0, 0.0]];
let planeCoords = [[0.0, 0.0, 5.0], [-5.0, 0.0, 0.0]];

function buildScene(imageDimension) {
    // z coordinate for image plane, camera, and light parameters
    let cameraPOS = camPosition[altView];
    let lookat = [0.0, 0.0, 0.0];
    let up = [0.0, 1.0, 0.0];
    let planeOrigin = planeCoords[altView];
    let ka = 0.5;
    let kd = 0.3;
    let ks = 0.3;
    let ke = 15.0;
    let ambientColor = [1.0, 1.0, 1.0];
    let specularColor = [1.0, 1.0, 1.0];
    let model;

    theWorld = new World(imageDimension, planeOrigin, cameraPOS, lookat, up);
    if (illumModel === 0) {
        model = new Phong_Pure(ka, kd, ks, ke, ambientColor, specularColor);
    } else {
        model = new Phong_Blinn(ka, kd, ks, ke, ambientColor, specularColor);
    }

    let lightPOSMain = [3.0, 10.0, 15.0];
    let lightRGBMain = [1.0, 1.0, 1.0];
    theWorld.addLight(new LightSource(lightPOSMain, lightRGBMain));

    let lightPOSAlt1 = [-9.0, 5.0, 10.0];
    let lightRGBAlt1 = [1.0, 0.0, 0.0];
    theWorld.addLight(new LightSource(lightPOSAlt1, lightRGBAlt1));

    let gSphereCenter = [0.0, 0.0, 0.0];
    let gSphereColor = [0.0, 0.7, 0.0];
    let gSphereRadius = 1.5;
    let gSphere = new Sphere(model, gSphereColor, gSphereCenter, gSphereRadius);
    theWorld.addObj(gSphere);

    let ySphereCenter = [-2.0, -1.0, -1.15];
    let ySphereColor = [0.7, 0.7, 0.2];
    let ySphereRadius = 1.0;
    let ySphere = new Sphere(model, ySphereColor, ySphereCenter, ySphereRadius);
    theWorld.addObj(ySphere);

    let platformCenter = [-2.5, -4.3, -10.0];  // [-2.5, -4.3, -10.0]
    let platformColor = [0.3, 0.3, 0.3];
    let platformXScale = 13.0;
    let platformZScale = 35.0;
    let platform = new Quad(model, platformColor, platformCenter,
        platformXScale, platformZScale);
    theWorld.addObj(platform);

    rayTrace();
}

function rayTrace() {
    let objList = theWorld.objectList;
    let posArr = theWorld.imagePlane.posArray;
    let colorArr = theWorld.imagePlane.colorArray;
    let camera = theWorld.camera;
    let numOfSSamples = 5;
    let counter = 0; // debug

    let delta = (superSample === 0) ? 0 : Math.abs((posArr[0] - posArr[3]) / 3);
    let iterations = (superSample === 0) ? 1 : numOfSSamples;

    for (let arrIndex = 0; arrIndex < posArr.length; arrIndex += 3) {
        let ray, closestResult;
        let closestObject = -1;
        let allResults = new Array(objList.length);
        let inRGB = vec3.create();
        let outRGB = vec3.create();

        counter++; // debug

        for (let sample = 0; sample < 1; sample++) {
            ray = getRay(sample, delta, camera.getPOS(),
                posArr[arrIndex], posArr[arrIndex + 1], posArr[arrIndex + 2]);
            closestResult = 10000.0;

            // check each ray against each object
            for (let objIndex = 0; objIndex < objList.length; objIndex++) {
                let curObj = objList[objIndex];
                // result is distance - int point (3) - int normal (3)
                allResults[objIndex] = curObj.intersect(ray);
                if (allResults[objIndex][0] !== -1 && allResults[objIndex][0] < closestResult) {
                    closestObject = objIndex;
                    closestResult = allResults[objIndex][0];
                }
            }
            if (closestObject === -1) {
                vec3.add(inRGB, inRGB, bgColor);
            } else {
                vec3.add(inRGB, inRGB, objList[closestObject].color.getRGB());
            }
        }

        // code to send sampling rays
        if (superSample === 1 && closestObject !== -1) {
            let sampleResults = new Array(objList.length);
            let closestResultSample;
            let closestObjectSample = -1;
            for (let sample = 1; sample < iterations; sample++) {
                ray = getRay(sample, delta, camera.getPOS(),
                    posArr[arrIndex], posArr[arrIndex + 1], posArr[arrIndex + 2]);
                closestResultSample = 10000.0;

                // check each ray against each object
                for (let objIndex = 0; objIndex < objList.length; objIndex++) {
                    let curObj = objList[objIndex];
                    // result is distance - int point (3) - int normal (3)
                    sampleResults[objIndex] = curObj.intersect(ray);

                    if (sampleResults[objIndex][0] !== -1 && sampleResults[objIndex][0] < closestResultSample) {
                        closestObjectSample = objIndex;
                        closestResultSample = sampleResults[objIndex][0];
                    }
                }
                if (closestObjectSample === -1) {
                    vec3.add(inRGB, inRGB, bgColor);
                } else {
                    vec3.add(inRGB, inRGB, objList[closestObjectSample].getColor()); //TODO error
                }
            }
            // debug
            // if (counter > 7144 && counter < 7151) {
            //     console.log("Pixel: " + counter + ";  inRGB values: " + inRGB);
            // }
            vec3.divide(inRGB, inRGB, [numOfSSamples, numOfSSamples, numOfSSamples]);
        }

        // debug
        // if (counter > 7144 && counter < 7151) {
        //     console.log("Pixel: " + counter + ";  inRGB values: " + inRGB);
        // }

        // if there is an intersection, and it's the closest to the camera,
        // update the color array with this objects color
        if (closestResult !== 10000.0) {
            let intersectData = new IntersectData(allResults[closestObject], ray, theWorld.lightList);
            inRGB = (superSample === 0) ? objList[closestObject].getColor(intersectData.intPoint) : new Color(inRGB);
            outRGB = objList[closestObject].material.illuminate(intersectData, inRGB);
        } else {
            outRGB = inRGB;
        }

        colorArr[arrIndex] = outRGB[0];
        colorArr[arrIndex + 1] = outRGB[1];
        colorArr[arrIndex + 2] = outRGB[2];

        closestObject = -1;
    }
}

// used in super-sampling
function getRay(sample, delta, camPOS, xCoord, yCoord, zCoord) {
    switch (sample) {
        case 1:
            xCoord -= delta;
            yCoord += delta;
            break;
        case 2:
            xCoord -= delta;
            yCoord -= delta;
            break;
        case 3:
            xCoord += delta;
            yCoord += delta;
            break;
        case 4:
            xCoord += delta;
            yCoord -= delta;
            break;
        default:
    }
    return new Ray(camPOS, vec3.fromValues(xCoord, yCoord, zCoord));
}

export {buildScene, rayTrace, theWorld};