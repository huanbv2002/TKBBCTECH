/**
 * TKB - PDF Uploader & In-Browser Parser (PDF.js)
 */
function cleanFontPdf(str) {
  if (!str) return '';
  return String(str)
    .replace(/c¬ khí/gi, 'Cơ khí')
    .replace(/c¬/g, 'cơ')
    .replace(/C¬/g, 'Cơ')
    .replace(/Hư¬ng/g, 'Hương')
    .replace(/hư¬ng/g, 'hương')
    .replace(/ư¬/g, 'ươ')
    .replace(/Trư¬ng/g, 'Trương')
    .replace(/Tr­-ng/g, 'Trương')
    .replace(/trư¬ng/g, 'trương')
    .replace(/L­u/g, 'Lưu')
    .replace(/l­u/g, 'lưu')
    .replace(/K¬/g, 'Kơ')
    .replace(/k¬/g, 'kơ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function parsePdfFileInBrowser(file) {
  const dropzone = $('pdf-dropzone');
  const processCard = $('pdf-processing-card');
  const resultCard = $('pdf-result-card');
  const filenameEl = $('pdf-process-filename');
  const percentEl = $('pdf-process-percent');
  const progressBar = $('pdf-progress-bar');
  const statusEl = $('pdf-process-status');
  const previewEl = $('pdf-classes-preview');
  const resultTitle = $('pdf-result-title');
  const resultSub = $('pdf-result-sub');

  if (dropzone) dropzone.style.display = 'none';
  if (resultCard) resultCard.style.display = 'none';
  if (processCard) processCard.style.display = 'block';

  if (filenameEl) filenameEl.textContent = file.name;
  if (percentEl) percentEl.textContent = '0%';
  if (progressBar) progressBar.style.width = '0%';
  if (statusEl) statusEl.textContent = 'Đang đọc dữ liệu file...';

  try {
    const arrayBuffer = await file.arrayBuffer();

    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    } else {
      throw new Error('Thư viện PDF.js chưa được nạp. Vui lòng kiểm tra kết nối mạng!');
    }

    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    if (numPages === 0) {
      throw new Error('File PDF không có trang nào!');
    }

    const extractedDatabase = {};

    for (let p = 1; p <= numPages; p++) {
      const percent = Math.round((p / numPages) * 100);
      if (percentEl) percentEl.textContent = `${percent}%`;
      if (progressBar) progressBar.style.width = `${percent}%`;
      if (statusEl) statusEl.textContent = `Đang trích xuất trang ${p} / ${numPages}...`;

      const page = await pdfDoc.getPage(p);
      const viewport = page.getViewport({ scale: 1.0 });
      const textContent = await page.getTextContent();
      const items = textContent.items;

      const fullText = items.map((it) => it.str).join(' ');

      const mClass = fullText.match(/THỜI\s*KHÓ[Aa]\s*BIỂU\s*LỚP\s*([A-Z0-9]+)/i);
      const classCode = mClass ? mClass[1].toUpperCase() : `CLASS_${p}`;

      const mMajor = fullText.match(/Nghề:\s*([^,\n\r]+?)(?=\s*Khoa:|\s*Lớp:|\s*Khóa:|\s*Học kỳ:|$)/i);
      const major = mMajor ? cleanFontPdf(mMajor[1]) : '';

      const mDept = fullText.match(/Khoa:\s*([^,\n\r]+?)(?=\s*Khóa:|\s*Học kỳ:|\s*Lớp:|$)/i);
      const dept = mDept ? cleanFontPdf(mDept[1]) : '';

      const mStart = fullText.match(/Ngày Bắt Đầu Học Kỳ\s*([0-9/]+)/i);
      let startDateIso = '2026-09-07';
      if (mStart) {
        const parts = mStart[1].trim().split('/');
        if (parts.length === 3) {
          const yr = parts[2].length === 4 ? parts[2] : '20' + parts[2];
          startDateIso = `${yr}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }

      const textTokens = items.map((it) => ({
        str: it.str,
        x: it.transform[4],
        y: viewport.height - it.transform[5],
        width: it.width,
        height: it.height
      }));

      const tableTokens = textTokens.filter((t) => t.y >= 135 && t.y <= viewport.height - 25);
      tableTokens.sort((a, b) => a.y - b.y || a.x - b.x);

      const rowsGrouped = [];
      tableTokens.forEach((tok) => {
        let matchedGroup = rowsGrouped.find((g) => Math.abs(g.y - tok.y) <= 4.5);
        if (!matchedGroup) {
          matchedGroup = { y: tok.y, tokens: [] };
          rowsGrouped.push(matchedGroup);
        }
        matchedGroup.tokens.push(tok);
      });

      const wx0 = 628.08 * (viewport.width / 842.0);
      const char_w = 4.824 * (viewport.width / 842.0);

      const scheduleRows = [];

      rowsGrouped.forEach((group) => {
        group.tokens.sort((a, b) => a.x - b.x);

        let codeTokens = [];
        let subjTokens = [];
        let teacherTokens = [];
        let dowTokens = [];
        let periodTokens = [];
        let roomTokens = [];
        let weekTokens = [];

        group.tokens.forEach((t) => {
          const ratio = t.x / viewport.width;
          if (ratio < 0.11) codeTokens.push(t.str);
          else if (ratio < 0.43) subjTokens.push(t.str);
          else if (ratio < 0.54) teacherTokens.push(t.str);
          else if (ratio < 0.58) dowTokens.push(t.str);
          else if (ratio < 0.68) periodTokens.push(t.str);
          else if (ratio < 0.76) roomTokens.push(t.str);
          else weekTokens.push(t);
        });

        const codeStr = cleanText(codeTokens.join(' '));
        const subjStr = cleanFontPdf(subjTokens.join(' '));
        const teacherStr = cleanFontPdf(teacherTokens.join(' '));
        const dowStr = dowTokens.join(' ').trim();
        const periodStr = periodTokens.join(' ').trim();
        const roomStr = normalizeRoom(roomTokens.join(' '));

        if (!codeStr || codeStr.includes('Mã MH') || codeStr.includes('Thời Khóa') || !subjStr || codeStr.includes('Lưu ý') || codeStr.includes('L­u ý')) {
          return;
        }

        const mDow = dowStr.match(/[2-8]/);
        const dow = mDow ? Number(mDow[0]) : (dowStr.toUpperCase().includes('CN') ? 8 : 2);
        const periods = parsePeriods(periodStr);

        const calculatedWeeks = new Set();
        weekTokens.forEach((wt) => {
          const str = wt.str;
          if (/\d/.test(str)) {
            for (let k = 0; k < str.length; k++) {
              if (/\d/.test(str[k])) {
                const wk = Math.floor((wt.x + k * char_w - wx0 + char_w * 0.5) / char_w) + 1;
                if (wk >= 1 && wk <= 22) calculatedWeeks.add(wk);
              }
            }
          }
        });

        let weeks = [...calculatedWeeks].sort((a, b) => a - b);
        if (!weeks.length) {
          const rawWeekText = weekTokens.map((t) => t.str).join('');
          weeks = parseWeeks(rawWeekText, 18);
          if (!weeks.length) weeks = range(1, 18);
        }

        scheduleRows.push({
          id: `${classCode.toLowerCase()}-${scheduleRows.length + 1}`,
          code: normalizeCode(codeStr),
          subject: subjStr,
          teacher: teacherStr,
          dow,
          periods,
          room: roomStr,
          weeks,
          color: colorForSubject(subjStr)
        });
      });

      extractedDatabase[classCode] = {
        code: classCode,
        name: `Lớp ${classCode}`,
        major: major || 'Chuyên ngành',
        dept: dept || 'Khoa',
        startDate: startDateIso,
        maxWeeks: 18,
        schedule: scheduleRows
      };
    }

    const classCount = Object.keys(extractedDatabase).length;
    if (classCount === 0) {
      throw new Error('Không tìm thấy thông tin lớp học nào trong file PDF!');
    }

    writeStorage(STORAGE.customDatabase, extractedDatabase);
    window.ALL_CLASSES_DATABASE = extractedDatabase;

    if (processCard) processCard.style.display = 'none';
    if (resultCard) resultCard.style.display = 'block';

    if (resultTitle) resultTitle.textContent = `Đã trích xuất thành công ${classCount} lớp học!`;
    if (resultSub) resultSub.textContent = `Dữ liệu thời khóa biểu mới từ file "${file.name}" đã được nạp trực tiếp vào ứng dụng web.`;

    if (previewEl) {
      const sortedKeys = Object.keys(extractedDatabase).sort();
      previewEl.innerHTML = sortedKeys.map((c) => {
        const cls = extractedDatabase[c];
        return `<span class="pdf-class-chip" title="${escapeHtml(cls.major)} (${cls.schedule.length} môn)"><strong>${c}</strong> · ${cls.schedule.length} môn</span>`;
      }).join('');
    }

    const applyBtn = $('pdf-apply-btn');
    if (applyBtn) {
      applyBtn.onclick = () => {
        initClassPicker();
        if (extractedDatabase[settings.classCode]) {
          switchClass(settings.classCode);
        } else {
          switchClass(Object.keys(extractedDatabase)[0]);
        }
        closePdfModal();
      };
    }

    const downloadJsBtn = $('pdf-download-js-btn');
    if (downloadJsBtn) {
      downloadJsBtn.onclick = () => {
        const jsContent = `/* Cơ sở dữ liệu TKB toàn trường - Trường CĐ Kỹ Thuật Công Nghệ BR-VT */\nconst ALL_CLASSES_DATABASE = ${JSON.stringify(extractedDatabase, null, 2)};\n`;
        const blob = new Blob([jsContent], { type: 'application/javascript;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'classes_data.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
    }

  } catch (err) {
    console.error('Lỗi phân tích PDF:', err);
    if (processCard) processCard.style.display = 'none';
    if (dropzone) dropzone.style.display = 'flex';
    alert(`Lỗi khi đọc file PDF: ${err.message || err}`);
  }
}

function initPdfUpload() {
  const dropzone = $('pdf-dropzone');
  const fileInput = $('pdf-file-input');
  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      parsePdfFileInBrowser(e.target.files[0]);
    }
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('is-dragover');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('is-dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt ? dt.files : null;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        parsePdfFileInBrowser(file);
      } else {
        alert('Vui lòng chọn hoặc kéo thả file định dạng PDF (.pdf)!');
      }
    }
  });
}
