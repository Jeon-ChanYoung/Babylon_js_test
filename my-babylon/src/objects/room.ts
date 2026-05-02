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

const ROOM_WIDTH  = 100;   // X축
const ROOM_DEPTH  = 65;   // Z축
const WALL_HEIGHT = 17;  // 벽 높이
const WALL_THICK  = 1; // 벽 두께
const WALL_TILE_DENSITY = 0.1; 

/* ─── 몰딩 치수 ─── */
const MOLDING_HEIGHT = 1.0;          // 몰딩 세로 두께
const MOLDING_DEPTH  = 0.2;          // 벽에서 얼마나 튀어나오는지
const MOLDING_BOTTOM_Y = MOLDING_HEIGHT / 2;                          // 바닥 몰딩 중심 Y
const MOLDING_TOP_Y    = WALL_HEIGHT - MOLDING_HEIGHT / 2;            // 상단 몰딩 중심 Y


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

    const floorTex = new Texture("/src/assets/floor/albedo.png", scene);
    floorTex.uScale = 8;
    floorTex.vScale = 3;
    floorTex.wAng = Math.PI / 2;      // ← 90도 회전
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
    const texFB = new Texture("/src/assets/wall/albedo.png", scene);
    texFB.uScale = ROOM_WIDTH * WALL_TILE_DENSITY;
    texFB.vScale = WALL_HEIGHT * WALL_TILE_DENSITY;
    wallMatFB.diffuseTexture = texFB;

    /* ═══════════ 세로벽 (Left/Right) — 90도 회전 ═══════════ */
    const wallMatLR = new StandardMaterial("wallMatLR", scene);
    wallMatLR.diffuseColor  = new Color3(0.28, 0.18, 0.08);
    wallMatLR.specularColor = new Color3(0.05, 0.05, 0.05);
    wallMatLR.backFaceCulling = false;
    const texLR = new Texture("/src/assets/wall/albedo.png", scene);
    texLR.uScale = WALL_HEIGHT * WALL_TILE_DENSITY;   // ← 스왑
    texLR.vScale = ROOM_DEPTH * WALL_TILE_DENSITY;    // ← 스왑
    texLR.wAng   = Math.PI / 2;                        // ← 90도 회전
    wallMatLR.diffuseTexture = texLR;

   /* ═══════════════════════════════════════════
    *  몰딩 재질 — 벽보다 더 어두운 색
    * ═══════════════════════════════════════════ */
    const moldingMat = new StandardMaterial("moldingMat", scene);
    moldingMat.diffuseColor  = new Color3(0.15, 0.09, 0.04);     // 아주 진한 갈색
    moldingMat.specularColor = new Color3(0.12, 0.12, 0.12);     // 약간의 광택


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
    *
    *  벽 안쪽으로 MOLDING_DEPTH 만큼 돌출
    *  상단 + 하단 각각 생성
    * ═══════════════════════════════════════════ */
    const createMolding = (
        baseName: string,
        lengthAxis: "x" | "z",
        length: number,
        pos: Vector3,            // 해당 벽 중심의 XZ (Y는 자동 계산)
        inwardOffset: Vector3    // 벽 안쪽 방향 오프셋
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

    // Back 벽 (Z = +halfD) → 안쪽은 -Z 방향
    createMolding("moldBack", "x", ROOM_WIDTH, new Vector3(0, 0, halfD), new Vector3(0, 0, -MOLDING_DEPTH / 2));

    // Front 벽 (Z = -halfD) → 안쪽은 +Z 방향
    createMolding("moldFront", "x", ROOM_WIDTH, new Vector3(0, 0, -halfD), new Vector3(0, 0, MOLDING_DEPTH / 2));

    /* ─── 세로벽 몰딩 (Z축 방향으로 긴 줄) ─── */

    // Left 벽 (X = -halfW) → 안쪽은 +X 방향
    createMolding("moldLeft", "z", ROOM_DEPTH, new Vector3(-halfW, 0, 0), new Vector3(MOLDING_DEPTH / 2, 0, 0));

    // Right 벽 (X = +halfW) → 안쪽은 -X 방향
    createMolding("moldRight", "z", ROOM_DEPTH, new Vector3(halfW, 0, 0), new Vector3(-MOLDING_DEPTH / 2, 0, 0));
}