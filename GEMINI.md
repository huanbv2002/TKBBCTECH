---
name: tkb-parser
description: Quy tắc phân tích và đọc Thời Khóa Biểu (TKB) chuẩn trường CĐ Kỹ Thuật Công Nghệ BR-VT từ file PDF.
---

# Quy Tắc Cốt Lõi Khi Đọc & Parse Thời Khóa Biểu (TKB) PDF

## 1. Bản chất cột "Tuần Học" (22 cột)
- Header cột là dãy số xanh: `1234567890123456789012` (tương ứng từ Tuần 1 đến Tuần 22).
- Vị trí gióng thẳng đứng từ trên xuống là TUẦN HỌC THỰC TẾ:
  - 10 cột đầu: Tuần 1 đến 10 (`1 2 3 4 5 6 7 8 9 0`)
  - 10 cột kế tiếp: Tuần 11 đến 20 (`1 2 3 4 5 6 7 8 9 0`)
  - 2 cột cuối: Tuần 21 đến 22 (`1 2`)
- **QUY TẮC BẮT BUỘC**: Dãy số `45678` hay `5678` nếu có các khoảng trắng phía trước gióng thẳng cột lượt 2 thì đó là **Tuần 14–18** hoặc **Tuần 15–18**, TUYỆT ĐỐI không được coi là Tuần 4–8 hay Tuần 5–8!
- Luôn dùng tọa độ hình học (Bounding Box & X-Coordinates từ `pdfplumber`) để đo vị trí X của từng con số gióng lên cột header, không được parse text thuần bằng strip spaces.

## 2. Quy tắc tách Tên Môn Học và Giảng Viên
- Họ tên giảng viên Việt Nam gồm 2 đến 4 từ ở cuối trước cột "Thứ".
- Quét tìm họ chính từ 4 từ -> 3 từ -> 2 từ trước cột "Thứ".
- Mã SHL luôn là "Sinh hoạt lớp", không có giảng viên riêng.

## 3. Khung giờ các tiết lẻ
- Tiết 1–4: `07:25–11:30`
- Tiết 1–5: `07:25–12:20`
- Tiết 5 (lẻ): `11:35–12:20`
- Tiết 6–9: `12:55–17:00`
- Tiết 6–10: `12:55–17:50`
- Tiết 10 (lẻ): `17:05–17:50`
- Tiết 11–14: `17:55–21:00`
