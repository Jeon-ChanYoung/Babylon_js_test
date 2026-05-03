import { Mesh, SceneLoader, Vector3, Scene, ShadowGenerator } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

interface Placement {
    x: number;
    z: number;
    rotX: number;
    rotY: number;
    scale: number;
}

const SCALE = 8;

const PLACEMENTS: Placement[] = [
    { x: -40, z:  -30, rotX: -Math.PI / 2.5, rotY: Math.PI, scale: SCALE },
];
const cache: Record<string, Mesh> = ((window as any).__tmplCache ??= {});


export async function createBrooms(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    if (!cache.broom || cache.broom.isDisposed()) {
        const result = await SceneLoader.ImportMeshAsync("", "/src/assets/3D/", "broom.glb", scene);
        cache.broom = result.meshes[0] as Mesh;
        cache.broom.setEnabled(false);
    }

    const root = cache.broom;

    PLACEMENTS.forEach((cfg, i) => {
        const clone = root.clone(`broom_${i}`, null)!;
        clone.setEnabled(true);
        clone.metadata = { hmr: true };  

        clone.position = new Vector3(cfg.x, 0, cfg.z);
        clone.rotation = new Vector3(cfg.rotX, cfg.rotY, 0);
        clone.scaling  = new Vector3(cfg.scale, cfg.scale, cfg.scale);
    });
}