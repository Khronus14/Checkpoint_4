import {Point, ImagePlane, Color} from "./rt4_AuxObjects_dr.js";
import {useGoL} from "./rt4_events_dr.js";

let GoL;

function buildGoL() {
    GoL = new Array(40 + 2);
    for (let row = 0; row < GoL.length; row++) {
        let temp = new Array(15 + 2);
        for (let i = 0; i < temp.length; i++) {
            temp[i] = 0;
        }
        GoL[row] = temp;
    }
    // GoL[row][col]
    // single glider
    // GoL[1][2] = 1;
    // GoL[2][3] = 1;
    // GoL[3][1] = 1;
    // GoL[3][2] = 1;
    // GoL[3][3] = 1;

    // pulsar by row
    let rowStart = 16;
    GoL[rowStart][4] = 1;
    GoL[rowStart][5] = 1;
    GoL[rowStart][6] = 1;
    GoL[rowStart][10] = 1;
    GoL[rowStart][11] = 1;
    GoL[rowStart][12] = 1;

    GoL[rowStart + 2][2] = 1;
    GoL[rowStart + 2][7] = 1;
    GoL[rowStart + 2][9] = 1;
    GoL[rowStart + 2][14] = 1;

    GoL[rowStart + 3][2] = 1;
    GoL[rowStart + 3][7] = 1;
    GoL[rowStart + 3][9] = 1;
    GoL[rowStart + 3][14] = 1;

    GoL[rowStart + 4][2] = 1;
    GoL[rowStart + 4][7] = 1;
    GoL[rowStart + 4][9] = 1;
    GoL[rowStart + 4][14] = 1;

    GoL[rowStart + 5][4] = 1;
    GoL[rowStart + 5][5] = 1;
    GoL[rowStart + 5][6] = 1;
    GoL[rowStart + 5][10] = 1;
    GoL[rowStart + 5][11] = 1;
    GoL[rowStart + 5][12] = 1;

    GoL[rowStart + 7][4] = 1;
    GoL[rowStart + 7][5] = 1;
    GoL[rowStart + 7][6] = 1;
    GoL[rowStart + 7][10] = 1;
    GoL[rowStart + 7][11] = 1;
    GoL[rowStart + 7][12] = 1;

    GoL[rowStart + 8][2] = 1;
    GoL[rowStart + 8][7] = 1;
    GoL[rowStart + 8][9] = 1;
    GoL[rowStart + 8][14] = 1;

    GoL[rowStart + 9][2] = 1;
    GoL[rowStart + 9][7] = 1;
    GoL[rowStart + 9][9] = 1;
    GoL[rowStart + 9][14] = 1;

    GoL[rowStart + 10][2] = 1;
    GoL[rowStart + 10][7] = 1;
    GoL[rowStart + 10][9] = 1;
    GoL[rowStart + 10][14] = 1;

    GoL[rowStart + 12][4] = 1;
    GoL[rowStart + 12][5] = 1;
    GoL[rowStart + 12][6] = 1;
    GoL[rowStart + 12][10] = 1;
    GoL[rowStart + 12][11] = 1;
    GoL[rowStart + 12][12] = 1;
}

function updateGoL() {
    // rules
    // live cell with two or three live neighbours survives.
    // dead cell with three live neighbours becomes a live cell.
    // other live cells die in the next generation; all other dead cells stay dead.
    let tempGoL = new Array(GoL.length);
    for (let row = 0; row < tempGoL.length; row++) {
        let temp = new Array(GoL[0].length);
        for (let i = 0; i < temp.length; i++) {
            temp[i] = 0;
        }
        tempGoL[row] = temp;
    }

    // let tempGoL = this.GoL;
    let neighborTotal = 0;

    for (let row = 1; row < GoL.length - 1; row++) {
        for (let col = 1; col < GoL[0].length - 1; col++) {
            neighborTotal += GoL[row - 1][col - 1];
            neighborTotal += GoL[row - 1][col];
            neighborTotal += GoL[row - 1][col + 1];
            neighborTotal += GoL[row][col - 1];
            neighborTotal += GoL[row][col + 1];
            neighborTotal += GoL[row + 1][col - 1];
            neighborTotal += GoL[row + 1][col];
            neighborTotal += GoL[row + 1][col + 1];

            if ((GoL[row][col] === 0 && neighborTotal === 3) ||
                (GoL[row][col] === 1 &&
                    (neighborTotal === 2 || neighborTotal === 3))) {
                tempGoL[row][col] = 1;
            } else {
                tempGoL[row][col] = 0;
            }
            neighborTotal = 0;
        }
    }
    GoL = tempGoL;
}

class World {
    constructor(imageDimension, planeOrigin, cameraPOS, lookat, up) {
        this.objectList = [];
        this.lightList = [];
        this.imagePlane = new ImagePlane(imageDimension, planeOrigin);
        this.camera = new Camera(cameraPOS, lookat, up);
        this.attributes = null;
    }

    addObj(object) {
        this.objectList.push(object);
    }

    addLight(light) {
        this.lightList.push(light);
    }

    transform(object) {

    }

    transformAllObjects() {

    }

    spawn(ray) {

    }
}

class anObject {
    constructor(illumModel, objectColor) {
        this.material = illumModel;
        this.color = new Color(objectColor);
    }

    intersect(ray) {}

    getColor() {
        return this.color;
    }
}

class Sphere extends anObject {
    constructor(illumModel, objectColor, center, radius) {
        super(illumModel, objectColor);
        this.center = center;
        this.radius = radius;
        //this.counter = 0; // debug
    }

    intersect(ray) {
        //this.counter++; // debug
        let ro = ray.origin.loc;
        // console.log("Ray origin: " + ro);
        let rd = vec3.fromValues(ray.direction.direction[0], ray.direction.direction[1], ray.direction.direction[2]);
        // console.log("Ray direction: " + rd);

        vec3.normalize(rd, rd);
        //console.log("Ray direction normalized: " + rd);
        let ce = vec3.fromValues(this.center[0], this.center[1], this.center[2]);
        let oc = vec3.create();
        let t, c, h; // floats

        vec3.subtract(oc, ro, ce);
        t = vec3.dot(oc, rd);
        c = vec3.dot(oc, oc) - (this.radius * this.radius);
        h = (t * t) - c;
        if (h < 0.0) return vec2.fromValues(-1.0, -1.0); // no intersection
        h = Math.sqrt(h);

        // calculate intersection data
        let intPoint = vec3.create();
        let dist = (-t-h < -t+h) ? -t-h : -t+h;

        // get intersection:  ray origin + norm(vector) * distance
        let normVectDist = vec3.fromValues(rd[0] * dist, rd[1] * dist, rd[2] * dist);
        vec3.add(intPoint, ray.origin.loc, normVectDist);

        let intPointNormal = vec3.create();
        vec3.subtract(intPointNormal, intPoint, this.center);

        return [dist, intPoint[0], intPoint[1], intPoint[2], intPointNormal[0], intPointNormal[1], intPointNormal[2]];
    }
}

class Quad extends anObject {
    normal;
    points;
    vertices;
    width;
    height;
    constructor(illumModel, objectColor, platformCenter, platformXScale, platformYScale) {
        super(illumModel, objectColor);
        this.createVertices(platformCenter, platformXScale, platformYScale);
        this.width = platformXScale;
        this.height = platformYScale;
        // this.counter = 0; // debug
    }

    createVertices(platformCenter, platformXScale, platformYScale) {
        let xC = platformCenter[0];
        let yC = platformCenter[1];
        let zC = platformCenter[2];
        let width = platformXScale / 2;
        let height = platformYScale / 2;
        let pointArray = new Array(12);
        let vertArray = new Array(6);

        pointArray[0] = xC - width;
        pointArray[1] = yC;
        pointArray[2] = zC + height;

        pointArray[3] = xC + width;
        pointArray[4] = yC;
        pointArray[5] = zC + height;

        pointArray[6] = xC + width;
        pointArray[7] = yC;
        pointArray[8] = zC - height;

        pointArray[9] = xC - width;
        pointArray[10] = yC;
        pointArray[11] = zC - height;
        this.points = pointArray;

        vertArray[0] = vec3.fromValues(pointArray[0], pointArray[1], pointArray[2]);
        vertArray[1] = vec3.fromValues(pointArray[3], pointArray[4], pointArray[5]);
        vertArray[2] = vec3.fromValues(pointArray[6], pointArray[7], pointArray[8]);
        vertArray[3] = vertArray[2];
        vertArray[4] = vec3.fromValues(pointArray[9], pointArray[10], pointArray[11]);
        vertArray[5] = vertArray[0];

        this.vertices = vertArray;

        let side1 = vec3.create();
        vec3.subtract(side1, vertArray[1], vertArray[2]);
        let side2 = vec3.create();
        vec3.subtract(side2, vertArray[1], vertArray[0]);

        let cross = vec3.create();
        vec3.cross(cross, side1, side2);
        vec3.normalize(cross, cross);
        this.normal = cross;
    }

    intersect(ray) {
        // Möller–Trumbore intersection algorithm
        // this.counter++; // debug
        let EPSILON = 0.0000001;
        let isIntersection;
        let noIntersection = vec2.fromValues(-1, -1);

        let vertex0, vertex1, vertex2;
        let edge1 = vec3.create();
        let edge2 = vec3.create();
        let h = vec3.create();
        let s = vec3.create();
        let q = vec3.create();
        let a, f, u, v, t;
        let rd = ray.direction.direction;

        for (let count = 0; count < 6; count += 3) {
            isIntersection = true;
            vertex0 = this.vertices[count];
            vertex1 = this.vertices[count + 1];
            vertex2 = this.vertices[count + 2];
            vec3.subtract(edge1, vertex1, vertex0);
            vec3.subtract(edge2, vertex2, vertex0);
            vec3.cross(h, rd, edge2);
            //vec3.cross(h, ray.direction, edge2);
            a = vec3.dot(edge1, h);
            if (a > -EPSILON && a < EPSILON) {
                isIntersection = false;    // This ray is parallel to this triangle.
            }

            f = 1.0 / a;
            vec3.subtract(s, ray.origin.loc, vertex0);
            u = f * vec3.dot(s, h);
            if (u < 0.0 || u > 1.0) {
                isIntersection = false;
            }

            vec3.cross(q, s, edge1);
            v = f * vec3.dot(rd, q);
            //v = f * vec3.dot(ray.direction, q);
            if (v < 0.0 || u + v > 1.0) {
                isIntersection = false;
            }

            t = f * vec3.dot(edge2, q);
            // let outIntersectionPoint = vec3.fromValues(0.0, 0.0, 0.0);
            // if (t > EPSILON) { // ray intersection
            //     outIntersectionPoint.scaleAdd(t, rayVector, rayOrigin);
            //     return true;
            // } else { // This means that there is a line intersection but not a ray intersection.
            //     isIntersection = false;
            // }

            if (isIntersection) {
                // calculate intersection data
                let intPoint = vec3.create();

                // get intersection:  ray origin + norm(vector) * distance
                let normVectDist = vec3.fromValues(rd[0] * t, rd[1] * t, rd[2] * t);
                vec3.add(intPoint, ray.origin.loc, normVectDist);

                return [t, intPoint[0], intPoint[1], intPoint[2], this.normal[0], this.normal[1], this.normal[2]];
            }
        }
        return noIntersection;
    }

    getColor(intersectionPoint) {
        let xCoord = Math.abs(this.vertices[4][0]) + intersectionPoint[0];
        let zCoord = Math.abs(this.vertices[4][2]) + intersectionPoint[2];
        let checkSize;
        if (useGoL) {
            checkSize = this.width / 15;
        } else {
            checkSize = this.width / 12;
        }

        let col = Math.floor(xCoord / checkSize);
        let row = Math.floor(zCoord / checkSize);

        if (useGoL) {
            if (GoL[row + 1][col + 1] === 0) {
                return new Color([0.1, 0.1, 0.1]);
            } else {
                return new Color([0.8, 0.6, 0.1]);
            }
        } else {
            if ((row + col) % 2 === 0) {
                return new Color([1.0, 0.0, 0.0]);
            } else {
                return new Color([1.0, 1.0, 0.0]);
            }
        }
    }
}

class Camera {
    constructor(position, lookat, up) {
        this.position = position;
        this.lookat = lookat;
        this.up = up;
    }

    getPOS() {return this.position;}

    render(world) {

    }
}

class LightSource {
    constructor(lightPOS, lightRGB) {
        this.position = new Point(lightPOS);
        this.color = new Color(lightRGB);
    }
}

export {buildGoL, updateGoL, World, Sphere, Quad, Camera, LightSource};