import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three"; // Import THREE

const Car = ({ position, carModal, rotation, onLoad }) => {

    const { scene } = useGLTF(carModal);
    const carRef = useRef();
  
    useEffect(() => {
      if (scene) {
        onLoad(); // Notify parent when the car is loaded
      }
    }, [scene, onLoad]);
  
    // Smooth animation using useFrame (inside the Canvas context)
    useFrame(() => {
      if (carRef.current) {
        const targetPosition = new THREE.Vector3(...position); // Use the prop position as target
        carRef.current.position.lerp(targetPosition, 0.1); // Smoothly move to the target position
      }
    });
  
    return <primitive object={scene} position={position} rotation={rotation} scale={50} />;
}

export default Car;