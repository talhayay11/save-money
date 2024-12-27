import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './App.scss';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Forest = ({ treeCount }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const treesRef = useRef([]); // Daha önceki ağaçları sakla
  const previousTreeCount = useRef(0);
  const [isVisible, setIsVisible] = useState(false); // Görünürlük durumu

  const initialCameraPosition = useRef({ x: 5, y: 5, z: 10 });

  useEffect(() => {
    // === Three.js Sahnesi ===
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(initialCameraPosition.current.x, initialCameraPosition.current.y, initialCameraPosition.current.z);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Daha pürüzsüz hareket
    controlsRef.current = controls;

    // Işıklandırma
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);

    camera.position.set(3, 3, 5); // Kamera daha yakına yerleştirildi
    camera.lookAt(0, 0, 0); // Kamerayı sahne merkezine odakla

    // Zemin
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    scene.add(ground);

    // Animasyon döngüsü
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
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
  }, []);

  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current || !isVisible) return;

    const scene = sceneRef.current;

    // Yeni ağaç ekleme ve animasyon fonksiyonu
    const addTreeWithAnimation = (x, z, delay) => {
      // Gövde
      const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 16);
      const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, -1, z); // Başlangıçta yerin altında
      scene.add(trunk);

      // Yapraklar
      const leavesGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.set(x, -1, z); // Başlangıçta yerin altında
      scene.add(leaves);

      // Animasyon
      let progress = 0;
      const animateTree = () => {
        if (progress < 1) {
          progress += 0.02; // Hız kontrolü
          const y = THREE.MathUtils.lerp(-1, 0.25, progress); // Gövde yükseliyor
          trunk.position.y = y;
          leaves.position.y = y + 0.35; // Yapraklar gövdeden yukarıda
          requestAnimationFrame(animateTree);
        }
      };

      // Belirli bir gecikme ile animasyonu başlat
      setTimeout(() => {
        animateTree();
        treesRef.current.push({ x, z });
      }, delay);
    };
        // Rastgele geçerli bir koordinat üret ve çakışmayı engelle
        const generateValidCoordinates = () => {
          let x, z;
          let isValid = false;

          while (!isValid) {
            x = Math.random() * 4.5 - 2.25; // Zemin boyutlarına göre (-2.25 ile 2.25 arasında)
            z = Math.random() * 4.5 - 2.25;
            isValid = treesRef.current.every(
              (tree) => Math.sqrt((tree.x - x) ** 2 + (tree.z - z) ** 2) > 0.6 // Mesafe kontrolü (0.6 birim)
            );
          }
    
          return { x, z };
        };

    // Daha önceki ağaçları koru, yeni ağaçları ekle
    const newTreeCount = treeCount - previousTreeCount.current;
    if (newTreeCount > 0) {
      for (let i = 0; i < newTreeCount; i++) {
        const { x, z } = generateValidCoordinates();
        addTreeWithAnimation(x, z, i * 300); // Her ağaç için 300ms gecikme
      }
    }
    previousTreeCount.current = treeCount;
  }, [treeCount, isVisible]);

  // Görünürlük kontrolü için Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting); // Görünürlük durumunu ayarla
      },
      { threshold: 0.1 } // %10 görünme oranı
    );

    if (mountRef.current) {
      observer.observe(mountRef.current);
    }

    return () => {
      if (mountRef.current) {
        observer.unobserve(mountRef.current);
      }
    };
  }, []);

  const resetForestView = () => {
    const controls = controlsRef.current;
    const camera = controls.object;

    // Kamera pozisyonunu başlangıç konumuna getir
    camera.position.set(initialCameraPosition.current.x, initialCameraPosition.current.y, initialCameraPosition.current.z);

    // Kameranın sahne merkezine bakmasını sağla
    camera.lookAt(0, 0, 0);
    // OrbitControls'ü sıfırla
    controls.update();
  };


  return (
    <div>
      {/* Orman Alanı */}
      <div ref={mountRef} className="forest-container" />
      {/* Ormanım Butonu */}
      <button onClick={resetForestView} className="reset-button">
        Ormanım
      </button>
    </div>
  );
};

export default Forest;