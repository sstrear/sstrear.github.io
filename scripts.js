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
