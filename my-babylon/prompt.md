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

if (import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.dispose((data: any) => {
        data.engine = engine;
        data.scene = scene;
        data.camera = camera;
        data.shadowGen = shadowGen;
    });
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

import { Scene, ArcRotateCamera, DefaultRenderingPipeline } from "@babylonjs/core";

export function createPipeline(scene: Scene, camera: ArcRotateCamera) {
    const pipeline = new DefaultRenderingPipeline("pipeline", true, scene, [camera]);

    pipeline.fxaaEnabled            = true;

    // 블룸 — 석양 빛번짐
    pipeline.bloomEnabled           = true;
    pipeline.bloomThreshold         = 0.5;
    pipeline.bloomWeight            = 0.5;
    pipeline.bloomKernel            = 128;

    pipeline.sharpenEnabled         = true;
    pipeline.sharpen.edgeAmount     = 0.4;

    // 톤매핑 + 노출
    pipeline.imageProcessing.toneMappingEnabled = true;
    pipeline.imageProcessing.toneMappingType    = 1; // ACES
    pipeline.imageProcessing.exposure           = 1.1;
    pipeline.imageProcessing.contrast           = 1.4;

    // 비네팅
    pipeline.imageProcessing.vignetteEnabled = true;
    pipeline.imageProcessing.vignetteWeight  = 4;

    // 필름 그레인
    pipeline.grainEnabled           = true;
    pipeline.grain.intensity        = 8;
    pipeline.grain.animated         = true;

    return pipeline;
}

import { Mesh, SceneLoader, Vector3, Scene, ShadowGenerator } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

interface Placement {
    x: number;
    y: number;
    z: number;
    rotY: number;
    scale: number;
}

const SCALE = 2.5;

const PLACEMENTS: Placement[] = [
    { x: 36.2, y: 4, z:  30.5, rotY: Math.PI, scale: SCALE },
];
const cache: Record<string, Mesh> = ((window as any).__tmplCache ??= {});


export async function createLamps(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    if (!cache.lamp || cache.lamp.isDisposed()) {
        const result = await SceneLoader.ImportMeshAsync("", "/src/assets/3D/", "lamp.glb", scene);
        cache.lamp = result.meshes[0] as Mesh;
        cache.lamp.setEnabled(false);
    }

    const root = cache.lamp;

    PLACEMENTS.forEach((cfg, i) => {
        const clone = root.clone(`lamp_${i}`, null)!;
        clone.setEnabled(true);
        clone.metadata = { hmr: true }; 

        clone.position = new Vector3(cfg.x, cfg.y, cfg.z);
        clone.rotation = new Vector3(0, cfg.rotY, 0);
        clone.scaling  = new Vector3(cfg.scale, cfg.scale, cfg.scale);
        
        clone.getChildMeshes().forEach((child) => {
            shadowGen.addShadowCaster(child);
            child.receiveShadows = true;
        });
        shadowGen.addShadowCaster(clone);
        clone.receiveShadows = true;
    });
}

// objects/chair.ts

import {
    Scene,
    Vector3,
    ShadowGenerator,
    SceneLoader,
    Mesh,
    TransformNode,
    PBRMaterial,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

/* ─── 배치 인터페이스 ─── */
interface Placement {
    x: number;
    z: number;
    rotY: number;
    scale: number;
}

const SCALE = 6;

const PLACEMENTS: Placement[] = [
    // 뒷줄 2개 (칠판 쪽 바라봄)
    { x: -5,  z:   0, rotY:  Math.PI,       scale: SCALE },
    { x:  5,  z:   0, rotY:  Math.PI,       scale: SCALE },

    // 중간 좌측
    { x: -10, z:  -6, rotY:  Math.PI * 0.5, scale: SCALE },

    // 중간 우측
    { x:  10, z:  -6, rotY: -Math.PI * 0.5, scale: SCALE },

    // 앞줄 2개
    { x: -5,  z: -12, rotY:  0,             scale: SCALE },
    { x:  5,  z: -12, rotY:  0,             scale: SCALE },

    // 오른쪽 하단 단독
    { x:  47, z: -30, rotY: -Math.PI * 0.5, scale: SCALE },

    // 책상 전용
    { x:  29, z: 26, rotY: 0, scale: SCALE },
];
const cache: Record<string, Mesh> = ((window as any).__tmplCache ??= {});


export async function createChairs(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    if (!cache.chair || cache.chair.isDisposed()) {
        const result = await SceneLoader.ImportMeshAsync("", "/src/assets/3D/", "chair.glb", scene);
        cache.chair = result.meshes[0] as Mesh;
        cache.chair.setEnabled(false);
    }

    const root = cache.chair;
    const children = root.getChildMeshes() as Mesh[];

    children.forEach((child) => {
        const mat = child.material;
        if (!(mat instanceof PBRMaterial)) return;

        if (mat.albedoTexture) {
            mat.albedoTexture.level = 0.7; // 기본 1.0, 낮을수록 어두움
        }
    });

    PLACEMENTS.forEach((cfg, i) => {
        const parent = new TransformNode(`chair_${i}`, scene);
        parent.position = new Vector3(cfg.x, 0, cfg.z);
        parent.rotation = new Vector3(0, cfg.rotY, 0);
        parent.scaling  = new Vector3(cfg.scale, cfg.scale, cfg.scale);
        parent.metadata = { hmr: true };

        children.forEach((child) => {
            if (child.geometry) {
                const inst = child.createInstance(`${child.name}_${i}`);
                inst.parent = parent;
                shadowGen.addShadowCaster(inst);
                inst.receiveShadows = true;
            }
        });
    });
}

// objects/room.ts

import {
    Scene,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Texture,
    Vector3,
    ShadowGenerator,
    Mesh,
} from "@babylonjs/core";

import "@babylonjs/loaders/glTF";
import floorTexturePath from "/src/assets/floor/albedo.png"
import wallTexturePath from "/src/assets/wall/albedo.png"

const ROOM_WIDTH  = 100;  
const ROOM_DEPTH  = 65;  
const WALL_HEIGHT = 14;  
const WALL_THICK  = 1; 
const WALL_TILE_DENSITY = 0.1; 

/* ─── 몰딩 치수 ─── */
const MOLDING_HEIGHT = 1.0; // 몰딩 세로 두께
const MOLDING_DEPTH  = 0.2; // 벽에서 얼마나 튀어나오는지
const MOLDING_BOTTOM_Y = MOLDING_HEIGHT / 2;                          
const MOLDING_TOP_Y    = WALL_HEIGHT - MOLDING_HEIGHT / 2;          

export function createRoom(scene: Scene, shadowGen: ShadowGenerator) {
  /* ═══════════════════════════════════════════
   *  바닥
   * ═══════════════════════════════════════════ */
    const floor = MeshBuilder.CreateGround(
        "floor",
        { 
            width: ROOM_WIDTH, 
            height: ROOM_DEPTH, 
            subdivisions: 1 
        },
        scene
    );
    const floorMat = new StandardMaterial("floorMat", scene);
    floorMat.diffuseColor  = new Color3(0.76, 0.60, 0.42);  
    floorMat.specularColor = new Color3(0.15, 0.15, 0.15);

    const floorTex = new Texture(floorTexturePath, scene);
    floorTex.uScale = 8;
    floorTex.vScale = 3;
    floorTex.wAng = Math.PI / 2;      
    floorMat.diffuseTexture = floorTex;
    floor.material = floorMat;
    floor.receiveShadows = true;

   /* ═══════════════════════════════════════════
    *  벽 
    * ═══════════════════════════════════════════ */

    /* 가로벽 (Front/Back)  */
    const wallMatFB = new StandardMaterial("wallMatFB", scene);
    wallMatFB.diffuseColor  = new Color3(0.28, 0.18, 0.08);
    wallMatFB.specularColor = new Color3(0.05, 0.05, 0.05);
    wallMatFB.backFaceCulling = false;
    const texFB = new Texture(wallTexturePath, scene);
    texFB.uScale = ROOM_WIDTH * WALL_TILE_DENSITY;
    texFB.vScale = WALL_HEIGHT * WALL_TILE_DENSITY;
    wallMatFB.diffuseTexture = texFB;

    /* 세로벽 (Left/Right) 90도 회전  */
    const wallMatLR = new StandardMaterial("wallMatLR", scene);
    wallMatLR.diffuseColor  = new Color3(0.28, 0.18, 0.08);
    wallMatLR.specularColor = new Color3(0.05, 0.05, 0.05);
    wallMatLR.backFaceCulling = false;
    const texLR = new Texture(wallTexturePath, scene);
    texLR.uScale = WALL_HEIGHT * WALL_TILE_DENSITY;  
    texLR.vScale = ROOM_DEPTH * WALL_TILE_DENSITY;    
    texLR.wAng   = Math.PI / 2;                        
    wallMatLR.diffuseTexture = texLR;

   /* ═══════════════════════════════════════════
    *  몰딩
    * ═══════════════════════════════════════════ */
    const moldingMat = new StandardMaterial("moldingMat", scene);
    moldingMat.diffuseColor  = new Color3(0.15, 0.09, 0.04);    
    moldingMat.specularColor = new Color3(0.12, 0.12, 0.12);     


   /* ═══════════════════════════════════════════  
    *  벽 생성 헬퍼
    * ═══════════════════════════════════════════ */
    const halfW = ROOM_WIDTH / 2;
    const halfD = ROOM_DEPTH / 2;
    const halfH = WALL_HEIGHT / 2;

    const createWall = (
        name: string,
        width: number,
        height: number,
        depth: number,
        position: Vector3,
        mat: StandardMaterial
    ): Mesh => {
        const wall = MeshBuilder.CreateBox(
        name, { width, height, depth }, scene
        );
        wall.position = position;
        wall.material = mat;
        wall.receiveShadows = true;
        return wall;
    };

    // 가로벽 (Front/Back) — wallMatFB
    createWall("wallBack",  ROOM_WIDTH, WALL_HEIGHT, WALL_THICK, new Vector3(0, halfH, halfD), wallMatFB);
    createWall("wallFront", ROOM_WIDTH, WALL_HEIGHT, WALL_THICK, new Vector3(0, halfH, -halfD), wallMatFB);

    // 세로벽 (Left/Right) — wallMatLR
    createWall("wallLeft",  WALL_THICK, WALL_HEIGHT, ROOM_DEPTH, new Vector3(-halfW, halfH, 0), wallMatLR);
    createWall("wallRight", WALL_THICK, WALL_HEIGHT, ROOM_DEPTH, new Vector3(halfW, halfH, 0), wallMatLR);

   /* ═══════════════════════════════════════════
    *  몰딩 생성 헬퍼
    * ═══════════════════════════════════════════ */
    const createMolding = (
        baseName: string,
        lengthAxis: "x" | "z",
        length: number,
        pos: Vector3,            
        inwardOffset: Vector3    
    ) => {
        const sizeW = lengthAxis === "x" ? length : MOLDING_DEPTH + WALL_THICK;
        const sizeD = lengthAxis === "z" ? length : MOLDING_DEPTH + WALL_THICK;

        // 하단 몰딩
        const bottom = MeshBuilder.CreateBox(
            `${baseName}_bottom`,
            { width: sizeW, height: MOLDING_HEIGHT, depth: sizeD },
            scene
        );
        bottom.position = new Vector3(
            pos.x + inwardOffset.x,
            MOLDING_BOTTOM_Y,
            pos.z + inwardOffset.z
        );
        bottom.material = moldingMat;
        bottom.receiveShadows = true;

        // 상단 몰딩
        const top = MeshBuilder.CreateBox(
            `${baseName}_top`,
            { width: sizeW, height: MOLDING_HEIGHT, depth: sizeD },
            scene
        );
        top.position = new Vector3(
            pos.x + inwardOffset.x,
            MOLDING_TOP_Y,
            pos.z + inwardOffset.z
        );
        top.material = moldingMat;
        top.receiveShadows = true;
    };

    /* ─── 가로벽 몰딩 (X축 방향으로 긴 줄) ─── */
    createMolding("moldBack", "x", ROOM_WIDTH, new Vector3(0, 0, halfD), new Vector3(0, 0, -MOLDING_DEPTH / 2));
    createMolding("moldFront", "x", ROOM_WIDTH, new Vector3(0, 0, -halfD), new Vector3(0, 0, MOLDING_DEPTH / 2));

    /* ─── 세로벽 몰딩 (Z축 방향으로 긴 줄) ─── */
    createMolding("moldLeft", "z", ROOM_DEPTH, new Vector3(-halfW, 0, 0), new Vector3(MOLDING_DEPTH / 2, 0, 0));
    createMolding("moldRight", "z", ROOM_DEPTH, new Vector3(halfW, 0, 0), new Vector3(-MOLDING_DEPTH / 2, 0, 0));
}

현재 코드이고 석양 효과가 적용되있는데 다 지우고 방에 지붕을 씌워서 분위기는 자정느낌의 방 효과를 내고 싶음. 전등에만 빛나고 그 방향으로 그림자가 드리워지도록. 밀폐된 곳이라 창문은 없음. 