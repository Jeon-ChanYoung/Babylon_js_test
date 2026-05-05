// object/extinguisher.ts

import { Mesh, SceneLoader, Vector3, Scene, ShadowGenerator, Color3, PBRMaterial } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

interface Placement {
    x: number;
    y: number;
    z: number;
    rotY: number;
    scale: number;
}

const SCALE = 7;

const PLACEMENTS: Placement[] = [
    { x: 23, y: 3, z: 32, rotY: Math.PI, scale: SCALE },
];
const cache: Record<string, Mesh> = ((window as any).__tmplCache ??= {});


export async function createExtinguishers(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    if (!cache.extinguisher || cache.extinguisher.isDisposed()) {
        const result = await SceneLoader.ImportMeshAsync("", "/src/assets/3D/", "extinguisher.glb", scene);
        cache.extinguisher = result.meshes[0] as Mesh;
        cache.extinguisher.setEnabled(false);
    }

    const root = cache.extinguisher;

    root.getChildMeshes().forEach((child) => {
        const mat = child.material as PBRMaterial;
        
        if (mat.albedoTexture) {
            mat.albedoTexture.level = 1.5
        }
        mat.metallic = 0.9;
        mat.roughness = 0.1;
        mat.albedoColor = Color3.FromHexString("#ffffff");
    });

    PLACEMENTS.forEach((cfg, i) => {
        const clone = root.clone(`extinguisher_${i}`, null)!;
        clone.setEnabled(true);
        clone.metadata = { hmr: true }; 

        clone.position = new Vector3(cfg.x, cfg.y, cfg.z);
        clone.rotation = new Vector3(0, cfg.rotY, 0);
        clone.scaling  = new Vector3(-cfg.scale, cfg.scale, cfg.scale);
    });
}