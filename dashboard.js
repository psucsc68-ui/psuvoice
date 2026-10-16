const DASHBOARD_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyiOSdbWlF_O-xXDVqA7ZJUs1yKfylZTuLWkfg6zbGIXxkuiouIC7uEl45FcGDICiA/exec';

let typeChartInstance = null;
let statusChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    fetchStats();
    
    // Update time
    const now = new Date();
    document.getElementById('last-update').textContent = now.toLocaleTimeString('th-TH') + ' น.';
});

async function fetchStats() {
    try {
        const response = await fetch(`${DASHBOARD_SCRIPT_URL}?action=stats`);
        if (!response.ok) throw new Error('Network error');
        const result = await response.json();
        
        if (result.success && result.data) {
            updateDashboard(result.data);
        } else {
            showFallbackData();
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showFallbackData();
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function updateDashboard(data) {
    animateValue('total-count', data.total || 0);
    animateValue('pending-count', (data.pending || 0) + (data.processing || 0));
    animateValue('done-count', data.done || 0);
    
    renderTypeChart(data.types || {});
    renderStatusChart(data);
}

function animateValue(id, end) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let start = 0;
    const duration = 1500;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end;
        }
    };
    window.requestAnimationFrame(step);
}

function renderTypeChart(typeCounts) {
    const ctx = document.getElementById('typeChart').getContext('2d');
    
    const labels = Object.keys(typeCounts);
    const data = Object.values(typeCounts);
    
    if (typeChartInstance) typeChartInstance.destroy();
    
    typeChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'จำนวนเรื่อง',
                data: data,
                backgroundColor: 'rgba(10, 42, 102, 0.7)',
                borderColor: 'rgba(10, 42, 102, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 } }
            }
        }
    });
}

function renderStatusChart(data) {
    const ctx = document.getElementById('statusChart').getContext('2d');
    
    if (statusChartInstance) statusChartInstance.destroy();
    
    statusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['เสร็จสิ้น', 'รอดำเนินการ', 'กำลังดำเนินการ'],
            datasets: [{
                data: [data.done || 0, data.pending || 0, data.processing || 0],
                backgroundColor: [
                    '#10B981', // green
                    '#F59E0B', // yellow
                    '#3B82F6'  // blue
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            },
            cutout: '70%'
        }
    });
}

function showFallbackData() {
    updateDashboard({
        total: 15,
        done: 5,
        pending: 8,
        processing: 2,
        types: {
            "วิชาการ/การเรียนการสอน": 5,
            "สิ่งอำนวยความสะดวก": 7,
            "กิจกรรมนักศึกษา": 2,
            "อื่นๆ": 1
        }
    });
}

function initParticles() {
    const canvas = document.getElementById('particles-js');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particlesArray = [];
    const numberOfParticles = 50;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.color = 'rgba(10, 42, 102, 0.1)';
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.size > 0.2) this.size -= 0.01;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        requestAnimationFrame(animate);
    }
    init();
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}
