"""
Script Cập Nhật Dữ Liệu Thời Khóa Biểu Tự Động (TKB BR-VT)
Sử dụng công nghệ đo tọa độ chính xác từng ô bảng PDF (Bounding Box + X-Coordinates).
Tương thích mọi máy tính và mọi đường dẫn thư mục.
"""
import os
import sys
import glob
import json
import re
import time

try:
    import pdfplumber
except ImportError:
    print("Dang cai dat thu vien pdfplumber...")
    os.system(f'"{sys.executable}" -m pip install pdfplumber')
    import pdfplumber

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

PALETTE = ['blue', 'teal', 'violet', 'emerald', 'orange', 'rose']

def remove_tones(s):
    import unicodedata
    s = unicodedata.normalize('NFD', str(s or '').lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return s.replace('đ', 'd')

def get_color(subj):
    t = remove_tones(subj)
    if 'sinh hoat' in t or 'shl' in t: return 'rose'
    if 'tieng anh' in t or 'english' in t: return 'orange'
    if 'tin hoc' in t: return 'emerald'
    if 'thiet ke web' in t or ' web' in t: return 'violet'
    if 'hoat hinh' in t or 'flash' in t: return 'teal'
    if 'lap trinh' in t or 'winform' in t or 'windows form' in t: return 'blue'
    h = 0
    for c in t: h = (h * 31 + ord(c)) % len(PALETTE)
    return PALETTE[h]

def parse_periods(p_str):
    periods = []
    for i, c in enumerate(str(p_str or '')[:14]):
        if c not in ('-', ' ', '.', '_'):
            p = i + 1
            if 1 <= p <= 14:
                periods.append(p)
    return sorted(set(periods))

def fix_text(s):
    return str(s or '').replace('C¬','Cơ').replace('c¬','cơ').replace('¬','ơ').replace('­','ư').strip()

def find_pdf_file():
    # 1. Đường dẫn truyền qua tham số dòng lệnh
    if len(sys.argv) > 1 and os.path.isfile(sys.argv[1]) and sys.argv[1].lower().endswith(".pdf"):
        return sys.argv[1]
    
    # 2. Tìm file PDF trong thư mục dự án
    current_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(current_dir)
    root_pdfs = glob.glob(os.path.join(root_dir, "*TKB*.pdf")) + glob.glob(os.path.join(root_dir, "*.pdf"))
    if root_pdfs:
        root_pdfs.sort(key=os.path.getmtime, reverse=True)
        return root_pdfs[0]
    
    # 3. Tìm trong thư mục Downloads của người dùng
    downloads = os.path.join(os.path.expanduser("~"), "Downloads")
    if os.path.isdir(downloads):
        dl_pdfs = glob.glob(os.path.join(downloads, "*TKB*.pdf")) + glob.glob(os.path.join(downloads, "*Dieu chinh*.pdf"))
        if dl_pdfs:
            dl_pdfs.sort(key=os.path.getmtime, reverse=True)
            return dl_pdfs[0]
        
    return None

def process_pdf(pdf_path):
    print("=" * 65)
    print(f"ĐANG XỬ LÝ FILE PDF: {os.path.basename(pdf_path)}")
    print("=" * 65)
    
    t0 = time.time()
    all_classes = {}
    
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        for page_idx, page in enumerate(pdf.pages):
            text = page.extract_text() or ''
            chars = page.chars
            
            m_class = re.search(r'THỜI KHÓ[Aa] BIỂU LỚP\s+(\S+)', text, re.IGNORECASE)
            if not m_class:
                continue
            class_code = re.sub(r'[^A-Z0-9]', '', m_class.group(1).upper())
            
            major = ''
            dept = ''
            for line in text.split('\n'):
                if line.startswith('Nghề:'):
                    major = fix_text(line.replace('Nghề:', ''))
                elif line.startswith('Khoa:'):
                    dept = fix_text(line.replace('Khoa:', ''))
            
            m_start = re.search(r"Ngày Bắt Đầu Học Kỳ\s*([0-9/]+)", text)
            start_date_raw = m_start.group(1).strip() if m_start else "07/09/2026"
            parts = start_date_raw.split("/")
            if len(parts) == 3:
                year = parts[2] if len(parts[2]) == 4 else "20" + parts[2]
                start_date_iso = f"{year}-{parts[1].zfill(2)}-{parts[0].zfill(2)}"
            else:
                start_date_iso = "2026-09-07"
            
            tables_found = page.find_tables()
            if not tables_found:
                continue
            
            table = tables_found[0]
            extracted_data = table.extract()
            
            header_chars = [c for c in chars if c['text'] in '1234567890' and 110 < c['top'] < 170 and c['x0'] > 500]
            header_chars.sort(key=lambda c: c['x0'])
            unique_header = []
            for hc in header_chars:
                if not any(abs(u['x0'] - hc['x0']) < 2.5 for u in unique_header):
                    unique_header.append(hc)
            unique_header.sort(key=lambda c: c['x0'])
            
            row_entries = []
            for r_idx, row in enumerate(table.rows):
                if r_idx >= len(extracted_data):
                    break
                raw_row = extracted_data[r_idx]
                if not raw_row or len(raw_row) < 6:
                    continue
                
                code = fix_text(raw_row[0])
                subject = fix_text(raw_row[1])
                teacher = fix_text(raw_row[2])
                dow_str = fix_text(raw_row[3])
                period_str = str(raw_row[4] or '')
                room = fix_text(raw_row[5])
                
                if not re.fullmatch(r'[2-8]', dow_str):
                    continue
                
                dow = int(dow_str)
                periods = parse_periods(period_str)
                if not periods:
                    continue
                
                room = re.sub(r'[\s\.\-]+$', '', room).strip()
                room = re.sub(r'\s*\.\s*', '.', room)
                if not room:
                    room = '?'
                
                if code.upper() in ('SHL', 'SH', 'SH.'):
                    subject = 'Sinh hoạt lớp'
                    teacher = ''
                
                bbox = row.bbox
                row_digits = [c for c in chars if c['text'] in '1234567890' and bbox[1] - 1.5 <= c['top'] <= bbox[3] + 1.5 and c['x0'] > 500]
                
                weeks = []
                for rd in row_digits:
                    best_col = None
                    min_dist = 9999
                    for col_idx, hc in enumerate(unique_header):
                        dist = abs(rd['x0'] - hc['x0'])
                        if dist < min_dist:
                            min_dist = dist
                            best_col = col_idx + 1
                    if best_col and min_dist < 6:
                        weeks.append(best_col)
                
                weeks = sorted(set(weeks))
                if not weeks and len(raw_row) > 6 and raw_row[6]:
                    week_text_digits = re.findall(r'\d+', str(raw_row[6]))
                    if week_text_digits:
                        weeks = sorted(set(int(x) for x in week_text_digits if 1 <= int(x) <= 22))
                
                row_entries.append({
                    'code': code,
                    'subject': subject,
                    'teacher': teacher,
                    'dow': dow,
                    'periods': periods,
                    'room': room,
                    'weeks': weeks,
                    'color': get_color(subject),
                })
            
            # Gộp các tiết trùng nhau (cùng thứ, tiết, môn, phòng)
            groups = {}
            order = []
            for e in row_entries:
                room_base = e['room'].split()[0].upper() if e['room'] else '?'
                key = (e['dow'], tuple(e['periods']), e['subject'].strip().lower(), room_base)
                if key not in groups:
                    groups[key] = {**e, 'weeks': set(e['weeks'])}
                    order.append(key)
                else:
                    groups[key]['weeks'].update(e['weeks'])
                    if len(e['room']) > len(groups[key]['room']):
                        groups[key]['room'] = e['room']
            
            merged = []
            for key in order:
                g = groups[key]
                g['weeks'] = sorted(g['weeks'])
                merged.append(dict(g))
            
            all_w = [w for e in merged for w in e['weeks']]
            max_w = max(all_w) if all_w else 18
            
            for i, e in enumerate(merged):
                e['id'] = f"{class_code.lower()}-{i+1}"
            
            all_classes[class_code] = {
                'code': class_code,
                'name': f'Lớp {class_code}',
                'major': major or f'Lớp {class_code}',
                'dept': dept,
                'startDate': start_date_iso,
                'maxWeeks': max(max_w, 18),
                'schedule': merged,
            }
            print(f"[{page_idx+1:02d}/{total_pages}] Lớp {class_code:12s} -> {len(merged):2d} dòng môn học (Max {max(max_w, 18)} tuần)")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(current_dir)
    data_dir = os.path.join(root_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    
    out_json = os.path.join(data_dir, "classes_database.json")
    out_js = os.path.join(data_dir, "classes_data.js")
    
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(all_classes, f, ensure_ascii=False, indent=2)
        
    with open(out_js, "w", encoding="utf-8") as f:
        f.write("/* Cơ sở dữ liệu TKB toàn trường - Trường CĐ Kỹ Thuật Công Nghệ BR-VT */\n")
        f.write("const ALL_CLASSES_DATABASE = \n")
        json.dump(all_classes, f, ensure_ascii=False, indent=2)
        f.write("\n;\n")
    
    print("\n" + "=" * 65)
    print(f"HOÀN TẤT! Đã cập nhật thành công {len(all_classes)} lớp trong {time.time()-t0:.2f} giây.")
    print(f"Đã lưu tại: {out_js}")
    print("=" * 65)

if __name__ == "__main__":
    pdf = find_pdf_file()
    if not pdf:
        print("KHÔNG TÌM THẤY FILE PDF THỜI KHÓA BIỂU!")
        print("Vui lòng đặt file PDF vào thư mục dự án hoặc truyền đường dẫn file vào script.")
    else:
        process_pdf(pdf)
