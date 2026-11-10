"use client";

import React, { useEffect, useRef } from "react";

export function PredictiveArc03({
  className = "",
  speed = 1.0,
  dotSize = 22,
  interactive = true,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId;
    let gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false });

    // Fallback: If WebGL not supported, use Canvas 2D
    if (!gl) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

      const onMouseMove = (e) => {
        if (!interactive) return;
        const rect = canvas.getBoundingClientRect();
        mouse.targetX = e.clientX - rect.left;
        mouse.targetY = e.clientY - rect.top;
      };

      const onMouseLeave = () => {
        mouse.targetX = -1000;
        mouse.targetY = -1000;
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseleave", onMouseLeave);

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
      };
      resize();
      window.addEventListener("resize", resize);

      let t = 0;
      const render2d = () => {
        t += 0.016 * speed;
        mouse.x += (mouse.targetX - mouse.x) * 0.1;
        mouse.y += (mouse.targetY - mouse.y) * 0.1;

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cell = dotSize * dpr;
        const cols = Math.ceil(w / cell);
        const rows = Math.ceil(h / cell);

        for (let i = 0; i <= cols; i++) {
          const cx = i * cell;
          const nx = (cx / w) * 2 - 1;

          const wave1 = Math.sin(nx * 2.8 + t * 0.8) * 0.22;
          const wave2 = Math.sin(nx * 5.6 - t * 0.5) * 0.11;
          const baseCurveY = wave1 + wave2;

          let mousePull = 0;
          if (mouse.x > -500) {
            const nMouseX = (mouse.x * dpr / w) * 2 - 1;
            const nMouseY = ((h - mouse.y * dpr) / h) * 2 - 1;
            const distToMouse = Math.abs(nx - nMouseX);
            mousePull = Math.exp(-distToMouse * 3.5) * (nMouseY - baseCurveY) * 0.55;
          }

          const curveYNorm = baseCurveY + mousePull;
          const curveY = (curveYNorm * 0.35 + 0.52) * h;

          for (let j = 0; j <= rows; j++) {
            const cy = j * cell;
            const dist = Math.abs(cy - curveY);
            const band = h * 0.2;
            let prox = Math.max(0, 1 - dist / band);
            prox = Math.pow(prox, 2.2);

            const shimmer = 0.5 + 0.5 * Math.sin(nx * 8.0 + t * 2.5);
            const intensity = prox * (0.7 + 0.3 * shimmer);

            const radius = (1.2 + intensity * 4.8) * dpr;
            const alpha = 0.15 + intensity * 0.85;

            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            if (intensity > 0.4) {
              ctx.fillStyle = `rgba(82, 168, 255, ${alpha})`;
            } else {
              ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.35})`;
            }
            ctx.fill();
          }
        }

        animationFrameId = requestAnimationFrame(render2d);
      };
      render2d();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseleave", onMouseLeave);
        window.removeEventListener("resize", resize);
      };
    }

    // --- WebGL Shader Implementation ---
    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_dot_size;

      void main() {
        vec2 st = gl_FragCoord.xy;
        float gridSize = u_dot_size;

        vec2 cell = floor(st / gridSize);
        vec2 cellCenter = (cell + 0.5) * gridSize;
        vec2 posInCell = st - cellCenter;
        float dToCenter = length(posInCell);

        // Normalized X in range [-1.0, 1.0]
        float nx = (cellCenter.x / u_resolution.x) * 2.0 - 1.0;

        // Two-harmonic scrolling sine wave
        float wave1 = sin(nx * 2.8 + u_time * 0.8) * 0.22;
        float wave2 = sin(nx * 5.6 - u_time * 0.5) * 0.11;
        float baseCurveY = wave1 + wave2;

        // Pointer bend interaction
        float mousePull = 0.0;
        if (u_mouse.x > -500.0) {
          vec2 normMouse = (u_mouse / u_resolution) * 2.0 - 1.0;
          float distToMouseX = abs(nx - normMouse.x);
          mousePull = exp(-distToMouseX * 3.5) * (normMouse.y - baseCurveY) * 0.55;
        }

        float curveYNorm = baseCurveY + mousePull;
        float curveY = (curveYNorm * 0.35 + 0.52) * u_resolution.y;

        // Proximity to the two-harmonic wave band
        float distToCurve = abs(cellCenter.y - curveY);
        float bandWidth = u_resolution.y * 0.22;
        float proximity = clamp(1.0 - distToCurve / bandWidth, 0.0, 1.0);
        proximity = pow(proximity, 2.2);

        // Travelling crossing shimmer
        float shimmer = 0.5 + 0.5 * sin(nx * 8.0 + u_time * 2.5);
        float intensity = proximity * (0.7 + 0.3 * shimmer);

        // Dot radius swell
        float maxRadius = gridSize * 0.32;
        float minRadius = 1.25;
        float radius = mix(minRadius, maxRadius, intensity);

        // Smooth circle anti-aliasing
        float dotAlpha = 1.0 - smoothstep(radius - 0.75, radius + 0.75, dToCenter);

        // Color ramp: subtle background dot -> glowing cyan/blue -> core white
        vec3 darkDot = vec3(0.12, 0.14, 0.20);
        vec3 blueGlow = vec3(0.32, 0.66, 1.0);
        vec3 whiteCore = vec3(0.96, 0.98, 1.0);

        vec3 color = mix(darkDot, blueGlow, intensity);
        color = mix(color, whiteCore, pow(intensity, 2.2));

        float alpha = dotAlpha * mix(0.16, 0.92, intensity);
        gl_FragColor = vec4(color * alpha, alpha);
      }
    `;

    function createShader(glCtx, type, source) {
      const shader = glCtx.createShader(type);
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error(glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const aPositionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPositionLocation);
    gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);

    const uResolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const uTimeLocation = gl.getUniformLocation(program, "u_time");
    const uMouseLocation = gl.getUniformLocation(program, "u_mouse");
    const uDotSizeLocation = gl.getUniformLocation(program, "u_dot_size");

    let mouse = { x: -1000, y: -1000, currentX: -1000, currentY: -1000 };

    const onMouseMove = (e) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      mouse.x = (e.clientX - rect.left) * dpr;
      // Flip Y for WebGL (0 is bottom)
      mouse.y = (rect.height - (e.clientY - rect.top)) * dpr;
    };

    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let startTime = performance.now();

    const render = (now) => {
      const elapsed = ((now - startTime) / 1000) * speed;

      // Mouse smoothing
      if (mouse.x > -500) {
        if (mouse.currentX < -500) {
          mouse.currentX = mouse.x;
          mouse.currentY = mouse.y;
        } else {
          mouse.currentX += (mouse.x - mouse.currentX) * 0.08;
          mouse.currentY += (mouse.y - mouse.currentY) * 0.08;
        }
      } else {
        mouse.currentX = -1000;
        mouse.currentY = -1000;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      gl.uniform2f(uResolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(uTimeLocation, elapsed);
      gl.uniform2f(uMouseLocation, mouse.currentX, mouse.currentY);
      gl.uniform1f(uDotSizeLocation, dotSize * dpr);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", resize);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, [speed, dotSize, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ display: "block" }}
    />
  );
}

export default PredictiveArc03;

