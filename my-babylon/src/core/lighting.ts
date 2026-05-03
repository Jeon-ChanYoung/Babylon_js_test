// core/lighting.ts

import {
    Scene,
    DirectionalLight,
    HemisphericLight,
    ShadowGenerator,
    Vector3,
    Color3,
	Color4,
	PointLight,
	SpotLight,
	GlowLayer,
} from "@babylonjs/core";

/* ═══════════════════════════════════════════
 *  이 플래그만 바꾸면 라이팅 전환
 *  true  → 최소 라이트만 (빠름)
 *  false → 풀 라이팅 + 그림자
 * ═══════════════════════════════════════════ */

export function createLighting(scene: Scene) {
    return createFullLighting(scene);
}

/* ─── 프로덕션: 풀 라이팅 ─── */
function createFullLighting(scene: Scene) {
	const sun = new DirectionalLight(
		"sun",
		new Vector3(1, -2, 1).normalize(),
		scene
	);
	sun.intensity = 3;
	sun.diffuse   = new Color3(1.0, 0.92, 0.78);
	sun.specular  = new Color3(1.0, 0.95, 0.85);
	sun.position  = new Vector3(-15, 20, -10);

	const ambient = new HemisphericLight(
		"ambient",
		new Vector3(0, 1, 0),
		scene
	);
	ambient.intensity   = 0.8;
	ambient.diffuse     = new Color3(0.9, 0.88, 0.82);
	ambient.groundColor = new Color3(0.5, 0.45, 0.38);

	const shadowGen = new ShadowGenerator(1024, sun);
	shadowGen.useBlurExponentialShadowMap = true;
	shadowGen.blurKernel = 48;
	shadowGen.darkness   = 0.35;
	shadowGen.bias       = 0.0001;
	shadowGen.normalBias = 0.008;

	// const shadowGen = new ShadowGenerator(1, sun);  // 최소 해상도
    // shadowGen.useBlurExponentialShadowMap = false;

	return { sun, shadowGen };
}