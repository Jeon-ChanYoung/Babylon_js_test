import { ArcRotateCamera, Vector3, type Scene } from "@babylonjs/core";

export function createCamera(scene: Scene, canvas: HTMLCanvasElement) {
    const camera = new ArcRotateCamera(
        "camera",
        -Math.PI / 2, 
        Math.PI / 3.5, 
        35,
        new Vector3(0, 2, 0), 
        scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit  = 1;
    camera.upperRadiusLimit  = 80;
    camera.lowerBetaLimit    = 0.1;
    camera.upperBetaLimit    = Math.PI / 2.2;
    camera.wheelPrecision    = 5;
    camera.inertia           = 0.92;
    return camera;
}