// objects/table.ts

import { Mesh, SceneLoader, Vector3, Scene, ShadowGenerator, Color3, PBRMaterial } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

interface Placement {
    x: number;
    z: number;
    rotY: number;
    scale: number;
}

const SCALE = 12;

const PLACEMENTS: Placement[] = [
    { x: 32, z:  30, rotY: Math.PI, scale: SCALE },
];
const cache: Record<string, Mesh> = ((window as any).__tmplCache ??= {});


export async function createTables(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    if (!cache.table || cache.table.isDisposed()) {
        const result = await SceneLoader.ImportMeshAsync("", "/src/assets/3D/", "table.glb", scene);
        cache.table = result.meshes[0] as Mesh;
        cache.table.setEnabled(false);
    }

    const root = cache.table;

    root.getChildMeshes().forEach((child) => {
        const mat = child.material as PBRMaterial;
        if (mat?.albedoColor) {
            mat.albedoColor = new Color3(0.3, 0.2, 0.1);
        }
    });

    PLACEMENTS.forEach((cfg, i) => {
        const clone = root.clone(`table_${i}`, null)!;
        clone.setEnabled(true);
        clone.metadata = { hmr: true };  

        clone.position = new Vector3(cfg.x, 0, cfg.z);
        clone.rotation = new Vector3(0, cfg.rotY, 0);
        clone.scaling  = new Vector3(-cfg.scale, cfg.scale, cfg.scale);
        
        clone.getChildMeshes().forEach((child) => {
            shadowGen.addShadowCaster(child);
            child.receiveShadows = true;
        });
        shadowGen.addShadowCaster(clone);
        clone.receiveShadows = true;
    });
}