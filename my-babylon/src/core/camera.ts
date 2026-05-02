// core/camera.ts

import {
    ArcRotateCamera,
    Vector3,
    KeyboardEventTypes,
    Scene,
    PointerEventTypes,
} from "@babylonjs/core";

export function createCamera(scene: Scene, canvas: HTMLCanvasElement) {
    const camera = new ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 3.5,
        35,
        new Vector3(0, 2, 0),
        scene
    );
    camera.attachControl(canvas, true);

    /* ── 줌 제한 ── */
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 150;

    /* ── 수직 회전 제한 ── */
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = Math.PI / 2.2;

    /* ── 회전 관성 ── */
    camera.wheelPrecision = 3;
    camera.inertia = 0.92;

    /* ── 마우스 패닝 (우클릭 드래그) ── */
    camera.panningSensibility = 30;
    camera.panningInertia = 0.85;
    camera.panningAxis = new Vector3(1, 0, 1);
    camera.panningDistanceLimit = 80;

    /* ── 기본 키보드 회전 비활성화 ── */
    camera.keysUp    = [];
    camera.keysDown  = [];
    camera.keysLeft  = [];
    camera.keysRight = [];

    /* ═══════════════════════════════════════════
    *  제자리 회전: 회전 시작 시 target을 카메라
    *  위치로 옮기고, radius를 0 근처로 설정.
    *  회전 끝나면 원래 radius로 복원.
    * ═══════════════════════════════════════════ */
    let savedRadius = camera.radius;
    let isRotating  = false;

    scene.onPointerObservable.add((info) => {
        // 좌클릭 눌림 → 회전 시작
        if (
            info.type === PointerEventTypes.POINTERDOWN &&
            info.event.button === 0
        ) {
            // 현재 카메라 월드 위치 저장
            const camPos = camera.position.clone();
            savedRadius  = camera.radius;

            // target을 카메라 위치로 이동 → 제자리 회전
            camera.target.copyFrom(camPos);
            camera.radius = 0.01; // 거의 0 (완전 0이면 오류)
            isRotating = true;
        }

            // 좌클릭 해제 → 회전 종료, radius 복원
        if (
            info.type === PointerEventTypes.POINTERUP &&
            info.event.button === 0 &&
            isRotating
        ) {
            // 현재 카메라 위치에서 원래 거리만큼 앞에 target 재배치
            const forward = camera.getDirection(Vector3.Forward());
            camera.target = camera.position.add(forward.scale(savedRadius));
            camera.radius = savedRadius;
            isRotating = false;
        }
    });

    /* ═══════════════════════════════════════════
    *  WASD / 방향키 → target 이동 (패닝)
    * ═══════════════════════════════════════════ */
    const PAN_SPEED = 0.5;
    const pressedKeys = new Set<number>();

    scene.onKeyboardObservable.add((info) => {
        if (info.type === KeyboardEventTypes.KEYDOWN) {
            pressedKeys.add(info.event.keyCode);
        } else {
            pressedKeys.delete(info.event.keyCode);
        }
    });

    scene.onBeforeRenderObservable.add(() => {
        if (pressedKeys.size === 0) return;

        const forward = camera.getDirection(Vector3.Forward());
        forward.y = 0;
        forward.normalize();

        const right = camera.getDirection(Vector3.Right());
        right.y = 0;
        right.normalize();

        const move = Vector3.Zero();

        if (pressedKeys.has(87) || pressedKeys.has(38)) {
            move.addInPlace(forward.scale(PAN_SPEED));
        }
        if (pressedKeys.has(83) || pressedKeys.has(40)) {
            move.addInPlace(forward.scale(-PAN_SPEED));
        }
        if (pressedKeys.has(65) || pressedKeys.has(37)) {
            move.addInPlace(right.scale(-PAN_SPEED));
        }
        if (pressedKeys.has(68) || pressedKeys.has(39)) {
            move.addInPlace(right.scale(PAN_SPEED));
        }

        camera.target.addInPlace(move);
    });

    return camera;
}