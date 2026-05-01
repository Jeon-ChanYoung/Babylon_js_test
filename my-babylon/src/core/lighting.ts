import { Scene, DirectionalLight, HemisphericLight, ShadowGenerator, Vector3, Color3 } from "@babylonjs/core";

export function createLighting(scene: Scene) {
    const sun = new DirectionalLight("sun",
        new Vector3(1, -2, 1).normalize(), scene);
    sun.intensity = 3;
    sun.diffuse   = new Color3(1.0, 0.92, 0.78);
    sun.specular  = new Color3(1.0, 0.95, 0.85);
    sun.position  = new Vector3(-15, 20, -10);

    const fill = new DirectionalLight(
        "fill", new Vector3(-1, -1.5, -1).normalize(), scene
    );
    fill.intensity = 1.0;
    fill.diffuse   = new Color3(0.85, 0.82, 0.75);
    fill.specular  = new Color3(0.2, 0.2, 0.2);

    const ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), scene);
    ambient.intensity   = 0.8;
    ambient.diffuse     = new Color3(0.9, 0.88, 0.82);
    ambient.groundColor = new Color3(0.5, 0.45, 0.38);

    const shadowGen = new ShadowGenerator(2048, sun);
    shadowGen.useBlurExponentialShadowMap = true;
    shadowGen.blurKernel = 48;
    shadowGen.darkness   = 0.35;
    shadowGen.bias       = 0.0001;
    shadowGen.normalBias = 0.008;

    return { sun, ambient, shadowGen };
}