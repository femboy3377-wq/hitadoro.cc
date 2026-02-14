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

    // 6. Modal Logic
    initModal();
});

    // --- Modal Logic ---
    const modal = document.getElementById('auth-modal');
    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn'); 
    const closeBtn = document.querySelector('.close-modal');
    const registerForm = document.getElementById('register-form');
    const downloadBtn = document.getElementById('download-btn');
    
    // Auth Mode State (Register or Login)
    let isLoginMode = false;
    const authTitle = document.querySelector('.auth-header h2');
    const authDesc = document.querySelector('.auth-header p');
    const authFooterText = document.querySelector('.auth-footer p');
    const submitBtn = registerForm ? registerForm.querySelector('button') : null;
    
    // Helper to toggle mode
    function setAuthMode(login) {
        isLoginMode = login;
        const emailGroup = registerForm.querySelector('input[type="email"]').closest('.form-group');
        const confirmPassGroup = registerForm.querySelectorAll('input[type="password"]')[1].closest('.form-group');
        
        if (isLoginMode) {
            // Login Mode
            authTitle.innerHTML = 'Login to <span class="accent">hitadoro.cc</span>';
            authDesc.innerText = 'Welcome back! Please login to your account.';
            emailGroup.style.display = 'none';
            confirmPassGroup.style.display = 'none';
            submitBtn.innerText = 'Login';
            authFooterText.innerHTML = 'Don\'t have an account? <a href="#" class="accent" id="switch-auth">Register</a>';
        } else {
            // Register Mode
            authTitle.innerHTML = 'Join <span class="accent">hitadoro.cc</span>';
            authDesc.innerText = 'Create an account to purchase and manage your subscription.';
            emailGroup.style.display = 'block';
            confirmPassGroup.style.display = 'block';
            submitBtn.innerText = 'Create Account';
            authFooterText.innerHTML = 'Already have an account? <a href="#" class="accent" id="switch-auth">Login</a>';
        }
        
        // Re-attach switch listener
        document.getElementById('switch-auth').addEventListener('click', (e) => {
            e.preventDefault();
            setAuthMode(!isLoginMode);
        });
    }

    function openModal(login = false) {
        setAuthMode(login);
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    if (registerBtn) registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(false); // Register
    });
    
    if (loginBtn) loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(true); // Login
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            closeModal();
        }
    });

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = registerForm.querySelector('button');
            const originalText = btn.innerText;
            const email = registerForm.querySelector('input[type="email"]').value;
            const inputs = registerForm.querySelectorAll('input[type="text"], input[type="password"]');
            const username = inputs[0].value;
            const password = inputs[1].value;
            const confirmPass = inputs[2].value;

            // Validation
            if (!isLoginMode) {
                if (password !== confirmPass) {
                    alert('Passwords do not match!');
                    return;
                }
            }

            btn.innerText = isLoginMode ? 'Logging in...' : 'Creating Account...';
            btn.disabled = true;
            
            const endpoint = isLoginMode ? 'http://localhost:3000/api/login' : 'http://localhost:3000/api/register';
            const body = isLoginMode ? { username, password } : { email, username, password };

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert(data.message);
                    closeModal();
                    if (isLoginMode) {
                        // Update UI for logged in user (Example)
                        document.querySelector('.nav-auth').innerHTML = `<a href="#" class="btn btn-outline">${data.user.username}</a>`;
                    }
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (err) {
                console.error(err);
                // Fallback for demo if server not running
                setTimeout(() => {
                    alert('Server not reachable. (Demo Mode: Action simulated)');
                    closeModal();
                }, 1000);
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Starting download for Hitadoro Loader...');
            // window.location.href = 'path/to/loader.exe';
        });
    }
}

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
