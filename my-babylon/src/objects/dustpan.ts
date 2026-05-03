import { Mesh, SceneLoader, Vector3, Scene, ShadowGenerator } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

interface Placement {
    x: number;
    z: number;
    rotY: number;
    scale: number;
}

const SCALE = 4;

const PLACEMENTS: Placement[] = [
    { x: -43, z:  -28, rotY: Math.PI / 1.8, scale: SCALE },
];
const cache: Record<string, Mesh> = ((window as any).__tmplCache ??= {});


export async function createDustpans(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    if (!cache.dustpan || cache.dustpan.isDisposed()) {
        const result = await SceneLoader.ImportMeshAsync("", "/src/assets/3D/", "dustpan.glb", scene);
        cache.dustpan = result.meshes[0] as Mesh;
        cache.dustpan.setEnabled(false);
    }

    const root = cache.dustpan;

    PLACEMENTS.forEach((cfg, i) => {
        const clone = root.clone(`dustpan_${i}`, null)!;
        clone.setEnabled(true);
        clone.metadata = { hmr: true };  

        clone.position = new Vector3(cfg.x, 0, cfg.z);
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