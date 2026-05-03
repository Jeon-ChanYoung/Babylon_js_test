// core/pipeline.ts

import { Scene, ArcRotateCamera, DefaultRenderingPipeline } from "@babylonjs/core";

export function createPipeline(scene: Scene, camera: ArcRotateCamera) {
    const pipeline = new DefaultRenderingPipeline("pipeline", true, scene, [camera]);
    // pipeline.fxaaEnabled            = true;
    // pipeline.bloomEnabled           = true;
    // pipeline.bloomThreshold         = 0.85;
    // pipeline.bloomWeight            = 0.25;
    // pipeline.bloomKernel            = 64;
    // pipeline.sharpenEnabled         = true;
    // pipeline.sharpen.edgeAmount     = 0.7;
    // pipeline.imageProcessing.vignetteEnabled = true;
    // pipeline.imageProcessing.vignetteWeight  = 2.5;
    // pipeline.grainEnabled           = true;
    // pipeline.grain.intensity        = 6;
    // pipeline.grain.animated         = true;
    return pipeline;
}