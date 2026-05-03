현재 렌더링 전인데 어떤 느낌으로 가면 좋을까? 내가 생각한 방안은 다음과 같음.

1. 석양이 진 모습
2. 지붕 씌우고 어둡게한 후 책상위에 있는 렘프만 켜진 모습
3. 자정의 밤(어둡고 푸른 느낌)
4. 그냥 어둡게.

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
    ({ shadowGen } = createLighting(scene));
    createRoom(scene, shadowGen);
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
    ]);
    console.timeEnd("load");
})();

scene.meshes.forEach((m: { freezeWorldMatrix: () => any; }) => m.freezeWorldMatrix());
scene.materials.forEach((m: { freeze: () => any; }) => m.freeze());


if (import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.dispose((data: any) => {
        data.engine = engine;
        data.scene = scene;
        data.camera = camera;
        data.shadowGen = shadowGen;
    });
}

// core/camera.ts

import {
    ArcRotateCamera,
    Vector3,
    KeyboardEventTypes,
    Scene,
    PointerEventTypes,
} from "@babylonjs/core";

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

    /* ── 줌 제한 ── */
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 300;

    /* ── 수직 회전 제한 ── */
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = Math.PI / 2.2;

    /* ── 회전 관성 ── */
    camera.wheelPrecision = 3;
    camera.inertia = 0.92;

    /* ── 마우스 패닝 (우클릭 드래그) ── */
    camera.panningSensibility = 30;
    camera.panningInertia = 0.85;
    camera.panningAxis = new Vector3(1, 0, 1);
    camera.panningDistanceLimit = 80;

    /* ── 기본 키보드 회전 비활성화 ── */
    camera.keysUp    = [];
    camera.keysDown  = [];
    camera.keysLeft  = [];
    camera.keysRight = [];

    /* ═══════════════════════════════════════════
    *  제자리 회전: 회전 시작 시 target을 카메라
    *  위치로 옮기고, radius를 0 근처로 설정.
    *  회전 끝나면 원래 radius로 복원.
    * ═══════════════════════════════════════════ */
    let savedRadius = camera.radius;
    let isRotating  = false;

    scene.onPointerObservable.add((info) => {
        // 좌클릭 눌림 → 회전 시작
        if (
            info.type === PointerEventTypes.POINTERDOWN &&
            info.event.button === 0
        ) {
            // 현재 카메라 월드 위치 저장
            const camPos = camera.position.clone();
            savedRadius  = camera.radius;

            // target을 카메라 위치로 이동 → 제자리 회전
            camera.target.copyFrom(camPos);
            camera.radius = 0.01; // 거의 0 (완전 0이면 오류)
            isRotating = true;
        }

            // 좌클릭 해제 → 회전 종료, radius 복원
        if (
            info.type === PointerEventTypes.POINTERUP &&
            info.event.button === 0 &&
            isRotating
        ) {
            // 현재 카메라 위치에서 원래 거리만큼 앞에 target 재배치
            const forward = camera.getDirection(Vector3.Forward());
            camera.target = camera.position.add(forward.scale(savedRadius));
            camera.radius = savedRadius;
            isRotating = false;
        }
    });

    /* ═══════════════════════════════════════════
    *  WASD / 방향키 → target 이동 (패닝)
    * ═══════════════════════════════════════════ */
    const PAN_SPEED = 0.5;
    const pressedKeys = new Set<number>();

    scene.onKeyboardObservable.add((info) => {
        if (info.type === KeyboardEventTypes.KEYDOWN) {
            pressedKeys.add(info.event.keyCode);
        } else {
            pressedKeys.delete(info.event.keyCode);
        }
    });

    scene.onBeforeRenderObservable.add(() => {
        if (pressedKeys.size === 0) return;

        const forward = camera.getDirection(Vector3.Forward());
        forward.y = 0;
        forward.normalize();

        const right = camera.getDirection(Vector3.Right());
        right.y = 0;
        right.normalize();

        const move = Vector3.Zero();

        if (pressedKeys.has(87) || pressedKeys.has(38)) {
            move.addInPlace(forward.scale(PAN_SPEED));
        }
        if (pressedKeys.has(83) || pressedKeys.has(40)) {
            move.addInPlace(forward.scale(-PAN_SPEED));
        }
        if (pressedKeys.has(65) || pressedKeys.has(37)) {
            move.addInPlace(right.scale(-PAN_SPEED));
        }
        if (pressedKeys.has(68) || pressedKeys.has(39)) {
            move.addInPlace(right.scale(PAN_SPEED));
        }

        camera.target.addInPlace(move);
    });

    return camera;
}

// core/engine.ts

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

// core/lighting.ts

import {
  Scene,
  DirectionalLight,
  HemisphericLight,
  ShadowGenerator,
  Vector3,
  Color3,
} from "@babylonjs/core";

/* ═══════════════════════════════════════════
 *  이 플래그만 바꾸면 라이팅 전환
 *  true  → 최소 라이트만 (빠름)
 *  false → 풀 라이팅 + 그림자
 * ═══════════════════════════════════════════ */
const DEV_LIGHT = true;

export function createLighting(scene: Scene) {
  if (DEV_LIGHT) {
    return createDevLighting(scene);
  }
  return createFullLighting(scene);
}

/* ─── 개발용: 헤미스피어 하나 + 더미 섀도우젠 ─── */
function createDevLighting(scene: Scene) {
  const ambient = new HemisphericLight(
    "devLight",
    new Vector3(0, 1, 0),
    scene
  );
  ambient.intensity   = 1.5;
  ambient.diffuse     = Color3.White();
  ambient.groundColor = new Color3(0.6, 0.6, 0.6);

  // 섀도우젠이 필요한 코드가 깨지지 않도록 더미 생성
  const dummySun = new DirectionalLight(
    "dummySun",
    new Vector3(0, -1, 0),
    scene
  );
  dummySun.intensity = 0;  // 안 보임

  const shadowGen = new ShadowGenerator(256, dummySun);  // 최소 해상도
  shadowGen.useBlurExponentialShadowMap = false;

  return { sun: dummySun, ambient, shadowGen };
}

/* ─── 프로덕션: 풀 라이팅 ─── */
function createFullLighting(scene: Scene) {
  const sun = new DirectionalLight(
    "sun",
    new Vector3(1, -2, 1).normalize(),
    scene
  );
  sun.intensity = 3;
  sun.diffuse   = new Color3(1.0, 0.92, 0.78);
  sun.specular  = new Color3(1.0, 0.95, 0.85);
  sun.position  = new Vector3(-15, 20, -10);

  const fill = new DirectionalLight(
    "fill",
    new Vector3(-1, -1.5, -1).normalize(),
    scene
  );
  fill.intensity = 1.0;
  fill.diffuse   = new Color3(0.85, 0.82, 0.75);
  fill.specular  = new Color3(0.2, 0.2, 0.2);

  const ambient = new HemisphericLight(
    "ambient",
    new Vector3(0, 1, 0),
    scene
  );
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

// core/pipeline.ts

import { Scene, ArcRotateCamera, DefaultRenderingPipeline } from "@babylonjs/core";

export function createPipeline(scene: Scene, camera: ArcRotateCamera) {
    const pipeline = new DefaultRenderingPipeline("pipeline", true, scene, [camera]);
    pipeline.fxaaEnabled            = true;
    pipeline.bloomEnabled           = true;
    pipeline.bloomThreshold         = 0.85;
    pipeline.bloomWeight            = 0.25;
    pipeline.bloomKernel            = 64;
    pipeline.sharpenEnabled         = true;
    pipeline.sharpen.edgeAmount     = 0.7;
    pipeline.imageProcessing.vignetteEnabled = true;
    pipeline.imageProcessing.vignetteWeight  = 2.5;
    pipeline.grainEnabled           = true;
    pipeline.grain.intensity        = 6;
    pipeline.grain.animated         = true;
    return pipeline;
}

모든 오브젝트는 다음과 같으며 예시는 다음과 같음. 아직 그림자나  특수효과는 없음.

// object/board.ts

import { Mesh, SceneLoader, Vector3, Scene, ShadowGenerator } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

interface Placement {
    x: number;
    y: number;
    z: number;
    rotY: number;
    scale: number;
}

const SCALE = 6.5;

const PLACEMENTS: Placement[] = [
    { x: 38.5, y: 8, z: 32, rotY: Math.PI, scale: SCALE },
];
const cache: Record<string, Mesh> = ((window as any).__tmplCache ??= {});


export async function createboards(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    if (!cache.board || cache.board.isDisposed()) {
        const result = await SceneLoader.ImportMeshAsync("", "/src/assets/3D/", "board.glb", scene);
        cache.board = result.meshes[0] as Mesh;
        cache.board.setEnabled(false);
    }

    const root = cache.board;

    PLACEMENTS.forEach((cfg, i) => {
        const clone = root.clone(`board_${i}`, null)!;
        clone.setEnabled(true);
        clone.metadata = { hmr: true }; 

        clone.position = new Vector3(cfg.x, cfg.y, cfg.z);
        clone.rotation = new Vector3(0, cfg.rotY, 0);
        clone.scaling  = new Vector3(-cfg.scale, cfg.scale, cfg.scale);
    });
}

나는 초고화질 고 퀄리티 작품을 원함.