// main.ts

import "./style.css";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import { DracoCompression } from "@babylonjs/core/Meshes/Compression/dracoCompression";

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
import { createChairfoldeds } from "./objects/chairfolded";
import { createboards } from "./objects/board";
import { createTables } from "./objects/table";

DracoCompression.Configuration.decoder = {
    wasmUrl: "https://cdn.babylonjs.com/draco_wasm_wrapper_gltf.js",
    wasmBinaryUrl: "https://cdn.babylonjs.com/draco_decoder_gltf.wasm",
    fallbackUrl: "https://cdn.babylonjs.com/draco_decoder_gltf.js",
};

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = createEngine(canvas);
const scene  = createScene(engine);
const camera = createCamera(scene, canvas);

const { shadowGen } = createLighting(scene);

createRoom(scene, shadowGen);
createPipeline(scene, camera);

engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());

(async () => {
    console.time("load");

    await Promise.all([
        // createChairs(scene, shadowGen),
        // createChairfoldeds(scene, shadowGen),
        // createCabinets(scene, shadowGen),
        // createChalkboards(scene, shadowGen),
        createboards(scene, shadowGen),
        createTrashbins(scene, shadowGen),
        createWaterfilters(scene, shadowGen),
        createTables(scene, shadowGen),
    ]);

    console.timeEnd("load");
})();