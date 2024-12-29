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
  const [treeData, setTreeData] = useState([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // "Başardınız" popup'ı kontrolü
  const [remainingTrees, setRemainingTrees] = useState(0); // 100'den fazla ağacı saklamak için

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
    // Zemin (Toprak Alanı)
    const groundGeometry = new THREE.BoxGeometry(10, 1, 10); // 10x10 birim boyutunda, 0.5 birim kalınlığında
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 }); // Kahverengi
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.y = -0.25; // Zemini biraz alçak konumlandır
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

  const generateGridCoordinates = (treeCount) => {
    const gridSize = Math.ceil(Math.sqrt(treeCount)); // Izgara boyutunu karekök üzerinden hesapla
    const spacing = 0.9; // Ağaçlar arasındaki mesafe
    const offset = (gridSize - 1) * spacing / 2;
    const coordinates = [];
  
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if (coordinates.length >= treeCount) break; // Gerekli sayıda koordinat üretildiğinde dur
        const x = -4 + col * spacing; // X ekseninde düzenli aralıklarla yerleştir
        const z = -4 + row * spacing; // Z ekseninde düzenli aralıklarla yerleştir
        coordinates.push({ x, z });
      }
    }
  
    return coordinates;
  };

  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current || !isVisible) return;
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = controlsRef.current.object;

    const generateValidCoordinates = () => {
      let x, z;
      let isValid = false;

      while (!isValid) {
        x = Math.random() * 8 - 4; // Zemin boyutlarına göre (-2.25 ile 2.25 arasında)
        z = Math.random() * 8 - 4;
        isValid = treesRef.current.every(
          (tree) => Math.sqrt((tree.x - x) ** 2 + (tree.z - z) ** 2) > 2 // Mesafe kontrolü (0.6 birim)
        );
      }

      return { x, z };
    };

    // Yeni ağaç ekleme ve animasyon fonksiyonu
    const addTreeWithAnimation = (x, z, delay, monthName) => {
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

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 128;

      context.fillStyle = 'white'; // Yazı rengi
      context.font = '28px Arial'; // Yazı tipi ve boyutu
      context.textAlign = 'center';
      context.fillText(monthName, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(x, 1.2, z); // Gövdenin üstüne yerleştir
      sprite.scale.set(1.5, 0.75, 1); // Ölçek
      scene.add(sprite);

      // Animasyon
      let progress = 0;
      const animateTree = () => {
        if (progress < 1) {
          progress += 0.1; // Hız kontrolü
          const y = THREE.MathUtils.lerp(-1, 0.25, progress); // Gövde yükseliyor
          trunk.position.y = y;
          leaves.position.y = y + 0.35; // Yapraklar gövdeden yukarıda
          requestAnimationFrame(animateTree);
        } else {
          renderer.render(scene, camera);
       }
      };

      const handlePopupClose = () => {
        setShowSuccessPopup(false); // Popup'ı kapat
        setTreeData([]); // Fazla ağaçları sıfırla
        if (remainingTrees > 0) {
          previousTreeCount.current = 0; // Sıfırdan başlat
          setRemainingTrees(0); // Kalan ağaç sayısını temizle
          for (let i = 0; i < remainingTrees; i++) {
            addTreeWithAnimation(coordinates[i].x, coordinates[i].z, i * 300); // Yeni ağaçları sırayla ekle
          }
        }
      };

      {showSuccessPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Başardınız! 100 Ağaç Dikildi!</h2>
            <button onClick={handlePopupClose}>Kapat</button>
          </div>
        </div>
      )}

      const playGrowSound = () => {
        const growSound = new Audio('/sounds/tree-grow.mp3'); // Ses dosyasının yolu
        growSound.volume = 0.5; // Ses seviyesi (0.0 - 1.0)
        growSound.play();
      };

      // Belirli bir gecikme ile animasyonu başlat
      setTimeout(() => {
        playGrowSound();
        animateTree();
        treesRef.current.push({ x, z, month: monthName });
        renderer.render(scene, camera);
      }, delay);
    };

        const getTurkishMonth = (monthIndex) => {
          const months = [
            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
          ];
          return months[monthIndex];
        };

    // Daha önceki ağaçları koru, yeni ağaçları ekle
    const coordinates = generateGridCoordinates(treeCount);
    const newTreeCount = treeCount - previousTreeCount.current;
    if (newTreeCount > 0) {
      const currentMonthName = getTurkishMonth(new Date().getMonth());
      let addedCount = 0;
      for (let i = 0; i < coordinates.length; i++) {
        if (addedCount >= newTreeCount) break;
  
        const { x, z } = coordinates[i];
  
        // Çakışma kontrolü
        const isValid = treesRef.current.every(
          (tree) => Math.sqrt((tree.x - x) ** 2 + (tree.z - z) ** 2) > 2 // Mesafe kontrolü (2 birim)
        );
  
        if (isValid) {
          addTreeWithAnimation(x, z, addedCount * 300, currentMonthName); // Her ağaç için 300ms gecikme
          addedCount++;
        }
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

  const resetForest = () => {
    if (sceneRef.current) {
      // Mevcut sahneyi temizle
      sceneRef.current.clear();
  
      // Yeni zemin oluştur
      const groundGeometry = new THREE.BoxGeometry(10, 1, 10);
      const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.position.y = -0.25;
      sceneRef.current.add(ground);
  
      // Ağaç listesini temizle
      treesRef.current = [];
      previousTreeCount.current = 0; // Sayacı sıfırla
    }
  };
  
  useEffect(() => {
    if (treeCount >= 100) {
      const extraTrees = treeCount - 100; // 100'ün üzerindeki ağaç sayısını hesapla
      setRemainingTrees(extraTrees); // Fazla ağaçları sakla
      setShowSuccessPopup(true); // Popup'ı göster
      resetForest(); // Toprak alanını sıfırla
    }
  }, [treeCount]);

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