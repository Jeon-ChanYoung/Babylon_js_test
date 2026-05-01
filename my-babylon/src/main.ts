import "./style.css";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";

import { createEngine, createScene } from "./core/engine";
import { createCamera } from "./core/camera";
import { createLighting } from "./core/lighting";
import { createPipeline } from "./core/pipeline";
import { createRoom } from "./objects/room";


const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = createEngine(canvas);
const scene  = createScene(engine);
const camera = createCamera(scene, canvas);

const { shadowGen } = createLighting(scene);

createRoom(scene, shadowGen);
createPipeline(scene, camera);

engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());