import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Markdown Documentation
const sammiesDocumentation = `
# Sammies: Compact, Waterproof, and Lightweight Outdoor Shoes

## Overview
Sammies is an innovative footwear company dedicated to creating compactable, waterproof, and lightweight shoes tailored for backpackers and outdoor enthusiasts.

## Vision
To provide a convenient solution for explorers, offering a campsite and après-ski shoe that balances performance with comfort and sustainability.

## Problem Statement
Outdoor enthusiasts often sacrifice size and weight for durability and performance. Current solutions lack the comfort, convenience, accessibility, and safety that Sammies provides.

## Product Features
- **Warmth & Waterproofing:** Insulated with synthetic down and constructed with a TPU bottom for waterproof protection.
- **Adjustable Fit:** Incorporates an inflatable system with a drawstring cinching mechanism.
- **Durability & Style:** Black nylon upper with red stitching.
- **Compactable Design:** The sole deflates and folds down for easy storage and travel.

## Business Model
- **Direct-to-Consumer:** Web sales at [unstabledesigns.com](https://unstabledesigns.com).
- **Price:** Estimated retail at $150.
`;

document.getElementById("doc-container").innerHTML = marked.parse(sammiesDocumentation);

// Initialize Three.js Scene
let scene, camera, renderer, controls, gltfLoader;

function init3DViewer() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e1e1e);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / 500, 0.1, 1000);
    camera.position.set(0, 1, 3);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, 500);
    document.getElementById('shoe-container').appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 2, 5);
    scene.add(directionalLight);

    // Orbit Controls for interaction
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 1.2;
    controls.minDistance = 1;
    controls.maxDistance = 5;

    // Load .glb Model
    gltfLoader = new GLTFLoader();
    gltfLoader.load('shoe.glb', function (gltf) {
        let model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5);
        model.position.set(0, -0.5, 0);
        scene.add(model);
    });

    // Resize Listener
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, 500);
        camera.aspect = window.innerWidth / 500;
        camera.updateProjectionMatrix();
    });

    animate();
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Initialize 3D Viewer on Page Load
window.onload = init3DViewer;

// Rotating Carousel for Featured Projects
document.addEventListener("DOMContentLoaded", function () {
  const slides = document.querySelectorAll("#project-carousel .carousel-slide");
  let currentSlide = 0;
  const slideInterval = 15000; // Rotate every 5 seconds

  function nextSlide() {
    slides[currentSlide].classList.remove("active");
    // Move to the next slide (wrap around)
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add("active");
  }

document.addEventListener("DOMContentLoaded", function () {
  const musicToggle = document.getElementById("music-toggle");
  const backgroundMusic = document.getElementById("backgroundMusic");

  musicToggle.addEventListener("click", function () {
    // Unmute the audio if necessary
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



  // Start the carousel rotation
  setInterval(nextSlide, slideInterval);
});


document.addEventListener("DOMContentLoaded", function() {
    const carousel = document.getElementById("project-carousel");
    const slides = carousel.querySelectorAll(".carousel-slide");
    let currentSlide = 0;
    const slideCount = slides.length;
    const intervalTime = 3000; // Rotate every 3 seconds
    let autoRotateInterval;

    // Function to display the slide at a given index
    function showSlide(index) {
      slides.forEach(slide => slide.classList.remove("active"));
      slides[index].classList.add("active");
    }

    // Function to move to the next slide
    function nextSlide() {
      currentSlide = (currentSlide + 1) % slideCount;
      showSlide(currentSlide);
    }

    // Start automatic slide rotation
    function startAutoRotate() {
      autoRotateInterval = setInterval(nextSlide, intervalTime);
    }

    // Stop automatic slide rotation
    function stopAutoRotate() {
      clearInterval(autoRotateInterval);
    }

    // Pause the automatic rotation on mouse enter and resume on mouse leave
    carousel.addEventListener("mouseenter", stopAutoRotate);
    carousel.addEventListener("mouseleave", startAutoRotate);

    // Initialize auto rotation
    startAutoRotate();

  });
  
