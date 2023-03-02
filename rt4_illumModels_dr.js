import {theWorld} from "./rt4_rayTracing_dr.js";
import {IntersectData, Ray} from "./rt4_AuxObjects_dr.js";
import {illumModel, multiLights} from "./rt4_events_dr.js";

class IlluminationModel {
    constructor() {
    }
    illuminate() {}
}

class Phong_Base extends IlluminationModel {
    constructor(inKA, inKD, inKS, inKE, ambientColor, specularColor) {
        super();
        this.ka = vec3.fromValues(inKA, inKA, inKA);
        this.kd = vec3.fromValues(inKD, inKD, inKD);
        this.ks = vec3.fromValues(inKS, inKS, inKS);
        this.ke = inKE;
        this.ambientLight = vec3.fromValues(ambientColor[0], ambientColor[1], ambientColor[2]);
        this.specularColor = vec3.fromValues(specularColor[0], specularColor[1], specularColor[2]);
    }

    illuminate(intersectionData, objColor) {
        let objList = theWorld.objectList;
        let lightList = intersectionData.lightList;
        let outRGB = vec3.create();
        // variables to toggle between using multiple lights
        let iterations = 1.0;
        if (multiLights === 1) iterations = lightList.length;
        // term used to scale total radiance contribution
        let divVector = vec3.fromValues(iterations, iterations, iterations);

        // complete for each light source
        for (let lightIndex = 0; lightIndex < iterations; lightIndex++) {
            let ambientRGB = vec3.create();
            let diffuseRGB = vec3.create();
            let specRGB = vec3.create();
            let result;
            let blocked = false;

            // spawn shadow ray
            // let ray = new Ray(intersectionData.intPoint, intersectionData.lightPOS);
            let ray = new Ray(intersectionData.intPoint, lightList[lightIndex].position.loc);

            // check to see if shadow ray is blocked from the lightPOS by any object
            for (let objIndex = 0; objIndex < objList.length; objIndex++) {
                result = objList[objIndex].intersect(ray);
                if (result[0] > 0.1) {
                    blocked = true;
                    break;
                }
            }

            // calculate ambient component
            // vec3 ambient = ka * ambientLight * baseColor;
            vec3.multiply(ambientRGB, this.ambientLight, objColor.getRGB());
            vec3.multiply(ambientRGB, this.ka, ambientRGB);
            vec3.divide(ambientRGB, ambientRGB, divVector);
            vec3.add(outRGB, outRGB, ambientRGB);

            if (!blocked) {
                // calculate diffuse component
                // vec3 diffuse = kd * lightColor * baseColor * max(dot(L, N), 0.0);
                let dotLN = Math.max(vec3.dot(intersectionData.intInLight, intersectionData.intNormal), 0.0);
                let dotLNVec3 = vec3.fromValues(dotLN, dotLN, dotLN);
                vec3.multiply(diffuseRGB, objColor.getRGB(), dotLNVec3);
                vec3.multiply(diffuseRGB, diffuseRGB, lightList[lightIndex].color.getRGB());
                vec3.multiply(diffuseRGB, diffuseRGB, this.kd);
                vec3.divide(diffuseRGB, diffuseRGB, divVector);
                vec3.add(outRGB, outRGB, diffuseRGB);

                // calculate specular component
                // generic call gets R for Phong_Pure, H for Phong_Blinn
                let specVector = this.getSpecVector(ray, intersectionData.intNormal);

                // vec3 spec = ks * specHighlightColor * lightColor * pow(max(dot(R, V), 0.0), ke);
                let V = vec3.create();
                vec3.subtract(V, intersectionData.intPoint, intersectionData.viewPoint);
                vec3.normalize(V, V);


                let dotRVke;
                if (illumModel === 0) {
                    dotRVke = Math.pow(Math.max(vec3.dot(specVector, V), 0.0), this.ke);
                } else {
                    dotRVke = Math.pow(Math.max(vec3.dot(specVector, intersectionData.intNormal), 0.0), this.ke);
                }
                let lastTerm = vec3.fromValues(dotRVke, dotRVke, dotRVke);

                vec3.multiply(specRGB, lightList[lightIndex].color.getRGB(), lastTerm);
                vec3.multiply(specRGB, specRGB, this.specularColor);
                vec3.multiply(specRGB, specRGB, this.ks);
                vec3.divide(specRGB, specRGB, divVector);
                vec3.add(outRGB, outRGB, specRGB);
            }
        }
        return outRGB;
    }

    getSpecVector() {}
}

class Phong_Pure extends Phong_Base {
    constructor(inKA, inKD, inKS, inKE, ambientColor, specularColor) {
        super(inKA, inKD, inKS, inKE, ambientColor, specularColor);
    }

    getSpecVector(ray, N) {
        // returns the perfect reflection vector for Phong
        // R = I - 2 * (dot(I, N) / mag(n)^2) * N
        let I = vec3.create();
        let R = vec3.create();

        vec3.subtract(I, ray.origin.loc, ray.direction.endPoint);
        vec3.normalize(I, I);

        let dotPro = vec3.dot(I, N);
        let magN = Math.pow(vec3.length(N), 2);

        let dotDivMagx2 = 2 * (dotPro / magN);
        dotDivMagx2 = vec3.fromValues(dotDivMagx2, dotDivMagx2, dotDivMagx2);

        let rightTerm = vec3.create();
        vec3.multiply(rightTerm, dotDivMagx2, N);

        vec3.subtract(R, rightTerm, I);
        vec3.normalize(R, R);
        return R;
    }
}

class Phong_Blinn extends Phong_Base {
    constructor(inKA, inKD, inKS, inKE, ambientColor, specularColor) {
        super(inKA, inKD, inKS, inKE, ambientColor, specularColor);
    }

    getSpecVector(ray, N) {
        // returns the halfway vector for Phong-Blinn
        // H = (V + L) / mag(V + L)
        let L = vec3.fromValues(ray.direction.direction[0], ray.direction.direction[1], ray.direction.direction[2]);
        vec3.normalize(L, L);

        let intPOS = vec3.fromValues(ray.origin.loc[0], ray.origin.loc[1], ray.origin.loc[2]);
        let cameraPOS = theWorld.camera.getPOS();
        let V = vec3.create();
        vec3.subtract(V, cameraPOS, intPOS);
        vec3.normalize(V, V);

        let VL = vec3.create();
        vec3.add(VL, V, L);
        let magVL = vec3.length(VL);
        let magVLVec3 = vec3.fromValues(magVL, magVL, magVL);

        let H = vec3.create();
        vec3.divide(H, VL, magVLVec3);

        vec3.normalize(H, H);
        return H;
    }
}

class Checker_Board extends IlluminationModel {
    constructor() {
        super();
        let evenColor = [1.0, 0.0, 0.0];
        let oddColor = [0.7, 0.7, 0.2];
    }
}

export {Phong_Pure, Phong_Blinn}