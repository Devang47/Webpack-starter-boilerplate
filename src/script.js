import "./CSS/normalize.css";
import "./CSS/style.scss";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

// import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
// import { DotScreenShader } from "three/examples/jsm/shaders/DotScreenShader.js";

import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import * as dat from "dat.gui";

init();
function init() {
  const gui = new dat.GUI();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#3d3d3d");

  scene.fog = new THREE.Fog(0x3d3d3d, 15, 40);

  const params = {
    exposure: 4.0,
    light: {
      x: 2.82,
      y: 4,
      z: 2.9,
    },
    ambientLight: 0,
    bgColor: "#ffffff",
  };

  gui.addColor(params, "bgColor").onChange(() => {
    scene.background = new THREE.Color(params.bgColor);
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

  const cubeTextureLoader = new THREE.CubeTextureLoader();

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
    .name('AmbientLight intensity')
    .onChange(() => {
      ambientLight.intensity = params.ambientLight;
    });

  params.lightColor = 0xffffff;
  const directionalLight = new THREE.DirectionalLight(params.lightColor, 3);
  directionalLight.position.set(params.light.x, params.light.y, params.light.z);

  params.bias = 0.05;
  directionalLight.shadow.normalBias = params.bias;
  // const directionalLightHelper = new THREE.DirectionalLightHelper(
  //   directionalLight,
  //   1
  // );
  scene.add(directionalLight);

  gui.addColor(params, "lightColor").onChange(() => {
    directionalLight.color = new THREE.Color(params.lightColor);
  });
  // gui
  //   .add(params.light, "x")
  //   .min(0)
  //   .max(10)
  //   .step(0.01)
  //   .onChange(() => {
  //     directionalLight.position.x = params.light.x;
  //   });
  // gui
  //   .add(params.light, "y")
  //   .min(0)
  //   .max(10)
  //   .step(0.01)
  //   .onChange(() => {
  //     directionalLight.position.x = params.light.y;
  //   });
  // gui
  //   .add(params.light, "z")
  //   .min(0)
  //   .max(10)
  //   .step(0.01)
  //   .onChange(() => {
  //     directionalLight.position.x = params.light.z;
  //   });

  /**
   * objects
   */
  params.planeColor = 0x000000;
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: params.planeColor,
  });
  planeMaterial.metalness = 0.1;
  planeMaterial.roughness = 1;

  const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(80, 80),
    planeMaterial
  );
  plane.rotation.x = Math.PI / 2;
  plane.material.side = THREE.DoubleSide;
  scene.add(plane);
  gui.addColor(params, "planeColor").onChange(() => {
    plane.material.color = new THREE.Color(params.planeColor);
  });

  gltfLoader.load("./Car/Challenger.gltf", (gltf) => {
    gltf.scene.traverse((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
    });
    gltf.scene.position.set(-2, 0, 0);
    gltf.scene.rotation.y = Math.PI;
    scene.add(gltf.scene);
    gltf.scene.scale.set(1, 1, 1);
  });

  gltfLoader.load("./Car/ford-mustang.gltf", (gltf) => {
    gltf.scene.traverse((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
    });
    gltf.scene.position.set(2, 0, 0);
    scene.add(gltf.scene);
    gltf.scene.scale.set(1, 1, 1);
  });

  /**
   * Environment map
   */
  const environmentMap = cubeTextureLoader.load([
    "/textures/environmentMaps/0/px.png",
    "/textures/environmentMaps/0/nx.png",
    "/textures/environmentMaps/0/py.png",
    "/textures/environmentMaps/0/ny.png",
    "/textures/environmentMaps/0/pz.png",
    "/textures/environmentMaps/0/nz.png",
  ]);
  // scene.background = environmentMap;
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
  camera.lookAt(new THREE.Vector3(0, 2, 0));

  /**
   * Material update
   */
  const updateAllMaterial = () => {
    scene.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
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
   * OrbitControls
   */
  // const controls = new OrbitControls(camera, canvas);
  // controls.enableDamping = true; // Smooth camera movement

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
  directionalLight.shadow.camera.far = 30;

  /**
   *  Postprocessing
   */
  const effects = {
    exposure: 1.3,
    bloomStrength: 0.4,
    bloomThreshold: 0.36,
    bloomRadius: 0.12,
  };
  let composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  // const effect1 = new ShaderPass(DotScreenShader);
  // effect1.uniforms["scale"].value = 4;
  // composer.addPass(effect1);

  // const effect2 = new ShaderPass(RGBShiftShader);
  // effect2.uniforms["amount"].value = 0.0014;
  // composer.addPass(effect2);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = effects.bloomThreshold;
  bloomPass.strength = effects.bloomStrength;
  bloomPass.radius = effects.bloomRadius;

  composer.addPass(bloomPass);
  renderer.toneMappingExposure = Math.pow(effects.exposure, 4.0);

  gui.add(effects, "exposure", 0.1, 2).onChange(function (value) {
    renderer.toneMappingExposure = Math.pow(value, 4.0);
  });

  gui.add(effects, "bloomThreshold", 0.0, 1.0).onChange(function (value) {
    bloomPass.threshold = Number(value);
  });

  gui.add(effects, "bloomStrength", 0.0, 3.0).onChange(function (value) {
    bloomPass.strength = Number(value);
  });

  gui
    .add(effects, "bloomRadius", 0.0, 1.0)
    .step(0.01)
    .onChange(function (value) {
      bloomPass.radius = Number(value);
    });

  /**
   * Mouse Controls
   */
  camera.position.y = 10;
  camera.position.x = 0;
  camera.position.z = 10;

  const target = new THREE.Vector2();
  const mouse = new THREE.Vector2();

  addEventListener("mousemove", (event) => {
    mouse.x = event.clientX / window.innerWidth - 0.5;
    mouse.y = -(event.clientY / window.innerHeight - 0.5);
  });


  /**
   * rendering frames
   */
  const clock = new THREE.Clock();
  function animate() {
    const elapsedTime = clock.getElapsedTime() * 0.05;

    composer.render();
    // renderer.toneMappingExposure = params.exposure;

    target.x = mouse.x * 26;
    target.y = mouse.y * 13;

    camera.position.x += 0.1 * (target.x - camera.position.x);
    camera.position.y += 0.005 * (target.y - camera.position.y);
    camera.lookAt(new THREE.Vector3(0, 1, 0));

    console.log(camera.position);

    requestAnimationFrame(animate);
  }
  animate();
}
