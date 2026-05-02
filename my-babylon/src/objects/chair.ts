// objects/chair.ts

import {
    Scene,
    Vector3,
    ShadowGenerator,
    SceneLoader,
    Mesh,
    TransformNode,
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

    { x:  28, z: 26, rotY: 0, scale: SCALE },
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
            }
        });
    });
}