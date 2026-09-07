/**
 * NAMO COMPLEX C WING - Combined Application Script
 * Includes: Number to Words, jsPDF A5 Generator, and App Logic
 */

// ==========================================================================
// 1. NUMBER TO WORDS CONVERTER (INDIAN RUPEES)
// ==========================================================================
function convertNumberToWords(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) return '';
    
    const num = Math.floor(Math.abs(Number(amount)));
    if (num === 0) return 'Zero Rupees Only';

    const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teenDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const doubleDigits = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function numToWordsLessThanThousand(n) {
        let str = '';
        if (n >= 100) {
            str += singleDigits[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n >= 10 && n < 20) {
            str += teenDigits[n - 10] + ' ';
        } else {
            if (n >= 20) {
                str += doubleDigits[Math.floor(n / 10)] + ' ';
                n %= 10;
            }
            if (n > 0) {
                str += singleDigits[n] + ' ';
            }
        }
        return str;
    }

    let crore = Math.floor(num / 10000000);
    let remainder = num % 10000000;
    let lakh = Math.floor(remainder / 100000);
    remainder %= 100000;
    let thousand = Math.floor(remainder / 1000);
    let hundred = remainder % 1000;

    let result = '';

    if (crore > 0) {
        result += numToWordsLessThanThousand(crore).trim() + ' Crore ';
    }
    if (lakh > 0) {
        result += numToWordsLessThanThousand(lakh).trim() + ' Lakh ';
    }
    if (thousand > 0) {
        result += numToWordsLessThanThousand(thousand).trim() + ' Thousand ';
    }
    if (hundred > 0) {
        result += numToWordsLessThanThousand(hundred).trim() + ' ';
    }

    return result.trim() + ' Rupees Only';
}

window.convertNumberToWords = convertNumberToWords;


// ==========================================================================
// 2. A5 PDF RECEIPT GENERATOR (jsPDF)
// ==========================================================================
function generateA5ReceiptPDF(receiptData) {
    const { jspdf } = window;
    if (!jspdf || !jspdf.jsPDF) {
        throw new Error('jsPDF library is not loaded.');
    }

    // A5 dimensions in mm: 148 x 210
    const doc = new jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5'
    });

    const pageWidth = 148;
    const pageHeight = 210;

    // Outer double borders
    // Outer Border: Dark Slate (#0f172a)
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(1.2);
    doc.rect(6, 6, pageWidth - 12, pageHeight - 12);

    // Inner Border: Indigo (#4338ca)
    doc.setDrawColor(67, 56, 202);
    doc.setLineWidth(0.5);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

    // Header Background Box (Dark Slate #0f172a)
    doc.setFillColor(15, 23, 42);
    doc.rect(10, 10, pageWidth - 20, 32, 'F');

    // Decorative Gold Accent Bar at top of header box
    doc.setFillColor(251, 191, 36); // #fbbf24
    doc.rect(10, 10, pageWidth - 20, 2, 'F');

    // Header Text - Building Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('NAMO COMPLEX C WING', pageWidth / 2, 20, { align: 'center' });

    // Subtext - Address
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225); // #cbd5e1
    doc.text('DHAYARI, PUNE – 411041', pageWidth / 2, 25, { align: 'center' });

    // Gold Badge Title: "SOCIETY MAINTENANCE RECEIPT"
    doc.setFillColor(251, 191, 36); // #fbbf24
    doc.roundedRect((pageWidth - 85) / 2, 29, 85, 7, 1.5, 1.5, 'F');
    doc.setTextColor(15, 23, 42); // #0f172a
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('SOCIETY MAINTENANCE RECEIPT', pageWidth / 2, 34, { align: 'center' });

    // Receipt Date & Time Meta Bar
    let yPos = 48;

    doc.setFillColor(241, 245, 249); // Light Gray #f1f5f9
    doc.rect(10, yPos, pageWidth - 20, 9, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(10, yPos, pageWidth - 20, 9, 'S');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`DATE: ${receiptData.generatedDate}`, 14, yPos + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`TIME: ${receiptData.generatedTime}`, pageWidth - 14, yPos + 6, { align: 'right' });

    // Data Table Section
    yPos += 13;

    const rows = [
        { label: 'Flat No.', value: receiptData.flatNo, highlight: true },
        { label: 'Resident Name', value: receiptData.residentName, highlight: false },
        { label: 'WhatsApp Mobile', value: `+91 ${receiptData.whatsappNo}`, highlight: false },
        { label: 'Maintenance Period', value: `${receiptData.month} ${receiptData.year}`, highlight: true },
        { label: 'Payment Mode', value: receiptData.paymentMode || 'Online / UPI', highlight: false }
    ];

    const tableLeft = 10;
    const tableWidth = pageWidth - 20;
    const rowHeight = 9.5;
    const labelWidth = 48;

    rows.forEach((row, index) => {
        // Alternating fill
        if (index % 2 === 0) {
            doc.setFillColor(248, 250, 252); // #f8fafc
            doc.rect(tableLeft, yPos, tableWidth, rowHeight, 'F');
        }

        // Row Border
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.rect(tableLeft, yPos, tableWidth, rowHeight, 'S');
        doc.line(tableLeft + labelWidth, yPos, tableLeft + labelWidth, yPos + rowHeight);

        // Label
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        doc.text(row.label, tableLeft + 4, yPos + 6);

        // Value
        if (row.highlight) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(67, 56, 202); // Indigo
        } else {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(15, 23, 42);
        }
        doc.text(String(row.value), tableLeft + labelWidth + 4, yPos + 6);

        yPos += rowHeight;
    });

    // Amount Section Highlight Box (Emerald Green Theme)
    yPos += 4;
    doc.setFillColor(236, 253, 245); // Emerald-50 #ecfdf5
    doc.setDrawColor(5, 150, 105); // Emerald-600 #059669
    doc.setLineWidth(0.8);
    doc.roundedRect(tableLeft, yPos, tableWidth, 22, 2, 2, 'FD');

    // Amount Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(6, 78, 59); // Dark Emerald
    doc.text('MAINTENANCE AMOUNT PAID:', tableLeft + 5, yPos + 7.5);

    // Formatted Amount Text
    const formattedAmount = `Rs. ${Number(receiptData.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(5, 150, 105); // Vibrant Emerald Green
    doc.text(formattedAmount, tableLeft + tableWidth - 5, yPos + 8, { align: 'right' });

    // Amount in Words
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('Amount in Words:', tableLeft + 5, yPos + 16);

    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const amountWords = receiptData.amountInWords || convertNumberToWords(receiptData.amount);
    doc.text(amountWords, tableLeft + 35, yPos + 16);

    // Notes / Payment Status Box
    yPos += 26;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(tableLeft, yPos, tableWidth, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Status: PAYMENT RECEIVED & VERIFIED', tableLeft + 4, yPos + 5);
    doc.text(`Remarks: Society maintenance fee for ${receiptData.month} ${receiptData.year}.`, tableLeft + 4, yPos + 9.5);

    // Green Tick Mark Signatory Section
    yPos += 18;

    // Green Circle Badge with White Tick Mark
    const badgeX = tableLeft + tableWidth - 58;
    const badgeY = yPos + 5;

    // Draw Green Filled Circle
    doc.setFillColor(5, 150, 105); // Emerald Green #059669
    doc.circle(badgeX, badgeY, 4.5, 'F');

    // Draw White Checkmark Lines
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.9);
    doc.line(badgeX - 2, badgeY, badgeX - 0.5, badgeY + 1.8);
    doc.line(badgeX - 0.5, badgeY + 1.8, badgeX + 2.2, badgeY - 1.8);

    // Text label next to Green Tick Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(5, 150, 105);
    doc.text('VERIFIED & AUTHORIZED SIGNATORY', badgeX + 7, badgeY + 1);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Namo Complex C Wing', badgeX + 7, badgeY + 5.5);

    // Footer Line & Text
    const footerY = pageHeight - 13;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(10, footerY - 3, pageWidth - 10, footerY - 3);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Computer Generated Receipt - Namo Complex C Wing', pageWidth / 2, footerY + 1, { align: 'center' });

    // Generate output formats
    const filename = `Receipt_${receiptData.flatNo.replace(/[^a-zA-Z0-9-]/g, '')}_${receiptData.month}_${receiptData.year}.pdf`;
    const pdfBlob = doc.output('blob');
    const pdfDataUri = doc.output('datauristring');

    return {
        doc,
        filename,
        blob: pdfBlob,
        dataUri: pdfDataUri
    };
}

window.generateA5ReceiptPDF = generateA5ReceiptPDF;


// ==========================================================================
// 3. MAIN WEB APPLICATION CONTROLLER LOGIC
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const receiptForm = document.getElementById('receiptForm');
    const flatNoInput = document.getElementById('flatNo');
    const residentNameInput = document.getElementById('residentName');
    const whatsappNoInput = document.getElementById('whatsappNo');
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    const amountInput = document.getElementById('amountInput');
    const paymentModeSelect = document.getElementById('paymentMode');
    const amountWordsBadge = document.getElementById('amountWordsBadge');
    const presetBtns = document.querySelectorAll('.preset-btn');

    // Modals
    const successModal = document.getElementById('successModal');
    const previewModal = document.getElementById('previewModal');
    const modalCloseBtns = document.querySelectorAll('.modal-close-btn');

    // Modal Actions
    const btnSharePDF = document.getElementById('btnSharePDF');
    const btnOpenWhatsApp = document.getElementById('btnOpenWhatsApp');
    const btnDownloadPDF = document.getElementById('btnDownloadPDF');
    const previewFrame = document.getElementById('previewFrame');

    // History Table
    const historyTableBody = document.getElementById('historyTableBody');
    const historySearch = document.getElementById('historySearch');

    // Current State
    let currentGeneratedReceipt = null;

    const MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Initial Form Setup
    function initForm() {
        const currentDate = new Date();
        const currentMonthIdx = currentDate.getMonth(); // 0-11
        const currentYear = currentDate.getFullYear();

        // Populate Months
        monthSelect.innerHTML = '';
        MONTHS.forEach((m, idx) => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m;
            if (idx === currentMonthIdx) opt.selected = true;
            monthSelect.appendChild(opt);
        });

        // Populate Years (currentYear - 5 to currentYear + 5)
        yearSelect.innerHTML = '';
        for (let y = currentYear - 5; y <= currentYear + 5; y++) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            if (y === currentYear) opt.selected = true;
            yearSelect.appendChild(opt);
        }

        // Load History
        renderReceiptHistory();
    }

    // Auto-uppercase Flat No input
    flatNoInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
        validateField(flatNoInput);
    });

    // Clean Phone Input (numbers only, max 10 digits)
    whatsappNoInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
        validateField(whatsappNoInput);
    });

    // Amount Input Listener for Words conversion & decimal filtering
    amountInput.addEventListener('input', (e) => {
        let valStr = e.target.value.replace(/[^0-9.]/g, '');
        const parts = valStr.split('.');
        if (parts.length > 2) {
            valStr = parts[0] + '.' + parts.slice(1).join('');
        }
        e.target.value = valStr;

        const val = parseFloat(valStr);
        if (!isNaN(val) && val > 0) {
            amountWordsBadge.textContent = convertNumberToWords(val);
        } else {
            amountWordsBadge.textContent = '';
        }
        validateField(amountInput);
    });

    // Preset Amount Buttons
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const amt = btn.getAttribute('data-amount');
            amountInput.value = amt;
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            amountWordsBadge.textContent = convertNumberToWords(amt);
            validateField(amountInput);
        });
    });

    // Form Validation
    function validateField(input) {
        const group = input.closest('.form-group');
        let isValid = true;

        if (input.required && !input.value.trim()) {
            isValid = false;
        }

        if (input.id === 'whatsappNo') {
            const phone = input.value.trim();
            if (!/^[6-9]\d{9}$/.test(phone)) {
                isValid = false;
            }
        }

        if (input.id === 'amountInput') {
            const amt = parseFloat(input.value);
            if (isNaN(amt) || amt <= 0) {
                isValid = false;
            }
        }

        if (isValid) {
            group.classList.remove('has-error');
        } else {
            group.classList.add('has-error');
        }

        return isValid;
    }

    function validateForm() {
        let isFormValid = true;
        [flatNoInput, residentNameInput, whatsappNoInput, amountInput].forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });
        return isFormValid;
    }

    // IST Timestamp Helper
    function getISTTimestamp() {
        const now = new Date();
        const dateOptions = { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' };
        const timeOptions = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true };

        const generatedDate = new Intl.DateTimeFormat('en-IN', dateOptions).format(now);
        const generatedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(now);

        return { generatedDate, generatedTime };
    }

    // WhatsApp Message Formatter
    function buildWhatsAppTextMessage(data) {
        const formattedAmount = Number(data.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `🏢 *NAMO COMPLEX C WING*
📍 Dhayari, Pune – 411041
-----------------------------------------
🧾 *SOCIETY MAINTENANCE RECEIPT*
-----------------------------------------
• *Flat No:* ${data.flatNo}
• *Resident Name:* ${data.residentName}
• *Period:* ${data.month} ${data.year}
• *Amount Paid:* ₹ ${formattedAmount}
• *Payment Mode:* ${data.paymentMode}
• *Date:* ${data.generatedDate} | ${data.generatedTime}
-----------------------------------------
✅ *Status:* Paid & Verified

📄 *Note:* Your compact A5 PDF Receipt is attached with this message.

Thank you for your timely payment!`;
    }

    // Process Receipt Generation
    function generateReceiptObject() {
        const { generatedDate, generatedTime } = getISTTimestamp();
        const amt = parseFloat(amountInput.value.trim());

        const receiptData = {
            flatNo: flatNoInput.value.trim(),
            residentName: residentNameInput.value.trim(),
            whatsappNo: whatsappNoInput.value.trim(),
            month: monthSelect.value,
            year: yearSelect.value,
            amount: amt,
            amountInWords: convertNumberToWords(amt),
            paymentMode: paymentModeSelect.value,
            generatedDate,
            generatedTime,
            timestamp: Date.now()
        };

        const pdfResult = generateA5ReceiptPDF(receiptData);
        receiptData.filename = pdfResult.filename;
        receiptData.blob = pdfResult.blob;
        receiptData.dataUri = pdfResult.dataUri;
        receiptData.waText = buildWhatsAppTextMessage(receiptData);

        return receiptData;
    }

    // Form Submission
    receiptForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        currentGeneratedReceipt = generateReceiptObject();
        downloadReceiptPDF(currentGeneratedReceipt);
        saveReceiptToHistory(currentGeneratedReceipt);
        openSuccessModal(currentGeneratedReceipt);
    });

    // Live Preview Button
    document.getElementById('btnPreview').addEventListener('click', () => {
        if (!validateForm()) return;
        currentGeneratedReceipt = generateReceiptObject();
        previewFrame.src = currentGeneratedReceipt.dataUri;
        previewModal.classList.add('active');
    });

    // Reset Form Button
    document.getElementById('btnReset').addEventListener('click', () => {
        receiptForm.reset();
        amountWordsBadge.textContent = '';
        presetBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
        initForm();
    });

    // Download PDF Helper
    function downloadReceiptPDF(receipt) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(receipt.blob);
        link.download = receipt.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Web Share API & WhatsApp Integration
    async function sharePDFFile(receipt) {
        if (!receipt || !receipt.blob) return;

        const file = new File([receipt.blob], receipt.filename, { type: 'application/pdf' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: `Receipt - ${receipt.flatNo}`,
                    text: receipt.waText
                });
                return true;
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.warn('Web Share failed, using direct WhatsApp chat fallback', err);
                }
            }
        }
        
        openWhatsAppDirectChat(receipt);
        alert(`Note: Direct binary PDF attachment over web link is not supported by browser. The PDF receipt has been saved to your Downloads. Opening WhatsApp chat now to paste text and attach the downloaded PDF file!`);
    }

    function openWhatsAppDirectChat(receipt) {
        if (!receipt) return;
        const cleanPhone = `91${receipt.whatsappNo}`;
        const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(receipt.waText)}`;
        window.open(waUrl, '_blank');
    }

    // Modal Button Listeners
    btnSharePDF.addEventListener('click', () => {
        if (currentGeneratedReceipt) {
            sharePDFFile(currentGeneratedReceipt);
        }
    });

    btnOpenWhatsApp.addEventListener('click', () => {
        if (currentGeneratedReceipt) {
            openWhatsAppDirectChat(currentGeneratedReceipt);
        }
    });

    btnDownloadPDF.addEventListener('click', () => {
        if (currentGeneratedReceipt) {
            downloadReceiptPDF(currentGeneratedReceipt);
        }
    });

    function openSuccessModal(receipt) {
        document.getElementById('modalFlatNo').textContent = receipt.flatNo;
        document.getElementById('modalResident').textContent = receipt.residentName;
        document.getElementById('modalAmount').textContent = `₹ ${receipt.amount.toLocaleString('en-IN')}`;
        document.getElementById('successPreviewFrame').src = receipt.dataUri;
        successModal.classList.add('active');
    }

    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            successModal.classList.remove('active');
            previewModal.classList.remove('active');
        });
    });

    [successModal, previewModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Receipt History (Local Storage)
    function getStoredHistory() {
        const stored = localStorage.getItem('namo_receipts_history');
        return stored ? JSON.parse(stored) : [];
    }

    function saveReceiptToHistory(receipt) {
        const history = getStoredHistory();
        const storable = {
            flatNo: receipt.flatNo,
            residentName: receipt.residentName,
            whatsappNo: receipt.whatsappNo,
            month: receipt.month,
            year: receipt.year,
            amount: receipt.amount,
            paymentMode: receipt.paymentMode,
            generatedDate: receipt.generatedDate,
            generatedTime: receipt.generatedTime,
            timestamp: receipt.timestamp
        };

        history.unshift(storable);
        if (history.length > 50) history.pop();

        localStorage.setItem('namo_receipts_history', JSON.stringify(history));
        renderReceiptHistory();
    }

    function renderReceiptHistory(filterQuery = '') {
        const history = getStoredHistory();
        historyTableBody.innerHTML = '';

        const query = filterQuery.toLowerCase().trim();
        const filtered = history.filter(item => 
            item.flatNo.toLowerCase().includes(query) ||
            item.residentName.toLowerCase().includes(query) ||
            item.whatsappNo.includes(query) ||
            item.month.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">
                        ${history.length === 0 ? 'No receipts generated yet.' : 'No matching receipts found.'}
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span style="color: var(--indigo-accent); font-weight:700;">${item.flatNo}</span></td>
                <td>${item.residentName}</td>
                <td>${item.month} ${item.year}</td>
                <td><span class="amount-badge">₹ ${item.amount.toLocaleString('en-IN')}</span></td>
                <td style="font-size: 0.8rem; color: var(--text-muted);">${item.generatedDate}</td>
                <td>
                    <button class="tbl-action-btn share-btn" title="Share via WhatsApp" data-index="${index}">
                        <i class="fa-brands fa-whatsapp"></i>
                    </button>
                    <button class="tbl-action-btn download-btn" title="Re-download A5 PDF" data-index="${index}">
                        <i class="fa-solid fa-download"></i>
                    </button>
                    <button class="tbl-action-btn delete delete-btn" title="Delete" data-index="${index}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;

            tr.querySelector('.share-btn').addEventListener('click', () => {
                const pdfRes = generateA5ReceiptPDF(item);
                item.blob = pdfRes.blob;
                item.filename = pdfRes.filename;
                item.waText = buildWhatsAppTextMessage(item);
                sharePDFFile(item);
            });

            tr.querySelector('.download-btn').addEventListener('click', () => {
                const pdfRes = generateA5ReceiptPDF(item);
                downloadReceiptPDF({ blob: pdfRes.blob, filename: pdfRes.filename });
            });

            tr.querySelector('.delete-btn').addEventListener('click', () => {
                deleteHistoryItem(item.timestamp);
            });

            historyTableBody.appendChild(tr);
        });
    }

    function deleteHistoryItem(timestamp) {
        let history = getStoredHistory();
        history = history.filter(h => h.timestamp !== timestamp);
        localStorage.setItem('namo_receipts_history', JSON.stringify(history));
        renderReceiptHistory(historySearch.value);
    }

    historySearch.addEventListener('input', (e) => {
        renderReceiptHistory(e.target.value);
    });

    // Initialize Form
    initForm();
});
