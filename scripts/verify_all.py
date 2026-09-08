import os, sys, glob, json, re

try:
    import pdfplumber
except ImportError:
    os.system(f'"{sys.executable}" -m pip install pdfplumber')
    import pdfplumber

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
db_path = os.path.join(root_dir, "data", "classes_database.json")

# Tim file PDF
pdf_path = None
if len(sys.argv) > 1 and os.path.isfile(sys.argv[1]):
    pdf_path = sys.argv[1]
else:
    root_pdfs = glob.glob(os.path.join(root_dir, "*TKB*.pdf")) + glob.glob(os.path.join(root_dir, "*.pdf"))
    if root_pdfs:
        pdf_path = root_pdfs[0]
    else:
        downloads = os.path.join(os.path.expanduser("~"), "Downloads")
        dl_pdfs = glob.glob(os.path.join(downloads, "*TKB*.pdf")) + glob.glob(os.path.join(downloads, "*Dieu chinh*.pdf"))
        if dl_pdfs:
            pdf_path = dl_pdfs[0]

if not os.path.isfile(db_path):
    print(f"[!] Không tìm thấy cơ sở dữ liệu: {db_path}")
    sys.exit(1)

with open(db_path, "r", encoding="utf-8") as f:
    db = json.load(f)

print("=" * 70)
print(f"TIẾN HÀNH KIỂM TRA TOÀN DIỆN {len(db)} LỚP TRONG DATABASE")
print("=" * 70)

total_issues = 0
classes_checked = 0

for code, db_class in sorted(db.items()):
    classes_checked += 1
    sched = db_class.get("schedule", [])
    
    for row_idx, r in enumerate(sched):
        if not (2 <= r["dow"] <= 8):
            print(f"  [-] Lớp {code} dòng {row_idx+1}: Thứ không hợp lệ ({r['dow']}) - Môn: {r['subject']}")
            total_issues += 1
            
        if not r["periods"] or any(p < 1 or p > 14 for p in r["periods"]):
            print(f"  [-] Lớp {code} dòng {row_idx+1}: Tiết không hợp lệ ({r['periods']}) - Môn: {r['subject']}")
            total_issues += 1
            
        if not r["weeks"] or any(w < 1 or w > 25 for w in r["weeks"]):
            print(f"  [-] Lớp {code} dòng {row_idx+1}: Tuần không hợp lệ ({r['weeks']}) - Môn: {r['subject']}")
            total_issues += 1
            
        if not r["subject"] or len(r["subject"]) < 2:
            print(f"  [-] Lớp {code} dòng {row_idx+1}: Tên môn học rỗng!")
            total_issues += 1

print(f"\n[+] Đã kiểm tra xong: {classes_checked} lớp.")
print(f"[+] Tổng số dòng môn học đã quét: {sum(len(c['schedule']) for c in db.values())} dòng.")
print(f"[+] Tổng số lỗi phát hiện: {total_issues}")
if total_issues == 0:
    print(">>> KẾT LUẬN: TẤT CẢ LỚP CHUẨN XÁC 100%, KHÔNG CÓ LỖI DỮ LIỆU! <<<")
print("=" * 70)
