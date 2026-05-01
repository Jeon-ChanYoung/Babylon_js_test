// core/room.ts

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

const ROOM_WIDTH  = 64;   // X축
const ROOM_DEPTH  = 40;   // Z축
const WALL_HEIGHT = 8;  // 벽 높이
const WALL_THICK  = 1; // 벽 두께
const WALL_TILE_DENSITY = 0.1; 

export function createRoom(scene: Scene, shadowGen: ShadowGenerator) {
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


    /* ═══════════ 가로벽 (Front/Back) —═══════════ */
    const wallMatFB = new StandardMaterial("wallMatFB", scene);
    wallMatFB.diffuseColor  = new Color3(0.40, 0.30, 0.15); 
    wallMatFB.specularColor = new Color3(0.08, 0.08, 0.08);
    wallMatFB.backFaceCulling = false;
    const texFB = new Texture("/src/assets/wall/albedo.png", scene);
    texFB.uScale = ROOM_WIDTH * WALL_TILE_DENSITY;
    texFB.vScale = WALL_HEIGHT * WALL_TILE_DENSITY;
    wallMatFB.diffuseTexture = texFB;

    /* ═══════════ 세로벽 (Left/Right) — 90도 회전 ═══════════ */
    const wallMatLR = new StandardMaterial("wallMatLR", scene);
    wallMatLR.diffuseColor  = new Color3(0.76, 0.60, 0.42); 
    wallMatLR.specularColor = new Color3(0.08, 0.08, 0.08);
    wallMatLR.backFaceCulling = false;
    const texLR = new Texture("/src/assets/wall/albedo.png", scene);
    texLR.uScale = WALL_HEIGHT * WALL_TILE_DENSITY;   // ← 스왑
    texLR.vScale = ROOM_DEPTH * WALL_TILE_DENSITY;    // ← 스왑
    texLR.wAng   = Math.PI / 2;                        // ← 90도 회전
    wallMatLR.diffuseTexture = texLR;

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
    createWall("wallBack",  ROOM_WIDTH, WALL_HEIGHT, WALL_THICK,
        new Vector3(0, halfH, halfD), wallMatFB);

    createWall("wallFront", ROOM_WIDTH, WALL_HEIGHT, WALL_THICK,
        new Vector3(0, halfH, -halfD), wallMatFB);

    // 세로벽 (Left/Right) — wallMatLR
    createWall("wallLeft",  WALL_THICK, WALL_HEIGHT, ROOM_DEPTH,
        new Vector3(-halfW, halfH, 0), wallMatLR);

    createWall("wallRight", WALL_THICK, WALL_HEIGHT, ROOM_DEPTH,
        new Vector3(halfW, halfH, 0), wallMatLR);
}