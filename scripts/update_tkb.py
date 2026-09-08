import os
import sys
import glob
import json
import re
import time

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Dang cai dat thu vien PyMuPDF...")
    os.system(f'"{sys.executable}" -m pip install pymupdf')
    import fitz

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

def clean_font(s):
    if not s: return ""
    s = s.replace("c¬ khí", "Cơ khí").replace("c¬", "cơ").replace("C¬", "Cơ")
    s = s.replace("Hư¬ng", "Hương").replace("hư¬ng", "hương").replace("ư¬", "ươ")
    s = s.replace("Trư¬ng", "Trương").replace("Tr­-ng", "Trương").replace("trư¬ng", "trương")
    s = s.replace("L­u", "Lưu").replace("l­u", "lưu")
    s = s.replace("K¬", "Kơ").replace("k¬", "kơ")
    s = s.replace("món ăn á", "món ăn Á").replace("Món Ăn á", "Món Ăn Á")
    return re.sub(r"\s+", " ", s).strip()

def parse_periods(p_str):
    p_str = str(p_str or "").strip()
    if not p_str or p_str == "*":
        return []
    if "-" in p_str or "." in p_str:
        res = []
        for i, ch in enumerate(p_str):
            if ch.isdigit():
                val = 10 if ch == "0" else int(ch)
                if i >= 10:
                    val = 10 + val
                res.append(val)
        if res:
            return sorted(list(set(res)))
    m = re.search(r"\b(\d+)\s*-\s*(\d+)\b", p_str)
    if m:
        s, e = int(m.group(1)), int(m.group(2))
        if 1 <= s <= 14 and 1 <= e <= 14 and s <= e:
            return list(range(s, e + 1))
    digits = [ch for ch in p_str if ch.isdigit()]
    if digits:
        return sorted(list(set(10 if ch == "0" else int(ch) for ch in digits)))
    return [1, 2, 3, 4]

def clean_room(r_str):
    r_str = str(r_str or "").strip()
    if not r_str: return "P.ONLINE"
    r_str = re.sub(r"[\s\.\-]+$", "", r_str).strip()
    if "ONLINE" in r_str.upper(): return "P.ONLINE"
    if not r_str or r_str == "DN": return "DN"
    return r_str

def get_color(subj):
    t = subj.lower()
    if "sinh hoat" in t or "shl" in t: return "rose"
    if "tieng anh" in t or "english" in t: return "orange"
    if "tin hoc" in t or "thuc tap" in t: return "emerald"
    if "web" in t or "do an" in t or "bao tri" in t: return "violet"
    if "flash" in t or "hoat hinh" in t or "may cat" in t or "nguoi" in t or "han" in t: return "teal"
    if "lap trinh" in t or "windows" in t or "dien tu" in t or "plc" in t: return "blue"
    if "toan" in t or "van" in t or "su" in t or "hoa" in t: return "indigo"
    palette = ["blue", "teal", "violet", "emerald", "orange", "rose", "indigo"]
    h = 0
    for c in t: h = (h * 31 + ord(c)) % len(palette)
    return palette[h]

def find_pdf_file():
    if len(sys.argv) > 1 and os.path.isfile(sys.argv[1]) and sys.argv[1].lower().endswith(".pdf"):
        return sys.argv[1]
    
    downloads = os.path.join(os.path.expanduser("~"), "Downloads")
    dl_pdfs = glob.glob(os.path.join(downloads, "*TKB*.pdf"))
    if dl_pdfs:
        dl_pdfs.sort(key=os.path.getmtime, reverse=True)
        return dl_pdfs[0]
        
    return None

def process_pdf(pdf_path):
    print("=" * 60)
    print(f"DANG XU LY FILE PDF: {os.path.basename(pdf_path)}")
    print("=" * 60)
    
    t0 = time.time()
    doc = fitz.open(pdf_path)
    all_classes = {}
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text")
        m_class = re.search(r"THỜI\s*KHÓ[A|a]\s*BIỂU\s*LỚP\s*([A-Z0-9]+)", text, re.I)
        class_code = m_class.group(1).upper() if m_class else f"CLASS_{page_num+1}"
        
        m_major = re.search(r"Nghề:\s*([^\n\r]+)", text)
        major = clean_font(m_major.group(1)) if m_major else ""
        m_dept = re.search(r"Khoa:\s*([^\n\r]+)", text)
        dept = clean_font(m_dept.group(1)) if m_dept else ""
        
        m_start = re.search(r"Ngày Bắt Đầu Học Kỳ\s*([0-9/]+)", text)
        start_date_raw = m_start.group(1).strip() if m_start else "07/09/2026"
        parts = start_date_raw.split("/")
        if len(parts) == 3:
            year = parts[2] if len(parts[2]) == 4 else "20" + parts[2]
            start_date_iso = f"{year}-{parts[1].zfill(2)}-{parts[0].zfill(2)}"
        else:
            start_date_iso = "2026-09-07"
        
        words = page.get_text("words")
        
        # Tim toa do header 1234567890123456789012 tren trang
        header_words = [w for w in words if "12345678901234567890" in w[4]]
        if header_words:
            wx0 = header_words[0][0]
            header_len = len(header_words[0][4])
            char_w = (header_words[0][2] - header_words[0][0]) / (header_len if header_len > 0 else 22)
        else:
            wx0 = 626.52
            char_w = 4.824
        
        tabs = page.find_tables()
        rows = []
        unscheduled_rows = []
        
        if len(tabs.tables) > 0:
            table = tabs[0]
            extracted = table.extract()
            is_unscheduled_section = False
            
            for row_idx, r_text in enumerate(extracted):
                if not r_text or len(r_text) < 7: continue
                code = str(r_text[0] or "").strip()
                subj = clean_font(str(r_text[1] or ""))
                teacher = clean_font(str(r_text[2] or ""))
                dow_raw = str(r_text[3] or "").strip()
                periods_raw = str(r_text[4] or "").strip()
                room_raw = clean_room(str(r_text[5] or ""))
                week_raw = str(r_text[6] or "").strip()
                
                # Kiem tra section chua xep
                if "Không Xếp" in code or "Chưa Xếp" in code or "Ch­a Xếp" in code or "Không Xếp" in subj:
                    is_unscheduled_section = True
                    continue
                
                if not code or "Mã MH" in code or "Thời Khóa" in code or not subj or "Lưu ý" in code or "L­u ý" in code:
                    continue
                
                # Xu ly mon chua xep
                if is_unscheduled_section or dow_raw == "*":
                    unscheduled_rows.append({
                        "code": code,
                        "subject": subj,
                        "teacher": teacher,
                        "note": "Môn chưa xếp / Tự học / Online"
                    })
                    continue
                
                m_dow = re.search(r"[2-8]", dow_raw)
                dow = int(m_dow.group(0)) if m_dow else (8 if "CN" in dow_raw.upper() or "8" in dow_raw else 2)
                periods = parse_periods(periods_raw)
                if not periods:
                    continue
                
                r_bbox = table.rows[row_idx].bbox
                row_words = [w for w in words if w[0] >= 615 and (r_bbox[1] - 3 <= (w[1]+w[3])/2 <= r_bbox[3] + 3)]
                
                calculated_weeks = set()
                for w in row_words:
                    w_text = w[4]
                    if not any(ch.isdigit() for ch in w_text): continue
                    for k, ch in enumerate(w_text):
                        if ch.isdigit():
                            wk = int((w[0] + k * char_w - wx0 + char_w * 0.5) / char_w) + 1
                            if 1 <= wk <= 22:
                                calculated_weeks.add(wk)
                                
                if not calculated_weeks:
                    digits = [ch for ch in week_raw if ch.isdigit()]
                    p = 0
                    for ch in digits:
                        val = 10 if ch == "0" else int(ch)
                        while val <= p and val + 10 <= 22:
                            val += 10
                        if 1 <= val <= 22:
                            calculated_weeks.add(val)
                            p = val
                            
                weeks = sorted(list(calculated_weeks)) if calculated_weeks else list(range(1, 19))
                
                rows.append({
                    "id": f"{class_code.lower()}-{len(rows)+1}",
                    "code": code,
                    "subject": subj,
                    "teacher": teacher,
                    "dow": dow,
                    "periods": periods,
                    "room": room_raw,
                    "weeks": weeks,
                    "color": get_color(subj)
                })
                
        # Tinh maxWeeks dong
        max_w = max([max(r["weeks"]) for r in rows if r["weeks"]] + [18])
        
        all_classes[class_code] = {
            "code": class_code,
            "name": f"Lớp {class_code}",
            "major": major,
            "dept": dept,
            "startDate": start_date_iso,
            "maxWeeks": max_w,
            "schedule": rows,
            "unscheduled": unscheduled_rows
        }
        print(f"[{page_num+1:02d}/{len(doc)}] Lớp {class_code:12s} -> {len(rows):2d} dòng môn học (Max {max_w} tuần)")
    
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
        f.write("const ALL_CLASSES_DATABASE = ")
        json.dump(all_classes, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    
    print("\n" + "=" * 60)
    print(f"HOÀN TẤT! Đã cập nhật thành công {len(all_classes)} lớp trong {time.time()-t0:.2f} giây.")
    print("=" * 60)

if __name__ == "__main__":
    pdf = find_pdf_file()
    if not pdf:
        print("KHONG TIM THAY FILE PDF THOI KHOA BIEU!")
    else:
        process_pdf(pdf)
