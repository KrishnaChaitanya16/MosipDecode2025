(() => {
  const apiBase = localStorage.getItem('apiBase') || 'http://localhost:8000';

  const uploadForm = document.getElementById('upload-form');
  const documentInput = document.getElementById('document');
  const dropzone = document.getElementById('dropzone');
  const fileLabel = document.getElementById('file-label');
  const extractProgress = document.getElementById('extract-progress');
  const extractedSection = document.getElementById('extracted-section');
  const fieldsForm = document.getElementById('fields-form');
  const dynamicFields = document.getElementById('dynamic-fields');
  const rawTextEl = document.getElementById('raw-text');
  const verifyBtn = document.getElementById('verify-btn');
  const verifySection = document.getElementById('verify-section');
  const verifyProgress = document.getElementById('verify-progress');
  const verificationResults = document.getElementById('verification-results');
  const resetBtn = document.getElementById('reset-btn');
  const templateSelect = document.getElementById('template-select');
  const modeSelect = document.getElementById('mode-select');
  const docSource = document.getElementById('doc-source');
  const urlWrapper = document.getElementById('url-wrapper');
  const documentUrl = document.getElementById('document-url');

  // Dynamic inputs will be created; keep ids for known fields
  let nameInput, dobInput, idInput, emailInput, phoneInput;

  let lastUploadedFile = null;

  function setHidden(el, hidden) { el.hidden = hidden; }
  function toast(message) { alert(message); }

  const TEMPLATES = {
    contact: [
      { id: 'name', label: 'Name', placeholder: 'Full name' },
      { id: 'email', label: 'Email', placeholder: 'name@example.com' },
      { id: 'phone', label: 'Phone Number', placeholder: '+1 234 567 8901' },
    ],
    id: [
      { id: 'name', label: 'Name', placeholder: 'Full name' },
      { id: 'dob', label: 'Date of Birth', placeholder: 'YYYY-MM-DD' },
      { id: 'id_number', label: 'ID Number', placeholder: 'ID number' },
    ],
    certificate: [
      { id: 'name', label: 'Name', placeholder: 'Full name' },
      { id: 'dob', label: 'Date of Birth', placeholder: 'YYYY-MM-DD' },
    ],
  };

  function renderTemplateFields(templateId) {
    dynamicFields.innerHTML = '';
    const fields = TEMPLATES[templateId] || [];
    fields.forEach(f => {
      const label = document.createElement('label');
      label.innerHTML = `
        <span>${f.label}</span>
        <input type="text" id="${f.id}" name="${f.id}" placeholder="${f.placeholder || ''}" />
      `;
      dynamicFields.appendChild(label);
    });
    // Re-bind inputs
    nameInput = document.getElementById('name');
    dobInput = document.getElementById('dob');
    idInput = document.getElementById('id_number');
    emailInput = document.getElementById('email');
    phoneInput = document.getElementById('phone');
  }

  // Initialize default template
  renderTemplateFields(templateSelect.value);
  templateSelect.addEventListener('change', () => {
    renderTemplateFields(templateSelect.value);
  });

  // Mode: extract vs compare (UI tweaks only; backend flows are same verify step)
  modeSelect.addEventListener('change', () => {
    const isExtract = modeSelect.value === 'extract';
    // In compare mode, we still need a document to compare against.
    // We just skip showing raw text until user verifies.
    setHidden(extractedSection, !isExtract);
  });

  // Toggle URL vs file input visibility
  docSource.addEventListener('change', () => {
    const useUrl = docSource.value === 'url';
    urlWrapper.hidden = !useUrl;
    dropzone.style.display = useUrl ? 'none' : 'grid';
  });

  // Ensure extraction only runs when clicking the button (form submit)
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Support two sources: file upload or remote URL (download client-side then send)
    let file = documentInput.files[0];
    if (docSource.value === 'url') {
      const url = documentUrl.value?.trim();
      if (!url) { toast('Please enter a document URL.'); return; }
      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Failed to fetch document (${resp.status})`);
        const blob = await resp.blob();
        // Try to infer filename from URL
        const name = url.split('/').pop()?.split('?')[0] || 'document';
        file = new File([blob], name, { type: blob.type || 'application/octet-stream' });
        documentInput.value = '';
        fileLabel.textContent = name;
      } catch (err) {
        console.error(err);
        toast(err.message || 'Could not fetch document');
        return;
      }
    }
    if (!file) { toast('Please select a file.'); return; }
    lastUploadedFile = file;

    const formData = new FormData();
    formData.append('document', file);

    setHidden(extractProgress, false);
    try {
      const res = await fetch(`${apiBase}/extract`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Extraction failed (${res.status})`);
      const data = await res.json();
      const { raw_text, mapped_fields } = data;

      rawTextEl.textContent = raw_text || '';
      if (nameInput) nameInput.value = mapped_fields?.name || '';
      if (dobInput) dobInput.value = mapped_fields?.dob || '';
      if (idInput) idInput.value = mapped_fields?.id_number || '';
      // Prefill contact fields from raw text if present
      if (emailInput) emailInput.value = (extractEmail(raw_text) || '');
      if (phoneInput) phoneInput.value = (extractPhone(raw_text) || '');

      setHidden(extractedSection, false);
      setHidden(verifySection, true);
    } catch (err) {
      console.error(err);
      toast(err.message || 'Extraction error');
    } finally {
      setHidden(extractProgress, true);
    }
  });

  verifyBtn.addEventListener('click', async () => {
    if (!lastUploadedFile) { toast('Upload and extract first.'); return; }
    const formData = new FormData();
    formData.append('document', lastUploadedFile);
    // Only send fields supported by backend: name, dob, id_number
    if (nameInput) formData.append('name', nameInput.value || '');
    if (dobInput) formData.append('dob', dobInput.value || '');
    if (idInput) formData.append('id_number', idInput.value || '');

    setHidden(verifyProgress, false);
    try {
      const res = await fetch(`${apiBase}/verify`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Verification failed (${res.status})`);
      const data = await res.json();
      const result = data.verification || {};
      // Merge client-only fields (email/phone) as NOT_VERIFIED
      const augmented = { ...result };
      if (emailInput && emailInput.value) {
        augmented.email = { submitted: emailInput.value, extracted: null, status: 'NOT_VERIFIED', confidence: 0 };
      }
      if (phoneInput && phoneInput.value) {
        augmented.phone = { submitted: phoneInput.value, extracted: null, status: 'NOT_VERIFIED', confidence: 0 };
      }
      renderVerification(augmented);
      setHidden(verifySection, false);
    } catch (err) {
      console.error(err);
      toast(err.message || 'Verification error');
    } finally {
      setHidden(verifyProgress, true);
    }
  });

  resetBtn.addEventListener('click', () => {
    uploadForm.reset();
    fieldsForm.reset();
    rawTextEl.textContent = '';
    verificationResults.innerHTML = '';
    lastUploadedFile = null;
    setHidden(extractedSection, true);
    setHidden(verifySection, true);
  });

  function renderVerification(result) {
    const entries = Object.entries(result);
    if (entries.length === 0) {
      verificationResults.innerHTML = `<div class="help">No fields submitted for verification.</div>`;
      return;
    }

    verificationResults.innerHTML = '';
    entries.forEach(([field, info]) => {
      const status = (info.status || '').toUpperCase();
      const cls = status === 'MATCH' ? 'ok' : (status === 'MISMATCH' ? 'mismatch' : 'unknown');
      const row = document.createElement('div');
      row.className = 'verify-item';
      row.innerHTML = `
        <div><strong>${field}</strong></div>
        <div title="submitted"><small>Submitted</small><div>${escapeHtml(info.submitted ?? '')}</div></div>
        <div title="extracted"><small>Extracted</small><div>${escapeHtml(info.extracted ?? '')}</div></div>
        <div class="status ${cls}">${status || 'UNKNOWN'}</div>
        <div><strong>${(info.confidence ?? 0).toFixed(2)}</strong></div>
      `;
      verificationResults.appendChild(row);
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Drag & drop UX
  ;['dragenter','dragover','dragleave','drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); });
  });
  ;['dragenter','dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => dropzone.classList.add('active'));
  });
  ;['dragleave','drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => dropzone.classList.remove('active'));
  });
  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files[0]) {
      documentInput.files = files;
      fileLabel.textContent = files[0].name;
    }
  });
  documentInput.addEventListener('change', () => {
    const file = documentInput.files[0];
    fileLabel.textContent = file ? file.name : 'Drag & drop or click to select a PDF/Image';
  });

  function extractEmail(text) {
    if (!text) return '';
    const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    return match ? match[0] : '';
  }
  function extractPhone(text) {
    if (!text) return '';
    const match = text.match(/\+?\d[\d\s().-]{7,}\d/);
    return match ? match[0].trim() : '';
  }
})();


