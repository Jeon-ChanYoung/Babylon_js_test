// core/player.ts

import {
    Scene, Vector3, MeshBuilder, StandardMaterial, Color3,
    KeyboardEventTypes, ArcRotateCamera, Mesh,
} from "@babylonjs/core";

/* ═══════════════════════════════════════════════════════════════
 *  조작 변수
 * ═══════════════════════════════════════════════════════════════
 *  MOVE_SPEED : 최대 수평 이동 속도. 클수록 빠름.
 *
 *  SMOOTHING  : 속도 보간 계수 (0~1).
 *               0 → 즉각 반응 (딱딱함).
 *               1 → 변화 없음 (안 움직임).
 *               0.82면 약 12프레임(~200ms)에 최고속 90% 도달.
 *               0.5면 약 3프레임(~50ms), 0.95면 약 45프레임(~750ms).
 *
 *  JUMP_FORCE : 점프 시 초기 수직 속도. 클수록 높이 뜀.
 *               0.25 → 약 2.6 유닛 높이, 체공 ~0.7초.
 *
 *  GRAVITY    : 프레임당 수직 가속도 (음수).
 *               절대값 클수록 빨리 떨어짐.
 *
 *  GROUND_Y   : 바닥 안전 높이 (= 공 반지름).
 *               충돌 누락 시 이 아래로 떨어지면 강제 복원.
 * ═══════════════════════════════════════════════════════════════ */
const MOVE_SPEED = 0.3;
const SMOOTHING  = 0.82;
const JUMP_FORCE = 0.25;
const GRAVITY    = -0.012;
const GROUND_Y   = 1.0;
const DIAMETER   = 2;

export function createPlayer(scene: Scene): Mesh {
    const sphere = MeshBuilder.CreateSphere("player", { diameter: DIAMETER }, scene);
    sphere.position = new Vector3(0, 5, 0);
    sphere.metadata = { hmr: true };

    const mat = new StandardMaterial("playerMat", scene);
    mat.diffuseColor = new Color3(0.9, 0.25, 0.25);
    sphere.material = mat;

    /* ── 충돌 타원체 (반지름 = DIAMETER/2) ── */
    sphere.checkCollisions = true;
    sphere.ellipsoid = new Vector3(1, 1, 1);

    /* ── 상태 ── */
    const velocity = Vector3.Zero();
    let isGrounded = false;

    /* ── 입력 ── */
    const keys = new Set<string>();
    scene.onKeyboardObservable.add((info) => {
        const key = info.event.key.toLowerCase();
        if (info.type === KeyboardEventTypes.KEYDOWN) keys.add(key);
        else keys.delete(key);
    });

    /* ── 매 프레임 업데이트 ── */
    scene.onBeforeRenderObservable.add(() => {
        if (sphere.isDisposed()) return;
        const cam = scene.activeCamera as ArcRotateCamera;
        if (!cam) return;

        // 카메라 기준 수평 방향
        const fwd = cam.getDirection(Vector3.Forward());
        fwd.y = 0; fwd.normalize();
        const rgt = cam.getDirection(Vector3.Right());
        rgt.y = 0; rgt.normalize();

        // 입력 → 방향 벡터
        const dir = Vector3.Zero();
        if (keys.has("w") || keys.has("arrowup"))    dir.addInPlace(fwd);
        if (keys.has("s") || keys.has("arrowdown"))  dir.addInPlace(fwd.scale(-1));
        if (keys.has("a") || keys.has("arrowleft"))  dir.addInPlace(rgt.scale(-1));
        if (keys.has("d") || keys.has("arrowright")) dir.addInPlace(rgt);
        if (dir.length() > 0) dir.normalize();

        // 수평 속도 보간: 현재 속도 → 목표 속도(dir * MOVE_SPEED)로 부드럽게 전환
        velocity.x = velocity.x * SMOOTHING + dir.x * MOVE_SPEED * (1 - SMOOTHING);
        velocity.z = velocity.z * SMOOTHING + dir.z * MOVE_SPEED * (1 - SMOOTHING);

        // 점프
        if (keys.has(" ") && isGrounded) {
            velocity.y = JUMP_FORCE;
            isGrounded = false;
        }

        // 중력
        velocity.y += GRAVITY;

        // 충돌 이동
        const prevY = sphere.position.y;
        sphere.moveWithCollisions(velocity);

        // 착지 감지: 아래로 떨어지려 했는데 실제로 덜 떨어졌으면 → 바닥에 닿음
        if (velocity.y <= 0 && sphere.position.y - prevY > velocity.y * 0.5) {
            velocity.y = 0;
            isGrounded = true;
        }

        // 바닥 안전망
        if (sphere.position.y < GROUND_Y) {
            sphere.position.y = GROUND_Y;
            velocity.y = 0;
            isGrounded = true;
        }
    });

    return sphere;
}

// core/camera.ts

import { ArcRotateCamera, Vector3, Scene } from "@babylonjs/core";

/* ═══════════════════════════════════════════════════════════════
 *  카메라 변수
 * ═══════════════════════════════════════════════════════════════
 *  ALPHA      : 초기 수평 각도 (라디안).
 *               -PI/2 = 정면. 0 = 우측에서.
 *
 *  BETA       : 초기 수직 각도.
 *               0 = 바로 위에서. PI/2 = 수평. PI/3.5 ≈ 비스듬히.
 *
 *  RADIUS     : 카메라 ↔ 플레이어 거리. 클수록 멀리서 봄.
 *
 *  RADIUS_MIN : 최소 줌 거리. 2~3이면 캐릭터 가까이까지 줌 가능.
 *  RADIUS_MAX : 최대 줌 거리.
 *
 *  BETA_MIN   : 수직 회전 상한. 0에 가까울수록 꼭대기에서 봄.
 *  BETA_MAX   : 수직 회전 하한. PI/2면 수평까지만 가능.
 *
 *  WHEEL_PREC : 마우스 휠 감도. 클수록 한 틱당 줌 변화 적음 (둔감).
 *  INERTIA    : 회전 관성 (0~1). 1에 가까울수록 미끄러짐.
 *  SENS_X/Y   : 마우스 드래그 회전 감도. 클수록 둔감.
 *               500 = 빠른 회전, 1000 = 느린 회전, 2000 = 매우 느림.
 * ═══════════════════════════════════════════════════════════════ */
const ALPHA      = -Math.PI / 2;
const BETA       = Math.PI / 3.5;
const RADIUS     = 20;

const RADIUS_MIN = 3;
const RADIUS_MAX = 60;

const BETA_MIN   = 0.3;
const BETA_MAX   = Math.PI / 2.2;

const WHEEL_PREC = 3;
const INERTIA    = 0.9;
const SENS_X     = 500;
const SENS_Y     = 500;

export function createCamera(scene: Scene, canvas: HTMLCanvasElement) {
    const camera = new ArcRotateCamera(
        "camera", ALPHA, BETA, RADIUS,
        Vector3.Zero(), scene
    );
    camera.attachControl(canvas, true);

    camera.lowerRadiusLimit    = RADIUS_MIN;
    camera.upperRadiusLimit    = RADIUS_MAX;
    camera.lowerBetaLimit      = BETA_MIN;
    camera.upperBetaLimit      = BETA_MAX;

    camera.wheelPrecision      = WHEEL_PREC;
    camera.inertia             = INERTIA;
    camera.angularSensibilityX = SENS_X;
    camera.angularSensibilityY = SENS_Y;

    /* WASD는 플레이어가 사용하므로 카메라 키보드 비활성화 */
    camera.keysUp    = [];
    camera.keysDown  = [];
    camera.keysLeft  = [];
    camera.keysRight = [];

    /* 우클릭 패닝 비활성화 (플레이어가 직접 이동) */
    camera.panningSensibility = 0;

    return camera;
}

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

scene.collisionsEnabled = true;
scene.meshes.forEach((m: any) => { m.checkCollisions = true; });
scene.onNewMeshAddedObservable.add((m: any) => { m.checkCollisions = true; });

const player = createPlayer(scene);
camera.setTarget(player);

(async () => {
    console.time("load");
    await Promise.all([
        // createboards(scene, shadowGen),
        // createTables(scene, shadowGen),
        // createTrashbins(scene, shadowGen),
        // createWaterfilters(scene, shadowGen),
        // createChalkboards(scene, shadowGen),
        // createCabinets(scene, shadowGen),
        // createChairfoldeds(scene, shadowGen),
        // createExtinguishers(scene, shadowGen),
        // createChairs(scene, shadowGen),
        // createDoors(scene, shadowGen),
        // createBrooms(scene, shadowGen),
        // createDustpans(scene, shadowGen),
        // createMopsinks(scene, shadowGen),
        // createLamps(scene, shadowGen),
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

function createPlayer(scene: any) {
    throw new Error("Function not implemented.");
}


3개 추가 및 업데이트 했는데 실행시 공은 없고 조작은 회전, 확대 축소만 됨