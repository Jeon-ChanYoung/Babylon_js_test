import { Mesh, SceneLoader, Vector3, Scene, ShadowGenerator } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

interface Placement {
    x: number;
    z: number;
    rotY: number;
    scale: number;
}

const SCALE = 12;

const PLACEMENTS: Placement[] = [
    { x: -47, z:  29, rotY: Math.PI, scale: SCALE },
    { x: -43, z:  29, rotY: Math.PI, scale: SCALE },
    { x: -39, z:  29, rotY: Math.PI, scale: SCALE },
];
const cache: Record<string, Mesh> = ((window as any).__tmplCache ??= {});


export async function createCabinets(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    if (!cache.cabinet || cache.cabinet.isDisposed()) {
        const result = await SceneLoader.ImportMeshAsync("", "/src/assets/3D/", "cabinet.glb", scene);
        cache.cabinet = result.meshes[0] as Mesh;
        cache.cabinet.setEnabled(false);
    }

    const root = cache.cabinet;

    PLACEMENTS.forEach((cfg, i) => {
        const clone = root.clone(`cabinet_${i}`, null)!;
        clone.setEnabled(true);
        clone.metadata = { hmr: true };  

        clone.position = new Vector3(cfg.x, 0, cfg.z);
        clone.rotation = new Vector3(0, cfg.rotY, 0);
        clone.scaling  = new Vector3(cfg.scale, cfg.scale, cfg.scale);
    });
}