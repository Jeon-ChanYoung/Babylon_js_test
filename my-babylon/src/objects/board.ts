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

const SCALE = 10;

const PLACEMENTS: Placement[] = [
    { x: 35, y: 8, z: 32, rotY: Math.PI, scale: SCALE },
]

export async function createboards(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    const container = await SceneLoader.LoadAssetContainerAsync(
        "/src/assets/3D/",
        "board.glb",
        scene
    );

    const rootMesh = container.meshes[0] as Mesh;
    const childMeshes = container.meshes.slice(1) as Mesh[];

    PLACEMENTS.forEach((cfg, i) => {
        // 빈 부모 노드 생성
        const parent = new Mesh(`board_${i}`, scene);
        parent.position = new Vector3(cfg.x, cfg.y, cfg.z);
        parent.rotation = new Vector3(0, cfg.rotY, 0);
        parent.scaling  = new Vector3(-cfg.scale, cfg.scale, cfg.scale);

        // 각 서브메시를 인스턴싱
        childMeshes.forEach((child) => {
            if (child.geometry) {
                const instance = child.createInstance(`${child.name}_${i}`);
                instance.parent = parent;
            }
        });
    });
}