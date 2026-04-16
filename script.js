// ===== CONFIG =====
// ⚠️ ใส่ URL ของ Google Apps Script Web App ที่ Deploy แล้วตรงนี้
const APPS_SCRIPT_URL = 'https://script.google.com/macros/library/d/1HYAyV-pxuelaTxBwTt30pHawCBqHrqIkJUQ6cnk6SCy4ghOLIbDNA1Iq/34';
// ตัวอย่าง: 'https://script.google.com/macros/s/AKfycbx.../exec'

// ===== STATE =====
let currentSection = 1;
const totalSections = 7;
let uploadedFiles = [];
let currentLanguage = 'th';

// ===== I18N DICTIONARY =====
const translations = {
    th: {
        'intro-title-1': 'ระบบรับเรื่องร้องเรียน',
        'intro-title-2': 'และข้อเสนอแนะนักศึกษา',
        'intro-desc': 'พื้นที่นี้ถูกสร้างขึ้นเพื่อเปิดโอกาสให้นักศึกษาได้สะท้อนปัญหา เสนอแนวทาง และมีส่วนร่วมในการพัฒนามหาวิทยาลัยร่วมกัน',
        'intro-sub-desc': 'ทุกความคิดเห็นของคุณมีความหมาย และจะถูกส่งต่อไปยังหน่วยงานที่เกี่ยวข้องเพื่อพิจารณาอย่างเหมาะสม',
        'btn-start': 'เริ่มต้นเสนอความคิดเห็น',
        'btn-view-dashboard': 'ดู Dashboard ทั้งหมด',
        'stat-solved': 'ปัญหาที่แก้ไขแล้ว',
        'stories-title': '✨ ความสำเร็จล่าสุด',
        'stories-subtitle': 'เรื่องที่ผ่านการพิจารณาและดำเนินการแก้ไขเรียบร้อยแล้ว',
        'lookup-title': 'ตรวจสอบสถานะเรื่องร้องเรียน',
        'btn-search': 'ค้นหา',
        'step-1': 'ประเภท', 'step-2': 'หน่วยงาน', 'step-3': 'รายละเอียด', 'step-4': 'แนบไฟล์', 'step-5': 'สถานที่', 'step-6': 'ความเร่งด่วน', 'step-7': 'ตัวตน',
        'section-1-title': 'ประเภทเรื่อง', 'section-1-subtitle': 'เลือกประเภทเรื่องที่คุณต้องการเสนอ',
        'section-2-title': 'หน่วยงานที่เกี่ยวข้อง', 'section-2-subtitle': 'เลือกหน่วยงานที่เกี่ยวข้องกับเรื่องของคุณ',
        'section-3-title': 'รายละเอียด', 'section-3-subtitle': 'กรุณาอธิบายรายละเอียดเรื่องที่ต้องการเสนอ',
        'section-4-title': 'แนบไฟล์', 'section-4-subtitle': 'แนบรูปภาพหรือหลักฐานเพื่อช่วยให้การตรวจสอบรวดเร็วมากขึ้น',
        'section-5-title': 'สถานที่', 'section-5-subtitle': 'ระบุสถานที่ที่เกิดเหตุ',
        'section-6-title': 'ระดับความเร่งด่วน', 'section-6-subtitle': 'ประเมินระดับความสำคัญของเรื่อง',
        'section-7-title': 'การเปิดเผยตัวตน', 'section-7-subtitle': 'เลือกว่าต้องการเปิดเผยตัวตนหรือไม่',
        'btn-prev': 'ย้อนกลับ', 'btn-next': 'ถัดไป', 'btn-submit': 'ส่งข้อมูล',
        'label-email': 'อีเมลสำหรับรับผลการดำเนินการ (ไม่บังคับ)',
        'hint-email': 'เราจะส่งหมายเลขอ้างอิงและผลการตรวจสอบไปให้อีเมลนี้ครับ',
        'success-title': 'ขอบคุณสำหรับความคิดเห็นของคุณ 🙏',
        'success-message': 'เรื่องของคุณได้รับการบันทึกเรียบร้อยแล้ว และจะถูกส่งต่อไปยังหน่วยงานที่เกี่ยวข้องเพื่อพิจารณาดำเนินการต่อไป',
        'success-ref-label': 'หมายเลขอ้างอิง',
        'qr-label': 'สแกนเพื่อติดตามสถานะได้ทันที',
        'copy-link': 'คัดลอกลิงก์ติดตาม',
        'success-footer': 'ร่วมกันสร้างมหาวิทยาลัยที่ดีขึ้นไปพร้อมกัน 💙',
        'btn-reset': 'ส่งเรื่องใหม่',
        'type-complaint': 'ข้อร้องเรียน', 'type-suggestion': 'ข้อเสนอแนะ', 'type-problem': 'แจ้งปัญหา', 'type-other': 'อื่น ๆ',
        'priority-low': 'ต่ำ', 'priority-low-desc': 'ไม่เร่งด่วน',
        'priority-med': 'ปานกลาง', 'priority-med-desc': 'ควรดำเนินการ',
        'priority-high': 'สูง', 'priority-high-desc': 'ต้องการเร่งด่วน',
        'priority-urgent': 'เร่งด่วนมาก 🚨', 'priority-urgent-desc': 'ต้องแก้ไขทันที',
        'id-anon': 'ไม่เปิดเผยตัวตน', 'id-anon-desc': 'ข้อมูลของคุณจะถูกเก็บเป็นความลับ',
        'id-reveal': 'เปิดเผยตัวตน', 'id-reveal-desc': 'ระบุชื่อและช่องทางติดต่อ',
        'id-reveal': 'เปิดเผยตัวตน', 'id-reveal-desc': 'ระบุชื่อและช่องทางติดต่อ'
    },
    en: {
        'intro-title-1': 'Student Voice',
        'intro-title-2': 'Feedback Platform',
        'intro-desc': 'A space created for students to reflect on problems, propose solutions, and participate in developing the university together.',
        'intro-sub-desc': 'Every opinion matters and will be forwarded to relevant departments for consideration.',
        'btn-start': 'Start Feedback',
        'btn-view-dashboard': 'View Dashboard',
        'stat-solved': 'Issues Solved',
        'stories-title': '✨ Latest Success',
        'stories-subtitle': 'Complaints that have been considered and resolved.',
        'lookup-title': 'Track Complaint Status',
        'btn-search': 'Search',
        'step-1': 'Type', 'step-2': 'Dept', 'step-3': 'Details', 'step-4': 'Files', 'step-5': 'Location', 'step-6': 'Priority', 'step-7': 'Identity',
        'section-1-title': 'Topic Type', 'section-1-subtitle': 'Select the type of feedback',
        'section-2-title': 'Related Department', 'section-2-subtitle': 'Select the department involved',
        'section-3-title': 'Details', 'section-3-subtitle': 'Please describe your concern',
        'section-4-title': 'Attach Files', 'section-4-subtitle': 'Attach photos or evidence for faster verification',
        'section-5-title': 'Location', 'section-5-subtitle': 'Where did this happen?',
        'section-6-title': 'Urgency Level', 'section-6-subtitle': 'Assess the priority of this matter',
        'section-7-title': 'Identity Disclosure', 'section-7-subtitle': 'Choose whether to reveal your identity',
        'btn-prev': 'Back', 'btn-next': 'Next', 'btn-submit': 'Submit',
        'label-email': 'Notification Email (Optional)',
        'hint-email': 'We will send the reference number and results to this email.',
        'success-title': 'Thank you for your feedback 🙏',
        'success-message': 'Your report has been recorded and will be processed accordingly.',
        'success-ref-label': 'Reference Number',
        'qr-label': 'Scan to track status instantly',
        'copy-link': 'Copy tracking link',
        'success-footer': 'Building a better university together 💙',
        'btn-reset': 'New Submission',
        'type-complaint': 'Complaint', 'type-suggestion': 'Suggestion', 'type-problem': 'Report Issue', 'type-other': 'Other',
        'priority-low': 'Low', 'priority-low-desc': 'Not urgent',
        'priority-med': 'Medium', 'priority-med-desc': 'Should proceed',
        'priority-high': 'High', 'priority-high-desc': 'Need urgency',
        'priority-urgent': 'Urgent 🚨', 'priority-urgent-desc': 'Immediate fix',
        'id-anon': 'Anonymous', 'id-anon-desc': 'Your info will be kept private',
        'id-reveal': 'Reveal Identity', 'id-reveal-desc': 'Provide name & contact info',
        'admin-login-title': '🔒 Admin Login',
        'admin-login-desc': 'Please enter password to manage data.',
        'btn-cancel': 'Cancel',
        'btn-login': 'Login'
    }
};

// ===== PARTICLES BACKGROUND =====
(function initParticles() {
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
            ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`;
            ctx.fill();

            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - dist / 120)})`;
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
})();

// ===== LANGUAGE LOGIC =====
function toggleLanguage() {
    currentLanguage = currentLanguage === 'th' ? 'en' : 'th';
    applyLanguage(currentLanguage);
}

function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    const flag = document.getElementById('lang-flag');
    if (flag) flag.src = lang === 'th' ? 'https://flagcdn.com/w20/th.png' : 'https://flagcdn.com/w20/gb.png';

    // Update placeholders if needed
    const refInput = document.getElementById('ref-input');
    if (refInput) refInput.placeholder = lang === 'th' ? 'กรอกหมายเลขอ้างอิง...' : 'Enter reference number...';
}



// ===== COUNTER ANIMATION =====
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        if (!target) return;
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            counter.textContent = current.toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    });
}

// ===== LIVE DATA LOADING =====
async function loadLiveStats() {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT_URL_HERE')) return;

    try {
        const response = await fetch(`${APPS_SCRIPT_URL}?action=stats&t=${Date.now()}`);
        const result = await response.json();

        if (result.success && result.data) {
            const stats = result.data;

            // Update the data-count attributes
            const totalEl = document.querySelector('.stat-item:nth-child(1) .stat-number');
            const percentEl = document.querySelector('.stat-item:nth-child(3) .stat-number');
            const doneEl = document.querySelector('.stat-item:nth-child(5) .stat-number');

            if (totalEl) totalEl.setAttribute('data-count', stats.total);
            if (doneEl) doneEl.setAttribute('data-count', stats.done);

            if (percentEl && stats.total > 0) {
                const percent = Math.round(((stats.inProgress + stats.done) / stats.total) * 100);
                percentEl.setAttribute('data-count', percent);
            }

            // Show and render home chart if data exists
            const homeChart = document.getElementById('home-dashboard-chart');
            if (homeChart && stats.total > 0) {
                homeChart.style.display = 'block';
                renderHomeChart(stats.typeCounts);
            }

            // Restart counters with new data
            animateCounters();
        }
    } catch (error) {
        console.error('Failed to load live stats:', error);
    }
}

function renderHomeChart(typeCounts) {
    const ctx = document.getElementById('homeTypeChart');
    if (!ctx) return;

    const labels = Object.keys(typeCounts);
    const values = Object.values(typeCounts);

    new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'จำนวนเรื่อง',
                data: values,
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: '#1e40af',
                borderWidth: 1.5,
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
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { color: '#64748b', font: { size: 10 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { size: 10 } }
                }
            }
        }
    });
}

// ===== PAGE NAVIGATION =====
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    setTimeout(() => {
        document.getElementById(pageId).classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
}

function showFormPage() {
    showPage('form-page');
}

// ===== FORM SECTION NAVIGATION =====
function updateProgress() {
    const fill = document.getElementById('progress-fill');
    if (!fill) return;
    const percentage = (currentSection / totalSections) * 100;
    fill.style.width = percentage + '%';

    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 === currentSection) {
            step.classList.add('active');
        } else if (index + 1 < currentSection) {
            step.classList.add('completed');
        }
    });
}

function showSection(sectionNum) {
    const sections = document.querySelectorAll('.form-section');
    sections.forEach(s => s.classList.remove('active'));

    const target = document.querySelector(`.form-section[data-section="${sectionNum}"]`);
    if (target) {
        target.classList.add('active');
    }

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnSubmit = document.getElementById('btn-submit');

    if (btnPrev) btnPrev.style.visibility = sectionNum === 1 ? 'hidden' : 'visible';

    if (sectionNum === totalSections) {
        if (btnNext) btnNext.style.display = 'none';
        if (btnSubmit) btnSubmit.style.display = 'inline-flex';
    } else {
        if (btnNext) btnNext.style.display = 'inline-flex';
        if (btnSubmit) btnSubmit.style.display = 'none';
    }

    updateProgress();
}

function validateSection(sectionNum) {
    clearErrors();
    let isValid = true;

    switch (sectionNum) {
        case 1: {
            const selected = document.querySelector('input[name="topicType"]:checked');
            if (!selected) {
                showError('topic-type', 'กรุณาเลือกประเภทเรื่อง');
                isValid = false;
            }
            break;
        }
        case 2: {
            const dept = document.getElementById('department');
            if (!dept.value) {
                dept.classList.add('field-error');
                showErrorAfter(dept.parentElement, 'กรุณาเลือกหน่วยงาน');
                isValid = false;
            }
            break;
        }
        case 3: {
            const subject = document.getElementById('subject');
            const details = document.getElementById('details');
            if (!subject.value.trim()) {
                subject.classList.add('field-error');
                showErrorAfter(subject, 'กรุณากรอกหัวข้อเรื่อง');
                isValid = false;
            }
            if (!details.value.trim()) {
                details.classList.add('field-error');
                showErrorAfter(details, 'กรุณากรอกรายละเอียด');
                isValid = false;
            }
            break;
        }
        case 4:
            break;
        case 5: {
            const location = document.getElementById('location');
            if (!location.value.trim()) {
                location.classList.add('field-error');
                showErrorAfter(location, 'กรุณาระบุสถานที่');
                isValid = false;
            }
            break;
        }
        case 6: {
            const selected = document.querySelector('input[name="priority"]:checked');
            if (!selected) {
                showError('priority-group', 'กรุณาเลือกระดับความสำคัญ');
                isValid = false;
            }
            break;
        }
        case 7: {
            const identity = document.querySelector('input[name="identity"]:checked');
            if (!identity) {
                showError('identity-group', 'กรุณาเลือกการเปิดเผยตัวตน');
                isValid = false;
            }
            if (identity && identity.value === 'เปิดเผย') {
                const name = document.getElementById('full-name');
                const contact = document.getElementById('contact');
                if (!name.value.trim()) {
                    name.classList.add('field-error');
                    showErrorAfter(name, 'กรุณากรอกชื่อ-นามสกุล');
                    isValid = false;
                }
                if (!contact.value.trim()) {
                    contact.classList.add('field-error');
                    showErrorAfter(contact, 'กรุณากรอกช่องทางติดต่อ');
                    isValid = false;
                }
            }
            break;
        }
    }
    return isValid;
}

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    const error = document.createElement('div');
    error.className = 'error-message';
    error.innerHTML = `⚠️ ${message}`;
    container.parentElement.appendChild(error);
}

function showErrorAfter(element, message) {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.innerHTML = `⚠️ ${message}`;
    element.parentElement.appendChild(error);
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(e => e.remove());
    document.querySelectorAll('.field-error').forEach(e => e.classList.remove('field-error'));
}

function nextSection() {
    if (!validateSection(currentSection)) return;

    if (currentSection < totalSections) {
        currentSection++;
        showSection(currentSection);
        document.querySelector('.form-wrapper').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function prevSection() {
    if (currentSection > 1) {
        currentSection--;
        showSection(currentSection);
        document.querySelector('.form-wrapper').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ===== CONDITIONAL IDENTITY FIELDS =====
document.querySelectorAll('input[name="identity"]').forEach(radio => {
    radio.addEventListener('change', function () {
        const identityFields = document.getElementById('identity-fields');
        if (!identityFields) return;
        if (this.value === 'เปิดเผย') {
            identityFields.style.display = 'block';
            identityFields.style.animation = 'sectionIn 0.4s ease';
        } else {
            identityFields.style.display = 'none';
            document.getElementById('full-name').value = '';
            document.getElementById('contact').value = '';
        }
    });
});

// ===== CHARACTER COUNTER =====
const detailsTextarea = document.getElementById('details');
const charCountEl = document.getElementById('char-count');
if (detailsTextarea && charCountEl) {
    detailsTextarea.addEventListener('input', function () {
        const count = this.value.length;
        charCountEl.textContent = count;
        if (count > 2000) {
            this.value = this.value.substring(0, 2000);
            charCountEl.textContent = 2000;
        }
    });
}

// ===== FILE UPLOAD =====
const fileUploadArea = document.getElementById('file-upload-area');
const fileInput = document.getElementById('file-input');
const fileListEl = document.getElementById('file-list');

if (fileUploadArea && fileInput) {
    fileUploadArea.addEventListener('click', () => fileInput.click());

    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('drag-over');
    });

    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('drag-over');
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

// ===== DEPARTMENT & FACULTY DEPENDENCY =====
const departmentSelect = document.getElementById('department');
const facultyGroup = document.getElementById('faculty-group');
const facultySelect = document.getElementById('faculty');

if (departmentSelect && facultyGroup && facultySelect) {
    departmentSelect.addEventListener('change', function () {
        if (this.value === 'คณะ') {
            facultyGroup.style.display = 'block';
            facultySelect.required = true;
        } else {
            facultyGroup.style.display = 'none';
            facultySelect.required = false;
            facultySelect.selectedIndex = 0;
        }
    });
}

function handleFiles(files) {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024;

    Array.from(files).forEach(file => {
        if (!allowedTypes.includes(file.type)) {
            showToast('❌ รองรับเฉพาะไฟล์ JPG, PNG, PDF เท่านั้น');
            return;
        }
        if (file.size > maxSize) {
            showToast('❌ ไฟล์มีขนาดใหญ่เกิน 10MB');
            return;
        }
        if (uploadedFiles.length >= 5) {
            showToast('❌ อัปโหลดได้สูงสุด 5 ไฟล์');
            return;
        }
        uploadedFiles.push(file);
        renderFileList();
    });
}

function renderFileList() {
    if (!fileListEl) return;
    fileListEl.innerHTML = '';
    uploadedFiles.forEach((file, index) => {
        const fileIcon = file.type === 'application/pdf' ? '📄' : '🖼️';
        const fileSize = (file.size / 1024).toFixed(1) + ' KB';

        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <div class="file-info">
                <span class="file-icon">${fileIcon}</span>
                <span class="file-name">${file.name}</span>
                <span class="file-size">(${fileSize})</span>
            </div>
            <button type="button" class="file-remove" onclick="removeFile(${index})" title="ลบไฟล์">✕</button>
        `;
        fileListEl.appendChild(item);
    });
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    renderFileList();
}

// Helper to convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Helper to compress image
function compressImage(file, maxWidth = 1000, maxHeight = 1000, quality = 0.6) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/') || file.type === 'image/gif') {
            // ไม่บีบอัดถ้าไม่ใช่รูปภาพ หรือเป็น GIF
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // คำนวณขนาดใหม่รักษาอัตราส่วน
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // แปลงเป็น Blob
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Canvas to Blob failed'));
                        return;
                    }
                    // คืนค่าเป็น File object ใหม่
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                }, 'image/jpeg', quality);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

// ===== LOCAL STORAGE HELPERS (fallback) =====
function getComplaints() {
    const data = localStorage.getItem('complaints');
    return data ? JSON.parse(data) : [];
}

function saveComplaintLocal(complaint) {
    const complaints = getComplaints();
    complaints.unshift(complaint);
    localStorage.setItem('complaints', JSON.stringify(complaints));
}

// ===== SEND TO GOOGLE SHEETS (via hidden iframe form) =====
async function sendToGoogleSheets(formData) {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT_URL_HERE')) {
        console.warn('⚠️ ยังไม่ได้ตั้งค่า APPS_SCRIPT_URL');
        return { success: true, local: true };
    }

    try {
        // ใช้ fetch แบบ no-cors เพื่อให้ข้อมูลไปถึง Google Sheets แน่นอนที่สุด
        // (ถึงแม้เราจะอ่านค่าตอบกลับไม่ได้ แต่ข้อมูลจะบันทึกลงชีทครับ)
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify(formData)
        });

        // ในโหมด no-cors เราถือว่าสำเร็จถ้าไม่มี Error ระหว่างส่ง
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending to Google Sheets:', error);
        return { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
    }
}

// ===== FORM SUBMISSION =====
async function submitForm() {
    if (!validateSection(currentSection)) return;

    const btnSubmit = document.getElementById('btn-submit');
    const originalContent = btnSubmit.innerHTML;
    btnSubmit.disabled = true;

    // Generate reference number
    const now = new Date();
    const refNum = `REF-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

    console.log('Starting submission...', { id: refNum, files: uploadedFiles.length });

    // 1. Process files in parallel
    const fileData = [];
    if (uploadedFiles.length > 0) {
        btnSubmit.innerHTML = `<span class="spinner"></span> กำลังย่อรูปภาพ (0/${uploadedFiles.length})...`;

        try {
            const processedFiles = await Promise.all(uploadedFiles.map(async (file, index) => {
                // อัปเดตข้อความสถานะ (ถ้าต้องการละเอียดขึ้นอาจจะต้องใช้ก้อนแยก)
                const processedFile = file.type.startsWith('image/') ? await compressImage(file) : file;
                const base64 = await fileToBase64(processedFile);

                // อัปเดต UI เมื่อแต่ละรูปเสร็จ (แบบง่าย)
                btnSubmit.innerHTML = `<span class="spinner"></span> กำลังเตรียมรูปที่ ${index + 1}/${uploadedFiles.length}...`;

                return {
                    name: file.name,
                    type: processedFile.type,
                    base64: base64
                };
            }));
            fileData.push(...processedFiles);
        } catch (err) {
            console.error('File processing error:', err);
            btnSubmit.innerHTML = originalContent;
            btnSubmit.disabled = false;
            alert('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ กรุณาลองใหม่อีกครั้ง');
            return;
        }
    }

    btnSubmit.innerHTML = '<span class="spinner"></span> กำลังบันทึกข้อมูลและส่งเรื่อง...';

    // Collect form data
    const formData = {
        id: refNum,
        topicType: document.querySelector('input[name="topicType"]:checked')?.value,
        department: (function () {
            const dept = document.getElementById('department').value;
            const faculty = document.getElementById('faculty').value;
            return (dept === 'คณะ' && faculty) ? `คณะ - ${faculty}` : dept;
        })(),
        subject: document.getElementById('subject').value,
        details: document.getElementById('details').value,
        location: document.getElementById('location').value,
        mapLink: document.getElementById('map-link').value,
        priority: document.querySelector('input[name="priority"]:checked')?.value,
        identity: document.querySelector('input[name="identity"]:checked')?.value,
        fullName: document.getElementById('full-name').value || 'ไม่เปิดเผย',
        contact: document.getElementById('contact').value || '-',
        email: document.getElementById('user-email').value || '',
        timestamp: now.toISOString(),
        files: uploadedFiles.map(f => f.name),
        fileData: fileData,
        status: 'รอดำเนินการ',
        adminNote: ''
    };

    // Save to localStorage as backup
    saveComplaintLocal(formData);

    // 2. Send to Google Sheets
    const result = await sendToGoogleSheets(formData);

    document.getElementById('ref-number').textContent = refNum;

    btnSubmit.innerHTML = originalContent;
    btnSubmit.disabled = false;
    showPage('success-page');

    if (result.local) {
        showToast('✅ บันทึกข้อมูลในเครื่องแล้ว (ยังไม่ได้ตั้งค่า Google Sheets)');
    } else {
        showToast('✅ ส่งข้อมูลไปยัง Google Sheets เรียบร้อยแล้ว!');
    }
}

// ===== LOOKUP STATUS =====
async function lookupStatus() {
    const refInput = document.getElementById('ref-input');
    const resultDiv = document.getElementById('lookup-result');
    if (!refInput || !resultDiv) return;

    const refId = refInput.value.trim().toUpperCase();

    if (!refId) {
        resultDiv.innerHTML = '<div class="lookup-error">⚠️ กรุณากรอกหมายเลขอ้างอิง</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="lookup-loading"><span class="spinner spinner-dark"></span> กำลังค้นหา...</div>';

    // 1. Try Google Sheets first (Live Data)
    if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT_URL_HERE')) {
        try {
            const response = await fetch(`${APPS_SCRIPT_URL}?action=lookup&refId=${encodeURIComponent(refId)}&t=${Date.now()}`);
            const data = await response.json();
            if (data.success) {
                renderLookupResult(data.data, resultDiv);
                return;
            }
        } catch (error) {
            console.error('Lookup error:', error);
            // If network error, continue to local storage
        }
    }

    // 2. Try local storage as fallback
    const localComplaints = getComplaints();
    const localResult = localComplaints.find(c => c.id === refId);

    if (localResult) {
        renderLookupResult(localResult, resultDiv);
        showToast('ℹ️ แสดงข้อมูลสำรองในเครื่อง (ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้)');
        return;
    }

    resultDiv.innerHTML = `
        <div class="lookup-not-found">
            <span class="lookup-icon">🔍</span>
            <p>ไม่พบข้อมูลสำหรับหมายเลข <strong>${refId}</strong></p>
            <p class="lookup-hint">กรุณาตรวจสอบหมายเลขอ้างอิงอีกครั้ง</p>
        </div>
    `;
}

function renderLookupResult(data, container) {
    const statusColors = {
        'รอดำเนินการ': { bg: '#FEF3C7', color: '#92400E', icon: '⏳' },
        'กำลังดำเนินการ': { bg: '#DBEAFE', color: '#1E40AF', icon: '🔄' },
        'เสร็จสิ้น': { bg: '#D1FAE5', color: '#065F46', icon: '✅' }
    };

    const priorityColors = {
        'ต่ำ': '#22c55e',
        'ปานกลาง': '#f59e0b',
        'สูง': '#f97316',
        'เร่งด่วนมาก': '#ef4444'
    };

    const currentStatus = (data.status || '').toString().trim();
    const status = statusColors[currentStatus] || statusColors['รอดำเนินการ'];
    const pColor = priorityColors[data.priority] || '#999';
    const dateStr = data.date || new Date(data.timestamp).toLocaleString('th-TH');

    container.innerHTML = `
        <div class="lookup-card">
            <div class="lookup-card-header">
                <div class="lookup-ref">
                    <span class="lookup-ref-label">หมายเลขอ้างอิง</span>
                    <span class="lookup-ref-id">${data.id}</span>
                </div>
                <div class="lookup-status" style="background:${status.bg};color:${status.color}">
                    ${status.icon} ${data.status}
                </div>
            </div>
            <div class="lookup-card-body">
                <div class="lookup-row">
                    <span class="lookup-label">📋 ประเภท</span>
                    <span class="lookup-value">${data.topicType}</span>
                </div>
                <div class="lookup-row">
                    <span class="lookup-label">🏛️ หน่วยงาน</span>
                    <span class="lookup-value">${data.department}</span>
                </div>
                <div class="lookup-row">
                    <span class="lookup-label">📝 หัวข้อ</span>
                    <span class="lookup-value">${data.subject}</span>
                </div>
                <div class="lookup-row">
                    <span class="lookup-label">📍 สถานที่</span>
                    <span class="lookup-value">${data.location}</span>
                </div>
                <div class="lookup-row">
                    <span class="lookup-label">🔔 ความเร่งด่วน</span>
                    <span class="lookup-value"><span class="priority-dot" style="background:${pColor}"></span> ${data.priority}</span>
                </div>
                <div class="lookup-row">
                    <span class="lookup-label">📅 วันที่แจ้ง</span>
                    <span class="lookup-value">${dateStr}</span>
                </div>
                ${data.files && data.files !== '-' ? `
                <div class="lookup-row">
                    <span class="lookup-label">📎 ไฟล์แนบ</span>
                    <div class="lookup-value file-links">
                        ${data.files.split(',').map(file => {
        const trimmedFile = file.trim();
        // ตรวจสอบว่าเป็น URL หรือไม่ (รองรับทั้ง http และ drive.google)
        if (trimmedFile.toLowerCase().includes('http')) {
            return `<a href="${trimmedFile}" target="_blank" class="file-link">เปิดดูรูปภาพ 🖼️</a>`;
        }
        return `<span class="file-name-only">${trimmedFile}</span>`;
    }).join(' ')}
                    </div>
                </div>` : ''}
                ${data.adminNote ? `
                <div class="lookup-row lookup-note">
                    <span class="lookup-label">💬 หมายเหตุจากเจ้าหน้าที่</span>
                    <span class="lookup-value">${data.adminNote}</span>
                </div>` : ''}
            </div>
        </div>
    `;
    applyLanguage(currentLanguage);
}

// ===== DASHBOARD DATA LOADING (LIVE STATS & SUCCESS STORIES) =====
async function loadDashboardData() {
    try {
        const response = await fetch(`${APPS_SCRIPT_URL}?action=stats&t=${Date.now()}`);
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            
            // 1. Update Basic Stats
            const totalEl = document.querySelector('[data-count]');
            if (totalEl) totalEl.textContent = data.total || 0;
            
            const solvedEl = document.getElementById('stat-done');
            if (solvedEl) solvedEl.textContent = data.done || 0;

            // 2. Update Success Stories
            const grid = document.getElementById('stories-grid');
            if (grid && data.recentResolved && data.recentResolved.length > 0) {
                grid.innerHTML = data.recentResolved.map(story => `
                    <div class="story-card">
                        <div class="story-badge">RESOLVED</div>
                        <div class="story-content">
                            <h4 class="story-subject">${story.subject}</h4>
                            <p class="story-date">${new Date(story.date).toLocaleDateString('th-TH')}</p>
                        </div>
                    </div>
                `).join('');
                document.getElementById('stories-section').style.display = 'block';
            } else if (grid) {
                document.getElementById('stories-section').style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// ===== RESET FORM =====
function resetForm() {
    const form = document.getElementById('feedback-form');
    if (form) form.reset();
    const idFields = document.getElementById('identity-fields');
    if (idFields) idFields.style.display = 'none';
    uploadedFiles = [];
    renderFileList();
    if (charCountEl) charCountEl.textContent = '0';
    currentSection = 1;
    showSection(1);
    showPage('form-page');
}

// ===== TOAST =====
function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ===== INPUT FOCUS ANIMATIONS =====
document.querySelectorAll('.text-input, .textarea-input, select').forEach(input => {
    input.addEventListener('focus', function () {
        this.closest('.field-group')?.classList.add('field-focused');
    });
    input.addEventListener('blur', function () {
        this.closest('.field-group')?.classList.remove('field-focused');
    });
});

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', (e) => {
    const formPage = document.getElementById('form-page');
    if (formPage && formPage.classList.contains('active')) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            if (currentSection === totalSections) {
                submitForm();
            } else {
                nextSection();
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();

    // Auto-lookup from URL
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get('ref');
    if (refId) {
        showPage('intro-page'); // Ensure we are on intro
        const refInput = document.getElementById('ref-input');
        if (refInput) {
            refInput.value = refId;
            lookupStatus();
        }
    }
});

// Reverted: Admin Dashboard Logic Removed
