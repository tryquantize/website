"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function RaycastShader() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });

        const container = mountRef.current;
        const { clientWidth: width, clientHeight: height } = container;

        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Shader Uniforms
        const uniforms = {
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(width, height) },
            uColor1: { value: new THREE.Color(0x000000) }, // Black base
            uColor2: { value: new THREE.Color(0x1a0b2e) }, // Deep purple
            uColor3: { value: new THREE.Color(0x763af5) }, // Raycast Purple/Blue
            uSpeed: { value: 0.2 },
        };

        // Vertex Shader (Simple pass-through)
        const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

        // Fragment Shader (The Magic)
        const fragmentShader = `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      uniform float uSpeed;

      varying vec2 vUv;

      // Noise function
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      void main() {
        vec2 uv = vUv;
        float time = uTime * uSpeed;

        // Create vertical beams
        float beams = 0.0;
        
        // Layer 1: Slow, wide beams
        vec2 pos1 = vec2(uv.x * 3.0 + time * 0.1, uv.y);
        float n1 = noise(pos1);
        beams += smoothstep(0.4, 0.6, n1) * 0.3;

        // Layer 2: Fast, thin beams
        vec2 pos2 = vec2(uv.x * 6.0 - time * 0.2, uv.y * 2.0);
        float n2 = noise(pos2);
        beams += smoothstep(0.3, 0.7, n2) * 0.2;

        // Layer 3: Interference
        float n3 = noise(vec2(uv.x * 10.0 + time * 0.05, uv.y + time * 0.1));
        beams += n3 * 0.1;

        // Gradient background
        vec3 bg = mix(uColor1, uColor2, uv.y * 1.2);
        
        // Add beams
        vec3 finalColor = mix(bg, uColor3, beams * uv.y); // Fade out at bottom

        // Vignette
        float vignette = 1.0 - length(uv - 0.5) * 0.5;
        finalColor *= vignette;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            transparent: true,
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Animation Loop
        let animationId: number;
        const animate = (time: number) => {
            uniforms.uTime.value = time * 0.001;
            renderer.render(scene, camera);
            animationId = requestAnimationFrame(animate);
        };
        animate(0);

        // Resize Handler
        const handleResize = () => {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            renderer.setSize(w, h);
            uniforms.uResolution.value.set(w, h);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationId);
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className="w-full h-full absolute inset-0" />;
}
