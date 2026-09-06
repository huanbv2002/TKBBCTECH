# Thời Khóa Biểu Thông Minh (Smart Timetable)

Ứng dụng tra cứu và quản lý **Thời Khóa Biểu thông minh**, tối ưu hiển thị hoàn hảo trên cả máy tính (Desktop) và điện thoại di động (Responsive Mobile UI). Hỗ trợ tra cứu 61 lớp học toàn trường, ghi chú cá nhân theo ngày, tra cứu lộ trình 22 tuần học kỳ kèm lịch nghỉ Lễ/Tết chính thức, và trích xuất dữ liệu trực tiếp từ file PDF trên trình duyệt.

---

## Tính Năng Nổi Bật

- **Lịch học tuần (Week View)**:
  - Phân chia rõ ràng theo các ca học: **Sáng / Chiều**.
  - Thẻ môn học thiết kế dạng **Pastel Card** mềm mại, không viền, hiển thị trực quan tên môn, phòng học, giảng viên và khung giờ.
  - Màu nền xám êm dịu cho các ngày và buổi không có tiết học.
  - Tự động nhảy đến đúng Tuần & Thứ hiện tại khi mở web. Nút **"Hôm nay"** giúp quay về lịch thực tế bất kỳ lúc nào.

- **Chế độ xem linh hoạt trên Điện thoại (Mobile-First)**:
  - **Từng ngày**: Xem chi tiết 1 ngày, có thanh thứ **T2 → CN** và hỗ trợ **vuốt chạm màn hình qua lại** để chuyển ngày.
  - **Cả tuần**: Xem toàn bộ tuần trên một màn hình với 2 dạng hiển thị tùy chọn:
    - **Lưới ngang**: Lưới 7 cột (T2 → CN) thiết kế vừa khít 100% chiều ngang điện thoại, không cần cuộn ngang.
    - **Bảng dọc**: Bảng chia thứ theo hàng dọc và 2 cột Sáng/Chiều gọn gàng.
  - Thanh điều hướng chuyển tuần/tháng đặt ở **dưới cùng và căn giữa**, cực kỳ thuận tiện khi thao tác bằng 1 tay.

- **Lịch tháng & Ghi chú cá nhân (Month View & Notes)**:
  - Xem tổng quan lịch học của tất cả các ngày trong tháng.
  - Thêm, xem và xóa ghi chú cá nhân (nhắc nộp bài tập, thi cử, deadline...) cho từng ngày.
  - Tự động lưu trữ an toàn trên trình duyệt (`LocalStorage`), không lo mất dữ liệu.

- **Bảng tham chiếu 22 tuần & Lịch nghỉ Lễ/Tết (Reference View)**:
  - Bảng tra cứu chuẩn 22 tuần học kỳ (18 tuần chính khóa, 2 tuần dự trữ & thi, 2 tuần nghỉ Tết).
  - Mục **Các ngày nghỉ Lễ & Tết** hiển thị dạng **Lưới 2 cột song song** gọn gàng.
  - **Click-to-jump**: Bấm vào bất kỳ hàng tuần hoặc thẻ ngày nghỉ lễ để mở ngay lịch học của tuần đó.

- **Hộp tìm kiếm lớp học toàn trường (Searchable Class Picker)**:
  - Tìm kiếm tức thì trong 61 lớp học theo mã lớp (CD25, CD24, T25...) hoặc tên ngành học (CNTT, Ô tô, Điện, Cơ khí...).
  - Tìm kiếm thông minh không phân biệt dấu tiếng Việt (Accent-insensitive) và bôi đậm từ khóa khớp.
  - Hỗ trợ phím tắt tiện lợi: `Ctrl + K` hoặc `/` để mở tìm kiếm; dùng phím `↑`/`↓` và `Enter` để chọn.

- **Cập nhật PDF trực tiếp trên Web (In-Browser PDF.js)**:
  - Kéo & thả file PDF Thời khóa biểu mới vào trình duyệt.
  - Tự động bóc tách mã lớp, môn học, giảng viên, phòng học, thứ, tiết và tuần học ngay trên trình duyệt mà không cần cài đặt Python.
  - Tùy chọn tải file `classes_data.js` để lưu cố định vào mã nguồn.

- **Hướng dẫn sử dụng tương tác (Interactive Onboarding Tour)**:
  - 6 bước hướng dẫn trực quan, chiếu sáng từng nút chức năng với lời văn mộc mạc, gần gũi, phù hợp cho mọi lứa tuổi và phụ huynh.

---

## Phím Tắt Tiện Lợi (Trên Máy Tính)

| Phím tắt | Thao tác |
| :--- | :--- |
| `Ctrl + K` hoặc `/` | Mở nhanh hộp tìm kiếm lớp học |
| `↑` / `↓` | Di chuyển lên / xuống giữa các lớp |
| `Enter` | Chọn lớp đang trỏ tới |
| `Escape` | Đóng hộp thoại tìm kiếm / Modal |

---

## Cấu Trúc Thư Mục Dự Án (Modular Architecture)

```
TKB/
├── index.html            # File HTML chính của ứng dụng
├── src/
│   ├── js/
│   │   ├── config.js        # Cấu hình, mốc giờ ca học, danh mục ngày nghỉ lễ
│   │   ├── utils.js         # Tiện ích ngày tháng, formatters, bộ lọc tiếng Việt
│   │   ├── storage.js       # Dịch vụ lưu trữ LocalStorage (ghi chú, settings)
│   │   ├── views/
│   │   │   ├── week-view.js      # Render Lịch tuần, dải thứ và chế độ mobile
│   │   │   ├── month-view.js     # Render Lịch tháng & sự kiện
│   │   │   ├── reference-view.js # Render Bảng 22 tuần & Lễ Tết
│   │   │   └── note-modal.js     # Modal thêm / xem / xóa ghi chú theo ngày
│   │   ├── components/
│   │   │   ├── class-picker.js   # Hộp thoại tìm kiếm & chọn lớp toàn trường (Ctrl+K)
│   │   │   ├── pdf-uploader.js   # Bộ trích xuất file PDF trực tiếp trên web (PDF.js)
│   │   │   └── tour.js           # Hướng dẫn sử dụng tương tác từng bước
│   │   └── main.js          # Khởi tạo ứng dụng & gắn kết các sự kiện điều hướng
│   │
│   └── css/
│       ├── main.css         # Entry point CSS nạp toàn bộ module
│       ├── variables.css    # Design System (biến màu sắc, fonts, shadows)
│       ├── base.css         # Reset CSS, App Shell, Topbar, Sidebar
│       ├── components.css   # Nút bấm, dropdown, modal, dropzone PDF
│       ├── week-view.css    # Styles cho bảng Lịch tuần
│       ├── month-view.css   # Styles cho Lịch tháng
│       ├── reference-view.css # Styles cho Bảng tham chiếu 22 tuần
│       ├── tour.css         # Styles cho hướng dẫn tương tác
│       └── responsive.css   # Styles responsive & tối ưu giao diện điện thoại
│
├── data/
│   ├── classes_data.js       # Dữ liệu TKB 61 lớp học (JS bundle)
│   └── classes_database.json # File JSON thô để tích hợp API/Backend
│
├── scripts/
│   └── update_tkb.py        # Tool Python trích xuất PDF tự động
│
├── cap_nhat_tkb.bat         # Tool Windows 1-click kéo thả cập nhật PDF
├── .gitignore              # Cấu hình bỏ qua file tạm cho Git
├── LICENSE                 # Giấy phép mã nguồn mở (MIT License)
└── README.md                # Tài liệu hướng dẫn sử dụng
```

---

## Hướng Dẫn Triển Khai (Deployment)

### 1. Chạy trực tiếp (Không cần cài đặt):
- Nhấp đúp mở file `index.html` bằng bất kỳ trình duyệt nào.
- Hoặc deploy trực tiếp lên **GitHub Pages**, **Vercel**, **Netlify**, **Cloudflare Pages** hoàn toàn miễn phí.

### 2. Triển khai lên GitHub Pages:
1. Tạo repository mới trên GitHub.
2. Đẩy toàn bộ mã nguồn lên:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Smart Timetable web app"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```
3. Vào **Settings** > **Pages** trên GitHub, chọn Branch `main` và thư mục `/(root)` > bấm **Save**. Trang web sẽ tự động online sau 1 phút!

---

## Bản Quyền (License)

Dự án được phân phối dưới giấy phép mã nguồn mở [MIT License](LICENSE).
