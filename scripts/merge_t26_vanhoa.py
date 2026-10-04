"""
Script Ghép Lịch Học Văn Hóa THPT vào các Lớp Nghề Trung Cấp Khóa 26 (T26)
Dựa trên quyết định phân lớp biên chế học văn hóa tại CS1 (Bà Rịa) và CS2 (Vũng Tàu).
Bảo mật thông tin 100%: Chỉ sử dụng cấu trúc mã lớp, tuyệt đối không lưu thông tin cá nhân.
"""
import os
import sys
import json
import copy

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

# Bảng ánh xạ cấu trúc (100% Zero PII)
T26_MAPPING = {
    # === CƠ SỞ 1 (BÀ RỊA) ===
    # 1. Các lớp học 1 - 1 trọn vẹn
    'T26CNTT1': {
        'type': 'single',
        'vocational': 'T26CNTT1',
        'cultural': 'T26VH07',
        'campus': 'CS1',
        'campusName': 'CS1 - Bà Rịa',
        'desc': 'CNTT + VH07 (CS1 - Bà Rịa)'
    },
    'T26CBMA1': {
        'type': 'single',
        'vocational': 'T26CBMA1',
        'cultural': 'T26VH08',
        'campus': 'CS1',
        'campusName': 'CS1 - Bà Rịa',
        'desc': 'Chế biến món ăn + VH08 (CS1 - Bà Rịa)'
    },
    'T26DCN1': {
        'type': 'single',
        'vocational': 'T26DCN1',
        'cultural': 'T26VH03',
        'campus': 'CS1',
        'campusName': 'CS1 - Bà Rịa',
        'desc': 'Điện công nghiệp + VH03 (CS1 - Bà Rịa)'
    },
    'T26CGKL1': {
        'type': 'single',
        'vocational': 'T26CGKL1',
        'cultural': 'T26VH04',
        'campus': 'CS1',
        'campusName': 'CS1 - Bà Rịa',
        'desc': 'Cắt gọt kim loại + VH04 (CS1 - Bà Rịa)'
    },
    'T26CNOT1': {
        'type': 'single',
        'vocational': 'T26CNOT1',
        'cultural': 'T26VH05',
        'campus': 'CS1',
        'campusName': 'CS1 - Bà Rịa',
        'desc': 'Công nghệ ô tô + VH05 (CS1 - Bà Rịa)'
    },
    'T26CNOT2': {
        'type': 'single',
        'vocational': 'T26CNOT2',
        'cultural': 'T26VH06',
        'campus': 'CS1',
        'campusName': 'CS1 - Bà Rịa',
        'desc': 'Công nghệ ô tô + VH06 (CS1 - Bà Rịa)'
    },
    'T26KTML1': {
        'type': 'single',
        'vocational': 'T26KTML1',
        'cultural': 'T26VH01',
        'campus': 'CS1',
        'campusName': 'CS1 - Bà Rịa',
        'desc': 'Kỹ thuật máy lạnh + VH01 (CS1 - Bà Rịa)'
    },
    'T26KTML2': {
        'type': 'single',
        'vocational': 'T26KTML2',
        'cultural': 'T26VH02',
        'campus': 'CS1',
        'campusName': 'CS1 - Bà Rịa',
        'desc': 'Kỹ thuật máy lạnh + VH02 (CS1 - Bà Rịa)'
    },

    # 2. Các lớp chia 2 nhóm tại CS1
    'T26DCN2': {
        'type': 'split',
        'base': 'T26DCN2',
        'groups': [
            {
                'code': 'T26DCN2-N1',
                'name': 'Lớp T26DCN2 (Nhóm 1)',
                'vocational': 'T26DCN2',
                'cultural': 'T26VH01',
                'campus': 'CS1',
                'campusName': 'CS1 - Bà Rịa',
                'desc': 'Điện công nghiệp (Nhóm 1 + VH01 · CS1)'
            },
            {
                'code': 'T26DCN2-N2',
                'name': 'Lớp T26DCN2 (Nhóm 2)',
                'vocational': 'T26DCN2',
                'cultural': 'T26VH02',
                'campus': 'CS1',
                'campusName': 'CS1 - Bà Rịa',
                'desc': 'Điện công nghiệp (Nhóm 2 + VH02 · CS1)'
            }
        ]
    },
    'T26CDT1': {
        'type': 'split',
        'base': 'T26CDT1',
        'groups': [
            {
                'code': 'T26CDT1-N1',
                'name': 'Lớp T26CDT1 (Nhóm 1)',
                'vocational': 'T26CDT1',
                'cultural': 'T26VH04',
                'campus': 'CS1',
                'campusName': 'CS1 - Bà Rịa',
                'desc': 'Cơ điện tử (Nhóm 1 + VH04 · CS1)'
            },
            {
                'code': 'T26CDT1-N2',
                'name': 'Lớp T26CDT1 (Nhóm 2)',
                'vocational': 'T26CDT1',
                'cultural': 'T26VH03',
                'campus': 'CS1',
                'campusName': 'CS1 - Bà Rịa',
                'desc': 'Cơ điện tử (Nhóm 2 + VH03 · CS1)'
            }
        ]
    },
    'T26HAN1': {
        'type': 'split',
        'base': 'T26HAN1',
        'groups': [
            {
                'code': 'T26HAN1-N1',
                'name': 'Lớp T26HAN1 (Nhóm 1)',
                'vocational': 'T26HAN1',
                'cultural': 'T26VH05',
                'campus': 'CS1',
                'campusName': 'CS1 - Bà Rịa',
                'desc': 'Hàn (Nhóm 1 + VH05 · CS1)'
            },
            {
                'code': 'T26HAN1-N2',
                'name': 'Lớp T26HAN1 (Nhóm 2)',
                'vocational': 'T26HAN1',
                'cultural': 'T26VH06',
                'campus': 'CS1',
                'campusName': 'CS1 - Bà Rịa',
                'desc': 'Hàn (Nhóm 2 + VH06 · CS1)'
            }
        ]
    },

    # === CƠ SỞ 2 (VŨNG TÀU) ===
    # 1. Các lớp học 1 - 1 trọn vẹn
    'T26CTCK': {
        'type': 'single',
        'vocational': 'T26CTCK',
        'cultural': 'T26VH09',
        'campus': 'CS2',
        'campusName': 'CS2 - Vũng Tàu',
        'desc': 'Chế tạo cơ khí + VH09 (CS2 - Vũng Tàu)'
    },
    'T26CDT2': {
        'type': 'single',
        'vocational': 'T26CDT2',
        'cultural': 'T26VH10',
        'campus': 'CS2',
        'campusName': 'CS2 - Vũng Tàu',
        'desc': 'Cơ điện tử + VH10 (CS2 - Vũng Tàu)'
    },
    'T26HAN2': {
        'type': 'single',
        'vocational': 'T26HAN2',
        'cultural': 'T26VH11',
        'campus': 'CS2',
        'campusName': 'CS2 - Vũng Tàu',
        'desc': 'Hàn + VH11 (CS2 - Vũng Tàu)'
    },
    'T26CNOT3': {
        'type': 'single',
        'vocational': 'T26CNOT3',
        'cultural': 'T26VH12',
        'campus': 'CS2',
        'campusName': 'CS2 - Vũng Tàu',
        'desc': 'Công nghệ ô tô + VH12 (CS2 - Vũng Tàu)'
    },
    'T26DCN4': {
        'type': 'single',
        'vocational': 'T26DCN4',
        'cultural': 'T26VH13',
        'campus': 'CS2',
        'campusName': 'CS2 - Vũng Tàu',
        'desc': 'Điện công nghiệp + VH13 (CS2 - Vũng Tàu)'
    },
    'T26KTML3': {
        'type': 'single',
        'vocational': 'T26KTML3',
        'cultural': 'T26VH14',
        'campus': 'CS2',
        'campusName': 'CS2 - Vũng Tàu',
        'desc': 'Kỹ thuật máy lạnh + VH14 (CS2 - Vũng Tàu)'
    },
    'T26NHKS': {
        'type': 'single',
        'vocational': 'T26NHKS',
        'cultural': 'T26VH16',
        'campus': 'CS2',
        'campusName': 'CS2 - Vũng Tàu',
        'desc': 'Nhà hàng khách sạn + VH16 (CS2 - Vũng Tàu)'
    },
    'T26TKDH': {
        'type': 'single',
        'vocational': 'T26TKDH',
        'cultural': 'T26VH15',
        'campus': 'CS2',
        'campusName': 'CS2 - Vũng Tàu',
        'desc': 'Thiết kế đồ họa + VH15 (CS2 - Vũng Tàu)'
    },
    'T26CNTT2': {
        'type': 'single',
        'vocational': 'T26CNTT2',
        'cultural': 'T26VH15',
        'campus': 'CS2',
        'campusName': 'CS2 - Vũng Tàu',
        'desc': 'CNTT + VH15 (CS2 - Vũng Tàu)'
    },
    'T26CBMA2': {
        'type': 'single',
        'vocational': 'T26CBMA2',
        'cultural': 'T26VH17',
        'campus': 'CS2',
        'campusName': 'CS2 - Vũng Tàu',
        'desc': 'Chế biến món ăn + VH17 (CS2 - Vũng Tàu)'
    },

    # 2. Các lớp chia 2 nhóm tại CS2
    'T26CGKL2': {
        'type': 'split',
        'base': 'T26CGKL2',
        'groups': [
            {
                'code': 'T26CGKL2-N1',
                'name': 'Lớp T26CGKL2 (Nhóm 1)',
                'vocational': 'T26CGKL2',
                'cultural': 'T26VH09',
                'campus': 'CS2',
                'campusName': 'CS2 - Vũng Tàu',
                'desc': 'Cắt gọt kim loại (Nhóm 1 + VH09 · CS2)'
            },
            {
                'code': 'T26CGKL2-N2',
                'name': 'Lớp T26CGKL2 (Nhóm 2)',
                'vocational': 'T26CGKL2',
                'cultural': 'T26VH10',
                'campus': 'CS2',
                'campusName': 'CS2 - Vũng Tàu',
                'desc': 'Cắt gọt kim loại (Nhóm 2 + VH10 · CS2)'
            }
        ]
    },
    'T26DCN3': {
        'type': 'split',
        'base': 'T26DCN3',
        'groups': [
            {
                'code': 'T26DCN3-N1',
                'name': 'Lớp T26DCN3 (Nhóm 1)',
                'vocational': 'T26DCN3',
                'cultural': 'T26VH13',
                'campus': 'CS2',
                'campusName': 'CS2 - Vũng Tàu',
                'desc': 'Điện công nghiệp (Nhóm 1 + VH13 · CS2)'
            },
            {
                'code': 'T26DCN3-N2',
                'name': 'Lớp T26DCN3 (Nhóm 2)',
                'vocational': 'T26DCN3',
                'cultural': 'T26VH14',
                'campus': 'CS2',
                'campusName': 'CS2 - Vũng Tàu',
                'desc': 'Điện công nghiệp (Nhóm 2 + VH14 · CS2)'
            }
        ]
    },
    'T26LOG': {
        'type': 'split',
        'base': 'T26LOG',
        'groups': [
            {
                'code': 'T26LOG-N1',
                'name': 'Lớp T26LOG (Nhóm 1)',
                'vocational': 'T26LOG',
                'cultural': 'T26VH16',
                'campus': 'CS2',
                'campusName': 'CS2 - Vũng Tàu',
                'desc': 'Logistics (Nhóm 1 + VH16 · CS2)'
            },
            {
                'code': 'T26LOG-N2',
                'name': 'Lớp T26LOG (Nhóm 2)',
                'vocational': 'T26LOG',
                'cultural': 'T26VH17',
                'campus': 'CS2',
                'campusName': 'CS2 - Vũng Tàu',
                'desc': 'Logistics (Nhóm 2 + VH17 · CS2)'
            }
        ]
    }
}

def merge_schedule(voc_items, cult_items, prefix_id):
    combined = []
    # 1. Thêm các môn nghề (đánh dấu chuyên môn)
    for idx, item in enumerate(voc_items):
        e = copy.deepcopy(item)
        e['id'] = f"{prefix_id.lower()}-voc-{idx+1}"
        combined.append(e)
        
    # 2. Thêm các môn văn hóa THPT
    for idx, item in enumerate(cult_items):
        e = copy.deepcopy(item)
        e['id'] = f"{prefix_id.lower()}-vh-{idx+1}"
        combined.append(e)
        
    # 3. Sắp xếp: theo Thứ (dow) -> Tiết bắt đầu -> Môn
    combined.sort(key=lambda x: (x.get('dow', 0), x['periods'][0] if x.get('periods') else 0))
    return combined

def run_merge():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(root_dir, "data")
    db_path = os.path.join(data_dir, "classes_database.json")
    js_path = os.path.join(data_dir, "classes_data.js")

    if not os.path.exists(db_path):
        print(f"LỖI: Không tìm thấy file {db_path}")
        return

    with open(db_path, "r", encoding="utf-8-sig") as f:
        database = json.load(f)

    print("=" * 65)
    print("BẮT ĐẦU GHÉP THỜI KHÓA BIỂU NGHỀ & VĂN HÓA KHÓA T26")
    print("=" * 65)

    merged_count = 0

    for key, cfg in T26_MAPPING.items():
        if cfg['type'] == 'single':
            v_code = cfg['vocational']
            vh_code = cfg['cultural']
            if v_code in database and vh_code in database:
                v_data = database[v_code]
                vh_data = database[vh_code]

                # Cập nhật lịch học gộp vào lớp nghề
                combined_sch = merge_schedule(v_data['schedule'], vh_data['schedule'], v_code)
                v_data['schedule'] = combined_sch
                v_data['maxWeeks'] = max(v_data.get('maxWeeks', 18), vh_data.get('maxWeeks', 18))
                v_data['major'] = cfg['desc']
                v_data['campus'] = cfg['campus']
                v_data['culturalClass'] = vh_code
                print(f"[1-1] {v_code:10s} + {vh_code:8s} -> {len(combined_sch)} tiết ({cfg['desc']})")
                merged_count += 1
            else:
                print(f"[BỎ QUA] Không tìm thấy {v_code} hoặc {vh_code} trong database")

        elif cfg['type'] == 'split':
            base_code = cfg['base']
            if base_code not in database:
                print(f"[BỎ QUA] Không tìm thấy lớp gốc {base_code}")
                continue

            base_data = database[base_code]
            # Cập nhật mô tả lớp gốc
            base_data['major'] = f"{base_data.get('major', base_code)} (Chỉ môn nghề)"

            for grp in cfg['groups']:
                grp_code = grp['code']
                vh_code = grp['cultural']
                if vh_code in database:
                    vh_data = database[vh_code]
                    combined_sch = merge_schedule(base_data['schedule'], vh_data['schedule'], grp_code)

                    database[grp_code] = {
                        'code': grp_code,
                        'name': grp['name'],
                        'major': grp['desc'],
                        'dept': base_data.get('dept', ''),
                        'startDate': base_data.get('startDate', '2026-09-07'),
                        'maxWeeks': max(base_data.get('maxWeeks', 18), vh_data.get('maxWeeks', 18)),
                        'schedule': combined_sch,
                        'campus': grp['campus'],
                        'baseClass': base_code,
                        'culturalClass': vh_code
                    }
                    print(f"[NHÓM] {grp_code:12s} (+ {vh_code:8s}) -> {len(combined_sch)} tiết ({grp['desc']})")
                    merged_count += 1

            # Xóa lớp gốc "chỉ môn nghề" để tránh trùng lặp và gây nhầm lẫn cho học sinh
            database.pop(base_code, None)
            print(f"[TINH GỌN] Đã ẩn lớp gốc '{base_code}' để học sinh chọn đúng nhóm có đủ Văn hóa")

    # Lưu ngược vào file json và file js
    with open(db_path, "w", encoding="utf-8") as f:
        json.dump(database, f, ensure_ascii=False, indent=2)

    with open(js_path, "w", encoding="utf-8") as f:
        f.write("/* Cơ sở dữ liệu TKB toàn trường - Trường CĐ Kỹ Thuật Công Nghệ BR-VT */\n")
        f.write("const ALL_CLASSES_DATABASE = \n")
        json.dump(database, f, ensure_ascii=False, indent=2)
        f.write("\n;\n")

    print("=" * 65)
    print(f"HOÀN TẤT! Đã xử lý và cập nhật thành công {merged_count} hồ sơ lớp T26.")
    print(f"Tổng số lớp trong CSDL hiện tại: {len(database)} lớp.")
    print("=" * 65)

if __name__ == "__main__":
    run_merge()
