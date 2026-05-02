import { Mesh, SceneLoader, Vector3, Scene, ShadowGenerator } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

interface Placement {
    x: number;
    y: number;
    z: number;
    rotY: number;
    scale: number;
}

const SCALE = 35;

const PLACEMENTS: Placement[] = [
    { x: 2, y: 5, z: 32, rotY: Math.PI, scale: SCALE },
]

export async function createChalkboards(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    const container = await SceneLoader.LoadAssetContainerAsync(
        "/src/assets/3D/",
        "chalkboard.glb",
        scene
    );

    const rootMesh = container.meshes[0] as Mesh;
    const childMeshes = container.meshes.slice(1) as Mesh[];

    PLACEMENTS.forEach((cfg, i) => {
        const parent = new Mesh(`chalkboard_${i}`, scene);
        parent.position = new Vector3(cfg.x, cfg.y, cfg.z);
        parent.rotation = new Vector3(0, cfg.rotY, 0);
        parent.scaling  = new Vector3(-cfg.scale, cfg.scale, cfg.scale);

        // 각 서브메시를 인스턴싱
        childMeshes.forEach((child) => {
            if (child.geometry) {
                const instance = child.createInstance(`${child.name}_${i}`);
                instance.parent = parent;
            }
        });
    });
}