import { CONFIG } from './config.js';

const state = {
  step: 1,
  zip: '',
  service: null,
  date: '',
  slot: null,
  customer: {
    name: '',
    phone: '',
    address: '',
    email: '',
    notes: ''
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Expose globally for direct inline fallback execution
window.handleZipCheck = handleZipCheck;

function initApp() {
  renderServices();
  setupEventListeners();
  setupFAQAccordion();
  updateStepUI();
}

function setupFAQAccordion() {
  document.querySelectorAll('.faq-q').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        const answer = i.querySelector('.faq-a');
        if (answer) answer.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        const answer = item.querySelector('.faq-a');
        if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

function setupEventListeners() {
  // Step 1: ZIP Check
  const zipInput = document.getElementById('zipInput');
  const zipBtn = document.getElementById('zipSubmitBtn');
  
  if (zipBtn) {
    zipBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleZipCheck();
    });
  }
  if (zipInput) {
    zipInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleZipCheck();
      }
    });
  }

  // Back Buttons
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.step > 1) {
        state.step--;
        updateStepUI();
      }
    });
  });

  // Step 3: Date Picker Change
  const dateInput = document.getElementById('bookingDate');
  if (dateInput) {
    // Set min date to today, max date to +14 days
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + CONFIG.leadDays);

    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];
    dateInput.value = dateInput.min;
    state.date = dateInput.value;

    dateInput.addEventListener('change', (e) => {
      state.date = e.target.value;
      fetchAndRenderSlots();
    });
  }

  // Step 4: Final Submit
  const confirmBtn = document.getElementById('confirmBookingBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', handleFinalSubmit);
  }
}

function handleZipCheck() {
  const input = document.getElementById('zipInput');
  const errorEl = document.getElementById('zipError');
  const cleanZip = (input.value || '').replace(/\D/g, '').slice(0, 5);

  if (!/^\d{5}$/.test(cleanZip)) {
    showError(errorEl, 'Please enter a valid 5-digit ZIP code.');
    return;
  }

  if (!cleanZip.startsWith('10') && !cleanZip.startsWith('11') && !CONFIG.zips.includes(cleanZip)) {
    showError(errorEl, `Sorry, ${cleanZip} is outside our service area. Contact us at (516) 350-0801 for custom requests!`);
    return;
  }

  hideError(errorEl);
  state.zip = cleanZip;
  state.step = 2;
  updateStepUI();
}

function renderServices() {
  const container = document.getElementById('servicesGrid');
  if (!container) return;

  container.innerHTML = CONFIG.services.map(svc => `
    <div class="service-card" data-id="${svc.id}">
      <div class="svc-icon">${svc.icon}</div>
      <div class="svc-details">
        <div class="svc-title-row">
          <h3>${svc.name}</h3>
          <span class="svc-check">✓</span>
        </div>
        <p class="svc-desc">${svc.desc}</p>
        <div class="svc-meta">
          <span class="svc-duration">⏱️ ~${svc.duration} mins</span>
          <span class="svc-badge">✨ Free On-Site Estimate</span>
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const id = card.getAttribute('data-id');
      state.service = CONFIG.services.find(s => s.id === id);
      
      setTimeout(() => {
        state.step = 3;
        updateStepUI();
        fetchAndRenderSlots();
      }, 150);
    });
  });
}

async function fetchAndRenderSlots() {
  const container = document.getElementById('slotsGrid');
  const loadingEl = document.getElementById('slotsLoading');

  if (!container || !state.service || !state.date) return;

  container.innerHTML = '';
  if (loadingEl) loadingEl.style.display = 'block';

  try {
    const res = await fetch(`/.netlify/functions/availability?date=${state.date}&serviceId=${state.service.id}`);
    const data = await res.json();
    
    if (loadingEl) loadingEl.style.display = 'none';

    const calloutHTML = `
      <div class="custom-time-callout">
        <div class="callout-icon">💬</div>
        <div class="callout-body">
          <strong>Don't see a time slot that fits your schedule?</strong>
          <p>We're happy to accommodate early mornings, evenings, or custom windows!</p>
          <div class="callout-btns">
            <a href="tel:+15163500801" class="btn-callout-phone">📞 Call (516) 350-0801</a>
            <a href="sms:+15163500801" class="btn-callout-sms">💬 Text David</a>
          </div>
        </div>
      </div>
    `;

    if (!res.ok || !data.slots || data.slots.length === 0) {
      container.innerHTML = `<div class="no-slots">No open slots available on ${state.date}. Select another date or contact us below!</div>` + calloutHTML;
      return;
    }

    container.innerHTML = data.slots.map(slot => `
      <button class="slot-pill" data-iso="${slot.iso}" data-label="${slot.label}">
        ${slot.label}
      </button>
    `).join('') + calloutHTML;

    container.querySelectorAll('.slot-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.slot-pill').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.slot = {
          iso: btn.getAttribute('data-iso'),
          label: btn.getAttribute('data-label')
        };

        // Enable proceed button
        const step3Next = document.getElementById('step3NextBtn');
        if (step3Next) {
          step3Next.disabled = false;
          step3Next.onclick = () => {
            state.step = 4;
            updateStepUI();
          };
        }
      });
    });

  } catch (err) {
    if (loadingEl) loadingEl.style.display = 'none';
    container.innerHTML = `<div class="error-msg">Unable to load time slots. Please try again.</div>`;
  }
}

async function handleFinalSubmit() {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const notes = document.getElementById('custNotes').value.trim();
  const submitError = document.getElementById('submitError');

  if (!name || !phone || !address) {
    showError(submitError, 'Please fill in all required fields (Name, Phone, Address).');
    return;
  }

  hideError(submitError);

  const btn = document.getElementById('confirmBookingBtn');
  btn.disabled = true;
  btn.innerHTML = `Confirming Appointment...`;

  try {
    const response = await fetch('/.netlify/functions/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zip: state.zip,
        serviceId: state.service.id,
        durationMinutes: state.service.duration,
        start: state.slot.iso,
        name,
        phone,
        address,
        email,
        notes
      })
    });

    const data = await response.json();

    if (response.status === 409) {
      showError(submitError, data.error || 'This slot was just booked! Please pick a different time.');
      btn.disabled = false;
      btn.innerHTML = `Confirm Appointment`;
      return;
    }

    if (!response.ok) {
      throw new Error(data.error || 'Booking failed');
    }

    // Trigger Instant Email Notification to David (Web3Forms Client-Side API)
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        access_key: "5cd5e45a-9146-4c3a-ac2f-8b2904476cf0",
        subject: `⚡ NEW APPOINTMENT BOOKED #${data.id}`,
        from_name: "Here Handyman Online Booking",
        name: name,
        phone: phone,
        email: email || "Not provided",
        message: `NEW APPOINTMENT CONFIRMED!\n\nBooking ID: ${data.id}\nCustomer: ${name}\nPhone: ${phone}\nAddress: ${address}\nZIP: ${state.zip}\nService: ${state.service.name}\nDate/Time Slot: ${state.date} at ${state.slot.label}\nNotes: ${notes || 'None'}`
      })
    }).catch(err => console.error("Web3Forms email error:", err));

    // Success! Show confirmation screen
    renderConfirmationScreen(data.id, data.start);

  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = `Confirm Appointment`;
    showError(submitError, err.message || 'Error saving appointment. Please try again.');
  }
}

function renderConfirmationScreen(id, startIso) {
  const wizardContainer = document.getElementById('bookingWizard');
  const dateFormatted = new Date(startIso).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  wizardContainer.innerHTML = `
    <div class="confirmation-card">
      <div class="confirm-icon">✅</div>
      <h2>Appointment Confirmed!</h2>
      <p class="confirm-id">Confirmation Code: <strong>${id}</strong></p>

      <div class="summary-box">
        <p><strong>Service:</strong> ${state.service.name}</p>
        <p><strong>Date & Time:</strong> ${dateFormatted} at ${state.slot.label}</p>
        <p><strong>Location:</strong> ${document.getElementById('custAddress').value}, ZIP ${state.zip}</p>
      </div>

      <div class="next-steps">
        <p>🎉 We have received your booking and reserved this slot. David will arrive within the appointment window!</p>
        <a href="https://g.page/r/herehandyman/review" target="_blank" rel="noopener" class="btn-review">⭐ Leave a Google Review</a>
      </div>
    </div>
  `;
}

function updateStepUI() {
  document.querySelectorAll('.wizard-step').forEach((el, idx) => {
    el.style.display = (idx + 1 === state.step) ? 'block' : 'none';
  });

  // Step Indicators in Progress Tracker Bar
  for (let i = 1; i <= 4; i++) {
    const dot = document.getElementById('pd' + i);
    const line = document.getElementById('pl' + i);
    if (!dot) continue;

    if (i < state.step) {
      dot.className = 'prog-dot done';
      if (line) line.className = 'prog-line done';
    } else if (i === state.step) {
      dot.className = 'prog-dot active';
      if (line) line.className = 'prog-line';
    } else {
      dot.className = 'prog-dot';
      if (line) line.className = 'prog-line';
    }
  }

  // Scroll to top of wizard on step change
  const wizard = document.getElementById('bookingWizard');
  if (wizard) {
    wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function showError(el, msg) {
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
}

function hideError(el) {
  if (el) {
    el.style.display = 'none';
  }
}
