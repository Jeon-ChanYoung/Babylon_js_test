import { Engine, Scene } from "@babylonjs/core";


export function createEngine(canvas: HTMLCanvasElement) {
    return new Engine(canvas, true, {
        stencil: true,
        antialias: true,
        adaptToDeviceRatio: true
    });
}

export function createScene(engine: Engine): Scene {
    const scene = new Scene(engine);
    return scene;
}