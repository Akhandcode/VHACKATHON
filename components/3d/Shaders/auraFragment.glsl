varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;
uniform float uTime;
uniform float uHover;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // Fresnel iridescent glow effect calculation
    float fresnel = pow(1.0 - dot(normal, viewDir), 2.5);
    
    // Y2K Chromatic Iridescence Colors: Cyan (#00FFFF), Magenta (#FF00FF), Silver (#E0E0E0)
    vec3 cyan = vec3(0.0, 1.0, 1.0);
    vec3 magenta = vec3(1.0, 0.0, 1.0);
    vec3 silver = vec3(0.88, 0.88, 0.88);
    
    float colorCycle = sin(uTime * 1.2 + vUv.x * 3.0) * 0.5 + 0.5;
    vec3 auraColor = mix(cyan, magenta, colorCycle);
    
    vec3 finalColor = mix(silver, auraColor, fresnel * (0.6 + uHover * 0.4));
    
    gl_FragColor = vec4(finalColor, 0.85 + fresnel * 0.15);
}
