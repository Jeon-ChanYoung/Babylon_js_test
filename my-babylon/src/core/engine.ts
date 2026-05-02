import { Engine, Scene } from "@babylonjs/core";


export function createEngine(canvas: HTMLCanvasElement) {
    const engine = new Engine(canvas, true, {
        stencil: false,
        antialias: false
    });

    engine.setHardwareScalingLevel(1.0);
    return engine;
}

export function createScene(engine: Engine): Scene {
    const scene = new Scene(engine);

    scene.blockfreeActiveMeshesAndRenderingGroups = true;

  // 오토클리어 비활성 (스카이박스 없을 때)
    scene.autoClear = false;
    scene.autoClearDepthAndStencil = false;

    return scene;
}