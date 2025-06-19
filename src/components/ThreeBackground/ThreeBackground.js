import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styled from 'styled-components';

const ThreeBackground = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameId = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 50;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);    // Central AI Core (glowing sphere) - positioned on the left side
    const coreGeometry = new THREE.SphereGeometry(2, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x40a070,
      transparent: true,
      opacity: 0.95
    });
    const aiCore = new THREE.Mesh(coreGeometry, coreMaterial);
    aiCore.position.set(-25, 0, 0); // Move to left side
    scene.add(aiCore);

    // Create a glowing effect for the core
    const coreGlow = new THREE.Mesh(
      new THREE.SphereGeometry(3, 32, 32),
      new THREE.MeshBasicMaterial({ 
        color: 0x40a070,
        transparent: true,
        opacity: 0.15
      })
    );
    coreGlow.position.set(-25, 0, 0); // Move glow to match core position
    scene.add(coreGlow);

    // Neural Network Nodes (smaller spheres around the core)
    const nodeGeometry = new THREE.SphereGeometry(0.2, 12, 12);
    const nodeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x64ffda,
      transparent: true,
      opacity: 0.8
    });

    const nodes = [];
    const nodeCount = 80;
      // Create nodes in layers around the core - positioned on left side
    for (let layer = 1; layer <= 4; layer++) {
      const layerNodeCount = Math.floor(nodeCount / 4);
      const radius = layer * 8 + Math.random() * 4;
      
      for (let i = 0; i < layerNodeCount; i++) {
        const theta = (i / layerNodeCount) * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        node.position.set(
          -25 + radius * Math.sin(phi) * Math.cos(theta), // Offset to left side
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        );
        
        // Store original position for animation
        node.userData = {
          originalPosition: node.position.clone(),
          layer: layer,
          angle: theta,
          centerX: -25 // Store the center X position for orbital motion
        };
        
        nodes.push(node);
        scene.add(node);
      }
    }// Neural Network Connections (radiating from core like synapses)
    const connections = [];
    const connectionMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ff88,
      transparent: true,
      opacity: 0.6
    });    // Create connections from AI core to nodes (updated for left-side positioning)
    nodes.forEach((node, index) => {
      if (Math.random() > 0.3) { // Don't connect all nodes
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-25, 0, 0), // AI core position on left side
          node.position
        ]);
        const line = new THREE.Line(geometry, connectionMaterial);
        connections.push({
          line: line,
          targetNode: node,
          index: index
        });
        scene.add(line);
      }
    });

    // Create inter-node connections (neural network style)
    const interConnectionMaterial = new THREE.LineBasicMaterial({ 
      color: 0x64ffda,
      transparent: true,
      opacity: 0.3
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = nodes[i].position.distanceTo(nodes[j].position);
        if (distance < 12 && Math.random() > 0.8) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            nodes[i].position,
            nodes[j].position
          ]);
          const line = new THREE.Line(geometry, interConnectionMaterial);
          connections.push({
            line: line,
            nodeA: nodes[i],
            nodeB: nodes[j]
          });
          scene.add(line);
        }
      }
    }    // CAD-style Technical Elements
    const cadGroup = new THREE.Group();    // Create complex mechanical assemblies like in the reference image
    const createMechanicalAssembly = (x, y, z) => {
      const assemblyGroup = new THREE.Group();
      
      // Main cylindrical body
      const mainCylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3, 8, 16),
        new THREE.MeshBasicMaterial({ 
          color: 0x8892b0, 
          transparent: true, 
          opacity: 0.7 
        })
      );
      assemblyGroup.add(mainCylinder);
      
      // Flanges (top and bottom discs)
      const topFlange = new THREE.Mesh(
        new THREE.CylinderGeometry(4.5, 4.5, 0.8, 16),
        new THREE.MeshBasicMaterial({ 
          color: 0xa8efda, 
          transparent: true, 
          opacity: 0.6 
        })
      );
      topFlange.position.y = 4;
      assemblyGroup.add(topFlange);
      
      const bottomFlange = new THREE.Mesh(
        new THREE.CylinderGeometry(4.5, 4.5, 0.8, 16),
        new THREE.MeshBasicMaterial({ 
          color: 0xa8efda, 
          transparent: true, 
          opacity: 0.6 
        })
      );
      bottomFlange.position.y = -4;
      assemblyGroup.add(bottomFlange);
      
      // Inner components (like bearing races)
      const innerRing = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.5, 6, 12),
        new THREE.MeshBasicMaterial({ 
          color: 0x64ffda, 
          transparent: true, 
          opacity: 0.8 
        })
      );
      assemblyGroup.add(innerRing);
      
      // Bolt holes in flanges
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const holeRadius = 3.5;
        
        const boltHole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 1, 8),
          new THREE.MeshBasicMaterial({ 
            color: 0x4a5568, 
            transparent: true, 
            opacity: 0.9 
          })
        );
        boltHole.position.set(
          Math.cos(angle) * holeRadius,
          4,
          Math.sin(angle) * holeRadius
        );
        assemblyGroup.add(boltHole);
      }
      
      assemblyGroup.position.set(x, y, z);
      return assemblyGroup;
    };    // Create gear-like structures
    const createGear = (radius, teeth, x, y, z) => {
      const gearGroup = new THREE.Group();
      
      // Main gear body
      const gearBody = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, 1, teeth),
        new THREE.MeshBasicMaterial({ 
          color: 0x8892b0, 
          transparent: true, 
          opacity: 0.7 
        })
      );
      gearGroup.add(gearBody);
      
      // Gear teeth
      for (let i = 0; i < teeth; i++) {
        const angle = (i / teeth) * Math.PI * 2;
        const tooth = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 2, 0.8),
          new THREE.MeshBasicMaterial({ 
            color: 0xa8efda, 
            transparent: true, 
            opacity: 0.6 
          })
        );
        tooth.position.set(
          Math.cos(angle) * (radius + 0.5),
          0,
          Math.sin(angle) * (radius + 0.5)
        );
        tooth.rotation.y = angle;
        gearGroup.add(tooth);
      }
      
      // Center hub
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.3, radius * 0.3, 1.5, 8),
        new THREE.MeshBasicMaterial({ 
          color: 0x64ffda, 
          transparent: true, 
          opacity: 0.8 
        })
      );
      gearGroup.add(hub);
      
      gearGroup.position.set(x, y, z);
      return gearGroup;
    };    // Create bearing-like structures
    const createBearing = (x, y, z) => {
      const bearingGroup = new THREE.Group();
      
      // Outer race
      const outerRace = new THREE.Mesh(
        new THREE.TorusGeometry(4, 0.8, 8, 16),
        new THREE.MeshBasicMaterial({ 
          color: 0x8892b0, 
          transparent: true, 
          opacity: 0.7 
        })
      );
      bearingGroup.add(outerRace);
      
      // Inner race
      const innerRace = new THREE.Mesh(
        new THREE.TorusGeometry(2.5, 0.6, 8, 16),
        new THREE.MeshBasicMaterial({ 
          color: 0xa8efda, 
          transparent: true, 
          opacity: 0.6 
        })
      );
      bearingGroup.add(innerRace);
      
      // Ball bearings
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const ball = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 8, 8),
          new THREE.MeshBasicMaterial({ 
            color: 0x64ffda, 
            transparent: true, 
            opacity: 0.9 
          })
        );
        ball.position.set(
          Math.cos(angle) * 3.5,
          0,
          Math.sin(angle) * 3.5
        );
        bearingGroup.add(ball);
      }
      
      bearingGroup.position.set(x, y, z);
      return bearingGroup;
    };    // Add mechanical assemblies to the scene - positioned on right side
    const mechanicalParts = [
      createMechanicalAssembly(35, 10, -20),
      createMechanicalAssembly(45, -15, -25),
      createGear(5, 12, 25, 5, -30),
      createGear(3, 8, 40, 20, -35),
      createBearing(30, -10, -40),
      createBearing(50, 15, -15)
    ];

    mechanicalParts.forEach(part => {
      part.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      cadGroup.add(part);
    });

    scene.add(cadGroup);    // CAD-style technical grid planes - positioned on right side
    const gridHelper1 = new THREE.GridHelper(40, 20, 0x4dabf7, 0x4dabf7);
    gridHelper1.material.transparent = true;
    gridHelper1.material.opacity = 0.2;
    gridHelper1.position.set(40, -15, 10);
    gridHelper1.rotation.x = Math.PI / 6;
    scene.add(gridHelper1);

    const gridHelper2 = new THREE.GridHelper(30, 15, 0x8892b0, 0x8892b0);
    gridHelper2.material.transparent = true;
    gridHelper2.material.opacity = 0.15;
    gridHelper2.position.set(35, 10, -15);
    gridHelper2.rotation.z = Math.PI / 4;
    scene.add(gridHelper2);

    // Floating CAD-style coordinate axes
    const axesGroup = new THREE.Group();
    const axisLength = 15;
    
    // X-axis (red)
    const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(axisLength, 0, 0)
    ]);
    const xAxis = new THREE.Line(xAxisGeometry, new THREE.LineBasicMaterial({ 
      color: 0xff6b6b,
      transparent: true,
      opacity: 0.6
    }));
    
    // Y-axis (green)
    const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, axisLength, 0)
    ]);
    const yAxis = new THREE.Line(yAxisGeometry, new THREE.LineBasicMaterial({ 
      color: 0x4ecdc4,
      transparent: true,
      opacity: 0.6
    }));
    
    // Z-axis (blue)
    const zAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, axisLength)
    ]);
    const zAxis = new THREE.Line(zAxisGeometry, new THREE.LineBasicMaterial({ 
      color: 0x4dabf7,
      transparent: true,
      opacity: 0.6
    }));    axesGroup.add(xAxis, yAxis, zAxis);
    axesGroup.position.set(30, -20, -10); // Move to right side with CAD elements
    scene.add(axesGroup);// Animation variables
    let time = 0;
    const aiCoreRef = aiCore;
    const coreGlowRef = coreGlow;// Animation loop
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      time += 0.01;      // Animate AI Core with pulsing effect
      const coreScale = 1 + Math.sin(time * 2) * 0.1;
      aiCoreRef.scale.setScalar(coreScale);
      aiCoreRef.rotation.y += 0.01;
      
      // Animate core glow
      const glowScale = 1 + Math.sin(time * 3) * 0.05;
      coreGlowRef.scale.setScalar(glowScale);
      coreGlowRef.rotation.x += 0.005;
      coreGlowRef.rotation.z += 0.005;

      // Animate neural network nodes orbiting around the core
      nodes.forEach((node, index) => {
        const userData = node.userData;
        const layer = userData.layer;
          // Orbital motion around the AI core (left side)
        userData.angle += 0.005 / layer; // Outer layers move slower
        const radius = layer * 8 + Math.sin(time + index * 0.1) * 2;
        
        node.position.x = userData.centerX + radius * Math.cos(userData.angle); // Use stored center X position
        node.position.z = radius * Math.sin(userData.angle);
        node.position.y = userData.originalPosition.y + Math.sin(time * 2 + index * 0.2) * 1;
        
        // Node pulsing
        const nodeScale = 0.8 + Math.sin(time * 4 + index * 0.3) * 0.2;
        node.scale.setScalar(nodeScale);
      });

      // Update neural network connections
      connections.forEach((connectionData) => {
        const { line, targetNode, nodeA, nodeB } = connectionData;
        const points = line.geometry.attributes.position.array;
          if (targetNode) {
          // Connection from core to node (left side)
          points[0] = -25; // Core X position on left side
          points[1] = 0; // Core Y
          points[2] = 0; // Core Z
          points[3] = targetNode.position.x;
          points[4] = targetNode.position.y;
          points[5] = targetNode.position.z;
        } else if (nodeA && nodeB) {
          // Inter-node connections
          points[0] = nodeA.position.x;
          points[1] = nodeA.position.y;
          points[2] = nodeA.position.z;
          points[3] = nodeB.position.x;
          points[4] = nodeB.position.y;
          points[5] = nodeB.position.z;
        }
        
        line.geometry.attributes.position.needsUpdate = true;
        
        // Animate connection opacity for neural pulse effect
        const pulseOpacity = 0.3 + Math.sin(time * 5 + connectionData.index * 0.5) * 0.2;
        line.material.opacity = Math.max(0.1, pulseOpacity);
      });      // Animate CAD mechanical parts
      cadGroup.children.forEach((part, index) => {
        // Different rotation speeds for different mechanical parts
        if (index < 2) { // Mechanical assemblies
          part.rotation.y += 0.005 + index * 0.002;
          part.rotation.x += 0.003;
        } else if (index < 4) { // Gears
          part.rotation.z += 0.02 + index * 0.01; // Gears rotate faster
          part.rotation.y += 0.005;
        } else { // Bearings
          part.rotation.x += 0.01 + index * 0.005;
          part.rotation.z += 0.008;
        }
        
        // Subtle floating motion
        part.position.y += Math.sin(time * 0.8 + index * 1.5) * 0.02;
        
        // Animate internal components
        part.children.forEach((component, compIndex) => {
          if (compIndex > 2) { // Animate smaller components differently
            component.rotation.y += 0.01 + compIndex * 0.002;
          }
        });
      });

      // Animate coordinate axes
      axesGroup.rotation.y += 0.003;
      axesGroup.rotation.x = Math.sin(time * 0.3) * 0.1;
      axesGroup.position.y = -20 + Math.sin(time * 0.5) * 2;

      // Subtle camera movement for dynamic feel
      camera.position.x = Math.sin(time * 0.1) * 3;
      camera.position.y = Math.cos(time * 0.08) * 2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js objects
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  return <BackgroundContainer ref={mountRef} />;
};

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
  
  canvas {
    display: block;
  }
`;

export default ThreeBackground;
