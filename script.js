const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const audio = document.getElementById('background-music');
audio.volume = 0.6;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const audioControl = document.getElementById('audio-control');
const responseButtons = document.getElementById('response-buttons');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');

camera.position.set(0, 0, 6);

let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let currentRotationX = 0, currentRotationY = 0;

const points = [];
const scale = 1.8;
const density = 600;
const phrase = "I LOVE YOU";

function heartPosition(u, v) {
    u = u * 2 * Math.PI;
    v = (v - 0.5) * Math.PI;
    const x = 16 * Math.pow(Math.sin(u), 3);
    const y = 13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u);
    const z = 10 * Math.sin(v);
    return new THREE.Vector3(x, y, z).multiplyScalar(0.06 * scale);
}

const heartGroup = new THREE.Group();
scene.add(heartGroup);

const sprites = [];
const initialPositions = [];
const targetPositions = [];

for (let i = 0; i < density; i++) {
    const u = Math.random ();
    const v = Math.random();
    const targetPos = heartPosition(u, v);
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.random() * Math.PI;
    const radius = 10 + Math.random() * 10;
    const initialPos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
    );
    points.push({ initial: initialPos, target: targetPos, text: phrase });
    initialPositions.push(initialPos);
    targetPositions.push(targetPos);
}

const textureLoader = new THREE.TextureLoader();
points.forEach((point, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 40px Georgia';
    ctx.fillStyle = 'rgba(255, 102, 178, 0.9)';
    ctx.shadowColor = '#ff3399';
    ctx.shadowBlur = 12;
    ctx.fillText(point.text, 10, 50);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(point.initial);
    sprite.scale.set(0.25, 0.06, 1);
    sprite.userData = { 
        initial: point.initial, 
        target: point.target, 
        progress: 0, 
        isAnimating: false,
        swirlAngle: Math.random() * 2 * Math.PI
    };
    heartGroup.add(sprite);
    sprites.push(sprite);
});

let centerSprite = null;
function createCenterMessage() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 32px Georgia';
    ctx.fillStyle = 'rgba(255, 102, 178, 0.9)';
    ctx.shadowColor = '#ff3399';
    ctx.shadowBlur = 15;
    ctx.textAlign = 'center';
    ctx.fillText('Do I still have a chance? 💕', 256, 80);
    ctx.fillText('We had a misunderstanding,', 256, 120);
    ctx.fillText('but my heart is yours.', 256, 160);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    centerSprite = new THREE.Sprite(material);
    centerSprite.position.set(0, 0, 0);
    centerSprite.scale.set(1.5, 0.75, 1);
    heartGroup.add(centerSprite);
}
createCenterMessage();

let celebrationSprite = null;
function createCelebrationMessage() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 36px Georgia';
    ctx.fillStyle = 'rgba(255, 153, 204, 0.9)';
    ctx.shadowColor = '#ff66b2';
    ctx.shadowBlur = 20;
    ctx.textAlign = 'center';

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    celebrationSprite = new THREE.Sprite(material);
    celebrationSprite.position.set(0, 2, 0);
    celebrationSprite.scale.set(2.0, 1.0, 1);
    heartGroup.add(celebrationSprite);
}
createCelebrationMessage();

const ambientLight = new THREE.AmbientLight(0x332233, 0.4);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xff66b2, 1.5, 12);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);
const pointLight2 = new THREE.PointLight(0xcc33ff, 1.2, 12);
pointLight2.position.set(-5, -5, 5);
scene.add(pointLight2);
const pointLight3 = new THREE.PointLight(0xff99cc, 0.8, 15);
pointLight3.position.set(0, 8, 0);
scene.add(pointLight3);

const fireworks = [];
const loveParticles = [];
const floatingHearts = [];
const sparkles = [];
const rainbowRings = [];

function createSlowFirework(x = 0, y = 0, z = 0) {
    const particleCount = 60;
    const particles = new THREE.Group();
    
    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.07, 10, 8);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(`hsl(${Math.random() * 60 + 300}, 90%, 75%)`),
            transparent: true,
            opacity: 0.9
        });
        const sphere = new THREE.Mesh(geometry, material);
        
        const angle = (i / particleCount) * Math.PI * 2;
        const speed = 0.6 + Math.random() * 0.6;
        sphere.userData = {
            velocity: new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed + Math.random() * 0.4,
                (Math.random() - 0.5) * 0.4
            ),
            life: 3.5 + Math.random() * 2.5,
            maxLife: 3.5 + Math.random() * 2.5,
            initialScale: 0.07 + Math.random() * 0.04
        };
        particles.add(sphere);
    }
    
    particles.position.set(x, y, z);
    scene.add(particles);
    fireworks.push(particles);
}

function createFloatingHeart() {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 60px serif';
    ctx.fillStyle = `hsl(${Math.random() * 30 + 330}, 90%, 80%)`;
    ctx.textAlign = 'center';
    ctx.fillText('💖', 48, 70);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.position.set(
        (Math.random() - 0.5) * 8,
        -4 + Math.random() * 2,
        (Math.random() - 0.5) * 4
    );
    sprite.scale.set(0.5, 0.5, 1);
    sprite.userData = {
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            0.4 + Math.random() * 0.3,
            (Math.random() - 0.5) * 0.15
        ),
        life: 4.5,
        rotationSpeed: (Math.random() - 0.5) * 0.06
    };
    
    scene.add(sprite);
    floatingHearts.push(sprite);
}

function createSparkles() {
    for (let i = 0; i < 30; i++) {
        const geometry = new THREE.SphereGeometry(0.03, 8, 6);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(`hsl(${Math.random() * 60 + 300}, 100%, 90%)`),
            transparent: true,
            opacity: 0.9
        });
        
        const sparkle = new THREE.Mesh(geometry, material);
        sparkle.position.set(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
        );
        sparkle.userData = {
            life: 2.5 + Math.random() * 2.5,
            twinkleSpeed: 2 + Math.random() * 3,
            originalOpacity: 0.9
        };
        
        scene.add(sparkle);
        sparkles.push(sparkle);
    }
}

function createRainbowRing() {
    const geometry = new THREE.RingGeometry(0.15, 0.3, 32);
    const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(`hsl(${Math.random() * 360}, 80%, 70%)`),
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    
    const ring = new THREE.Mesh(geometry, material);
    ring.position.set(0, 0, 0);
    ring.userData = {
        life: 3.5,
        expandSpeed: 0.03,
        maxScale: 4 + Math.random() * 3
    };
    
    scene.add(ring);
    rainbowRings.push(ring);
}

let time = 0;
let animationTriggered = false;
let zoomProgress = 0;
let buttonsShown = false;
let celebrationActive = false;
let celebrationTime = 0;
let isAudioPlaying = false;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    targetRotationY = mouseX * 0.3;
    targetRotationX = mouseY * 0.2;
});

function animate() {
    requestAnimationFrame(animate);
    time += 0.008;

    currentRotationX += (targetRotationX - currentRotationX) * 0.02;
    currentRotationY += (targetRotationY - currentRotationY) * 0.02;
    
    if (animationTriggered && !sprites.some(sprite => sprite.userData.isAnimating)) {
        heartGroup.rotation.y += 0.003;
        heartGroup.rotation.x = currentRotationX * 0.5;
        heartGroup.rotation.z = currentRotationY * 0.2;
        
        if (centerSprite) {
            centerSprite.material.opacity = Math.min(centerSprite.material.opacity + 0.008, 0.9);
        }
        if (zoomProgress < 1) {
            zoomProgress += 0.003;
            camera.position.z = 6 - 1.5 * zoomProgress;
            camera.updateProjectionMatrix();
        }
        if (!buttonsShown && centerSprite.material.opacity >= 0.8) {
            responseButtons.style.display = 'flex';
            buttonsShown = true;
        }
    }

    if (celebrationActive) {
        celebrationTime += 0.016;
        
        if (celebrationSprite) {
            celebrationSprite.material.opacity = Math.min(celebrationSprite.material.opacity + 0.01, 0.9);
            celebrationSprite.position.y = 2 + Math.sin(celebrationTime * 2) * 0.1;
        }
        
        if (celebrationTime % 1.8 < 0.016) {
            createSlowFirework(
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 3
            );
        }
        
        if (celebrationTime % 0.7 < 0.016) {
            createFloatingHeart();
        }
        
        if (celebrationTime % 1.3 < 0.016) {
            createSparkles();
        }
        
        if (celebrationTime % 2.7 < 0.016) {
            createRainbowRing();
        }
    }

    sprites.forEach(sprite => {
        if (sprite.userData.isAnimating) {
            sprite.userData.progress += 0.012;
            if (sprite.userData.progress < 1) {
                const t = sprite.userData.progress;
                const swirl = 1 - t;
                sprite.userData.swirlAngle += 0.08;
                const swirlPos = sprite.userData.initial.clone();
                swirlPos.x += Math.cos(sprite.userData.swirlAngle) * swirl * 2;
                swirlPos.y += Math.sin(sprite.userData.swirlAngle) * swirl * 2;
                sprite.position.lerpVectors(
                    swirlPos,
                    sprite.userData.target,
                    t * t
                );
            } else {
                sprite.position.copy(sprite.userData.target);
                sprite.userData.isAnimating = false;
            }
        }
        const pulse = 0.8 + 0.15 * Math.sin(time * 1.5 + sprite.position.x);
        sprite.material.opacity = 0.7 * pulse;
        sprite.scale.set(0.25 * pulse, 0.06 * pulse, 1);
    });

    fireworks.forEach(particles => {
        particles.children.forEach(sphere => {
            sphere.userData.life -= 0.012;
            if (sphere.userData.life > 0) {
                sphere.position.add(sphere.userData.velocity.clone().multiplyScalar(0.03));
                const lifeRatio = sphere.userData.life / sphere.userData.maxLife;
                sphere.material.opacity = lifeRatio * 0.9;
                sphere.scale.setScalar(sphere.userData.initialScale * (0.5 + lifeRatio * 0.5));
                sphere.userData.velocity.multiplyScalar(0.98);
                sphere.userData.velocity.y -= 0.005;
            }
        });
        
        if (particles.children.every(sphere => sphere.userData.life <= 0)) {
            scene.remove(particles);
            fireworks.splice(fireworks.indexOf(particles), 1);
        }
    });

    floatingHearts.forEach(heart => {
        heart.userData.life -= 0.008;
        if (heart.userData.life > 0) {
            heart.position.add(heart.userData.velocity.clone().multiplyScalar(0.04));
            heart.material.opacity = (heart.userData.life / 4.5) * 0.8;
            heart.rotation.z += heart.userData.rotationSpeed;
            heart.userData.velocity.x += Math.sin(time + heart.position.y) * 0.002;
        } else {
            scene.remove(heart);
            floatingHearts.splice(floatingHearts.indexOf(heart), 1);
        }
    });

    sparkles.forEach(sparkle => {
        sparkle.userData.life -= 0.012;
        if (sparkle.userData.life > 0) {
            const twinkle = Math.sin(time * sparkle.userData.twinkleSpeed) * 0.5 + 0.5;
            sparkle.material.opacity = sparkle.userData.originalOpacity * twinkle * (sparkle.userData.life / 4.0);
            sparkle.rotation.x += 0.02;
            sparkle.rotation.y += 0.03;
        } else {
            scene.remove(sparkle);
            sparkles.splice(sparkles.indexOf(sparkle), 1);
        }
    });

    rainbowRings.forEach(ring => {
        ring.userData.life -= 0.01;
        if (ring.userData.life > 0) {
            const scale = (3.0 - ring.userData.life) * ring.userData.expandSpeed * 10;
            ring.scale.setScalar(Math.min(scale, ring.userData.maxScale));
            ring.material.opacity = (ring.userData.life / 3.0) * 0.6;
            ring.rotation.z += 0.01;
        } else {
            scene.remove(ring);
            rainbowRings.splice(rainbowRings.indexOf(ring), 1);
        }
    });

    pointLight.intensity = 1.5 + Math.sin(time * 2) * 0.3;
    pointLight2.intensity = 1.2 + Math.cos(time * 1.5) * 0.3;
    pointLight.position.x = 5 + Math.sin(time) * 2;
    pointLight2.position.y = -5 + Math.cos(time * 0.8) * 2;

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function playAudio() {
    if (isAudioPlaying || !audio.paused) {
        return;
    }

    if (audio.readyState < 2) {
        audio.addEventListener('canplay', () => {
            attemptPlay();
        }, { once: true });
        audio.load();
        return;
    }

    attemptPlay();

    function attemptPlay() {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
                startAudioPlayback();
            }).catch(error => {
                console.error("Failed to resume AudioContext:", error);
            });
        } else {
            startAudioPlayback();
        }
    }

    function startAudioPlayback() {
        isAudioPlaying = true;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                audioControl.textContent = 'Pause Music';
            }).catch(error => {
                isAudioPlaying = false;
                alert("Failed to play audio. Please ensure the audio file exists and try again.");
            });
        }
    }
}

function pauseAudio() {
    if (!audio.paused) {
        audio.pause();
        isAudioPlaying = false;
        audioControl.textContent = 'Play Music';
    }
}

function triggerAnimation() {
    if (!animationTriggered) {
        animationTriggered = true;
        startScreen.style.display = 'none';
        audioControl.style.display = 'block';
        sprites.forEach(sprite => {
            sprite.userData.isAnimating = true;
            sprite.userData.progress = 0;
            sprite.userData.swirlAngle = Math.random() * 2 * Math.PI;
        });
        playAudio();
    }
}

startBtn.addEventListener('click', triggerAnimation);

audioControl.addEventListener('click', () => {
    if (audio.paused) {
        playAudio();
    } else {
        pauseAudio();
    }
});

yesBtn.addEventListener('click', () => {
    responseButtons.style.display = 'none';
    celebrationActive = true;
    celebrationTime = 0;
    
    for (let i = 0; i < 4; i++) {
        setTimeout(() => createSlowFirework(
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 3
        ), i * 600);
    }
    
    for (let i = 0; i < 7; i++) {
        setTimeout(createFloatingHeart, i * 150);
    }
    
    setTimeout(createSparkles, 500);
    setTimeout(createRainbowRing, 800);
});

noBtn.addEventListener('mouseenter', () => {
    const maxDistance = Math.min(window.innerWidth, window.innerHeight) * 0.1;
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.min(50, maxDistance);
    const newX = Math.cos(angle) * distance;
    const newY = Math.sin(angle) * distance;
    const currentTransform = window.getComputedStyle(noBtn).transform;
    const currentMatrix = new DOMMatrix(currentTransform);
    const currentX = currentMatrix.m41;
    const currentY = currentMatrix.m42;
    const boundedX = Math.max(-window.innerWidth * 0.3, Math.min(window.innerWidth * 0.3, currentX + newX));
    const boundedY = Math.max(-window.innerHeight * 0.3 + 60, Math.min(window.innerHeight * 0.3 - 60, currentY + newY));
    noBtn.style.transform = `translate(${boundedX}px, ${boundedY}px) scale(0.9)`;
    noBtn.style.opacity = '0.7';
});

noBtn.addEventListener('mouseleave', () => {
    setTimeout(() => {
        noBtn.style.transform = 'translate(0, 0) scale(1)';
        noBtn.style.opacity = '1';
    }, 2000);
});

noBtn.addEventListener('touchstart', (event) => {
    event.preventDefault();
    const maxDistance = Math.min(window.innerWidth, window.innerHeight) * 0.1;
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.min(50, maxDistance);
    const newX = Math.cos(angle) * distance;
    const newY = Math.sin(angle) * distance;
    const currentTransform = window.getComputedStyle(noBtn).transform;
    const currentMatrix = new DOMMatrix(currentTransform);
    const currentX = currentMatrix.m41;
    const currentY = currentMatrix.m42;
    const boundedX = Math.max(-window.innerWidth * 0.3, Math.min(window.innerWidth * 0.3, currentX + newX));
    const boundedY = Math.max(-window.innerHeight * 0.3 + 60, Math.min(window.innerHeight * 0.3 - 60, currentY + newY));
    noBtn.style.transform = `translate(${boundedX}px, ${boundedY}px) scale(0.8)`;
    noBtn.style.opacity = '0.6';
});

let isTouching = false;
let prevTouchX = 0;
let prevTouchY = 0;

renderer.domElement.addEventListener('touchstart', (event) => {
    event.preventDefault();
    isTouching = true;
    const touch = event.touches[0];
    prevTouchX = touch.clientX;
    prevTouchY = touch.clientY;
});

renderer.domElement.addEventListener('touchmove', (event) => {
    event.preventDefault();
    if (isTouching) {
        const touch = event.touches[0];
        const deltaX = touch.clientX - prevTouchX;
        const deltaY = touch.clientY - prevTouchY;
        targetRotationY += deltaX * 0.005;
        targetRotationX += deltaY * 0.005;
        prevTouchX = touch.clientX;
        prevTouchY = touch.clientY;
    }
});

renderer.domElement.addEventListener('touchend', () => {
    isTouching = false;
});

audio.addEventListener('error', (e) => {
    alert("Error loading audio file. Please check if 'taylor.mp3' exists in the correct directory.");
});
