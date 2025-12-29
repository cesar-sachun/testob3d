import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// 1. CONFIGURACIÓN DEL RENDERER (La base PBR)
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setClearColor(0x000000, 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Good practice for studio quality
document.getElementById('canvas-container').appendChild(renderer.domElement);

const scene = new THREE.Scene();

// 2. ILUMINACIÓN AMBIENTAL (La clave del realismo)
// NO añadas luces direccionales ni puntuales todavía.
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://modelviewer.dev/shared-assets/environments/neutral.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    // Optional: scene.background = texture; // Uncomment if you want to see the HDRI
});

// 3. CARGA Y CORRECCIÓN DEL MODELO (El arreglo del material)
const loader = new GLTFLoader();
loader.load('/rotor.glb', (gltf) => {
    const model = gltf.scene;

    // Auto-center and scale logic
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 3 / maxDim;
    model.scale.setScalar(scale);
    const box2 = new THREE.Box3().setFromObject(model);
    const center2 = box2.getCenter(new THREE.Vector3());
    model.position.sub(center2);

    scene.add(model);

    // Diccionario para almacenar los componentes encontrados
    const parts = {};

    // Nombres exactos de las partes a buscar
    const partNames = [
        'Shaft002',
        'Rotor006',
        'Surface001',
        'Surface001_1',
        'Rotor006_1',
        'Arrows'
    ];

    model.traverse((child) => {
        if (child.isMesh) {
            // Activa sombras globalmente
            child.castShadow = true;
            child.receiveShadow = true;

            // Identificar componentes específicos
            if (partNames.includes(child.name)) {
                parts[child.name] = child;
                console.log(`Componente cargado: ${child.name}`);
            }
        }
    });

    // ---------------------------------------------------------
    // CONFIGURACIÓN INDIVIDUAL DE COMPONENTES
    // ---------------------------------------------------------
    
    // Configuración Ejemplo: Shaft002 (Eje)
    if (parts['Shaft002']) {
        const m = parts['Shaft002'].material;
        // Keeping PBR adjustments for realism
        m.metalness = 1.0;
        m.roughness = 0.2;
    }

    // Configuración Ejemplo: Rotor006 (Cuerpo principal del rotor)
    if (parts['Rotor006']) {
        const m = parts['Rotor006'].material;
        // Keeping PBR adjustments for realism
        m.metalness = 0.8;
        m.roughness = 0.15;
    }

    // Configuración Ejemplo: Rotor006_1 (Detalles del rotor)
    if (parts['Rotor006_1']) {
         // Original colors preserved
    }

    // Configuración Ejemplo: Surfaces (Superficies de desgaste o similar)
    if (parts['Surface001']) {
        // Ejemplo: Material mate
        parts['Surface001'].material.metalness = 0.1;
        parts['Surface001'].material.roughness = 0.8;
    }

    if (parts['Surface001_1']) {
         // Original colors preserved
    }

    // Configuración Ejemplo: Arrows (Flechas indicadoras)
    if (parts['Arrows']) {
        // Keeping emissive as it is a light effect, but removing base color override if present
        parts['Arrows'].material.emissive = new THREE.Color(0xffff00);
        parts['Arrows'].material.emissiveIntensity = 0.5;
    }

    // Hacemos 'parts' accesible globalmente para depuración en consola
    window.rotorParts = parts;

}, undefined, (error) => {
    console.error('An error happened loading the model:', error);
});

// 4. CÁMARA Y CONTROLES
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
