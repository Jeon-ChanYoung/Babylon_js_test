import { Mesh, SceneLoader, Vector3, Scene, ShadowGenerator } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

interface Placement {
    x: number;
    z: number;
    rotY: number;
    scale: number;
}

const SCALE = 5;

const PLACEMENTS: Placement[] = [
    { x: 41, z:  30, rotY: Math.PI, scale: SCALE },
]

export async function createTrashbins(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    const container = await SceneLoader.LoadAssetContainerAsync(
        "/src/assets/3D/",
        "trashbin.glb",
        scene
    );

    const rootMesh = container.meshes[0] as Mesh;
    const childMeshes = container.meshes.slice(1) as Mesh[];

    PLACEMENTS.forEach((cfg, i) => {
        const parent = new Mesh(`trashbin_${i}`, scene);
        parent.position = new Vector3(cfg.x, 0, cfg.z);
        parent.rotation = new Vector3(0, cfg.rotY, 0);
        parent.scaling  = new Vector3(cfg.scale, cfg.scale, cfg.scale);

        childMeshes.forEach((child) => {
            if (child.geometry) {
                const instance = child.createInstance(`${child.name}_${i}`);
                instance.parent = parent;
            }
        });
    });
}