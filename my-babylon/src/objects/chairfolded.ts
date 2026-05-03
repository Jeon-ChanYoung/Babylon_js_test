import {
    Scene,
    Vector3,
    ShadowGenerator,
    SceneLoader,
    Mesh,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

/* ─── 배치 인터페이스 ─── */
interface Placement {
    x: number;
    z: number;
    rotX: number;
    rotY: number;
    scale: number;
}

const SCALE = 6;

const PLACEMENTS: Placement[] = [
    { x: -33.5,  z:   30, rotX: -Math.PI / 12, rotY:  Math.PI,       scale: SCALE },
];
const cache: Record<string, Mesh> = ((window as any).__tmplCache ??= {});


export async function createChairfoldeds(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    if (!cache.chairfolded || cache.chairfolded.isDisposed()) {
        const result = await SceneLoader.ImportMeshAsync("", "/src/assets/3D/", "chairfolded.glb", scene);
        cache.chairfolded = result.meshes[0] as Mesh;
        cache.chairfolded.setEnabled(false);
    }

    const root = cache.chairfolded;

    PLACEMENTS.forEach((cfg, i) => {
        const clone = root.clone(`chairfolded_${i}`, null)!;
        clone.setEnabled(true);
        clone.metadata = { hmr: true };  
        clone.position = new Vector3(cfg.x, 0, cfg.z);
        clone.rotation = new Vector3(cfg.rotX, cfg.rotY, 0);
        clone.scaling  = new Vector3(cfg.scale, cfg.scale, cfg.scale);
        
        clone.getChildMeshes().forEach((child) => {
            shadowGen.addShadowCaster(child);
            child.receiveShadows = true;
        });
        shadowGen.addShadowCaster(clone);
        clone.receiveShadows = true;
    });
}