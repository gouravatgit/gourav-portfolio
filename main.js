import * as THREE from 'three';
import { gsap } from 'gsap';

// ==========================================
// 1. THREE.JS 3D BACKGROUND SETUP
// ==========================================

const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Create Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
  // Spread particles in a wide area
  posArray[i] = (Math.random() - 0.5) * 15;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Particle Material
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.015,
  color: 0x6366f1, // matching accent color
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});

// Mesh
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Create Abstract Geometry 
const icosahedronGeometry = new THREE.IcosahedronGeometry(2, 0);
const material = new THREE.MeshBasicMaterial({ 
  color: 0xffffff,
  wireframe: true,
  transparent: true,
  opacity: 0.05
});
const icosahedron = new THREE.Mesh(icosahedronGeometry, material);
scene.add(icosahedron);

// Mouse Interaction
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX - windowHalfX);
  mouseY = (event.clientY - windowHalfY);
});

// Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Rotate objects
  icosahedron.rotation.y = elapsedTime * 0.1;
  icosahedron.rotation.z = elapsedTime * 0.15;
  particlesMesh.rotation.y = elapsedTime * 0.05;

  // Smooth mouse interaction
  targetX = mouseX * 0.001;
  targetY = mouseY * 0.001;

  particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
  particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

  renderer.render(scene, camera);
}
animate();

// ==========================================
// 2. GSAP UI ANIMATIONS
// ==========================================

// Initial loading animation for hero section
gsap.from('#hero', {
  opacity: 0,
  y: 30,
  duration: 1,
  ease: 'power3.out',
  delay: 0.2
});

// Simple scroll animation using Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.target.id !== 'hero') {
      gsap.fromTo(entry.target, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
      // unobserve so it only happens once
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

// Observe other sections
document.querySelectorAll('.section').forEach((section) => {
  if(section.id !== 'hero') {
    section.style.opacity = '0'; // Hide initially for scroll reveal
    observer.observe(section);
  }
});

// Hover effect for skill tags
const skillTags = document.querySelectorAll('.skill-tag');
skillTags.forEach(tag => {
  tag.addEventListener('mouseenter', () => {
    gsap.to(tag, { y: -5, duration: 0.3, ease: 'power2.out' });
  });
  tag.addEventListener('mouseleave', () => {
    gsap.to(tag, { y: 0, duration: 0.3, ease: 'power2.out' });
  });
});

// ==========================================
// 3. THEME SWITCHER DROPDOWN
// ==========================================
const themeBtns = document.querySelectorAll('.theme-btn');
const themeDropdown = document.getElementById('theme-dropdown');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

// Toggle dropdown
themeToggleBtn.addEventListener('click', () => {
  themeDropdown.classList.toggle('open');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!themeDropdown.contains(e.target) && !themeToggleBtn.contains(e.target)) {
    themeDropdown.classList.remove('open');
  }
});

// Set initial active state
document.querySelector('[data-color1="#22d3ee"]').classList.add('active');

// Default CSS Variables for first run (if CSS isn't immediately overridden)
document.documentElement.style.setProperty('--accent-color-1', '#22d3ee');
document.documentElement.style.setProperty('--accent-color-2', '#a78bfa');
particlesMaterial.color.setHex(0x22d3ee);

themeBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    // If the click event bubbles, parse the closest button
    const targetBtn = e.target.closest('.theme-btn');
    if(!targetBtn) return;

    const color1 = targetBtn.getAttribute('data-color1');
    const color2 = targetBtn.getAttribute('data-color2');
    
    // Update active button
    themeBtns.forEach(b => b.classList.remove('active'));
    targetBtn.classList.add('active');

    // Update CSS Variable
    document.documentElement.style.setProperty('--accent-color-1', color1);
    document.documentElement.style.setProperty('--accent-color-2', color2);

    // Update Three.js particles
    particlesMaterial.color.setHex(color1.replace('#', '0x'));
  });
});

// Helper to darken hex slightly
function adjustColorForHover(hex, amt) {
    let usePound = false;
    if (hex[0] == "#") {
        hex = hex.slice(1);
        usePound = true;
    }
    let num = parseInt(hex,16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if  (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if  (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}

// ==========================================
// 4. 3D CARD TILT EFFECT
// ==========================================
const cards = document.querySelectorAll('.glass-card');

cards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -5; // max 5 deg tilt
    const rotateY = ((x - centerX) / centerX) * 5;

    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.5,
      ease: 'power2.out',
      transformPerspective: 1000
    });
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  });
});

// ==========================================
// 5. CUSTOM CURSOR
// ==========================================
const cursor = document.querySelector('.custom-cursor');
const cursorFollower = document.querySelector('.custom-cursor-follower');
let mouseXPos = 0, mouseYPos = 0;

document.addEventListener('mousemove', (e) => {
  mouseXPos = e.clientX;
  mouseYPos = e.clientY;
  
  // Instant follow for the dot
  gsap.to(cursor, {
    x: mouseXPos,
    y: mouseYPos,
    duration: 0,
  });
  
  // Delayed follow for the ring
  gsap.to(cursorFollower, {
    x: mouseXPos,
    y: mouseYPos,
    duration: 0.5,
    ease: 'power3.out'
  });
});

// Add hover effect to interactive elements
const interactiveElements = document.querySelectorAll('a, button, .theme-btn, .skill-tag');
interactiveElements.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hover');
    cursorFollower.classList.add('hover');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hover');
    cursorFollower.classList.remove('hover');
  });
});

// ==========================================
// 6. MAGNETIC BUTTONS
// ==========================================
const magneticElements = document.querySelectorAll('.btn-primary, .btn-secondary, .theme-toggle-btn');
magneticElements.forEach(elem => {
  elem.addEventListener('mousemove', (e) => {
    const rect = elem.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(elem, {
      x: x * 0.4,
      y: y * 0.4,
      duration: 0.4,
      ease: 'power2.out'
    });
  });

  elem.addEventListener('mouseleave', () => {
    gsap.to(elem, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: 'elastic.out(1, 0.3)'
    });
  });
});

// ==========================================
// 6. TYPEWRITER EFFECT
// ==========================================
const subtitleEl = document.querySelector('.subtitle');
const textToType = subtitleEl.innerText;
subtitleEl.innerText = ''; // Clear it initially

let i = 0;
function typeWriter() {
  if (i < textToType.length) {
    subtitleEl.innerHTML += textToType.charAt(i);
    i++;
    setTimeout(typeWriter, 50); // Speed of typing
  }
}

// Start typing after initial load animation
setTimeout(typeWriter, 1200);
