import * as THREE from 'https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.157.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.157.0/examples/jsm/controls/OrbitControls.js';

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
  // Project Display Code
  // ----------------------
  const projectTitles = document.querySelectorAll(".project-title");
  const projectSlides = document.querySelectorAll(".project-slide");

  if (projectSlides.length === 0) {
    console.error("No project slides found!");
    return;
  }

  // Function to show a specific slide based on its index
  function showSlide(index) {
    // Hide all slides and remove the 'active' class from titles
    projectSlides.forEach(slide => {
      slide.style.display = "none";
      slide.classList.remove("active");
    });
    projectTitles.forEach(title => title.classList.remove("active"));

    // Show the selected slide
    projectSlides[index].style.display = "block";
    projectSlides[index].classList.add("active");
    projectTitles[index].classList.add("active");
  }

  // Attach click event listeners to each project title
  projectTitles.forEach(title => {
    title.addEventListener("click", () => {
      const targetIndex = parseInt(title.getAttribute("data-index"), 10);
      showSlide(targetIndex);
    });
  });

  // Initialize by showing the first slide
  showSlide(0);

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

  console.log("Project switcher loaded");

  // ----------------------
  // Auto Typing Effect Code
  // ----------------------
  // JavaScript for auto typing effect
  const typedTextSpan = document.querySelector(".typed-text");
  
  // List of phrases to display
  const textArray = [
    "Search for products...",
    "Search for recipes...",
    "Search for news...",
    "Search for locations...",
    "Search for deals..."
  ];
  
  // Timing variables
  const typingDelay = 150;
  const erasingDelay = 100;
  const newTextDelay = 2000; // Pause after each word
  let textArrayIndex = 0;
  let charIndex = 0;
  
  function type() {
    if (charIndex < textArray[textArrayIndex].length) {
      // Append next character to span
      typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
      charIndex++;
      setTimeout(type, typingDelay);
    } else {
      // After finishing typing, pause then start erasing
      setTimeout(erase, newTextDelay);
    }
  }
  
  function erase() {
    if (charIndex > 0) {
      // Remove one character
      typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
      charIndex--;
      setTimeout(erase, erasingDelay);
    } else {
      // Move to the next phrase after erasing
      textArrayIndex++;
      if (textArrayIndex >= textArray.length) textArrayIndex = 0;
      setTimeout(type, typingDelay + 1100);
    }
  }
  
  // Initialize typing after a brief delay
  setTimeout(type, newTextDelay + 250);
});


