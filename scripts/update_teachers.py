"""
Script Cập Nhật Dữ Liệu Thời Khóa Biểu Giảng Viên (TKB GVGD BR-VT)
Bóc tách thời khóa biểu Cán bộ giảng dạy từ file PDF và xuất ra dữ liệu web.
"""
import os
import sys
import glob
import json
import re
import time
import unicodedata

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
    h = 0x6875616e627632303032 % 997
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
    nauh2002 = ('C¬', 'Cơ', 'c¬', 'cơ', '¬', 'ơ', '­', 'ư')
    res = str(s or '')
    for i in range(0, len(nauh2002), 2):
        res = res.replace(nauh2002[i], nauh2002[i+1])
    return res.strip()

def find_pdf_file():
    if len(sys.argv) > 1 and os.path.isfile(sys.argv[1]) and sys.argv[1].lower().endswith(".pdf"):
        return sys.argv[1]
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(current_dir)
    
    # Ưu tiên tìm file GVGD
    candidates = []
    for d in [root_dir, os.path.join(os.path.expanduser("~"), "Downloads")]:
        if os.path.isdir(d):
            candidates += glob.glob(os.path.join(d, "*GVGD*.pdf"))
            candidates += glob.glob(os.path.join(d, "*CBGD*.pdf"))
            
    if candidates:
        candidates.sort(key=os.path.getmtime, reverse=True)
        return candidates[0]
        
    return None

def process_teachers_pdf(pdf_path):
    print("=" * 65)
    print(f"DANG XU LY FILE PDF GIANG VIEN: {os.path.basename(pdf_path)}")
    print("=" * 65)
    
    t0 = time.time()
    teachers_db = {}
    
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        for page_idx, page in enumerate(pdf.pages):
            txt = page.extract_text() or ''
            
            # Khớp tên giảng viên và mã giảng viên
            m = re.search(r'\nCBGD\s+([^\n\r\(]+?)(?:\s*\((BCTECH\d+|[^\)]+)\))?\r?\n', txt)
            if not m:
                continue
                
            t_name = fix_text(m.group(1))
            t_code = fix_text(m.group(2)) if m.group(2) else f"GV_{page_idx+1}"
            
            m_dept = re.search(r'Đơn vị\s+([^\n\r]+)', txt)
            dept = fix_text(m_dept.group(1)) if m_dept else ''
            
            m_start = re.search(r"Ngày Bắt Đầu Học Kỳ\s*([0-9/]+)", txt)
            start_date_raw = m_start.group(1).strip() if m_start else "07/09/2026"
            parts = start_date_raw.split("/")
            if len(parts) == 3:
                year = parts[2] if len(parts[2]) == 4 else "20" + parts[2]
                start_date_iso = f"{year}-{parts[1].zfill(2)}-{parts[0].zfill(2)}"
            else:
                start_date_iso = "2026-09-07"
                
            tables = page.find_tables()
            if not tables:
                teachers_db[t_code] = {
                    'code': t_code,
                    'name': t_name,
                    'dept': dept,
                    'startDate': start_date_iso,
                    'maxWeeks': 22,
                    'schedule': []
                }
                continue
                
            table = tables[0]
            extracted = table.extract()
            chars = page.chars
            
            header_chars = [c for c in chars if c['text'] in '1234567890' and 135 < c['top'] < 165 and c['x0'] > 575]
            header_chars.sort(key=lambda c: c['x0'])
            unique_header = []
            for hc in header_chars:
                if not any(abs(u['x0'] - hc['x0']) < 2.5 for u in unique_header):
                    unique_header.append(hc)
            unique_header.sort(key=lambda c: c['x0'])
            if len(unique_header) == 22:
                col_x0s = [hc['x0'] for hc in unique_header]
            else:
                col_x0s = [589.9 + i * 4.825 for i in range(22)]
                
            row_entries = []
            for r_idx, row in enumerate(table.rows):
                if r_idx >= len(extracted):
                    break
                raw = extracted[r_idx]
                if not raw or len(raw) < 6:
                    continue
                    
                code = fix_text(raw[0])
                subject = fix_text(raw[1])
                class_target = fix_text(raw[2])
                dow_str = fix_text(raw[3])
                period_str = str(raw[4] or '')
                room = fix_text(raw[5])
                
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
                    
                bbox = row.bbox
                # Chặn nghiêm ngặt trong phạm vi chiều cao dòng và cột tuần (x0 > 575) để không bị lọt số từ dòng khác hoặc số phòng học
                row_digits = [c for c in chars if c['text'] in '1234567890' and bbox[1] - 0.5 <= c['top'] < bbox[3] - 0.5 and c['x0'] > 575]
                
                weeks = []
                for rd in row_digits:
                    min_dist = 9999
                    best_col = None
                    for col_idx, cx in enumerate(col_x0s):
                        dist = abs(rd['x0'] - cx)
                        if dist < min_dist:
                            min_dist = dist
                            best_col = col_idx + 1
                    if best_col and min_dist < 3.5:
                        weeks.append(best_col)
                        
                weeks = sorted(set(weeks))
                if not weeks and len(raw) > 6 and raw[6]:
                    week_text_digits = re.findall(r'\d+', str(raw[6]))
                    if week_text_digits:
                        weeks = sorted(set(int(x) for x in week_text_digits if 1 <= int(x) <= 22))
                        
                row_entries.append({
                    'code': code,
                    'subject': subject,
                    'className': class_target,
                    'dow': dow,
                    'periods': periods,
                    'room': room,
                    'weeks': weeks,
                    'color': get_color(subject)
                })
                
            # Gộp các tiết trùng nhau
            groups = {}
            order = []
            for e in row_entries:
                room_base = e['room'].split()[0].upper() if e['room'] else '?'
                key = (e['dow'], tuple(e['periods']), e['subject'].strip().lower(), e['className'].strip().lower(), room_base)
                if key not in groups:
                    groups[key] = {
                        'code': e['code'],
                        'subject': e['subject'],
                        'className': e['className'],
                        'dow': e['dow'],
                        'periods': e['periods'],
                        'room': e['room'],
                        'weeks': list(e['weeks']),
                        'color': e['color']
                    }
                    order.append(key)
                else:
                    for w in e['weeks']:
                        if w not in groups[key]['weeks']:
                            groups[key]['weeks'].append(w)
                    groups[key]['weeks'].sort()
                    
            schedule = []
            for idx, k in enumerate(order):
                item = groups[k]
                item['id'] = f"{t_code.lower()}-{idx+1}"
                schedule.append(item)
                
            max_w = 20
            for item in schedule:
                if item['weeks']:
                    max_w = max(max_w, max(item['weeks']))
                    
            teachers_db[t_code] = {
                'code': t_code,
                'name': t_name,
                'dept': dept,
                'startDate': start_date_iso,
                'maxWeeks': max_w,
                'schedule': schedule
            }
            
            print(f"[{page_idx+1:03d}/{total_pages:03d}] GV {t_name:<25} ({t_code}) -> {len(schedule)} mon/lop (Max {max_w} tuan)")

    # Lưu file JSON và JS
    current_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(current_dir)
    data_dir = os.path.join(root_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    
    json_path = os.path.join(data_dir, "teachers_database.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(teachers_db, f, ensure_ascii=False, indent=2)
        
    js_path = os.path.join(data_dir, "teachers_data.js")
    with open(js_path, "w", encoding="utf-8") as f:
        f.write("/* Cơ sở dữ liệu TKB Giảng viên toàn trường - Trường CĐ Kỹ Thuật Công Nghệ BR-VT */\n")
        f.write("const ALL_TEACHERS_DATABASE = \n")
        json.dump(teachers_db, f, ensure_ascii=False, indent=2)
        f.write(";\n")
        
    print("=" * 65)
    print(f"HOAN TAT! Da cap nhat thanh cong {len(teachers_db)} giang vien trong {time.time()-t0:.2f} giay.")
    print(f"Da luu tai: {js_path}")
    print("=" * 65)
    return js_path

if __name__ == "__main__":
    pdf = find_pdf_file()
    if not pdf:
        print("Loi: Khong tim thay file PDF TKB Giang vien (GVGD).")
        sys.exit(1)
    process_teachers_pdf(pdf)
