import { Mesh, SceneLoader, Vector3, Scene, ShadowGenerator, Color3, PBRMaterial, TransformNode } from "@babylonjs/core";
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
    const children = root.getChildMeshes() as Mesh[];

    children.forEach((child) => {
        const mat = child.material;
        if (!(mat instanceof PBRMaterial)) return;

        if (mat.albedoTexture) {
            mat.albedoTexture.level = 0.7; // 기본 1.0, 낮을수록 어두움
        }
    });

    PLACEMENTS.forEach((cfg, i) => {
        const parent = new TransformNode(`cabinet_${i}`, scene);
        parent.position = new Vector3(cfg.x, 0, cfg.z);
        parent.rotation = new Vector3(0, cfg.rotY, 0);
        parent.scaling  = new Vector3(-cfg.scale, cfg.scale, cfg.scale);
        parent.metadata = { hmr: true };

        children.forEach((child) => {
            if (child.geometry) {
                const inst = child.createInstance(`${child.name}_${i}`);
                inst.parent = parent;
            }
        });
    });
}