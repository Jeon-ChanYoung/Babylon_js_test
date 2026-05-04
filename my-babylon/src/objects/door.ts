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
        clone.scaling  = new Vector3(-cfg.scale, cfg.scale, cfg.scale);
    });
}