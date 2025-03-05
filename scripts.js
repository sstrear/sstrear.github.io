import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ----------------------
// Three.js 3D Viewer Code
// ----------------------
let scene, camera, renderer, controls, gltfLoader;

function init3DViewer() {
  // Create the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1e1e1e);

  // Set up the camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / 500, 0.1, 1000);
  camera.position.set(0, 1, 3);

  // Create the renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, 500);
  const container = document.getElementById('shoe-container');
  if (container) {
    container.appendChild(renderer.domElement);
  }

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(2, 2, 5);
  scene.add(directionalLight);

  // Set up OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.5;
  controls.zoomSpeed = 1.2;
  controls.minDistance = 1;
  controls.maxDistance = 5;

  // Load the GLB model
  gltfLoader = new GLTFLoader();
  gltfLoader.load('shoe.glb', function(gltf) {
    let model = gltf.scene;
    model.scale.set(0.5, 0.5, 0.5);
    model.position.set(0, -0.5, 0);
    scene.add(model);
  });

  // Handle window resizing
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, 500);
    camera.aspect = window.innerWidth / 500;
    camera.updateProjectionMatrix();
  });

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update();
  if (renderer && scene && camera) renderer.render(scene, camera);
}

// ----------------------
// Initialize Everything on DOMContentLoaded
// ----------------------
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Three.js viewer
  init3DViewer();

  // ----------------------
  // Carousel & Project Titles Code (No Auto-Rotation)
  // ----------------------
  const carousel = document.getElementById("project-carousel");
  const slides = carousel.querySelectorAll(".carousel-slide");
  const titles = document.querySelectorAll(".project-title");

  // Function to display a specific slide and update title underline
  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove("active"));
    slides[index].classList.add("active");

    titles.forEach(title => title.classList.remove("active"));
    titles[index].classList.add("active");
  }

  // Attach click listeners to project titles
  titles.forEach(title => {
    title.addEventListener("click", function() {
      let index = parseInt(title.getAttribute("data-index"));
      showSlide(index);
    });
  });

  // ----------------------
  // Audio Toggle Code
  // ----------------------
  const musicToggle = document.getElementById("music-toggle");
  const backgroundMusic = document.getElementById("backgroundMusic");

  musicToggle.addEventListener("click", function() {
    // Unmute the audio before playing
    backgroundMusic.muted = false;
    if (backgroundMusic.paused) {
      backgroundMusic.play().then(() => {
        musicToggle.textContent = "Pause";
      }).catch(error => {
        console.error("Playback error:", error);
      });
    } else {
      backgroundMusic.pause();
      musicToggle.textContent = "Play";
    }
  });
});
