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
const MOLDING_DEPTH  = 0.3; // 벽에서 얼마나 튀어나오는지
const MOLDING_BOTTOM_Y = MOLDING_HEIGHT / 2;                          
const MOLDING_TOP_Y    = WALL_HEIGHT - MOLDING_HEIGHT / 2;      

const BORDER_SIZE  = 300;   // 충분히 크게
const FRAME_THICK  = 4.0;   // 회색 프레임 두께
const FRAME_Y      = WALL_HEIGHT + 0.01;  // 벽 꼭대기와 같은 높이


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
    floorMat.diffuseColor  = new Color3(0.62, 0.48, 0.32);  // 기존보다 살짝 어둡게
    floorMat.specularColor = new Color3(0.10, 0.10, 0.10);

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
    wallMatFB.diffuseColor  = new Color3(0.22, 0.13, 0.06);  // 짙은 갈색
    wallMatFB.specularColor = new Color3(0.05, 0.05, 0.05);
    wallMatFB.backFaceCulling = false;
    const texFB = new Texture(wallTexturePath, scene);
    texFB.uScale = ROOM_WIDTH * WALL_TILE_DENSITY;
    texFB.vScale = WALL_HEIGHT * WALL_TILE_DENSITY;
    wallMatFB.diffuseTexture = texFB;

    /* 세로벽 (Left/Right) 90도 회전  */
    const wallMatLR = new StandardMaterial("wallMatLR", scene);
    wallMatLR.diffuseColor  = new Color3(0.22, 0.13, 0.06);  // ← wallMatLR로 수정
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
    moldingMat.diffuseColor  = new Color3(0.12, 0.07, 0.03);   // 더 어둡고 중립적인 갈색
    moldingMat.specularColor = new Color3(0.15, 0.10, 0.07);   // specular도 낮춰서 주황기 제거
    moldingMat.specularPower = 48;
    moldingMat.zOffset = -1;


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
        const sizeW = lengthAxis === "x" ? length : MOLDING_DEPTH;
        const sizeD = lengthAxis === "z" ? length : MOLDING_DEPTH;

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

    /* ─── 가로벽 몰딩: 세로몰딩이 차지하는 공간(MOLDING_DEPTH)만큼만 줄이기 ─── */
    createMolding("moldBack",  "x", ROOM_WIDTH - MOLDING_DEPTH * 5, new Vector3(0, 0, halfD),
        new Vector3(0, 0, -(WALL_THICK / 2 + MOLDING_DEPTH / 2)));
    createMolding("moldFront", "x", ROOM_WIDTH - MOLDING_DEPTH * 5, new Vector3(0, 0, -halfD),
        new Vector3(0, 0,  (WALL_THICK / 2 + MOLDING_DEPTH / 2)));

    /* ─── 세로벽 몰딩: 가로벽 두께만큼 줄여서 관통 방지 ─── */
    createMolding("moldLeft",  "z", ROOM_DEPTH - MOLDING_DEPTH * 3, new Vector3(-halfW, 0, 0),
        new Vector3( (WALL_THICK / 2 + MOLDING_DEPTH / 2), 0, 0));
    createMolding("moldRight", "z", ROOM_DEPTH - MOLDING_DEPTH * 3, new Vector3( halfW, 0, 0),
        new Vector3(-(WALL_THICK / 2 + MOLDING_DEPTH / 2), 0, 0));


    /* ── 검정 재질 ── */
    const blackMat = new StandardMaterial("blackMat", scene);
    blackMat.diffuseColor  = new Color3(0.03, 0.03, 0.03);
    blackMat.specularColor = new Color3(0, 0, 0);
    blackMat.disableLighting = true

    /* ── 회색 프레임 재질 ── */
    const grayMat = new StandardMaterial("grayMat", scene);
    grayMat.diffuseColor  = new Color3(0.03, 0.03, 0.03);
    grayMat.specularColor = new Color3(0, 0, 0);

    const createFlatBox = (
        name: string,
        w: number, h: number, d: number,
        pos: Vector3,
        mat: StandardMaterial
    ) => {
        const box = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
        box.position = pos;
        box.material = mat;
    };

    /* ─── 회색 프레임 (벽 상단 테두리, 방 바로 바깥) ─── */
    // Back
    createFlatBox("frameBack",  ROOM_WIDTH + FRAME_THICK * 2, 0.5, FRAME_THICK,
        new Vector3(0, FRAME_Y, halfD + FRAME_THICK / 2), grayMat);
    // Front
    createFlatBox("frameFront", ROOM_WIDTH + FRAME_THICK * 2, 0.5, FRAME_THICK,
        new Vector3(0, FRAME_Y, -halfD - FRAME_THICK / 2), grayMat);
    // Left
    createFlatBox("frameLeft",  FRAME_THICK, 0.5, ROOM_DEPTH,
        new Vector3(-halfW - FRAME_THICK / 2, FRAME_Y, 0), grayMat);
    // Right
    createFlatBox("frameRight", FRAME_THICK, 0.5, ROOM_DEPTH,
        new Vector3(halfW + FRAME_THICK / 2, FRAME_Y, 0), grayMat);

    /* ─── 검정 바깥 평면 (회색 프레임 바깥 전부) ─── */
    const outerY = FRAME_Y + 0.01;  // 프레임보다 살짝 위
    const frameOuter = FRAME_THICK;

    // Back 바깥
    createFlatBox("blackBack",  BORDER_SIZE, 0.5, BORDER_SIZE,
        new Vector3(0, outerY, halfD + frameOuter + BORDER_SIZE / 2), blackMat);
    // Front 바깥
    createFlatBox("blackFront", BORDER_SIZE, 0.5, BORDER_SIZE,
        new Vector3(0, outerY, -halfD - frameOuter - BORDER_SIZE / 2), blackMat);
    // Left 바깥
    createFlatBox("blackLeft",  BORDER_SIZE, 0.5, BORDER_SIZE,
        new Vector3(-halfW - frameOuter - BORDER_SIZE / 2, outerY, 0), blackMat);
    // Right 바깥
    createFlatBox("blackRight", BORDER_SIZE, 0.5, BORDER_SIZE,
        new Vector3(halfW + frameOuter + BORDER_SIZE / 2, outerY, 0), blackMat);
    // 코너 4개 (빈틈 없애기)
    createFlatBox("blackCornerBL", BORDER_SIZE, 0.5, BORDER_SIZE,
        new Vector3(-halfW - frameOuter - BORDER_SIZE / 2, outerY, -halfD - frameOuter - BORDER_SIZE / 2), blackMat);
    createFlatBox("blackCornerBR", BORDER_SIZE, 0.5, BORDER_SIZE,
        new Vector3(halfW + frameOuter + BORDER_SIZE / 2, outerY, -halfD - frameOuter - BORDER_SIZE / 2), blackMat);
    createFlatBox("blackCornerTL", BORDER_SIZE, 0.5, BORDER_SIZE,
        new Vector3(-halfW - frameOuter - BORDER_SIZE / 2, outerY, halfD + frameOuter + BORDER_SIZE / 2), blackMat);
    createFlatBox("blackCornerTR", BORDER_SIZE, 0.5, BORDER_SIZE,
        new Vector3(halfW + frameOuter + BORDER_SIZE / 2, outerY, halfD + frameOuter + BORDER_SIZE / 2), blackMat);
}

// objects/door.ts

import { Mesh, SceneLoader, Vector3, Scene, ShadowGenerator, PBRMaterial, Color3 } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

interface Placement {
    x: number;
    z: number;
    rotY: number;
    scale: number;
}

const SCALE = 12;

const PLACEMENTS: Placement[] = [
    { x: -26, z:  31.8, rotY: Math.PI, scale: SCALE },
];
const cache: Record<string, Mesh> = ((window as any).__tmplCache ??= {});


export async function createDoors(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    if (!cache.door || cache.door.isDisposed()) {
        const result = await SceneLoader.ImportMeshAsync("", "/src/assets/3D/", "door.glb", scene);
        cache.door = result.meshes[0] as Mesh;
        cache.door.setEnabled(false);
    }

    const root = cache.door;

    root.getChildMeshes().forEach((child) => {
        const mat = child.material as PBRMaterial;
        if (mat?.albedoColor) {
            if (mat.albedoTexture) {
                mat.albedoTexture.level = 0.8; // 기본 1.0, 낮을수록 어두움
            }
            mat.roughness = 0.8;
            mat.metallic  = 0.5;
            mat.albedoColor = new Color3(0.10, 0.05, 0.02);  // 훨씬 짙은 다크브라운
            mat.emissiveColor    = new Color3(0, 0, 0);
        }
    });


    PLACEMENTS.forEach((cfg, i) => {
        const clone = root.clone(`door_${i}`, null)!;
        clone.setEnabled(true);
        clone.metadata = { hmr: true };  

        clone.position = new Vector3(cfg.x, 0, cfg.z);
        clone.rotation = new Vector3(0, cfg.rotY, 0);
        clone.scaling  = new Vector3(cfg.scale, cfg.scale, cfg.scale);
    });
}

현재 4면으로 밀폐된 방에 지붕 추가하고자 함. 간단하게 추가해줘. 안에서 볼 때 보이도록. 그리고 텍스텨는 내가 적절히 추가할 테니 같은 방식으로