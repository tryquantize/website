import React, { useRef, useEffect } from 'react';

/* ---------- GLSL Fragment Shader ---------- */
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform float time;
uniform vec2 resolution;
out vec4 fragColor;

float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

float scene(vec2 uv) {
  vec2 pos1 = vec2(cos(time) * 0.4, sin(time * 2.0) * 0.2);
  float c1 = sdCircle(uv - pos1, 0.2);

  vec2 pos2 = vec2(cos(time + 3.14) * 0.4, sin(time * 2.0 + 3.14) * 0.2);
  float c2 = sdCircle(uv - pos2, 0.16);

  return opSmoothUnion(c1, c2, 0.2);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
  float d = scene(uv);
  float glow = exp(-10.0 * abs(d));
  vec3 color = 0.5 + 0.5 * cos(time + uv.xyx + vec3(0, 2, 4));
  vec3 finalColor = color * glow + smoothstep(0.01, 0.0, d);
  fragColor = vec4(finalColor, 1.0);
}
`;

/* ---------- Simple WebGL2 Renderer ---------- */
class Renderer {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext | null;
  program: WebGLProgram | null = null;
  uTime: WebGLUniformLocation | null = null;
  uRes: WebGLUniformLocation | null = null;

  constructor(canvas: HTMLCanvasElement, fragmentSource: string) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2');
    this._init(fragmentSource);
  }

  _compile(type: number, src: string): WebGLShader | null {
    const gl = this.gl;
    if (!gl) return null;
    
    const s = gl.createShader(type);
    if (!s) return null;
    
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  _init(fragmentSource: string) {
    const gl = this.gl;
    if (!gl) {
      console.error('WebGL2 not supported');
      return;
    }

    const vertexSrc = `#version 300 es
    precision highp float;
    in vec4 position;
    void main() {
      gl_Position = position;
    }`;

    const vs = this._compile(gl.VERTEX_SHADER, vertexSrc);
    const fs = this._compile(gl.FRAGMENT_SHADER, fragmentSource);
    
    if (!vs || !fs) return;
    
    this.program = gl.createProgram();
    if (!this.program) return;
    
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(this.program));
      return;
    }

    // Full‐screen quad
    const verts = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(this.program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    this.uTime = gl.getUniformLocation(this.program, 'time');
    this.uRes  = gl.getUniformLocation(this.program, 'resolution');
  }

  resize(w: number, h: number) {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width  = w * dpr;
    this.canvas.height = h * dpr;
    this.gl?.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  render(now: number) {
    const gl = this.gl;
    if (!gl || !this.program) return;
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.uniform1f(this.uTime, now * 0.001);
    gl.uniform2f(this.uRes, gl.canvas.width, gl.canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

/* ---------- Hook to Drive the Animation ---------- */
function useShaderAnimation(canvasRef: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new Renderer(canvas, FRAGMENT_SHADER);
    let rafId: number;

    function onResize() {
      renderer.resize(window.innerWidth, window.innerHeight);
    }

    function animate(time: number) {
      renderer.render(time);
      rafId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', onResize);
    onResize();
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, [canvasRef]);
}

/* ---------- Named Export of the Component ---------- */
export function ShaderComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useShaderAnimation(canvasRef);
  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
}