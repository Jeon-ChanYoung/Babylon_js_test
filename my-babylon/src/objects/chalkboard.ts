import { Mesh, SceneLoader, Vector3, Scene, ShadowGenerator } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

interface Placement {
    x: number;
    y: number;
    z: number;
    rotY: number;
    scale: number;
}

const SCALE = 30;

const PLACEMENTS: Placement[] = [
    { x: -4, y: 4, z: 32, rotY: Math.PI, scale: SCALE },
];
const cache: Record<string, Mesh> = ((window as any).__tmplCache ??= {});


export async function createChalkboards(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    if (!cache.chalkboard || cache.chalkboard.isDisposed()) {
        const result = await SceneLoader.ImportMeshAsync("", "/src/assets/3D/", "chalkboard.glb", scene);
        cache.chalkboard = result.meshes[0] as Mesh;
        cache.chalkboard.setEnabled(false);
    }

    const root = cache.chalkboard;

    PLACEMENTS.forEach((cfg, i) => {
        const clone = root.clone(`chalkboard_${i}`, null)!;
        clone.setEnabled(true);
        clone.metadata = { hmr: true }; 

        clone.position = new Vector3(cfg.x, cfg.y, cfg.z);
        clone.rotation = new Vector3(0, cfg.rotY, 0);
        clone.scaling  = new Vector3(-cfg.scale, cfg.scale, cfg.scale);
    });
}