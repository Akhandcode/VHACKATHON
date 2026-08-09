varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;
uniform float uTime;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    // Slight dynamic vertex wave displacement for Y2K liquid blob physics
    vec3 transformed = position;
    float wave = sin(position.x * 2.0 + uTime * 1.5) * cos(position.y * 2.0 + uTime * 1.5) * 0.12;
    transformed += normal * wave;

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
