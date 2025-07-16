import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import earthTexture from "../assets/earth_dotmap.png";

export default function RotatingEarth() {
    const mountRef = useRef();

    useEffect(() => {
        const mount = mountRef.current; // ✅ capture the ref

        const width = mount.clientWidth;
        const height = mount.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.z = 3;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        mount.appendChild(renderer.domElement);

        const texture = new THREE.TextureLoader().load(earthTexture);
        const earthGeometry = new THREE.SphereGeometry(0.66, 64, 64);
        const earthMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9,
        });
        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earthMesh);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x222222);
        scene.add(ambientLight);

        const animate = () => {
            requestAnimationFrame(animate);
            earthMesh.rotation.y += 0.002;
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            const width = mount.clientWidth;
            const height = mount.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        window.addEventListener("resize", handleResize);

        // ✅ Cleanup safely using the captured ref
        return () => {
            window.removeEventListener("resize", handleResize);
            mount.removeChild(renderer.domElement);
        };
    }, []);


    return (
        <div
            ref={mountRef}
            style={{
                width: "200px",
                height: "200px",
                position: "relative",
                top: "-250px",
                right: "20px",
                zIndex: 0,
                pointerEvents: "none",
            }}
        />
    );
}
