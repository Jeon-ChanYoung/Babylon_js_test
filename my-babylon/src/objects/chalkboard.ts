import { Mesh, SceneLoader, Vector3, Scene, ShadowGenerator, PBRMaterial, Color3 } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

interface Placement {
    x: number;
    y: number;
    z: number;
    rotY: number;
    scale: number;
}

const SCALE = 70;

const PLACEMENTS: Placement[] = [
    { x: -2, y: 8, z: 49, rotY: Math.PI, scale: SCALE },
];
const cache: Record<string, Mesh> = ((window as any).__tmplCache ??= {});


export async function createChalkboards(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    if (!cache.chalkboard || cache.chalkboard.isDisposed()) {
        const result = await SceneLoader.ImportMeshAsync("", "/src/assets/3D/", "chalkboard.glb", scene);
        cache.chalkboard = result.meshes[0] as Mesh;
        cache.chalkboard.setEnabled(false);
    }

    const root = cache.chalkboard;

    root.getChildMeshes().forEach((child) => {
        const mat = child.material as PBRMaterial;
        if (mat?.albedoColor) {
            if (mat.albedoTexture) {
                mat.albedoTexture.level = 0.7; // 기본 1.0, 낮을수록 어두움
            }
        }
    });

    PLACEMENTS.forEach((cfg, i) => {
        const clone = root.clone(`chalkboard_${i}`, null)!;
        clone.setEnabled(true);
        clone.metadata = { hmr: true }; 

        clone.position = new Vector3(cfg.x, cfg.y, cfg.z);
        clone.rotation = new Vector3(0, cfg.rotY, 0);
        clone.scaling  = new Vector3(-cfg.scale, cfg.scale, cfg.scale);
    });
}