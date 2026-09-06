# THỜI KHÓA BIỂU THÔNG MINH - LỚP CD25CNTT2 & TOÀN TRƯỜNG

Ứng dụng web tra cứu và quản lý Thời Khóa Biểu thông minh, tự động đồng bộ theo thời gian thực, tối ưu giao diện mượt mà trên cả máy tính và điện thoại di động.

---

## 1. THÔNG TIN DỰ ÁN

- **Tên dự án**: Thời Khóa Biểu Thông Minh (Smart Timetable Web App)
- **Đơn vị**: Trường Cao đẳng Kỹ thuật Công nghệ Bà Rịa - Vũng Tàu (BCTECH)
- **Khoa**: Công nghệ thông tin
- **Lớp học chính**: CD25CNTT2 (Cao đẳng Công nghệ thông tin - Khóa 25)
- **Phạm vi dữ liệu**: 61 lớp học trong toàn trường
- **Thời gian áp dụng**: Học kỳ 1 (Năm học 2026 – 2027)
- **Mốc khai giảng**: Thứ Hai, 07/09/2026 (Tuần 1)
- **Lộ trình học kỳ**: 22 tuần chuẩn mẫu in X1025

---

## 2. TÁC GIẢ & PHÁT TRIỂN (AUTHOR & CREDITS)

- **Người thực hiện**: HUAN (huanbv2002 · Sinh viên lớp CD25CNTT2)
- **Khoa**: Công nghệ thông tin - Trường CĐ Kỹ Thuật Công Nghệ BR-VT
- **Mục đích**: Phục vụ việc tra cứu lịch học hàng ngày, theo dõi lịch thi, ghi chú bài tập và hỗ trợ sinh viên toàn trường tra cứu thời khóa biểu nhanh chóng, tiện lợi.

---

## 3. CÔNG NGHỆ SỬ DỤNG (TECH STACK)

- **Giao diện (Frontend)**: HTML5, CSS3 hiện đại (Flexbox, CSS Grid, Custom Properties, Responsive Mobile-First).
- **Xử lý dữ liệu (Logic & Engine)**: JavaScript (ES6+ Vanilla), Modular Architecture, LocalStorage API.
- **Trích xuất dữ liệu (Data Parser)**:
  - PDF.js (Mozilla) - Bóc tách dữ liệu PDF trực tiếp trên trình duyệt web.
  - Python (PyMuPDF / fitz) - Công cụ xử lý và chuẩn hóa dữ liệu tự động.
- **Thiết kế giao diện (UI/UX)**:
  - Hệ màu Pastel mềm mại không viền (Borderless Pastel Design).
  - Hệ thống icon chuẩn SVG Vector sắc nét.
  - Không sử dụng thư viện nặng, không cần cài đặt Node.js hay Build tool.

---

## 4. TÍNH NĂNG CHÍNH

### A. Đồng hồ thực tế & Tự động mở đúng tuần/thứ
- Tự động đối soát thời gian thực tế để mở ngay **Tuần học** và **Thứ hôm nay** khi truy cập web.
- Nút "Hôm nay" giúp quay về lịch hiện tại nhanh chóng khi đang xem các tuần khác.

### B. Lịch học theo tuần (Week View)
- Phân ca rõ ràng: Buổi Sáng (Tiết 1-5, từ 07:25) và Buổi Chiều (Tiết 6-10, từ 12:55).
- Thẻ môn học hiển thị đầy đủ tên môn, số tiết, khung giờ, phòng học (LAB / Lý thuyết) và giảng viên.
- Phân biệt rõ ràng các ngày và buổi không có tiết bằng màu nền xám dịu.
- **Chế độ xem trên điện thoại**:
  - **Từng ngày**: Xem chi tiết 1 ngày, có dải thứ T2-CN và hỗ trợ vuốt chạm trái/phải để đổi ngày.
  - **Cả tuần**: Xem toàn bộ tuần trên một màn hình với 2 dạng: Lưới ngang (7 cột vừa khít màn hình, không cần cuộn ngang) hoặc Bảng dọc.
  - Thanh điều hướng chuyển tuần đặt ở dưới cùng và căn giữa, thuận tiện thao tác 1 tay.

### C. Lịch tháng & Ghi chú học tập (Month View & Notes)
- Hiển thị toàn bộ các ngày trong tháng dưới dạng tờ lịch trực quan.
- Tự động đánh dấu ngày có tiết học, ngày nghỉ Lễ/Tết.
- Ghi chú cá nhân: Bấm vào ngày bất kỳ để ghi nhớ bài tập, hạn nộp LAB, lịch kiểm tra (lưu an toàn trên LocalStorage của máy).

### D. Bảng tham chiếu 22 tuần & Lịch nghỉ Lễ, Tết (Reference View)
- Bảng tổng kết 22 tuần của học kỳ: 18 tuần chính khóa, 2 tuần dự trữ & thi, 2 tuần nghỉ Tết.
- Mục ngày nghỉ Lễ/Tết hiển thị dạng lưới 2 cột (20/11, 24/11, Tết Dương Lịch 2027, Tết Nguyên Đán Đinh Mùi 2027).
- Bấm vào hàng tuần bất kỳ để chuyển nhanh đến lịch tuần đó.

### E. Tra cứu 61 lớp học toàn trường (Searchable Class Picker)
- Tìm kiếm nhanh bằng phím tắt `Ctrl + K` hoặc `/`.
- Tìm kiếm thông minh không dấu theo mã lớp (CD25, CD24, T25...) hoặc tên ngành học (CNTT, Ô tô, Điện, Cơ khí, May...).

### F. Cập nhật dữ liệu từ file PDF
- Trực tiếp trên web qua nút "Cập nhật PDF".
- Bằng file script `cap_nhat_tkb.bat` trên máy tính Windows.

### G. Hướng dẫn sử dụng tương tác (Onboarding Tour)
- 6 bước hướng dẫn chi tiết, chỉ rõ từng nút bấm với ngôn ngữ thân thiện, dễ hiểu cho người lớn tuổi và phụ huynh.

---

## 5. CẤU TRÚC MÃ NGUỒN (DIRECTORY STRUCTURE)

```
TKB/
├── index.html            # File giao diện chính của ứng dụng
│
├── src/
│   ├── js/
│   │   ├── config.js        # Cấu hình ca học, mốc giờ, danh mục ngày nghỉ lễ
│   │   ├── utils.js         # Tiện ích ngày tháng, formatters, bộ lọc tiếng Việt
│   │   ├── storage.js       # Dịch vụ lưu trữ LocalStorage (ghi chú, settings)
│   │   ├── views/
│   │   │   ├── week-view.js      # Lịch tuần, dải thứ và chế độ mobile
│   │   │   ├── month-view.js     # Lịch tháng & sự kiện
│   │   │   ├── reference-view.js # Bảng tham chiếu 22 tuần & Lễ Tết
│   │   │   └── note-modal.js     # Modal ghi chú bài học cá nhân
│   │   ├── components/
│   │   │   ├── class-picker.js   # Tìm & chọn 61 lớp học toàn trường (Ctrl+K)
│   │   │   ├── pdf-uploader.js   # Bộ bóc tách PDF trực tiếp trên web (PDF.js)
│   │   │   └── tour.js           # Hướng dẫn 6 bước tương tác trực quan
│   │   └── main.js          # Khởi tạo ứng dụng & điều hướng sự kiện
│   │
│   └── css/
│       ├── main.css         # CSS Entry point
│       ├── variables.css    # Biến màu sắc pastel không viền, fonts, shadows
│       ├── base.css         # Reset & App Shell layout
│       ├── components.css   # Buttons, Dropdown, Modal, Search box
│       ├── week-view.css    # Styles Lịch tuần
│       ├── month-view.css   # Styles Lịch tháng
│       ├── reference-view.css # Styles Bảng 22 tuần & Thẻ nghỉ lễ
│       ├── tour.css         # Styles Spotlight & Popover hướng dẫn
│       └── responsive.css   # Tối ưu giao diện điện thoại & bottom navigation
│
├── data/
│   ├── classes_data.js       # Cơ sở dữ liệu 61 lớp học (JS bundle nạp vào web)
│   └── classes_database.json # File JSON thô phục vụ tích hợp API/Backend
│
├── scripts/
│   └── update_tkb.py        # Script Python trích xuất PDF tự động
│
├── cap_nhat_tkb.bat         # File thực thi 1-click cập nhật PDF trên Windows
├── .gitignore              # Danh sách file loại trừ khi đẩy lên Git
├── LICENSE                 # Giấy phép mã nguồn mở (MIT License)
└── README.md                # Tài liệu mô tả dự án và hướng dẫn sử dụng
```

---

## 6. HƯỚNG DẪN SỬ DỤNG & TRIỂN KHAI

### Chạy trực tiếp trên máy tính:
- Nhấp đúp mở file `index.html` bằng bất kỳ trình duyệt nào (Chrome, Edge, Firefox, Safari...).

### Triển khai lên GitHub Pages (Miễn phí):
1. Đẩy toàn bộ mã nguồn lên GitHub:
   ```bash
   git push origin main
   ```
2. Vào **Settings** > **Pages** trên GitHub repository, tại mục **Branch** chọn `main` và thư mục `/(root)` > bấm **Save**.

---

## 7. BẢN QUYỀN (LICENSE)

Dự án được phân phối dưới giấy phép mã nguồn mở [MIT License](LICENSE).
