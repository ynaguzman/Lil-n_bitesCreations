// PRICING DATA
const PRICES = {
  polaroid: {
    'instax-square': { min: 8, options: [{ qty: 8, price: 60 }, { qty: 20, price: 150 }] },
    'strip-film': { min: 5, options: [{ qty: 5, price: 40 }, { qty: 10, price: 80 }] },
    'mini-photo-strip': { min: 20, options: [{ qty: 20, price: 50 }, { qty: 40, price: 100 }] },
    'photo-booth': { min: 2, options: [{ qty: 4, price: 60 }, { qty: 8, price: 120 }] },
    'instax-mini': { min: 10, options: [{ qty: 10, price: 50 }, { qty: 20, price: 100 }] },
    'instax-wide': { min: 5, options: [{ qty: 5, price: 30 }, { qty: 10, price: 60 }] },
    '2x6-photo-strip': { min: 5, options: [{ qty: 10, price: 40 }, { qty: 20, price: 80 }] }
  },
  document: {
    bw: { a4: 3, short: 3, long: 4 },
    partial: { a4: 4, short: 4, long: 5 },
    colored: { a4: 5, short: 5, long: 6 }
  },
  'document-photo': {
    bw: { a4: 5, short: 5, long: 6 },
    partial: { a4: 6, short: 6, long: 7 },
    colored: { a4: 6, short: 7, long: 8 }
  },
  'photo-only': {
    bw: { a4: 6, short: 5, long: 7 },
    partial: { a4: 7, short: 6, long: 8 },
    colored: { a4: 9, short: 8, long: 10 }
  },
  id: {
    'id-a': { price: 50, desc: 'Package A - 4pcs 2x2 & 8pcs 1x1' },
    'id-b': { price: 30, desc: 'Package B - 6pcs 2x2' },
    'id-c': { price: 45, desc: 'Package C - 24pcs 1x1' },
    'id-d': { price: 40, desc: 'Package D - 9pcs Passport ID & 4pcs 1x1' }
  },
  sticker: { price: 55, desc: 'A4 Size Sticker per page' },
  'xerox-bw': { short: 2, a4: 3, backToBack: 1 },
  'xerox-colored': { short: 3, a4: 4, backToBack: 1 },
  scan: { price: 10, desc: 'Scan per page (A4 & below)' }
};

let uploadedFiles = [];

function openCloudinaryUploader() {
  window.cloudinary.openUploadWidget(
    { cloudName: 'dodjx4don', uploadPreset: 'ml_default', multiple: true },
    (err, result) => {
      if (!err && result?.event === 'success') {
        uploadedFiles.push(result.info);
        renderUploadedFiles();
      }
    }
  );
}

function renderUploadedFiles() {
  const container = document.getElementById('uploadedFiles');
  const btnText = document.getElementById('uploadBtnText');
  if (uploadedFiles.length === 0) {
    container.innerHTML = '';
    btnText.textContent = 'Click to select files';
    return;
  }
  btnText.textContent = `${uploadedFiles.length} file(s) selected`;
  let html = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">';
  for (const f of uploadedFiles) {
    html += `<span style="background:var(--pink-light);padding:4px 12px;border-radius:20px;font-size:0.8rem;color:var(--text);">📄 ${f.original_filename}</span>`;
  }
  html += '</div>';
  container.innerHTML = html;
}

function getPolaroidPrice(type, qty) {
  const data = PRICES.polaroid[type];
  if (!data) return 0;
  let best = 0;
  for (const opt of data.options) {
    if (qty >= opt.qty) {
      best = Math.max(best, (opt.price / opt.qty) * qty);
      if (qty === opt.qty) return opt.price;
    }
  }
  const lastOpt = data.options[data.options.length - 1];
  const perUnit = lastOpt.price / lastOpt.qty;
  return Math.ceil(perUnit * qty);
}

function getPolaroidNames(type) {
  const names = {
    'instax-square': 'INSTAX SQUARE',
    'strip-film': 'STRIP FILM',
    'mini-photo-strip': 'MINI PHOTO STRIP',
    'photo-booth': 'PHOTO BOOTH',
    'instax-mini': 'INSTAX MINI',
    'instax-wide': 'INSTAX WIDE',
    '2x6-photo-strip': '2X6 PHOTO STRIP'
  };
  return names[type] || type;
}

function getCategoryLabel(cat) {
  const labels = {
    'polaroid': 'Polaroid Inspired',
    'document': 'Document Printing (Standard)',
    'document-photo': 'Document Printing with Photo',
    'photo-only': 'Photo Only',
    'id': 'ID Package',
    'sticker': 'Sticker Printing',
    'xerox-bw': 'Xerox - Black & White',
    'xerox-colored': 'Full Page Colored',
    'scan': 'Scan (Document or Photo)'
  };
  return labels[cat] || cat;
}

function onCategoryChange() {
  const cat = document.getElementById('orderCategory').value;

  document.getElementById('polaroidOptions').style.display = 'none';
  document.getElementById('docOptions').style.display = 'none';
  document.getElementById('idOptions').style.display = 'none';
  document.getElementById('stickerOptions').style.display = 'none';
  document.getElementById('qtyGroup').style.display = 'none';
  document.getElementById('xeroxOptions').style.display = 'none';
  document.getElementById('scanOptions').style.display = 'none';

  if (cat === 'polaroid') {
    document.getElementById('polaroidOptions').style.display = 'block';
  } else if (cat === 'document' || cat === 'document-photo' || cat === 'photo-only') {
    document.getElementById('docOptions').style.display = 'block';
  } else if (cat === 'id') {
    document.getElementById('idOptions').style.display = 'block';
  } else if (cat === 'sticker') {
    document.getElementById('stickerOptions').style.display = 'block';
  } else if (cat === 'xerox-bw' || cat === 'xerox-colored') {
    document.getElementById('xeroxOptions').style.display = 'block';
  } else if (cat === 'scan') {
    document.getElementById('scanOptions').style.display = 'block';
  }

  for (const id of ['polaroidType', 'docColor', 'docSize', 'idPackage', 'orderQty', 'xeroxSize']) {
    const el = document.getElementById(id);
    if (el) el.value = '';
  }

  const pd = document.getElementById('polaroidPriceDisplay');
  if (pd) pd.style.display = 'none';
  const po = document.getElementById('polaroidPriceOptions');
  if (po) po.style.display = 'none';

  calcEstimate();
}

function calcEstimate() {
  const cat = document.getElementById('orderCategory').value;
  let total = 0;
  let breakdownHtml = '';

  if (!cat) {
    document.getElementById('costBreakdown').innerHTML =
      '<div class="cost-row"><span>Select your order details above</span><span>—</span></div>';
    document.getElementById('totalCost').textContent = '₱0.00';
    return;
  }

  if (cat === 'polaroid') {
    const type = document.getElementById('polaroidType').value;
    const qty = parseInt(document.getElementById('orderQty').value) || 0;
    const priceDisplay = document.getElementById('polaroidPriceDisplay');
    const priceLabel = document.getElementById('polaroidPriceLabel');
    const priceAmount = document.getElementById('polaroidPriceAmount');
    const priceOptions = document.getElementById('polaroidPriceOptions');

    if (type) {
      const data = PRICES.polaroid[type];
      let optsHtml = '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
      for (const opt of data.options) {
        optsHtml += `<div onclick="document.getElementById('orderQty').value=${opt.qty};calcEstimate()" style="flex:1;min-width:100px;background:#fff;border:2px solid var(--pink-light);border-radius:10px;padding:10px 12px;text-align:center;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor='var(--pink)'" onmouseout="this.style.borderColor='var(--pink-light)'">
          <div style="font-size:0.8rem;color:var(--text-muted);">${opt.qty} pcs</div>
          <div style="font-weight:700;color:var(--pink-deep);font-family:'Playfair Display',serif;font-size:1.1rem;">₱${opt.price}</div>
        </div>`;
      }
      optsHtml += '</div>';
      priceOptions.innerHTML = optsHtml;
      priceOptions.style.display = 'block';
    } else {
      priceOptions.style.display = 'none';
    }

    if (type && qty > 0) {
      total = getPolaroidPrice(type, qty);
      const label = getPolaroidNames(type);
      breakdownHtml = `<div class="cost-row"><span>${label} × ${qty} pcs</span><span>₱${total.toFixed(2)}</span></div>`;
      priceDisplay.style.display = 'block';
      priceLabel.textContent = `${label} × ${qty} pcs:`;
      priceAmount.textContent = `₱${total.toFixed(2)}`;
    } else {
      priceDisplay.style.display = 'none';
    }
  } else if (cat === 'document' || cat === 'document-photo' || cat === 'photo-only') {
    const color = document.getElementById('docColor').value;
    const size = document.getElementById('docSize').value;
    const copies = parseInt(document.getElementById('docCopies').value) || 0;
    if (color && size && copies > 0) {
      const prices = PRICES[cat][color];
      if (prices && prices[size] !== undefined) {
        const perUnit = prices[size];
        total = perUnit * copies;
        const catNames = { 'document': 'Standard', 'document-photo': 'With Photo', 'photo-only': 'Photo Only' };
        const colorNames = { bw: 'B&W', partial: 'Partial Color', colored: 'Colored' };
        breakdownHtml = `
          <div class="cost-row"><span>${catNames[cat]} - ${colorNames[color]} - ${size.toUpperCase()}</span><span>₱${perUnit.toFixed(2)}/pc</span></div>
          <div class="cost-row"><span>Copies</span><span>${copies}</span></div>
          <div class="cost-row"><span>Subtotal</span><span>₱${total.toFixed(2)}</span></div>`;
      }
    }
  } else if (cat === 'id') {
    const pkg = document.getElementById('idPackage').value;
    const qty = parseInt(document.getElementById('idQty').value) || 0;
    if (pkg && qty > 0) {
      const data = PRICES.id[pkg];
      total = data.price * qty;
      breakdownHtml = `
        <div class="cost-row"><span>${data.desc}</span><span>₱${data.price.toFixed(2)}</span></div>
        <div class="cost-row"><span>Quantity</span><span>${qty}</span></div>
        <div class="cost-row"><span>Subtotal</span><span>₱${total.toFixed(2)}</span></div>`;
    }
  } else if (cat === 'sticker') {
    const qty = parseInt(document.getElementById('stickerQty').value) || 0;
    if (qty > 0) {
      total = PRICES.sticker.price * qty;
      breakdownHtml = `
        <div class="cost-row"><span>A4 Size Sticker</span><span>₱${PRICES.sticker.price.toFixed(2)}/page</span></div>
        <div class="cost-row"><span>Pages</span><span>${qty}</span></div>
        <div class="cost-row"><span>Subtotal</span><span>₱${total.toFixed(2)}</span></div>`;
    }
  } else if (cat === 'xerox-bw' || cat === 'xerox-colored') {
    const size = document.getElementById('xeroxSize').value;
    const copies = parseInt(document.getElementById('xeroxCopies').value) || 0;
    const backToBack = document.getElementById('xeroxBackToBack').value === 'yes';
    if (size && copies > 0) {
      const perUnit = PRICES[cat][size];
      const backFee = backToBack ? PRICES[cat].backToBack : 0;
      total = (perUnit + backFee) * copies;
      const catNames = { 'xerox-bw': 'Xerox B&W', 'xerox-colored': 'Full Page Colored' };
      breakdownHtml = `<div class="cost-row"><span>${catNames[cat]} - ${size.toUpperCase()}</span><span>₱${perUnit.toFixed(2)}/pc</span></div>`;
      if (backToBack) breakdownHtml += `<div class="cost-row"><span>Back to Back (+₱1)</span><span>₱${backFee.toFixed(2)}/pc</span></div>`;
      breakdownHtml += `<div class="cost-row"><span>Copies</span><span>${copies}</span></div><div class="cost-row"><span>Subtotal</span><span>₱${total.toFixed(2)}</span></div>`;
    }
  } else if (cat === 'scan') {
    const qty = parseInt(document.getElementById('scanQty').value) || 0;
    if (qty > 0) {
      total = PRICES.scan.price * qty;
      breakdownHtml = `
        <div class="cost-row"><span>Scan (A4 & below)</span><span>₱${PRICES.scan.price.toFixed(2)}/page</span></div>
        <div class="cost-row"><span>Pages</span><span>${qty}</span></div>
        <div class="cost-row"><span>Subtotal</span><span>₱${total.toFixed(2)}</span></div>`;
    }
  }

  let addonTotal = 0;
  if (document.getElementById('addonBg').checked) { addonTotal += 10; breakdownHtml += '<div class="cost-row"><span>Change Background (+₱10)</span><span>—</span></div>'; }
  if (document.getElementById('addonDesign').checked) { addonTotal += 10; breakdownHtml += '<div class="cost-row"><span>Add Designs (+₱10)</span><span>—</span></div>'; }
  if (document.getElementById('addonText').checked) { addonTotal += 5; breakdownHtml += '<div class="cost-row"><span>Add Text (+₱5)</span><span>—</span></div>'; }
  total += addonTotal;

  if (total > 0) {
    document.getElementById('costBreakdown').innerHTML = breakdownHtml;
    document.getElementById('totalCost').textContent = `₱${total.toFixed(2)}`;
  } else {
    document.getElementById('costBreakdown').innerHTML =
      '<div class="cost-row"><span>Fill in all required fields</span><span>—</span></div>';
    document.getElementById('totalCost').textContent = '₱0.00';
  }
}

function buildReceipt() {
  const name = document.getElementById('custName').value;
  const email = document.getElementById('custEmail').value;
  const cat = document.getElementById('orderCategory').value;
  const remarks = document.getElementById('orderRemarks').value || '—';
  const total = document.getElementById('totalCost').textContent;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  const orderId = 'LNB-' + Date.now().toString(36).toUpperCase();

  let details = '';
  if (cat === 'polaroid') {
    const type = document.getElementById('polaroidType');
    const qty = document.getElementById('orderQty').value;
    details = `${type.options[type.selectedIndex]?.text || type.value} × ${qty} pcs`;
  } else if (cat === 'document' || cat === 'document-photo' || cat === 'photo-only') {
    const color = document.getElementById('docColor');
    const size = document.getElementById('docSize');
    const copies = document.getElementById('docCopies').value;
    details = `${color.options[color.selectedIndex]?.text || color.value} - ${size.options[size.selectedIndex]?.text || size.value} × ${copies} copies`;
  } else if (cat === 'id') {
    const pkg = document.getElementById('idPackage');
    const qty = document.getElementById('idQty').value;
    details = `${pkg.options[pkg.selectedIndex]?.text || pkg.value} × ${qty}`;
  } else if (cat === 'sticker') {
    const qty = document.getElementById('stickerQty').value;
    details = `A4 Sticker × ${qty} page(s)`;
  } else if (cat === 'xerox-bw' || cat === 'xerox-colored') {
    const size = document.getElementById('xeroxSize');
    const copies = document.getElementById('xeroxCopies').value;
    const b2b = document.getElementById('xeroxBackToBack').value === 'yes';
    details = `${size.options[size.selectedIndex]?.text || size.value} × ${copies} copy/copies${b2b ? ' (Back to Back)' : ''}`;
  } else if (cat === 'scan') {
    details = `${document.getElementById('scanQty').value} page(s) (A4 & below)`;
  }

  let addons = [];
  if (document.getElementById('addonBg').checked) addons.push('Change Background');
  if (document.getElementById('addonDesign').checked) addons.push('Add Designs');
  if (document.getElementById('addonText').checked) addons.push('Add Text');

  let html = `
    <div class="receipt-line"><span class="r-label">Order #</span><span class="r-value">${orderId}</span></div>
    <div class="receipt-line"><span class="r-label">Date</span><span class="r-value">${dateStr} ${timeStr}</span></div>
    <div class="receipt-divider"></div>
    <div class="receipt-line"><span class="r-label">Customer</span><span class="r-value">${name}</span></div>
    <div class="receipt-line"><span class="r-label">Email</span><span class="r-value">${email}</span></div>
    <div class="receipt-divider"></div>
    <div class="receipt-line"><span class="r-label">Category</span><span class="r-value">${getCategoryLabel(cat)}</span></div>
    <div class="receipt-line"><span class="r-label">Details</span><span class="r-value">${details}</span></div>`;

  if (addons.length) html += `<div class="receipt-line"><span class="r-label">Add-Ons</span><span class="r-value">${addons.join(', ')}</span></div>`;
  if (uploadedFiles.length) html += `<div class="receipt-line"><span class="r-label">Files</span><span class="r-value">${uploadedFiles.length} file(s)</span></div>`;
  html += `<div class="receipt-line"><span class="r-label">Remarks</span><span class="r-value">${remarks}</span></div>
    <div class="receipt-divider"></div>
    <div class="receipt-total"><span>Total</span><span>${total}</span></div>`;

  return { html, orderId, name, email, details, total, dateStr };
}

async function submitOrder(e) {
  e.preventDefault();

  const name = document.getElementById('custName').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const cat = document.getElementById('orderCategory').value;
  const total = document.getElementById('totalCost').textContent;

  if (!name || !email || !cat) {
    alert('Please fill in all required fields.');
    return false;
  }

  const receipt = buildReceipt();
  const fileNames = uploadedFiles.map(f => {
    const dlUrl = f.secure_url.replace('/upload/', '/upload/fl_attachment/');
    return `${f.original_filename}: ${dlUrl}`;
  }).join(', ');

  const btn = document.querySelector('.btn[type="submit"]');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: 'service_rlgiatm',
        template_id: 'template_9fozov5',
        user_id: 'ygyA-0gFFOkhnUzi8',
        template_params: {
          name,
          email,
          copies: receipt.details,
          total,
          details: document.getElementById('orderRemarks').value || 'None',
          fileNames: fileNames || 'No files uploaded',
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    document.getElementById('receiptContent').innerHTML = receipt.html + `
      <div style="text-align:center;margin-top:16px;padding:12px;background:#e8f5e9;border-radius:10px;color:#2e7d32;font-weight:600;">
        ✅ Order sent to your Gmail!
      </div>`;
    document.getElementById('receiptOverlay').classList.add('show');
  } catch (err) {
    console.error('EmailJS error:', err);
    alert('Order placed! But email sending failed: ' + err.message + '\n\nPlease take a screenshot of your order and message us on Instagram @shaina_guzman');
  } finally {
    btn.textContent = '📩 Submit Order';
    btn.disabled = false;
  }

  return false;
}

function closeReceipt() {
  document.getElementById('receiptOverlay').classList.remove('show');
}

document.addEventListener('DOMContentLoaded', function () {
  const inputs = document.querySelectorAll('.form-control');
  for (const inp of inputs) {
    if (inp.type !== 'textarea') {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') e.preventDefault();
      });
    }
  }
});
