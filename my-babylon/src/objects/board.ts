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