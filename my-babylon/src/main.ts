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
import { createExtinguishers } from "./objects/extinguisher";
import { createDoors } from "./objects/door";
import { createBrooms } from "./objects/broom";
import { createDustpans } from "./objects/dustpan";
import { createMopsinks } from "./objects/mopsink";
import { createLamps } from "./objects/lamp";
import { createCeilingLamps } from "./objects/ceilinglamp";

DracoCompression.Configuration.decoder = {
    wasmUrl: "https://cdn.babylonjs.com/draco_wasm_wrapper_gltf.js",
    wasmBinaryUrl: "https://cdn.babylonjs.com/draco_decoder_gltf.wasm",
    fallbackUrl: "https://cdn.babylonjs.com/draco_decoder_gltf.js",
};

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
let engine: any, scene: any, camera: any, shadowGen: any;

if (import.meta.hot?.data?.engine) {
    ({ engine, scene, camera, shadowGen } = import.meta.hot.data);

    [...scene.transformNodes, ...scene.meshes]
        .filter((n: any) => n.metadata?.hmr)
        .forEach((n: any) => n.dispose());
} else {
    engine = createEngine(canvas);
    scene = createScene(engine);
    camera = createCamera(scene, canvas);
    ({ shadowGen } = createLighting(scene)),
    createRoom(scene, shadowGen),
    createPipeline(scene, camera);
    engine.runRenderLoop(() => scene.render());       
    window.addEventListener("resize", () => engine.resize()); 
}


(async () => { 
    console.time("load");
    await Promise.all([
        createboards(scene, shadowGen),
        createTables(scene, shadowGen),
        createTrashbins(scene, shadowGen),
        createWaterfilters(scene, shadowGen),
        createChalkboards(scene, shadowGen),
        createCabinets(scene, shadowGen),
        createChairfoldeds(scene, shadowGen),
        createExtinguishers(scene, shadowGen),
        createChairs(scene, shadowGen),
        createDoors(scene, shadowGen),
        createBrooms(scene, shadowGen),
        createDustpans(scene, shadowGen),
        createMopsinks(scene, shadowGen),
        createLamps(scene, shadowGen),
        createCeilingLamps(scene, shadowGen),
    ]);
    console.timeEnd("load");
})();


if (import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.dispose((data: any) => {
        data.engine = engine;
        data.scene = scene;
        data.camera = camera;
        data.shadowGen = shadowGen;
    });
}