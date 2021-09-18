import "./CSS/styles.scss";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();

const sizes = {
  width: innerWidth,
  height: innerHeight,
};

init();
function init() {
  Lights();
  Objects();
  const camera = Camera();

  const canvas = document.querySelector("#webgl");
  const renderer = Renderer(canvas);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  addEventListener("resize", () => {
    sizes.height = innerHeight;
    sizes.width = innerWidth;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
  });

  const clock = new THREE.Clock();
  function animate() {
    const elapsedTime = clock.getElapsedTime();

    controls.update();
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
  }
  animate();
}

function Lights() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1.5, 4, 2);

  const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
    1
  );

  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;

  scene.add(directionalLight, directionalLightHelper);
}

function Objects() {
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xf7f0f5 });
  planeMaterial.metalness = 0.2;
  planeMaterial.roughness = 0.8;

  const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(5, 5),
    planeMaterial
  );
  plane.rotation.x = Math.PI / 2;
  plane.position.y = -0.501;
  plane.material.side = THREE.DoubleSide; // Render both sides

  const cube = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );

  plane.receiveShadow = true;
  cube.castShadow = true;
  cube.receiveShadow = true;

  scene.add(plane, cube);
}

function Camera() {
  const camera = new THREE.PerspectiveCamera(
    65,
    sizes.width / sizes.height,
    0.1,
    500
  );
  camera.position.set(-3, 2, 4);
  scene.add(camera);

  return camera;
}

function Renderer(canvas) {
  const renderer = new THREE.WebGL1Renderer({ canvas });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  return renderer;
}
