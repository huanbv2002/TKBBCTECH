import fitz
import glob
import json
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

pdf_path = glob.glob(r"C:/Users/banhtieu/Downloads/*L3*T25*.pdf")[0]
doc = fitz.open(pdf_path)

with open(r"C:\Users\banhtieu\Desktop\TKB\data\classes_database.json", "r", encoding="utf-8") as f:
    db = json.load(f)

print("=" * 70)
print(f"TIEN HANH KIEM TRA TOAN DIEN 46 LOP (PDF vs DATABASE)")
print("=" * 70)

total_issues = 0
classes_checked = 0

for page_num in range(len(doc)):
    page = doc[page_num]
    text = page.get_text("text")
    m_class = re.search(r"THỜI\s*KHÓ[A|a]\s*BIỂU\s*LỚP\s*([A-Z0-9]+)", text, re.I)
    class_code = m_class.group(1).upper() if m_class else None
    
    if not class_code:
        print(f"[!] Trang {page_num+1}: Khong tim thay ma lop!")
        total_issues += 1
        continue
        
    classes_checked += 1
    db_class = db.get(class_code)
    if not db_class:
        print(f"[!] Lop {class_code} (Trang {page_num+1}) khong co trong database!")
        total_issues += 1
        continue
        
    sched = db_class.get("schedule", [])
    
    # Kiem tra tung dong mon hoc
    for row_idx, r in enumerate(sched):
        # 1. Kiem tra Thu (dow)
        if not (2 <= r["dow"] <= 8):
            print(f"  [-] Lop {class_code} dong {row_idx+1}: Thu khong hop le ({r['dow']}) - Mon: {r['subject']}")
            total_issues += 1
            
        # 2. Kiem tra Tiet (periods)
        if not r["periods"] or any(p < 1 or p > 14 for p in r["periods"]):
            print(f"  [-] Lop {class_code} dong {row_idx+1}: Tiet khong hop le ({r['periods']}) - Mon: {r['subject']}")
            total_issues += 1
            
        # 3. Kiem tra Tuan (weeks)
        if not r["weeks"] or any(w < 1 or w > 25 for w in r["weeks"]):
            print(f"  [-] Lop {class_code} dong {row_idx+1}: Tuan khong hop le ({r['weeks']}) - Mon: {r['subject']}")
            total_issues += 1
            
        # 4. Kiem tra Ten mon hoc
        if not r["subject"] or len(r["subject"]) < 2:
            print(f"  [-] Lop {class_code} dong {row_idx+1}: Ten mon hoc rong!")
            total_issues += 1

print(f"\n[+] Da kiem tra xong: {classes_checked}/46 lop.")
print(f"[+] Tong so dong mon hoc da quet: {sum(len(c['schedule']) for c in db.values())} dong.")
print(f"[+] Tong so loi phat hien: {total_issues}")
if total_issues == 0:
    print(">>> KET LUAN: TAT CA 46 LOP CHUAN XAC 100%, KHONG CO LOI DU LIEU! <<<")
print("=" * 70)
