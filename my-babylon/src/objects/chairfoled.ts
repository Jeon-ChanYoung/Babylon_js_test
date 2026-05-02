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

export async function createChairfoldeds(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    const container = await SceneLoader.LoadAssetContainerAsync(
        "/src/assets/3D/",
        "chairfolded.glb",
        scene
    );

    const rootMesh = container.meshes[0] as Mesh;
    const childMeshes = container.meshes.slice(1) as Mesh[];

    PLACEMENTS.forEach((cfg, i) => {
        const parent = new Mesh(`chairfolded_${i}`, scene);
        parent.position = new Vector3(cfg.x, 0, cfg.z);
        parent.rotation = new Vector3(cfg.rotX, cfg.rotY, 0);
        parent.scaling  = new Vector3(cfg.scale, cfg.scale, cfg.scale);

        childMeshes.forEach((child) => {
            if (child.geometry) {
                const instance = child.createInstance(`${child.name}_${i}`);
                instance.parent = parent;
            }
        });
    });     
}