import {
  Scene,
  Vector3,
  ShadowGenerator,
  SceneLoader,
  Mesh,
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
];

export async function createChairs(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    const container = await SceneLoader.LoadAssetContainerAsync(
        "/src/assets/3D/",
        "chair.glb",
        scene
    );

    // 원본 메시들을 scene에 추가하지 않고 보관
    const rootMesh = container.meshes[0] as Mesh;
    const childMeshes = container.meshes.slice(1) as Mesh[];

    PLACEMENTS.forEach((cfg, i) => {
        // 빈 부모 노드 생성
        const parent = new Mesh(`chair_${i}`, scene);
        parent.position = new Vector3(cfg.x, 0, cfg.z);
        parent.rotation = new Vector3(0, cfg.rotY, 0);
        parent.scaling  = new Vector3(cfg.scale, cfg.scale, cfg.scale);

        // 각 서브메시를 인스턴싱
        childMeshes.forEach((child) => {
            if (child.geometry) {
                const instance = child.createInstance(`${child.name}_${i}`);
                instance.parent = parent;
            }
        });
    });
}