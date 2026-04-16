// ===== CONFIG =====
// ดึง URL จาก script.js หรือระบุโดยตรง
const DASHBOARD_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx5031kjUETj291aoQHky4LGfAIRiWr1sElym1gCOSPvOK6UcF_5MyKldlirb1bV39w/exec';

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    fetchStats();
});

// ===== FETCH DATA =====
async function fetchStats() {
    const loading = document.getElementById('loading');

    try {
        const response = await fetch(`${DASHBOARD_SCRIPT_URL}?action=stats&t=${Date.now()}`);
        const result = await response.json();

        if (result.success) {
            updateDashboard(result.data);
            const now = new Date();
            document.getElementById('last-update').textContent = now.toLocaleTimeString('th-TH');
        } else {
            console.error('Failed to fetch stats:', result.message);
            alert('ไม่สามารถโหลดข้อมูลได้: ' + result.message);
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback for local testing
        showFallbackData();
    } finally {
        if (loading) loading.style.opacity = '0';
        setTimeout(() => loading.style.display = 'none', 500);
    }
}

// ===== UPDATE UI =====
function updateDashboard(data) {
    // Basic Stats
    animateValue('total-count', data.total || 0);
    animateValue('pending-count', (data.pending || 0) + (data.processing || 0));
    animateValue('done-count', data.done || 0);

    // Render Charts
    if (data.types) renderTypeChart(data.types);
    renderStatusChart(data);
}

function animateValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;

    const duration = 1500;
    const start = 0;
    const end = parseInt(value);
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(ease * end);
        el.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

// ===== CHARTS =====
function renderTypeChart(typeCounts) {
    const ctx = document.getElementById('typeChart').getContext('2d');
    const labels = Object.keys(typeCounts);
    const values = Object.values(typeCounts);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'จำนวนเรื่อง',
                data: values,
                backgroundColor: [
                    'rgba(37, 99, 235, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(100, 116, 139, 0.7)'
                ],
                borderColor: [
                    '#1e40af', '#059669', '#d97706', '#7c3aed', '#475569'
                ],
                borderWidth: 0,
                borderRadius: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.03)', borderDash: [5, 5] },
                    ticks: { color: '#64748b', font: { family: 'Outfit', weight: 600 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { family: 'Outfit', weight: 600 } }
                }
            }
        }
    });
}

function renderStatusChart(data) {
    const ctx = document.getElementById('statusChart').getContext('2d');

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น'],
            datasets: [{
                backgroundColor: [
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(37, 99, 235, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                data: [data.pending || 0, data.processing || 0, data.done || 0],
                borderColor: '#ffffff',
                borderWidth: 4,
                hoverOffset: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#64748b', padding: 25, font: { family: 'Outfit', weight: 600 } }
                }
            }
        }
    });
}

// ===== PARTICLES (Copied from script.js for consistency) =====
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];
        const count = Math.floor((canvas.width * canvas.height) / 15000);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: (Math.random() - 0.5) * 0.4,
                opacity: Math.random() * 0.4 + 0.1
            });
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(37, 99, 235, ${p.opacity})`;
            ctx.fill();

            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(37, 99, 235, ${0.1 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(drawParticles);
    }

    resize();
    createParticles();
    drawParticles();
    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });
}

function showFallbackData() {
    updateDashboard({
        total: 10,
        pending: 5,
        inProgress: 2,
        done: 3,
        typeCounts: { 'ข้อร้องเรียน': 4, 'ข้อเสนอแนะ': 3, 'แจ้งปัญหา': 2, 'อื่นๆ': 1 },
        deptCounts: { 'กองพัฒนานักศึกษา': 5, 'หอพัก': 3, 'คณะ': 2 }
    });
}
