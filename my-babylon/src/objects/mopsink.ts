// objects/mopsink.ts

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
    { x: -47, z:  -26.5, rotY: Math.PI / 2, scale: SCALE },
];
const cache: Record<string, Mesh> = ((window as any).__tmplCache ??= {});


export async function createMopsinks(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    if (!cache.mopsink || cache.mopsink.isDisposed()) {
        const result = await SceneLoader.ImportMeshAsync("", "/src/assets/3D/", "mopsink.glb", scene);
        cache.mopsink = result.meshes[0] as Mesh;
        cache.mopsink.setEnabled(false);
    }

    const root = cache.mopsink;

    root.getChildMeshes().forEach((child) => {
        const mat = child.material as PBRMaterial;
        if (mat?.albedoColor) {
            if (mat.albedoTexture) {
                mat.albedoTexture.level = 1.2; // 기본 1.0, 낮을수록 어두움
            }
            mat.albedoColor = new Color3(0.8, 0.8, 0.8);
            mat.metallic = 0.9;
            mat.roughness = 0.3;
        }
    });

    PLACEMENTS.forEach((cfg, i) => {
        const clone = root.clone(`mopsink_${i}`, null)!;
        clone.setEnabled(true);
        clone.metadata = { hmr: true };  

        clone.position = new Vector3(cfg.x, 0, cfg.z);
        clone.rotation = new Vector3(0, cfg.rotY, 0);
        clone.scaling  = new Vector3(cfg.scale, cfg.scale, cfg.scale);
    });
}