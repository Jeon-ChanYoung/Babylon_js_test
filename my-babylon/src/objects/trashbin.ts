import { Mesh, SceneLoader, Vector3, Scene, ShadowGenerator } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

interface Placement {
    x: number;
    z: number;
    rotY: number;
    scale: number;
}

const SCALE = 6;

const PLACEMENTS: Placement[] = [
    { x: 41, z:  30, rotY: Math.PI, scale: SCALE },
];
const cache: Record<string, Mesh> = ((window as any).__tmplCache ??= {});


export async function createTrashbins(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    if (!cache.trashbin || cache.trashbin.isDisposed()) {
        const result = await SceneLoader.ImportMeshAsync("", "/src/assets/3D/", "trashbin.glb", scene);
        cache.trashbin = result.meshes[0] as Mesh;
        cache.trashbin.setEnabled(false);
    }

    const root = cache.trashbin;

    PLACEMENTS.forEach((cfg, i) => {
        const clone = root.clone(`trashbin_${i}`, null)!;
        clone.setEnabled(true);
        clone.metadata = { hmr: true }; 

        clone.position = new Vector3(cfg.x, 0, cfg.z);
        clone.rotation = new Vector3(0, cfg.rotY, 0);
        clone.scaling  = new Vector3(cfg.scale, cfg.scale, cfg.scale);
    });
}