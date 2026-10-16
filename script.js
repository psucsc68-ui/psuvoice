const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyiOSdbWlF_O-xXDVqA7ZJUs1yKfylZTuLWkfg6zbGIXxkuiouIC7uEl45FcGDICiA/exec';

const CATEGORY_DEPT_MAP = {
  'สาธารณูปโภค / อาคารสถานที่': 'กองกายภาพและสิ่งแวดล้อม วิทยาเขตหาดใหญ่',
  'หอพักนักศึกษา': 'งานหอพักนักศึกษา',
  'ความปลอดภัย / อาชีวอนามัย': 'ศูนย์บริหารจัดการความปลอดภัย อาชีวอนามัยและสิ่งแวดล้อม',
  'กิจกรรม / พัฒนานักศึกษา': 'กองพัฒนานักศึกษาและศิษย์เก่าสัมพันธ์ วิทยาเขตหาดใหญ่',
  'วิชาการ / ทะเบียน': 'สำนักงานการศึกษาและนวัตกรรมการเรียนรู้',
  'ห้องสมุด / แหล่งเรียนรู้': 'สำนักทรัพยากรการเรียนรู้คุณหญิงหลง อรรถกระวีสุนทร',
  'IT / ระบบดิจิทัล': 'สำนักนวัตกรรมดิจิทัลและระบบอัจฉริยะ',
  'สุขภาพ / กีฬา': 'ศูนย์กีฬาและสุขภาพ วิทยาเขตหาดใหญ่',
  'การเงิน / ทุนการศึกษา': 'กองคลัง',
  'สภานักศึกษา / องค์การนักศึกษา': 'สภานักศึกษา',
  'อื่น ๆ': 'อื่น ๆ'
};

const LOCATION_DATA = {
  'วิทยาเขตหาดใหญ่': [
    'อาคารศูนย์กิจกรรมนักศึกษา', 'ศูนย์ประชุมนานาชาติฯ',
    'โรงช้าง',
    'หอพัก 1', 'หอพัก 2', 'หอพัก 3', 'หอพัก 4', 'หอพัก 5',
    'หอพัก 6', 'หอพัก 7', 'หอพัก 8', 'หอพัก 9', 'หอพัก 10',
    'หอพัก 11', 'หอพัก 12', 'หอพัก 13', 'หอพัก 14',
    'ศูนย์กีฬาและสุขภาพ', 'สำนักทรัพยากรการเรียนรู้ (ห้องสมุด)',
    'คณะวิศวกรรมศาสตร์', 'คณะวิทยาศาสตร์', 'คณะแพทยศาสตร์',
    'คณะพยาบาลศาสตร์', 'คณะวิทยาการจัดการ', 'คณะทรัพยากรธรรมชาติ',
    'คณะเภสัชศาสตร์', 'คณะทันตแพทยศาสตร์', 'คณะอุตสาหกรรมเกษตร',
    'คณะศิลปศาสตร์', 'คณะนิติศาสตร์', 'คณะเศรษฐศาสตร์',
    'คณะการแพทย์แผนไทย', 'คณะเทคนิคการแพทย์', 'วิทยาลัยนานาชาติ',
    'อาคารสำนักงานอธิการบดี', 'ลานจอดรถ', 'ถนน/ทางเดินภายใน',
    'อ่างเก็บน้ำ', 'อื่น ๆ'
  ],
  'วิทยาเขตปัตตานี': ['อาคารเรียนรวม', 'หอพักนักศึกษา', 'โรงอาหาร', 'ห้องสมุด', 'สนามกีฬา', 'อื่น ๆ'],
  'วิทยาเขตภูเก็ต': ['อาคารเรียนรวม', 'หอพักนักศึกษา', 'โรงอาหาร', 'ห้องสมุด', 'อื่น ๆ'],
  'วิทยาเขตสุราษฎร์ธานี': ['อาคารเรียนรวม', 'หอพักนักศึกษา', 'โรงอาหาร', 'ห้องสมุด', 'อื่น ๆ'],
  'วิทยาเขตตรัง': ['อาคารเรียนรวม', 'หอพักนักศึกษา', 'โรงอาหาร', 'ห้องสมุด', 'อื่น ๆ']
};

let currentStep = 1;
const totalSteps = 3;
let uploadedFiles = [];
let draftTimer = null;

// --- 1. PDPA Consent System ---
function checkPDPA() {
  const consent = localStorage.getItem('pdpa_consent');
  if (!consent) {
    document.getElementById('pdpa-overlay').classList.remove('hidden');
    // Blur background could be handled via CSS class on main container or body, but typically handled by tailwind classes if we toggle a class on body or main content
    // document.body.style.overflow = 'hidden'; 
  }
}

function acceptPDPA() {
  const checkbox = document.getElementById('pdpa-checkbox');
  if (checkbox && checkbox.checked) {
    localStorage.setItem('pdpa_consent', JSON.stringify({ consented: true, date: new Date().toISOString() }));
    document.getElementById('pdpa-overlay').classList.add('hidden');
    // document.body.style.overflow = 'auto';
  }
}

// --- 2. Particles Background ---
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  const particleCount = 50;
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1
    });
  }
  
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.fill();
      
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(59, 130, 246, ${1 - dist/100})`;
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(draw);
  }
  
  draw();
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// --- 3. Page Navigation (SPA) ---
function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.add('hidden'));
  
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.remove('hidden');
    window.scrollTo(0, 0);
  }
}

// --- 4. Smart Department Mapping ---
function handleCategoryChange(e) {
  if (e.target.name === 'category') {
    const category = e.target.value;
    const departmentDisplay = document.getElementById('department-display');
    const departmentName = document.getElementById('department-name');
    if (departmentDisplay) {
      const mappedDept = CATEGORY_DEPT_MAP[category] || 'ระบุฝ่ายไม่สำเร็จ';
      if (departmentName) {
        departmentName.textContent = 'หน่วยงานรับผิดชอบ: ' + mappedDept;
      } else {
        departmentDisplay.textContent = 'หน่วยงานรับผิดชอบ: ' + mappedDept;
      }
      departmentDisplay.classList.remove('hidden');
      departmentDisplay.dataset.dept = mappedDept;
    }
  }
}

// --- 5. Cascading Location Dropdown ---
function handleCampusChange() {
  const campusEl = document.getElementById('campus');
  const campus = campusEl && campusEl.value ? campusEl.value : 'วิทยาเขตหาดใหญ่';
  const buildingSelect = document.getElementById('building');
  if (!buildingSelect) return;
  
  buildingSelect.disabled = false;
  buildingSelect.innerHTML = '<option value="">-- เลือกอาคาร/สถานที่ --</option>';
  
  const list = LOCATION_DATA[campus] || LOCATION_DATA['วิทยาเขตหาดใหญ่'] || [];
  list.forEach(building => {
    const option = document.createElement('option');
    option.value = building;
    option.textContent = building;
    buildingSelect.appendChild(option);
  });
}

// --- 6. Auto-Save Draft ---
function saveDraft() {
  const getCheckedValue = (name) => {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : '';
  };
  
  const draft = {
    category: getCheckedValue('category'),
    subject: document.getElementById('subject')?.value || '',
    details: document.getElementById('details')?.value || '',
    campus: document.getElementById('campus')?.value || '',
    building: document.getElementById('building')?.value || '',
    floorArea: document.getElementById('floor-area')?.value || '',
    landmark: document.getElementById('landmark')?.value || '',
    urgency: getCheckedValue('urgency'),
    identity: getCheckedValue('identity'),
    fullName: document.getElementById('full-name')?.value || '',
    contactInfo: document.getElementById('contact-info')?.value || '',
    anonContact: document.getElementById('anon-contact')?.value || ''
  };
  
  localStorage.setItem('draft_complaint', JSON.stringify(draft));
}

function restoreDraft() {
  const draftStr = localStorage.getItem('draft_complaint');
  if (draftStr) {
    try {
      const draft = JSON.parse(draftStr);
      
      if (draft.category) {
        const catRadio = document.querySelector(`input[name="category"][value="${draft.category}"]`);
        if (catRadio) {
          catRadio.checked = true;
          handleCategoryChange({ target: catRadio });
        }
      }
      
      if (document.getElementById('subject')) document.getElementById('subject').value = draft.subject || '';
      if (document.getElementById('details')) {
        document.getElementById('details').value = draft.details || '';
        updateCharCount();
      }
      
      if (document.getElementById('campus')) {
        document.getElementById('campus').value = 'วิทยาเขตหาดใหญ่';
        handleCampusChange();
      }
      
      if (draft.building && document.getElementById('building')) {
        setTimeout(() => {
          document.getElementById('building').value = draft.building;
        }, 100);
      }
      
      if (document.getElementById('floor-area')) document.getElementById('floor-area').value = draft.floorArea || '';
      if (document.getElementById('landmark')) document.getElementById('landmark').value = draft.landmark || '';
      if (draft.urgency) {
        const urgRadio = document.querySelector(`input[name="urgency"][value="${draft.urgency}"]`);
        if (urgRadio) urgRadio.checked = true;
      }
      
      if (draft.identity) {
        const idRadio = document.querySelector(`input[name="identity"][value="${draft.identity}"]`);
        if (idRadio) {
          idRadio.checked = true;
          handleIdentityChange();
        }
      }
      
      if (draft.fullName && document.getElementById('full-name')) {
        document.getElementById('full-name').value = draft.fullName;
      }
      if (draft.contactInfo && document.getElementById('contact-info')) {
        document.getElementById('contact-info').value = draft.contactInfo;
      }
      if (draft.anonContact && document.getElementById('anon-contact')) {
        document.getElementById('anon-contact').value = draft.anonContact;
      }
    } catch (e) {
      console.error('Failed to restore draft', e);
    }
  }
}

function clearDraft() {
  localStorage.removeItem('draft_complaint');
}

function setupDraftAutoSave() {
  const inputs = document.querySelectorAll('#form-page input, #form-page select, #form-page textarea');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      clearTimeout(draftTimer);
      draftTimer = setTimeout(saveDraft, 2000);
    });
    input.addEventListener('change', () => {
      clearTimeout(draftTimer);
      draftTimer = setTimeout(saveDraft, 2000);
    });
  });
}

// --- 7. 3-Step Form Navigation ---
function showStep(stepNum) {
  currentStep = stepNum;
  
  // Hide all steps
  for (let i = 1; i <= totalSteps; i++) {
    const section = document.getElementById(`form-section-${i}`);
    if (section) {
      if (i === currentStep) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    }
  }
  
  updateProgress();
  
  // Toggle buttons
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  const submitBtn = document.getElementById('btn-submit');
  
  if (prevBtn) {
    if (currentStep === 1) prevBtn.classList.add('hidden');
    else prevBtn.classList.remove('hidden');
  }
  if (nextBtn) {
    if (currentStep === totalSteps) nextBtn.classList.add('hidden');
    else nextBtn.classList.remove('hidden');
  }
  if (submitBtn) {
    if (currentStep === totalSteps) submitBtn.classList.remove('hidden');
    else submitBtn.classList.add('hidden');
  }
  
  const formPage = document.getElementById('form-page');
  if (formPage) {
    formPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function nextStep() {
  if (validateStep(currentStep)) {
    if (currentStep < totalSteps) {
      showStep(currentStep + 1);
    }
  }
}

function prevStep() {
  if (currentStep > 1) {
    showStep(currentStep - 1);
  }
}

function updateProgress() {
  const progressFill = document.getElementById('progress-fill');
  if (progressFill) {
    const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressFill.style.width = `${percentage}%`;
  }
  
  for (let i = 1; i <= totalSteps; i++) {
    const dot = document.getElementById(`step-dot-${i}`);
    const label = document.getElementById(`step-label-${i}`);
    if (dot) {
      if (i < currentStep) {
        dot.className = "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-emerald-500 shadow-md transition-colors";
        dot.innerHTML = '<i class="fa-solid fa-check"></i>';
        if (label) label.className = "text-xs font-semibold text-emerald-600";
      } else if (i === currentStep) {
        dot.className = "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-primary-600 shadow-md ring-4 ring-primary-100 transition-colors";
        dot.textContent = i;
        if (label) label.className = "text-xs font-semibold text-primary-600";
      } else {
        dot.className = "w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-400 bg-slate-100 transition-colors";
        dot.textContent = i;
        if (label) label.className = "text-xs font-medium text-slate-500";
      }
    }
  }
}

// --- 8. Form Validation ---
function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  let errorEl = el.nextElementSibling;
  if (!errorEl || !errorEl.classList.contains('error-msg')) {
    errorEl = document.createElement('div');
    errorEl.className = 'error-msg text-red-500 text-sm mt-1 flex items-center gap-1';
    el.parentNode.insertBefore(errorEl, el.nextSibling);
  }
  errorEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
  
  if (el.tagName !== 'DIV') {
    el.classList.add('border-red-500');
  }
}

function clearErrors() {
  const errorMsgs = document.querySelectorAll('.error-msg');
  errorMsgs.forEach(msg => msg.remove());
  
  const errorInputs = document.querySelectorAll('.border-red-500');
  errorInputs.forEach(input => input.classList.remove('border-red-500'));
}

function validateStep(step) {
  clearErrors();
  let isValid = true;
  
  if (step === 1) {
    const category = document.querySelector('input[name="category"]:checked');
    if (!category) {
      showError('category-group', 'กรุณาเลือกหมวดหมู่เรื่องร้องเรียน');
      isValid = false;
    }
    
    const subject = document.getElementById('subject');
    if (subject && !subject.value.trim()) {
      showError('subject', 'กรุณากรอกหัวข้อเรื่อง');
      isValid = false;
    }
    
    const details = document.getElementById('details');
    if (details && !details.value.trim()) {
      showError('details', 'กรุณากรอกรายละเอียดเรื่องร้องเรียน');
      isValid = false;
    }
  } else if (step === 2) {
    const campus = document.getElementById('campus');
    if (campus && !campus.value) {
      showError('campus', 'กรุณาเลือกวิทยาเขต');
      isValid = false;
    }
    
    const building = document.getElementById('building');
    if (building && !building.value) {
      showError('building', 'กรุณาเลือกอาคาร/หอพัก/สถานที่');
      isValid = false;
    }
    
    const urgency = document.querySelector('input[name="urgency"]:checked');
    if (!urgency) {
      showError('urgency-group', 'กรุณาเลือกระดับความเร่งด่วน');
      isValid = false;
    }
  } else if (step === 3) {
    const identity = document.querySelector('input[name="identity"]:checked');
    if (!identity) {
      showError('identity-group', 'กรุณาเลือกรูปแบบการแสดงตัวตน');
      isValid = false;
    } else {
      if (identity.value === 'ไม่เปิดเผยตัวตน') {
        const pin1 = document.getElementById('pin-1')?.value || '';
        const pin2 = document.getElementById('pin-2')?.value || '';
        const pin3 = document.getElementById('pin-3')?.value || '';
        const pin4 = document.getElementById('pin-4')?.value || '';
        
        if (!pin1 || !pin2 || !pin3 || !pin4) {
          showError('pin-group', 'กรุณาระบุรหัส PIN ให้ครบทั้ง 4 หลัก');
          isValid = false;
        }
      } else if (identity.value === 'เปิดเผยตัวตน') {
        const fullName = document.getElementById('full-name');
        if (fullName && !fullName.value.trim()) {
          showError('full-name', 'กรุณาระบุชื่อ-นามสกุล');
          isValid = false;
        }
      }
    }
  }
  
  return isValid;
}

// --- 9. Identity Conditional Fields ---
function handleIdentityChange() {
  const identity = document.querySelector('input[name="identity"]:checked');
  if (!identity) return;
  
  const anonymousFields = document.getElementById('anonymous-fields');
  const revealFields = document.getElementById('reveal-fields');
  
  if (anonymousFields && revealFields) {
    if (identity.value === 'ไม่เปิดเผยตัวตน') {
      anonymousFields.classList.remove('hidden');
      revealFields.classList.add('hidden');
    } else {
      revealFields.classList.remove('hidden');
      anonymousFields.classList.add('hidden');
    }
  }
}

// --- 10. PIN Input Auto-Advance ---
function setupPinInputs() {
  const pinInputGroups = [
    ['pin-1', 'pin-2', 'pin-3', 'pin-4'],
    ['track-pin-1', 'track-pin-2', 'track-pin-3', 'track-pin-4']
  ];
  
  pinInputGroups.forEach(group => {
    group.forEach((id, index) => {
      const el = document.getElementById(id);
      if (!el) return;
      
      el.addEventListener('input', (e) => {
        el.value = el.value.replace(/[^0-9]/g, '').slice(0, 1);
        if (el.value.length === 1 && index < group.length - 1) {
          document.getElementById(group[index + 1]).focus();
        }
      });
      
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && el.value === '' && index > 0) {
          document.getElementById(group[index - 1]).focus();
        }
      });
    });
  });
}

// --- 11. File Upload ---
function setupFileUpload() {
  const uploadArea = document.getElementById('file-upload-area');
  const fileInput = document.getElementById('file-input') || document.getElementById('file-upload');
  if (!uploadArea || !fileInput) return;
  
  uploadArea.addEventListener('click', () => fileInput.click());
  
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('border-primary-500', 'bg-primary-50');
  });
  
  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('border-primary-500', 'bg-primary-50');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('border-primary-500', 'bg-primary-50');
    if (e.dataTransfer && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  });
  
  fileInput.addEventListener('change', (e) => {
    if (e.target && e.target.files) {
      handleFiles(e.target.files);
      fileInput.value = ''; // Reset input
    }
  });
}

async function handleFiles(files) {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const maxFiles = 5;
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  for (let file of files) {
    if (uploadedFiles.length >= maxFiles) {
      showToast(`อัพโหลดได้สูงสุด ${maxFiles} ไฟล์เท่านั้น`);
      break;
    }
    
    if (!allowedTypes.includes(file.type)) {
      showToast(`ไม่รองรับไฟล์ ${file.name}`);
      continue;
    }
    
    if (file.size > maxSize) {
      showToast(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 10MB`);
      continue;
    }
    
    try {
      let data = await fileToBase64(file);
      if (file.type.startsWith('image/')) {
        data = await compressImage(file);
      }
      
      uploadedFiles.push({
        name: file.name,
        type: file.type,
        data: data.split(',')[1] // Get base64 without prefix
      });
      
      renderFileList();
    } catch (e) {
      console.error('File processing error', e);
      showToast(`เกิดข้อผิดพลาดในการประมวลผลไฟล์ ${file.name}`);
    }
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function compressImage(file, maxWidth = 1000, maxHeight = 1000, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

function renderFileList() {
  const container = document.getElementById('file-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  uploadedFiles.forEach((file, index) => {
    const div = document.createElement('div');
    div.className = 'flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-primary-300 transition-all';
    
    let icon = '📄';
    if (file.type.startsWith('image/')) icon = '🖼️';
    
    div.innerHTML = `
      <div class="flex items-center gap-3 overflow-hidden">
        <span class="text-xl">${icon}</span>
        <div class="flex flex-col min-w-0">
          <span class="truncate text-sm font-medium text-slate-800">${file.name}</span>
          <span class="text-xs text-emerald-600 font-medium">✓ แนบไฟล์เรียบร้อย</span>
        </div>
      </div>
      <button type="button" class="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer" onclick="removeFile(${index})" title="ลบไฟล์">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    container.appendChild(div);
  });
}

window.removeFile = function(index) {
  uploadedFiles.splice(index, 1);
  renderFileList();
}

// --- 12. Character Counter ---
function updateCharCount() {
  const details = document.getElementById('details');
  const count = document.getElementById('char-count');
  if (details && count) {
    let val = details.value;
    if (val.length > 2000) {
      details.value = val.slice(0, 2000);
      val = details.value;
    }
    count.textContent = `${val.length}/2000`;
  }
}

// --- 13. PIN Hashing ---
async function hashPIN(pin) {
  const pinStr = (pin || '').toString().trim();
  try {
    if (window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(pinStr);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('crypto.subtle failed, using fallback', e);
  }
  // Simple deterministic fallback for non-crypto contexts
  let hash = 0;
  for (let i = 0; i < pinStr.length; i++) {
    const char = pinStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'fallback_' + Math.abs(hash).toString(16);
}

// --- 14. Form Submission ---
async function submitForm() {
  if (!validateStep(3)) return;
  
  const submitBtn = document.getElementById('btn-submit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'กำลังส่งข้อมูล... ⏳';
  }
  
  try {
    const category = document.querySelector('input[name="category"]:checked').value;
    const departmentDisplay = document.getElementById('department-display');
    const mappedDepartment = departmentDisplay ? (departmentDisplay.dataset.dept || '') : '';
    const subject = document.getElementById('subject').value;
    const details = document.getElementById('details').value;
    const campus = document.getElementById('campus').value;
    
    let buildingText = document.getElementById('building').value;
    const floorArea = document.getElementById('floor-area')?.value;
    const landmark = document.getElementById('landmark')?.value;
    if (floorArea) buildingText += ' / ' + floorArea;
    if (landmark) buildingText += ' (' + landmark + ')';
    
    const urgency = document.querySelector('input[name="urgency"]:checked')?.value || 'ปกติ';
    const identity = document.querySelector('input[name="identity"]:checked').value;
    
    const fullName = document.getElementById('full-name')?.value.trim() || '';
    const contactInfo = document.getElementById('contact-info')?.value.trim() || '';
    const anonContact = document.getElementById('anon-contact')?.value.trim() || '';
    const finalContact = identity === 'เปิดเผยตัวตน' 
      ? (contactInfo || '-') 
      : (anonContact || '-');
    
    let pinHashValue = '';
    if (identity === 'ไม่เปิดเผยตัวตน') {
      const pin1 = document.getElementById('pin-1').value;
      const pin2 = document.getElementById('pin-2').value;
      const pin3 = document.getElementById('pin-3').value;
      const pin4 = document.getElementById('pin-4').value;
      pinHashValue = await hashPIN(pin1 + pin2 + pin3 + pin4);
    }
    
    const date = new Date();
    const yyyymmdd = date.getFullYear().toString() + (date.getMonth() + 1).toString().padStart(2, '0') + date.getDate().toString().padStart(2, '0');
    const random4digits = Math.floor(1000 + Math.random() * 9000).toString();
    const refNum = `REF-${yyyymmdd}-${random4digits}`;
    
    const formData = {
      ref_code: refNum,
      category: category,
      department: mappedDepartment,
      title: subject,
      description: details,
      location_campus: campus,
      location_building: buildingText,
      urgency_level: urgency,
      is_anonymous: identity,
      contact_name: identity === 'เปิดเผยตัวตน' ? (fullName || 'ไม่ระบุชื่อ') : 'ไม่เปิดเผย',
      contact_info: finalContact,
      pin_hash: pinHashValue,
      fileData: uploadedFiles
    };
    
    // Fallback save
    localStorage.setItem(`backup_${refNum}`, JSON.stringify(formData));
    
    // Post data
    let response;
    try {
      response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
    } catch(err) {
      console.warn("CORS failed, trying no-cors", err);
      response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
    }
    
    showPage('success-page');
    document.getElementById('ref-number').textContent = refNum;
    
    clearDraft();
    
    const pinReminder = document.getElementById('pin-reminder');
    if (pinReminder) {
      if (identity === 'ไม่เปิดเผยตัวตน') {
        pinReminder.classList.remove('hidden');
      } else {
        pinReminder.classList.add('hidden');
      }
    }
    
  } catch (error) {
    console.error('Submission error', error);
    showToast('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'ส่งเรื่องร้องเรียน 📤';
    }
  }
}

// --- 15. Success Page Actions ---
function copyRefNumber() {
  const refNum = document.getElementById('ref-number').textContent;
  navigator.clipboard.writeText(refNum).then(() => {
    showToast('คัดลอกหมายเลขอ้างอิงแล้ว');
  });
}

function copyTrackingLink() {
  const refNum = document.getElementById('ref-number').textContent;
  const link = `${window.location.origin}${window.location.pathname}?ref=${refNum}`;
  navigator.clipboard.writeText(link).then(() => {
    showToast('คัดลอกลิงก์สำหรับติดตามสถานะแล้ว');
  });
}

function saveCardAsImage() {
  const card = document.getElementById('ref-card');
  if (!card) return;
  
  if (typeof html2canvas !== 'undefined') {
    html2canvas(card, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
      const link = document.createElement('a');
      link.download = `PSU-StudentVoice-${document.getElementById('ref-number').textContent}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  } else {
    showToast('ไม่สามารถบันทึกรูปภาพได้ (ไม่พบไลบรารี html2canvas)');
  }
}

// --- 16. Tracking Page ---
async function lookupTracking() {
  const refInput = document.getElementById('track-ref-input');
  const refId = refInput ? refInput.value.trim().toUpperCase() : '';
  const pin1 = document.getElementById('track-pin-1')?.value || '';
  const pin2 = document.getElementById('track-pin-2')?.value || '';
  const pin3 = document.getElementById('track-pin-3')?.value || '';
  const pin4 = document.getElementById('track-pin-4')?.value || '';
  
  if (!refId) {
    showToast('กรุณาระบุหมายเลขอ้างอิง');
    return;
  }
  
  const searchBtn = document.querySelector('#tracking-page button[onclick="lookupTracking()"]');
  if (searchBtn) {
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> กำลังค้นหา...';
  }
  
  try {
    const pin = (pin1 + pin2 + pin3 + pin4).trim();
    const pinHash = pin.length === 4 ? await hashPIN(pin) : '';
    
    const res = await fetch(`${APPS_SCRIPT_URL}?action=lookup&refId=${encodeURIComponent(refId)}&pinHash=${encodeURIComponent(pinHash)}&t=${Date.now()}`);
    const data = await res.json();
    
    const trackResult = document.getElementById('track-result');
    
    if ((data.success || data.status === 'success') && data.data) {
      const d = data.data;
      
      let html = `<div class="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-100">`;
      html += `<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-4 border-b">
                 <div>
                   <span class="text-xs font-bold text-primary-600 uppercase tracking-widest">สถานะการร้องเรียน</span>
                   <h3 class="text-2xl font-black text-slate-800">${d.ref_code || refId}</h3>
                 </div>
                 <div class="text-xs text-slate-400">แจ้งเมื่อ: ${d.created_at || '-'}</div>
               </div>`;
      
      let daysPassed = 0;
      if (d.days_passed !== undefined && d.days_passed !== '-') {
        daysPassed = parseInt(d.days_passed, 10) || 0;
      }
      
      let badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      if (daysPassed > 3 && daysPassed <= 7) badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
      else if (daysPassed > 7) badgeClass = 'bg-rose-100 text-rose-800 border-rose-200';
      
      if (d.status !== 'เสร็จสิ้น') {
        html += `<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${badgeClass} mb-6">
                   <i class="fa-regular fa-clock"></i> <span>รอดำเนินการมาแล้ว ${daysPassed} วัน</span>
                 </div>`;
      }
      
      // Timeline Stepper
      const statusList = ['รับเรื่องแล้ว', 'กำลังดำเนินการ', 'เสร็จสิ้น'];
      let activeIndex = 0;
      if (d.status === 'กำลังดำเนินการ') activeIndex = 1;
      else if (d.status === 'เสร็จสิ้น') activeIndex = 2;
      
      html += `<div class="mb-8">
                 <div class="flex justify-between items-center relative z-10">`;
                 
      statusList.forEach((s, idx) => {
        const isActive = idx <= activeIndex;
        const isCurrent = idx === activeIndex;
        html += `
          <div class="flex flex-col items-center">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-white ${isActive ? 'bg-primary-600 shadow-md' : 'bg-slate-200 text-slate-400'} ${isCurrent ? 'ring-4 ring-primary-100' : ''} mb-2 text-xs font-bold transition-all">
              ${isActive ? '<i class="fa-solid fa-check"></i>' : (idx + 1)}
            </div>
            <span class="text-xs font-semibold ${isActive ? 'text-primary-600' : 'text-slate-400'}">${s}</span>
          </div>
        `;
      });
      html += `  </div>
               </div>`;
      
      html += `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
          <div><span class="text-slate-500">หมวดหมู่:</span> <span class="font-semibold text-slate-800">${d.category || '-'}</span></div>
          <div><span class="text-slate-500">หัวข้อ:</span> <span class="font-semibold text-slate-800">${d.title || '-'}</span></div>
          <div><span class="text-slate-500">สถานที่:</span> <span class="font-semibold text-slate-800">${d.location_campus || ''} ${d.location_building ? '- ' + d.location_building : ''}</span></div>
          <div><span class="text-slate-500">ความเร่งด่วน:</span> <span class="font-semibold text-slate-800">${d.urgency_level || '-'}</span></div>
          ${d.description ? `<div class="col-span-full pt-2 border-t border-slate-200"><span class="text-slate-500 block mb-1">รายละเอียด:</span> <p class="text-slate-700 whitespace-pre-wrap">${d.description}</p></div>` : ''}
        </div>
      `;
      
      if (d.admin_reply) {
        html += `
          <div class="bg-primary-50 border-l-4 border-primary-500 p-4 mb-6 rounded-r-xl">
            <h4 class="font-bold text-primary-900 mb-1 flex items-center gap-2">
              <i class="fa-solid fa-comment-dots text-primary-600"></i> ข้อความตอบกลับจากเจ้าหน้าที่:
            </h4>
            <p class="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">${d.admin_reply}</p>
          </div>
        `;
      }
      
      // Attachments
      const attachments = d.attachment_url ? d.attachment_url.split(',').map(u => u.trim()).filter(Boolean) : [];
      if (attachments.length > 0) {
        html += `<div class="mb-6">
                   <h4 class="font-bold text-sm text-slate-700 mb-2">ไฟล์หลักฐานแนบ:</h4>
                   <div class="flex flex-wrap gap-2">`;
        attachments.forEach((url, i) => {
          html += `<a href="${url}" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-primary-700 rounded-lg text-xs font-medium transition-colors">
                     <i class="fa-solid fa-arrow-up-right-from-square"></i> ดูไฟล์แนบที่ ${i + 1}
                   </a>`;
        });
        html += `   </div>
                 </div>`;
      }
      
      if (d.status === 'เสร็จสิ้น') {
        html += `
          <div id="rating-section" class="mt-8 border-t border-slate-200 pt-6 text-center">
            <h4 class="font-bold text-slate-800 mb-3">กรุณาประเมินความพึงพอใจการแก้ปัญหา</h4>
            <div class="flex justify-center gap-2 mb-5 text-3xl">
              ${[1,2,3,4,5].map(i => `<button onclick="selectRating(${i})" class="rating-star hover:scale-125 transition-transform cursor-pointer" data-val="${i}">⭐</button>`).join('')}
            </div>
            <div class="flex flex-col sm:flex-row justify-center gap-3">
              <button onclick="submitRating(true, '${d.ref_code}')" class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer">✅ แก้ไขเรียบร้อยแล้ว</button>
              <button onclick="submitRating(false, '${d.ref_code}')" class="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-all shadow-md shadow-rose-500/20 cursor-pointer">❌ ปัญหายังไม่ได้รับการแก้ไข</button>
            </div>
          </div>
        `;
      }
      
      html += `</div>`;
      trackResult.innerHTML = html;
      trackResult.classList.remove('hidden');
    } else {
      const errorMsg = data.error === 'Invalid PIN' 
        ? '⚠️ รหัส PIN 4 หลักไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' 
        : (data.error === 'Not found' ? '⚠️ ไม่พบข้อมูลหมายเลขอ้างอิงนี้' : (data.error || 'ไม่พบข้อมูล หรือรหัส PIN ไม่ถูกต้อง'));
      showToast(errorMsg);
      trackResult.classList.add('hidden');
    }
  } catch (error) {
    console.error(error);
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
  } finally {
    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.innerHTML = 'ค้นหาสถานะ';
    }
  }
}

let currentRating = 0;
window.selectRating = function(val) {
  currentRating = val;
  const stars = document.querySelectorAll('.rating-star');
  stars.forEach(star => {
    if (parseInt(star.dataset.val) <= val) {
      star.style.filter = 'grayscale(0%)';
      star.style.opacity = '1';
    } else {
      star.style.filter = 'grayscale(100%)';
      star.style.opacity = '0.4';
    }
  });
}

window.submitRating = async function(resolved, refCode) {
  if (currentRating === 0) {
    showToast('กรุณาเลือกดาวประเมินความพึงพอใจ');
    return;
  }
  try {
    // Fire and forget rating to apps script
    fetch(`${APPS_SCRIPT_URL}?action=rate&refId=${refCode}&rating=${currentRating}&resolved=${resolved}`, { mode: 'no-cors' });
    const ratingSection = document.getElementById('rating-section');
    if (ratingSection) {
      ratingSection.innerHTML = '<div class="text-green-600 font-bold text-lg">ขอบคุณสำหรับการประเมิน! 🎉</div>';
    }
    showToast('ส่งผลประเมินเรียบร้อยแล้ว');
  } catch(e) {
    showToast('ส่งผลประเมินเรียบร้อยแล้ว (ออฟไลน์)');
  }
}

// --- 17. Intro Page Status Lookup ---
async function lookupStatus() {
  const refInput = document.getElementById('ref-input') || document.getElementById('quick-track-input');
  const refId = refInput ? refInput.value.trim().toUpperCase() : '';
  if (!refId) {
    showToast('กรุณาระบุหมายเลขอ้างอิง');
    return;
  }
  
  const searchBtn = document.querySelector('#intro-page button[onclick="lookupStatus()"]');
  if (searchBtn) {
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ค้นหา...';
  }
  
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=lookup&refId=${encodeURIComponent(refId)}`);
    const result = await res.json();
    
    if (result.success && result.data) {
      document.getElementById('track-ref-input').value = refId;
      showPage('tracking-page');
      lookupTracking();
    } else {
      showToast(result.message || 'ไม่พบข้อมูลหมายเลขอ้างอิงนี้');
    }
  } catch (error) {
    console.error(error);
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ');
  } finally {
    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.innerHTML = 'ค้นหาสถานะ';
    }
  }
}

// --- 18. Live Stats Loading ---
async function loadLiveStats() {
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=stats&t=${Date.now()}`);
    const result = await res.json();
    
    if (result.success && result.data) {
      const stats = result.data;
      const elTotal = document.getElementById('stat-total');
      const elDone = document.getElementById('stat-done');
      
      if (elTotal) elTotal.setAttribute('data-count', stats.total || 0);
      if (elDone) elDone.setAttribute('data-count', stats.done || 0);
      
      animateCounters();
      
      const storiesGrid = document.getElementById('stories-grid');
      if (storiesGrid) {
        if (stats.recentResolved && stats.recentResolved.length > 0) {
          storiesGrid.innerHTML = '';
          stats.recentResolved.forEach(item => {
            storiesGrid.innerHTML += `
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-2">
                  <span class="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">✅ แก้ไขแล้ว</span>
                  <span class="text-xs text-slate-400">${item.date || '-'}</span>
                </div>
                <h4 class="font-bold text-slate-800 text-base mb-1 line-clamp-1">${item.subject || item.title || '-'}</h4>
                <p class="text-xs text-slate-500">หมายเลขอ้างอิง: ${item.id || item.ref_code || '-'}</p>
              </div>
            `;
          });
        } else {
          storiesGrid.innerHTML = `
            <div class="col-span-full text-center py-8 text-slate-400 bg-white rounded-2xl border border-slate-100">
              <i class="fa-solid fa-sparkles text-2xl mb-2 text-slate-300"></i>
              <p>ยินดีต้อนรับสู่ระบบ PSU Student Voice — กำลังเปิดรับเรื่องร้องเรียนและข้อเสนอแนะ</p>
            </div>
          `;
        }
      }
    }
  } catch (error) {
    console.error('Failed to load stats', error);
  }
}

function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-count'), 10) || 0;
    if (target === 0) {
      counter.innerText = '0';
      return;
    }
    const duration = 1500;
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.innerText = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.innerText = target;
      }
    }
    requestAnimationFrame(update);
  });
}

// --- 19. Toast Notifications ---
function showToast(message, duration = 3000) {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-notification fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 transition-all duration-300 opacity-0 translate-y-4';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.classList.remove('opacity-0', 'translate-y-4'); });
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// --- 20. URL Auto-Lookup ---
function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) {
    const trackInput = document.getElementById('track-ref-input');
    if (trackInput) {
      trackInput.value = ref;
      showPage('tracking-page');
    }
  }
}

// --- 21. Form Reset ---
function resetForm() {
  const inputs = document.querySelectorAll('#form-page input[type="text"], #form-page input[type="password"], #form-page textarea');
  inputs.forEach(input => input.value = '');
  
  const selects = document.querySelectorAll('#form-page select');
  selects.forEach(select => select.selectedIndex = 0);
  const campusSelect = document.getElementById('campus');
  if (campusSelect) campusSelect.value = 'วิทยาเขตหาดใหญ่';
  handleCampusChange();
  
  const defaultCategory = document.querySelector('input[name="category"]');
  if (defaultCategory) defaultCategory.checked = true;
  
  const defaultIdentity = document.querySelector('input[name="identity"]');
  if (defaultIdentity) defaultIdentity.checked = true;
  
  uploadedFiles = [];
  renderFileList();
  
  const deptDisplay = document.getElementById('department-display');
  if (deptDisplay) deptDisplay.classList.add('hidden');
  
  handleIdentityChange();
  
  clearDraft();
  clearErrors();
  showStep(1);
  showPage('form-page');
}

// --- 22. Language Toggle (Simple) ---
function toggleLanguage() {
  showToast('Language switching coming soon / ระบบเปลี่ยนภาษากำลังพัฒนา');
}

// --- 23. DOMContentLoaded Handler ---
document.addEventListener('DOMContentLoaded', () => {
  checkPDPA();
  initParticles();
  loadLiveStats();
  
  const pdpaCheckbox = document.getElementById('pdpa-checkbox');
  const pdpaBtn = document.getElementById('pdpa-accept-btn');
  if (pdpaCheckbox && pdpaBtn) {
    pdpaCheckbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      pdpaBtn.disabled = !isChecked;
      if (isChecked) {
        pdpaBtn.className = "w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 cursor-pointer transition-all";
      } else {
        pdpaBtn.className = "w-full py-4 bg-slate-200 text-slate-400 font-bold rounded-xl cursor-not-allowed transition-all";
      }
    });
  }
  
  const categoryRadios = document.querySelectorAll('input[name="category"]');
  categoryRadios.forEach(radio => radio.addEventListener('change', handleCategoryChange));
  
  const campusSelect = document.getElementById('campus');
  if (campusSelect) {
    campusSelect.value = 'วิทยาเขตหาดใหญ่';
    campusSelect.addEventListener('change', handleCampusChange);
  }
  handleCampusChange();
  
  const identityRadios = document.querySelectorAll('input[name="identity"]');
  identityRadios.forEach(radio => radio.addEventListener('change', handleIdentityChange));
  
  const detailsInput = document.getElementById('details');
  if (detailsInput) {
    detailsInput.addEventListener('input', updateCharCount);
  }
  
  setupPinInputs();
  setupFileUpload();
  setupDraftAutoSave();
  restoreDraft();
  checkUrlParams();
  
  window.acceptPDPA = acceptPDPA;
  window.showPage = showPage;
  window.nextStep = nextStep;
  window.prevStep = prevStep;
  window.submitForm = submitForm;
  window.copyRefNumber = copyRefNumber;
  window.copyTrackingLink = copyTrackingLink;
  window.saveCardAsImage = saveCardAsImage;
  window.lookupTracking = lookupTracking;
  window.lookupStatus = lookupStatus;
  window.resetForm = resetForm;
  window.toggleLanguage = toggleLanguage;
});
