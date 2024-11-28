import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Forest = ({ treeCount }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    // === Three.js Sahnesi ===
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Işıklandırma
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);

    // Zemin
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    scene.add(ground);

    // Ağaç ekleme işlevi
    const trees = [];

    const addTree = (x, z) => {
      // Gövde
      const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 16);
      const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, 0.25, z);

      // Yapraklar
      const leavesGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.set(x, 0.6, z);

      // Ağacı sahneye ekle
      scene.add(trunk);
      scene.add(leaves);

      // Ağaç bileşenlerini kaydet
      trees.push({ trunk, leaves });
    };

    // Ağaçları ekle
    for (let i = 0; i < treeCount; i++) {
      const x = Math.random() * 8 - 4; // -4 ile 4 arasında rastgele x koordinatı
      const z = Math.random() * 8 - 4; // -4 ile 4 arasında rastgele z koordinatı
      addTree(x, z);
    }

    // Kamera ayarları
    camera.position.z = 8;
    camera.position.y = 2;

    // Animasyon döngüsü
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Temizlik
    return () => {
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.traverse((object) => {
        if (object.isMesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
    };
  }, [treeCount]);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Forest;