// main.ts

import "./style.css";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";

import { createEngine, createScene } from "./core/engine";
import { createCamera } from "./core/camera";
import { createLighting } from "./core/lighting";
import { createPipeline } from "./core/pipeline";
import { createRoom } from "./objects/room";
import { createChairs } from "./objects/chair";
import { createCabinets } from "./objects/cabinet";
import { createWaterfilters } from "./objects/waterfilter";
import { createChalkboards } from "./objects/chalkboard";
import { createTrashbins } from "./objects/trashbin";
import { createChairfoldeds } from "./objects/chairfoled";
import { createboards } from "./objects/board";


// ✅ 개선: 명시적 병렬 로딩
async function init() {
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    const engine = createEngine(canvas);
    const scene  = createScene(engine);
    const camera = createCamera(scene, canvas);
    const { shadowGen } = createLighting(scene);
    createRoom(scene, shadowGen),
    engine.runRenderLoop(() => scene.render());

    // 모든 모델을 동시에 로딩
    await Promise.all([
        createChairs(scene, shadowGen),
        createChairfoldeds(scene, shadowGen),
        createCabinets(scene, shadowGen),
        createChalkboards(scene, shadowGen),
        createboards(scene, shadowGen),
        createTrashbins(scene, shadowGen),
        createWaterfilters(scene, shadowGen),
    ]);

    createPipeline(scene, camera);

    window.addEventListener("resize", () => engine.resize());
}

init();