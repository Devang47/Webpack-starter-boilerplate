import "./CSS/normalize.css";
import "./CSS/style.scss";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader";

import * as dat from "dat.gui";

init();
function init() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#E8E6E6");

  const params = {
    exposure: 4.0,
    fog: 0.05,
    light: {
      x: 2.82,
      y: 4,
      z: 2.9,
    },
    ambientLight: 0.3,
  };

  // scene.fog = new THREE.FogExp2(0xe8e6e6, params.fog);

  const gui = new dat.GUI();
  gui.add(params, "exposure").min(0).max(10).step(0.01);

  gui
    .add(params, "fog")
    .min(0)
    .max(4)
    .step(0.01)
    .onChange(() => {
      scene.fog = new THREE.FogExp2(0xe8e6e6, params.fog);
    });

  const sizes = {
    width: innerWidth,
    height: innerHeight,
  };

  /**
   * Loaders
   */
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  // let envMap;
  // const exrLoader = new EXRLoader();
  // exrLoader.load("./env-map.exr", function (texture, textureData) {
  //   texture.encoding = THREE.sRGBEncoding;
  //   scene.background = texture;
  //   scene.environment = texture;
  // });

  /**
   * Lights
   */
  const ambientLight = new THREE.AmbientLight(0xfafafa, params.ambientLight);
  scene.add(ambientLight);
  gui
    .add(params, "ambientLight")
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
      ambientLight.intensity = params.ambientLight;
    });

  params.lightColor = 0xffffff;
  const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
  directionalLight.position.set(params.light.x, params.light.y, params.light.z);

  params.bias = 0.05;
  directionalLight.shadow.normalBias = params.bias;
  const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
    1
  );
  scene.add(directionalLight, directionalLightHelper);

  gui.add(params, "bias").min(0).max(1).step(0.01);
  gui.addColor(params, "lightColor").onChange(() => {
    directionalLight.color = params.lightColor;
  });
  gui
    .add(params.light, "x")
    .min(0)
    .max(10)
    .step(0.01)
    .onChange(() => {
      directionalLight.position.x = params.light.x;
    });
  gui
    .add(params.light, "y")
    .min(0)
    .max(10)
    .step(0.01)
    .onChange(() => {
      directionalLight.position.x = params.light.y;
    });
  gui
    .add(params.light, "z")
    .min(0)
    .max(10)
    .step(0.01)
    .onChange(() => {
      directionalLight.position.x = params.light.z;
    });

  /**
   * objects
   */
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  planeMaterial.metalness = 0.2;
  planeMaterial.roughness = 0.8;

  const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(50, 50),
    planeMaterial
  );
  plane.rotation.x = Math.PI / 2;
  plane.material.side = THREE.DoubleSide; // Render both sides
  scene.add(plane);

  gltfLoader.load("./Car/ford-mustang.gltf", (gltf) => {
    gltf.scene.traverse((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
    });
    scene.add(gltf.scene);
    gltf.scene.scale.set(1, 1, 1);
  });

  /**
   * Environment map
   */
  const cubeTextureLoader = new THREE.CubeTextureLoader();

  const environmentMap = cubeTextureLoader.load([
    "/textures/environmentMaps/0/px.png",
    "/textures/environmentMaps/0/nx.png",
    "/textures/environmentMaps/0/py.png",
    "/textures/environmentMaps/0/ny.png",
    "/textures/environmentMaps/0/pz.png",
    "/textures/environmentMaps/0/nz.png",
  ]);
  scene.background = environmentMap;
  scene.environment = environmentMap;
  environmentMap.encoding = THREE.sRGBEncoding;

  /**
   * Camera
   */
  const camera = new THREE.PerspectiveCamera(
    55,
    sizes.width / sizes.height,
    0.1,
    500
  );
  camera.position.set(3, 2, 8);
  camera.lookAt({x: 0, y: 1, z: 0})

  const updateAllMaterial = () => {
    scene.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        //   child.material.envMap = environmentMap;
        child.material.envMapIntensity = params.exposure;
        child.material.needsUpdate = true;
      }
    });
  };

  /**
   * Renderer
   */
  const canvas = document.querySelector("#webgl");

  const renderer = new THREE.WebGL1Renderer({
    canvas,
    antialias: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  gui
    .add(renderer, "toneMapping", {
      No: THREE.NoToneMapping,
      Linear: THREE.LinearToneMapping,
      Reinhard: THREE.ReinhardToneMapping,
      Cineon: THREE.CineonToneMapping,
      ACESFilmic: THREE.ACESFilmicToneMapping,
    })
    .onFinishChange(() => {
      renderer.toneMapping = Number(renderer.toneMapping);
      updateAllMaterial();
    });

  /**
   * Controls
   */
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; // Smooth camera movement

  /**
   * Update Canvas on Resize
   */
  addEventListener("resize", () => {
    sizes.height = innerHeight;
    sizes.width = innerWidth;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
  });

  /**
   * Shadows
   */
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  plane.receiveShadow = true;

  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;

  // Optimize shadows
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 9;

  /**
   * rendering frames
   */
  const clock = new THREE.Clock();
  function animate() {
    const elapsedTime = clock.getElapsedTime();

    controls.update();
    // cameraHelper.update()

    renderer.render(scene, camera);
    renderer.toneMappingExposure = params.exposure;

    requestAnimationFrame(animate);
  }
  animate();
}
