# Thời Khóa Biểu CD25CNTT2 & Toàn Trường

Ứng dụng web tra cứu và quản lý **Thời Khóa Biểu thông minh** dành cho lớp **CD25CNTT2 (Cao đẳng Công nghệ thông tin)** và toàn bộ **61 lớp học** tại Trường Cao đẳng Kỹ thuật Công nghệ Bà Rịa - Vũng Tàu (Học kỳ 1, Năm học 2026 – 2027).

---

## 1. Thông Tin & Nguồn Gốc Dữ Liệu

- **Đơn vị đào tạo**: Trường Cao đẳng Kỹ thuật Công nghệ Bà Rịa - Vũng Tàu.
- **Lớp mặc định**: `CD25CNTT2` · Ngành Công nghệ thông tin.
- **Thời gian học kỳ 1**:
  - **Tuần 1 bắt đầu**: Thứ Hai, **07/09/2026**.
  - **Lộ trình học tập**: 22 tuần (18 tuần học chính khóa, 2 tuần dự trữ & thi, 2 tuần nghỉ Tết Âm Lịch).
- **Cơ sở dữ liệu**:
  - Tích hợp sẵn dữ liệu đầy đủ của toàn bộ **61 lớp học** trong toàn trường (lưu trữ tại `data/classes_data.js` và `data/classes_database.json`).
  - Hỗ trợ cập nhật tự động khi nhà trường ban hành file Thời khóa biểu PDF mới.

---

## 2. Các Tính Năng Chi Tiết

### Đồng hồ thực tế & Tự động nhận diện tuần học
- Đồng hồ hiển thị Thứ, Ngày, Tháng, Năm và thời gian thực tế.
- Hệ thống tự động so sánh ngày thực tế với mốc khai giảng (07/09/2026) để **tự động mở đúng Tuần học và Thứ của ngày hôm nay** ngay khi vào web.
- Nút **"Hôm nay"** giúp quay trở lại ngay lịch thực tế sau khi xem các tuần hoặc tháng khác.

### Lịch học theo Tuần (Week View)
- Phân ca học rõ ràng: **Buổi Sáng** (Tiết 1–5: 07:25 – 11:30) & **Buổi Chiều** (Tiết 6–10: 12:55 – 17:00).
- Thẻ môn học thiết kế dạng **Pastel Card** mềm mại, không đường viền thô, hiển thị đầy đủ: tên môn, số tiết, khung giờ, phòng học (LAB / Lý thuyết) và thầy cô giảng dạy.
- Các ngày và buổi không có tiết học có màu xám êm dịu, dễ phân biệt.
- **Tối ưu trên Điện thoại**:
  - **Chế độ Từng ngày**: Xem chi tiết 1 ngày, có thanh thứ **T2 → CN** và hỗ trợ **vuốt màn hình qua lại** để chuyển ngày.
  - **Chế độ Cả tuần**: Xem trọn vẹn cả tuần từ Thứ 2 đến Chủ Nhật với 2 dạng hiển thị tùy chọn:
    - **Lưới ngang**: 7 cột thứ thiết kế vừa khít 100% chiều ngang điện thoại, không cần cuộn ngang.
    - **Bảng dọc**: Bảng chia thứ theo hàng dọc và 2 cột Sáng/Chiều gọn gàng.
  - Cụm nút điều hướng chuyển tuần được đặt ở **dưới cùng và căn giữa**, rất thuận tay khi dùng 1 tay.

### Lịch Tháng & Ghi chú cá nhân (Month View & Notes)
- Hiển thị toàn bộ các ngày trong tháng theo dạng tờ lịch thân quen.
- Tự động đánh dấu các ngày có tiết học, ngày nghỉ Lễ/Tết và ngày có ghi chú.
- **Ghi chú bài học**: Bấm vào ngày bất kỳ để lưu nhắc nhở bài tập, hạn nộp bài LAB, lịch thi. Ghi chú được lưu trữ an toàn ngay trên trình duyệt (`LocalStorage`) của người dùng.

### Bảng tham chiếu 22 tuần & Lịch nghỉ Lễ, Tết (Reference View)
- Bảng tổng kết chuẩn mẫu in X1025 của học kỳ 1: hiển thị ngày bắt đầu, ngày kết thúc và trạng thái của từng tuần (Tuần học chính khóa, Dự trữ & Thi, Nghỉ Tết).
- **Mục Ngày nghỉ Lễ & Tết**: Hiển thị dạng **Lưới 2 cột song song** (Ngày Nhà Giáo VN 20/11, Ngày Văn Hóa VN 24/11, Tết Dương Lịch 01/01/2027, Tết Nguyên Đán Đinh Mùi 2027).
- **Click-to-jump**: Chạm vào bất kỳ hàng tuần hoặc thẻ nghỉ lễ nào để mở ngay lịch của tuần đó.

### Hộp tìm kiếm 61 lớp học toàn trường (Searchable Class Picker)
- Tìm kiếm tức thì theo mã lớp (CD25, CD24, T25...) hoặc theo tên ngành học (CNTT, Ô tô, Điện, Cơ khí, May thời trang...).
- Tìm kiếm thông minh không phân biệt dấu tiếng Việt và bôi đậm từ khóa khớp.
- Hỗ trợ phím tắt trên máy tính: bấm `Ctrl + K` hoặc `/` để mở tìm kiếm, dùng phím `↑`/`↓` và `Enter` để chọn.

### Cập nhật TKB từ file PDF mới
- **Trực tiếp trên web**: Bấm nút **"Cập nhật PDF"**, kéo thả file PDF vào để hệ thống tự động bóc tách và cập nhật ngay trên trình duyệt (sử dụng thư viện `PDF.js`).
- **Bằng công cụ Windows**: Kéo thả file PDF vào file `cap_nhat_tkb.bat` để chạy script Python tự động xuất dữ liệu mới vào thư mục `data/`.

### Hướng dẫn sử dụng tương tác (Tour Onboarding)
- Gồm 6 bước hướng dẫn chiếu sáng từng nút bấm chức năng, lời văn bình dị, gần gũi, phù hợp cho mọi lứa tuổi và phụ huynh.

---

## 3. Cấu Trúc Mã Nguồn (Project Structure)

```
TKB/
├── index.html            # File HTML chính (Giao diện chuẩn PC & Điện thoại)
│
├── src/
│   ├── js/
│   │   ├── config.js        # Cấu hình ca học, mốc giờ, danh mục ngày nghỉ lễ
│   │   ├── utils.js         # Tiện ích ngày tháng, formatters, bộ lọc tiếng Việt
│   │   ├── storage.js       # Dịch vụ lưu trữ LocalStorage (ghi chú, settings)
│   │   ├── views/
│   │   │   ├── week-view.js      # Lịch tuần (Từng ngày & Cả tuần vừa khít điện thoại)
│   │   │   ├── month-view.js     # Lịch tháng & sự kiện
│   │   │   ├── reference-view.js # Bảng tham chiếu 22 tuần & Lễ Tết (Lưới 2 cột)
│   │   │   └── note-modal.js     # Modal ghi chú bài học cá nhân
│   │   ├── components/
│   │   │   ├── class-picker.js   # Tìm & chọn 61 lớp học toàn trường (Ctrl+K)
│   │   │   ├── pdf-uploader.js   # Bộ bóc tách PDF trực tiếp trên web (PDF.js)
│   │   │   └── tour.js           # Hướng dẫn 6 bước dễ hiểu cho người lớn tuổi
│   │   └── main.js          # Controller khởi tạo ứng dụng & đồng hồ
│   │
│   └── css/
│       ├── main.css         # CSS Entry point
│       ├── variables.css    # Design System (Màu sắc pastel không viền, fonts)
│       ├── base.css         # Reset & App Shell layout
│       ├── components.css   # Buttons, Dropdown, Modal, Search box
│       ├── week-view.css    # Bảng Lịch tuần
│       ├── month-view.css   # Lịch tháng
│       ├── reference-view.css # Bảng 22 tuần & Thẻ nghỉ lễ
│       ├── tour.css         # Spotlight & Popover hướng dẫn
│       └── responsive.css   # Tối ưu giao diện mobile & bottom navigation
│
├── data/
│   ├── classes_data.js       # Dữ liệu TKB 61 lớp học (JS bundle nạp vào web)
│   └── classes_database.json # File JSON thô phục vụ tích hợp API/Backend
│
├── scripts/
│   └── update_tkb.py        # Tool Python trích xuất PDF tự động
│
├── cap_nhat_tkb.bat         # Tool Windows 1-click kéo thả cập nhật file PDF
├── .gitignore              # Cấu hình bỏ qua file tạm cho Git
├── LICENSE                 # Giấy phép mã nguồn mở (MIT License)
└── README.md                # Tài liệu hướng dẫn sử dụng & triển khai
```

---

## 4. Hướng Dẫn Sử Dụng & Triển Khai (Deployment)

### Chạy trực tiếp trên máy:
- Không cần cài đặt bất kỳ phần mềm hay Node.js nào. Chỉ cần nhấp đúp mở file `index.html` bằng trình duyệt web bất kỳ.

### Triển khai lên GitHub Pages (Miễn phí):
1. Tạo một repository mới trên tài khoản GitHub của bạn.
2. Đẩy toàn bộ mã nguồn lên:
   ```bash
   git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
   git push -u origin main
   ```
3. Vào **Settings** > **Pages** trên GitHub repository, tại mục **Branch** chọn `main` và thư mục `/(root)` > bấm **Save**.
4. Trang web sẽ có link online công khai để xem trên mọi thiết bị di động và máy tính!

---

## 5. Bản Quyền (License)

Dự án được phát hành dưới giấy phép mã nguồn mở [MIT License](LICENSE).
