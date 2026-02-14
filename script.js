document.addEventListener('DOMContentLoaded', () => {
    // 1. Particle System
    initParticles();

    // 2. 3D Tilt Effect for Card
    initTiltEffect();

    // 3. Number Counter Animation
    initCounters();

    // 4. Glitch Effect Randomizer
    initGlitchRandomizer();

    // 5. Smooth Scroll
    initSmoothScroll();
});

// --- Particle System ---
function initParticles() {
    const container = document.getElementById('particles-js');
    if (!container) return;

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.color = `rgba(255, 140, 0, ${Math.random() * 0.5})`; // Orange tint
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        resize();
        for (let i = 0; i < 100; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw connections
        ctx.strokeStyle = 'rgba(255, 140, 0, 0.05)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
            particles[i].update();
            particles[i].draw();
        }
        
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        particles = [];
        init();
    });

    init();
    animate();
}

// --- 3D Tilt Effect ---
function initTiltEffect() {
    const card = document.querySelector('.card-3d');
    const container = document.querySelector('.hero-visual');

    if (!card || !container) return;

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    container.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
}

// --- Number Counter ---
function initCounters() {
    const stats = document.querySelectorAll('.stat-num');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endVal = parseInt(target.getAttribute('data-val'));
                let startVal = 0;
                const duration = 2000;
                const startTime = performance.now();

                function update(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Ease out quart
                    const ease = 1 - Math.pow(1 - progress, 4);
                    
                    const current = Math.floor(startVal + (endVal - startVal) * ease);
                    target.innerText = current.toLocaleString();

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        target.innerText = endVal.toLocaleString();
                    }
                }
                
                requestAnimationFrame(update);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

// --- Glitch Effect Randomizer ---
function initGlitchRandomizer() {
    const glitchText = document.querySelector('.glitch');
    if (!glitchText) return;

    setInterval(() => {
        if (Math.random() > 0.95) {
            glitchText.style.textShadow = `
                ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px #ff00c1,
                ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px #00fff9
            `;
            setTimeout(() => {
                glitchText.style.textShadow = '';
            }, 100);
        }
    }, 50);
}

// --- Smooth Scroll ---
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}
