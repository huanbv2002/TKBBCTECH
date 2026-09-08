import fitz, glob, os, sys
sys.stdout.reconfigure(encoding="utf-8")

pdf_path = glob.glob(r"C:/Users/banhtieu/Downloads/*L3*T25*.pdf")[0]
doc = fitz.open(pdf_path)
page = doc[0]
tabs = page.find_tables()
table = tabs.tables[0]
words = page.get_text("words")

header_word = [w for w in words if "1234567890123456789012" in w[4]][0]
wx0 = header_word[0]
char_w = 4.824
print(f"Exact Header wx0: {wx0:.4f}, header_text={header_word[4]}")

for r_idx in range(1, 15):
    r_bbox = table.rows[r_idx].bbox
    row_words = [w for w in words if w[0] >= 615 and (r_bbox[1] - 3 <= (w[1]+w[3])/2 <= r_bbox[3] + 3)]
    row_text = table.extract()[r_idx]
    print(f"\nRow {r_idx}: Môn={row_text[1]}, Thứ={row_text[3]}, Tiết={row_text[4]}, TextTuần={row_text[6]}")
    for w in row_words:
        print(f"  word: text='{w[4]}', x0={w[0]:.2f}, x1={w[2]:.2f}")
        for k, ch in enumerate(w[4]):
            if ch.isdigit():
                wk = int((w[0] + k * char_w - wx0 + char_w * 0.5) / char_w) + 1
                print(f"    ch='{ch}', k={k}, calc_wk={wk}")
