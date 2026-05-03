import { Mesh, SceneLoader, Vector3, Scene, ShadowGenerator } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

interface Placement {
    x: number;
    y: number;
    z: number;
    rotY: number;
    scale: number;
}

const SCALE = 2.5;

const PLACEMENTS: Placement[] = [
    { x: 36.2, y: 4, z:  30.5, rotY: Math.PI, scale: SCALE },
];
const cache: Record<string, Mesh> = ((window as any).__tmplCache ??= {});


export async function createLamps(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    if (!cache.lamp || cache.lamp.isDisposed()) {
        const result = await SceneLoader.ImportMeshAsync("", "/src/assets/3D/", "lamp.glb", scene);
        cache.lamp = result.meshes[0] as Mesh;
        cache.lamp.setEnabled(false);
    }

    const root = cache.lamp;

    PLACEMENTS.forEach((cfg, i) => {
        const clone = root.clone(`lamp_${i}`, null)!;
        clone.setEnabled(true);
        clone.metadata = { hmr: true }; 

        clone.position = new Vector3(cfg.x, cfg.y, cfg.z);
        clone.rotation = new Vector3(0, cfg.rotY, 0);
        clone.scaling  = new Vector3(cfg.scale, cfg.scale, cfg.scale);
        
        clone.getChildMeshes().forEach((child) => {
            shadowGen.addShadowCaster(child);
            child.receiveShadows = true;
        });
        shadowGen.addShadowCaster(clone);
        clone.receiveShadows = true;
    });
}