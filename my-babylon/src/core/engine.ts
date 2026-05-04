// core/engine.ts

import { Engine, Scene } from "@babylonjs/core";

export function createEngine(canvas: HTMLCanvasElement) {
    const engine = new Engine(canvas, true, {
        stencil: false,
    });

    return engine;
}

export function createScene(engine: Engine): Scene {
    const scene = new Scene(engine);
    scene.clearColor.set(0, 0, 0, 1);
    return scene;
}