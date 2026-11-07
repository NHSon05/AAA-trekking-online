---
title: Untitled
---

# SON TRA — Beyond The Map

> **Explore in 3D. Discover with AI. Experience Nature.**

Website khám phá và trải nghiệm leo núi trực tuyến tại bán đảo Sơn Trà, Đà Nẵng. Người dùng có thể khám phá địa hình 3D, tìm hiểu các địa điểm nổi bật, lựa chọn tuyến đường, chuẩn bị hành trang và tương tác với trợ lý AI.

---

## 1. Giới thiệu dự án

### 1.1. Tổng quan

**SON TRA — Beyond The Map** là một website mô phỏng trải nghiệm khám phá Sơn Trà theo hướng tương tác trực quan.

Thay vì chỉ xem bản đồ 2D hoặc đọc thông tin du lịch thông thường, người dùng có thể:

- Quan sát địa hình Sơn Trà trên bản đồ 3D.
- Khám phá các địa điểm nổi bật như Đỉnh Bàn Cờ, Chùa Linh Ứng và các điểm tham quan khác.
- Xem thông tin giới thiệu, hình ảnh và đặc điểm của từng địa điểm.
- Lựa chọn điểm xuất phát và điểm đến.
- Tham khảo tuyến đường, khoảng cách và thời gian di chuyển từ dịch vụ bản đồ.
- Chuẩn bị hành trang dựa trên thời gian và hình thức di chuyển.
- Trò chuyện với AI để nhận tư vấn và giải đáp các câu hỏi liên quan đến chuyến đi.

### 1.2. Mục tiêu

1. Xây dựng trải nghiệm khám phá Sơn Trà trực quan bằng bản đồ 3D.
2. Giúp người mới dễ dàng tìm hiểu các địa điểm và chuẩn bị cho chuyến đi.
3. Tích hợp AI để hỗ trợ tìm kiếm thông tin và lập kế hoạch.
4. Sử dụng các công nghệ bản đồ miễn phí hoặc mã nguồn mở để giảm chi phí.
5. Xây dựng một sản phẩm demo có giao diện hiện đại, dễ sử dụng và có khả năng mở rộng.

### 1.3. Đối tượng sử dụng

- Người lần đầu đến Sơn Trà.
- Khách du lịch muốn khám phá các địa điểm tại Đà Nẵng.
- Người yêu thích thiên nhiên và hoạt động ngoài trời.
- Người muốn tìm hiểu trước về tuyến đường và hành trang cần chuẩn bị.

---

## 2. Phạm vi dự án

### 2.1. Khu vực khám phá

Phạm vi ban đầu tập trung vào bán đảo Sơn Trà, Đà Nẵng.

Các địa điểm dự kiến:

| Địa điểm                | Nội dung                                     |
| ----------------------- | -------------------------------------------- |
| Đỉnh Bàn Cờ             | Giới thiệu địa điểm, hình ảnh và vị trí      |
| Chùa Linh Ứng           | Giới thiệu công trình và thông tin tham quan |
| Cây đa ngàn năm         | Giới thiệu điểm tham quan thiên nhiên        |
| Các điểm ngắm cảnh      | Khám phá cảnh quan và vị trí                 |
| Các tuyến đường Sơn Trà | Hiển thị đường đi và thông tin tuyến         |

**Lưu ý:** Danh sách địa điểm, tọa độ, tình trạng tiếp cận và tuyến đường cần được kiểm tra bằng nguồn dữ liệu đáng tin cậy trước khi đưa vào bản demo. Không mặc định rằng mọi đường trên bản đồ đều là đường leo núi hợp pháp hoặc an toàn.

### 2.2. Phạm vi phiên bản demo

Phiên bản đầu tiên tập trung vào:

- Bản đồ tương tác và địa hình 3D.
- Khám phá địa điểm.
- Lập kế hoạch tuyến đường cơ bản.
- Gợi ý hành trang.
- Trợ lý AI sử dụng OpenAI API.

Chưa yêu cầu:

- Định vị người dùng theo thời gian thực.
- Theo dõi hành trình bằng GPS.
- Cảnh báo cứu hộ.
- Dữ liệu thời tiết và tình trạng đường theo thời gian thực.
- Hệ thống tài khoản và quản lý người dùng.
- Thanh toán hoặc đặt tour.

---

## 3. Chức năng chính

### 3.1. Trang chủ — Landing Page

Mục tiêu: Tạo ấn tượng trực quan và giới thiệu trải nghiệm khám phá Sơn Trà.

Các thành phần:

- Hero section với hình ảnh hoặc video phong cảnh Sơn Trà.
- Tiêu đề: Explore Sơn Tra in a New Perspective.
- Nút Explore 3D Map.
- Giới thiệu những địa điểm nổi bật.
- Giới thiệu các trải nghiệm khám phá.
- Giới thiệu tính năng AI Trekking Assistant.
- Footer chứa thông tin dự án.

### 3.2. 3D Explorer — Khám phá bản đồ 3D

<details>
<summary>Chi tiết chức năng</summary>

Đây là chức năng trung tâm của website.

**Chức năng cơ bản:**

- Hiển thị bản đồ khu vực Sơn Trà.
- Phóng to, thu nhỏ và xoay bản đồ.
- Chuyển đổi giữa chế độ 2D và 3D nếu nguồn dữ liệu hỗ trợ.
- Hiển thị địa hình có độ cao.
- Hiển thị marker tại các địa điểm nổi bật.
- Nhấn vào marker để xem thông tin địa điểm.
- Hiển thị tuyến đường khi người dùng chọn hành trình.

**Thông tin khi chọn một địa điểm:**

- Tên địa điểm.
- Hình ảnh.
- Mô tả ngắn.
- Tọa độ.
- Độ cao nếu có nguồn dữ liệu.
- Các thông tin tham quan đã được xác minh.

**Trải nghiệm nâng cao:**

- Hiển thị địa hình dạng 3D.
- Tùy chỉnh góc camera.
- Hiển thị các điểm quan sát trên bản đồ.
- Kết hợp mô hình 3D được tạo từ Blender nếu cần.

</details>

### 3.3. Landmark Guide — Hướng dẫn địa điểm

Mục tiêu: Giúp người dùng tìm hiểu từng địa điểm trước khi tham quan.

Mỗi địa điểm có một trang hoặc một panel thông tin riêng.

Nội dung:

- Tên địa điểm.
- Hình ảnh.
- Mô tả.
- Vị trí trên bản đồ.
- Thông tin tham quan.
- Gợi ý chuẩn bị.
- Các địa điểm gần đó nếu có dữ liệu phù hợp.

Người dùng có thể chuyển trực tiếp từ trang giới thiệu địa điểm sang bản đồ 3D hoặc công cụ lập kế hoạch tuyến đường.

### 3.4. Smart Route Planner — Lập kế hoạch di chuyển

Mục tiêu: Cho phép người dùng lựa chọn hành trình và xem thông tin tuyến đường.

**Các lựa chọn:**

- Điểm xuất phát.
- Điểm đến.
- Hình thức di chuyển.
- Loại tuyến đường mong muốn.

**Các chế độ tuyến đường dự kiến:**

| Chế độ         | Ý nghĩa                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| Shortest Route | Tuyến có khoảng cách ngắn nhất theo dữ liệu định tuyến                                                        |
| Fastest Route  | Tuyến có thời gian ước tính ngắn nhất                                                                         |
| Scenic Route   | Tuyến ưu tiên các điểm tham quan, nếu có dữ liệu phù hợp                                                      |
| Easy Route     | Tuyến ưu tiên mức độ dễ đi, chỉ triển khai khi có dữ liệu độ dốc, mặt đường và khả năng tiếp cận đáng tin cậy |

**Thông tin kết quả:**

- Đường đi hiển thị trên bản đồ.
- Khoảng cách.
- Thời gian di chuyển ước tính.
- Điểm xuất phát và điểm đến.
- Các điểm trung gian nếu có.
- Gợi ý chuẩn bị phù hợp với hành trình.

**Nguyên tắc xử lý dữ liệu:**

Khoảng cách, hình học tuyến đường và thời gian di chuyển phải lấy từ dịch vụ định tuyến hoặc dữ liệu đã kiểm chứng.

AI chỉ có nhiệm vụ giải thích kết quả và hỗ trợ người dùng lựa chọn. AI không được tự tạo tọa độ, tự vẽ tuyến đường hoặc đưa ra thời gian di chuyển như dữ liệu thực tế.

### 3.5. Trekking Preparation — Chuẩn bị hành trang

Mục tiêu: Hỗ trợ người mới chuẩn bị trước khi khám phá Sơn Trà.

Các nhóm hành trang:

| Nhóm           | Vật dụng tham khảo              |
| -------------- | ------------------------------- |
| Nước uống      | Bình nước                       |
| Trang phục     | Quần áo thoải mái, giày phù hợp |
| Bảo vệ cá nhân | Mũ, kem chống nắng              |
| Thiết bị       | Điện thoại, pin dự phòng        |
| An toàn        | Bộ sơ cứu cơ bản                |
| Khác           | Túi đựng rác, giấy tờ cần thiết |

Người dùng có thể chọn:

- Đi bộ.
- Di chuyển bằng xe máy.
- Tham quan trong thời gian ngắn.
- Tham quan trong thời gian dài.

Website hiển thị checklist phù hợp với lựa chọn của người dùng.

**Lưu ý:** Đây là danh sách tham khảo, không thay thế hướng dẫn an toàn hoặc quy định tham quan tại địa phương.

### 3.6. AI Trekking Assistant — Trợ lý AI

Đây là chức năng AI chính của dự án và bắt buộc sử dụng OpenAI API Key.

AI đóng vai trò như một người hướng dẫn khám phá Sơn Trà.

**Nhóm chức năng 1 — Landmark Assistant**

Người dùng có thể hỏi:

- Đỉnh Bàn Cờ có gì đặc biệt?
- Chùa Linh Ứng nằm ở đâu?
- Có những địa điểm nào đáng khám phá tại Sơn Trà?

AI trả lời dựa trên dữ liệu địa điểm được cung cấp cho hệ thống.

**Nhóm chức năng 2 — Trip Planner**

Người dùng có thể yêu cầu:

- Gợi ý lịch trình tham quan.
- Tư vấn lựa chọn địa điểm.
- Giải thích các phương án tuyến đường.
- Gợi ý thời gian tham quan dựa trên dữ liệu đầu vào.

AI sử dụng dữ liệu tuyến đường do hệ thống cung cấp, không tự suy đoán khoảng cách hoặc thời gian.

**Nhóm chức năng 3 — Preparation Assistant**

Ví dụ:

- Tôi lần đầu đi Sơn Trà, cần chuẩn bị gì?
- Nếu đi trong vài giờ thì nên mang theo những gì?
- Tôi nên chuẩn bị trang phục như thế nào?

AI đưa ra gợi ý dựa trên thông tin chuyến đi và checklist của dự án.

**Nhóm chức năng 4 — AI Chat**

Giao diện chat cho phép người dùng đặt câu hỏi tự nhiên.

Một số câu hỏi mẫu:

- Hãy giới thiệu về Sơn Trà.
- Tôi muốn khám phá Đỉnh Bàn Cờ.
- Có thể kết hợp những địa điểm nào trong một chuyến đi?
- Hãy giải thích tuyến đường tôi vừa chọn.
- Tôi cần chuẩn bị gì cho chuyến đi?

**Nguyên tắc trả lời của AI:**

1. Ưu tiên dữ liệu được cung cấp từ hệ thống.
2. Không tự tạo thông tin địa lý hoặc tuyến đường.
3. Không khẳng định tình trạng đường đi nếu không có dữ liệu xác minh.
4. Phân biệt thông tin đã xác minh và thông tin tham khảo.
5. Nếu không có đủ dữ liệu, AI phải thông báo rõ rằng chưa thể xác minh.

---

## 4. Công nghệ sử dụng

### 4.1. Frontend

| Công nghệ          | Vai trò                    |
| ------------------ | -------------------------- |
| Next.js App Router | Framework xây dựng website |
| TypeScript         | Kiểm soát kiểu dữ liệu     |
| Tailwind CSS       | Xây dựng giao diện         |
| shadcn/ui          | Các thành phần giao diện   |
| Lucide React       | Icon                       |
| React Hook Form    | Quản lý biểu mẫu           |
| Zod                | Kiểm tra dữ liệu đầu vào   |

### 4.2. Bản đồ và địa hình 3D

| Công nghệ         | Vai trò                      |
| ----------------- | ---------------------------- |
| MapLibre GL JS    | Hiển thị bản đồ tương tác    |
| OpenFreeMap       | Nguồn bản đồ nền             |
| OpenStreetMap     | Dữ liệu địa lý               |
| DEM               | Dữ liệu độ cao địa hình      |
| Three.js          | Xây dựng cảnh 3D tùy chỉnh   |
| React Three Fiber | Tích hợp Three.js với React  |
| Drei              | Các tiện ích hỗ trợ Three.js |
| Blender           | Tạo mô hình 3D tùy chỉnh     |

**Lưu ý:** MapLibre là công cụ hiển thị bản đồ, không tự cung cấp toàn bộ dữ liệu bản đồ hoặc dữ liệu độ cao. Muốn hiển thị địa hình 3D cần có nguồn DEM tương thích.

### 4.3. Routing — Tính toán tuyến đường

| Công nghệ     | Vai trò                           |
| ------------- | --------------------------------- |
| Valhalla      | Tính toán tuyến đường             |
| OpenStreetMap | Dữ liệu đường đi                  |
| GeoJSON       | Lưu trữ và trao đổi dữ liệu tuyến |

Valhalla hỗ trợ nhiều hình thức di chuyển như đi bộ, xe đạp và ô tô. Tuy nhiên, cần kiểm tra khả năng định tuyến và chất lượng dữ liệu tại khu vực Sơn Trà trước khi sử dụng trong demo.

Có thể cân nhắc OSRM cho các tuyến đường phù hợp với cấu hình hỗ trợ của nó.

### 4.4. AI Integration

| Công nghệ     | Vai trò                     |
| ------------- | --------------------------- |
| OpenAI API    | Xử lý hội thoại và tư vấn   |
| OpenAI SDK    | Gửi yêu cầu đến API         |
| Responses API | Tạo phản hồi từ mô hình     |
| Zod           | Kiểm tra dữ liệu gửi đến AI |

### 4.5. Backend và dữ liệu

Phiên bản demo có thể sử dụng:

- Next.js Route Handlers.
- JSON để lưu dữ liệu địa điểm.
- GeoJSON để lưu dữ liệu không gian.
- Biến môi trường để quản lý API Key.

Chưa cần tích hợp database ngay từ đầu. Có thể bổ sung Supabase hoặc PostgreSQL khi cần tài khoản, lưu lịch trình hoặc quản lý dữ liệu động.

---

## 5. Kiến trúc hệ thống

### 5.1. Tổng quan

```text
                 USER
                   |
                   v
          NEXT.JS FRONTEND
                   |
        +----------+----------+
        |          |          |
        v          v          v
    3D MAP     ROUTE PLAN    AI CHAT
        |          |          |
        v          v          v
    MapLibre   Next.js API  Next.js API
        |          |          |
        v          v          v
 OpenFreeMap  Valhalla    OpenAI API
        |
        v
  Terrain / DEM
```

### 5.2. Luồng xử lý AI

```text
User
 |
 v
Chat Interface
 |
 v
POST /api/ai/chat
 |
 v
Validate Input
 |
 v
Load Relevant Landmark / Route Data
 |
 v
OpenAI API
 |
 v
Return AI Response
 |
 v
Display Answer
```

### 5.3. Luồng xử lý tuyến đường

```text
User selects start and destination
                 |
                 v
          Validate locations
                 |
                 v
          Route API request
                 |
                 v
              Valhalla
                 |
                 v
       Receive route information
                 |
                 v
       Display route on MapLibre
                 |
                 v
        Send route data to AI
                 |
                 v
      AI explains route to user
```

---

## 6. API Design

### 6.1. AI API

**POST `/api/ai/chat`**

Chức năng: Xử lý câu hỏi từ người dùng.

Request tham khảo:

```json
{
  "message": "Tôi muốn khám phá Đỉnh Bàn Cờ",
  "context": {
    "location": "Son Tra",
    "selectedLandmark": "Dinh Ban Co"
  }
}
```

Response tham khảo:

```json
{
  "success": true,
  "answer": "Thông tin tư vấn từ AI"
}
```

**POST `/api/ai/guide`**

Chức năng: Tạo nội dung hướng dẫn dựa trên dữ liệu địa điểm.

Request tham khảo:

```json
{
  "landmarkId": "dinh-ban-co",
  "language": "vi"
}
```

### 6.2. Route API

**POST `/api/routes`**

Chức năng: Nhận điểm xuất phát, điểm đến và hình thức di chuyển, sau đó gọi dịch vụ định tuyến.

Request tham khảo:

```json
{
  "origin": {
    "lat": 16.0,
    "lng": 108.0
  },
  "destination": {
    "lat": 16.0,
    "lng": 108.1
  },
  "mode": "pedestrian"
}
```

Các tọa độ trên chỉ là dữ liệu minh họa cấu trúc request, không phải tọa độ địa điểm thực tế.

Response nên chứa:

- Geometry của tuyến đường.
- Khoảng cách do dịch vụ định tuyến trả về.
- Thời gian ước tính do dịch vụ định tuyến trả về.
- Các thông tin cần thiết để hiển thị tuyến.

### 6.3. Bảo mật API Key

Tạo file `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=your_supported_model

ROUTING_API_URL=your_routing_service_url
```

**Quy tắc bảo mật:**

- Không đặt OpenAI API Key trong biến `NEXT_PUBLIC_*`.
- Không gọi OpenAI trực tiếp từ trình duyệt bằng Secret API Key.
- Chỉ gọi OpenAI thông qua backend.
- Không commit `.env.local` lên GitHub.
- Kiểm tra dữ liệu đầu vào trước khi gọi API.
- Có thể bổ sung giới hạn số lần gọi API để kiểm soát chi phí.

---

## 7. Cấu trúc thư mục dự kiến

```text
son-tra-beyond-the-map/
│
├── public/
│   ├── images/
│   │   ├── landmarks/
│   │   └── hero/
│   │
│   ├── models/
│   └── icons/
│
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   │
│   │   ├── explorer/
│   │   │   └── page.tsx
│   │   │
│   │   ├── landmarks/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── planner/
│   │   │   └── page.tsx
│   │   │
│   │   ├── preparation/
│   │   │   └── page.tsx
│   │   │
│   │   └── api/
│   │       ├── ai/
│   │       │   ├── chat/
│   │       │   │   └── route.ts
│   │       │   └── guide/
│   │       │       └── route.ts
│   │       │
│   │       └── routes/
│   │           └── route.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── map/
│   │   ├── landmarks/
│   │   ├── planner/
│   │   ├── preparation/
│   │   └── ai-chat/
│   │
│   ├── data/
│   │   ├── landmarks.json
│   │   ├── routes.json
│   │   └── checklist.json
│   │
│   ├── lib/
│   │   ├── openai.ts
│   │   ├── map.ts
│   │   ├── routing.ts
│   │   └── utils.ts
│   │
│   ├── types/
│   │   ├── landmark.ts
│   │   ├── route.ts
│   │   └── chat.ts
│   │
│   └── styles/
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 8. Giao diện và trải nghiệm người dùng

### 8.1. Định hướng thiết kế

Phong cách thiết kế:

- Nature Exploration.
- Modern Outdoor Experience.
- Minimalist.
- Immersive 3D.
- Kết hợp hình ảnh thiên nhiên với giao diện công nghệ hiện đại.

### 8.2. Màu sắc tham khảo

| Màu          | Mục đích            |
| ------------ | ------------------- |
| Forest Green | Màu chủ đạo         |
| Deep Green   | Nền và khu vực nhấn |
| Sand Beige   | Màu nền phụ         |
| White        | Nội dung và card    |
| Sky Blue     | Thông tin bản đồ    |

### 8.3. Các trang chính

| Trang               | Nội dung                 |
| ------------------- | ------------------------ |
| `/`                 | Trang giới thiệu         |
| `/explorer`         | Bản đồ 3D                |
| `/landmarks/[slug]` | Chi tiết địa điểm        |
| `/planner`          | Lập kế hoạch tuyến đường |
| `/preparation`      | Chuẩn bị hành trang      |

AI Chat có thể xuất hiện dưới dạng widget dùng chung trên các trang.

---

## 9. Cài đặt môi trường phát triển

### 9.1. Công cụ cần thiết

| Công cụ             | Mục đích                   |
| ------------------- | -------------------------- |
| Node.js LTS         | Môi trường chạy JavaScript |
| pnpm                | Quản lý package            |
| Cursor hoặc VS Code | IDE                        |
| Git                 | Quản lý phiên bản          |
| GitHub              | Lưu trữ source code        |
| Blender             | Tạo tài nguyên 3D          |
| Chrome              | Kiểm tra website           |
| OpenAI Platform     | Quản lý API Key            |

### 9.2. Khởi tạo dự án

```bash
pnpm create next-app@latest son-tra-beyond-the-map
```

Chọn TypeScript, App Router và các cấu hình phù hợp.

### 9.3. Cài đặt thư viện

```bash
pnpm add maplibre-gl
pnpm add openai zod
pnpm add lucide-react
pnpm add react-hook-form
```

Nếu cần xây dựng mô hình 3D tùy chỉnh:

```bash
pnpm add three @react-three/fiber @react-three/drei
```

Nếu cần giao diện shadcn/ui, khởi tạo và cài đặt các component cần sử dụng theo tài liệu chính thức.

---

## 10. Kế hoạch triển khai

### Phase 1 — Project Setup

- Khởi tạo Next.js.
- Cài đặt TypeScript và Tailwind CSS.
- Thiết lập cấu trúc thư mục.
- Cấu hình shadcn/ui.
- Tạo layout và navigation.
- Thiết lập biến môi trường.

**Kết quả:** Website có cấu trúc và giao diện nền tảng.

### Phase 2 — UI Development

- Xây dựng Landing Page.
- Xây dựng Landmark Guide.
- Xây dựng giao diện Route Planner.
- Xây dựng giao diện Preparation.
- Xây dựng giao diện AI Chat.

**Kết quả:** Hoàn thiện giao diện các chức năng chính.

### Phase 3 — 3D Map Integration

- Tích hợp MapLibre GL JS.
- Kết nối OpenFreeMap.
- Hiển thị khu vực Sơn Trà.
- Thêm marker địa điểm.
- Hiển thị panel thông tin.
- Tích hợp dữ liệu DEM nếu tìm được nguồn phù hợp.
- Thử nghiệm chế độ terrain 3D.

**Kết quả:** Có thể khám phá bản đồ và địa điểm trên giao diện tương tác.

### Phase 4 — Route Planner

- Tích hợp Valhalla.
- Xây dựng form chọn điểm xuất phát và điểm đến.
- Xử lý lựa chọn hình thức di chuyển.
- Hiển thị tuyến đường.
- Hiển thị khoảng cách và thời gian từ kết quả định tuyến.
- Kiểm tra các tuyến đường thực tế tại Sơn Trà.

**Kết quả:** Người dùng có thể thử lập kế hoạch di chuyển.

### Phase 5 — OpenAI Integration

- Cấu hình OpenAI API Key.
- Xây dựng backend API.
- Tạo prompt cho AI Trekking Assistant.
- Cung cấp dữ liệu địa điểm cho AI.
- Cung cấp dữ liệu tuyến đường cho AI.
- Xử lý lỗi và trường hợp thiếu dữ liệu.
- Xây dựng giao diện chat.

**Kết quả:** AI có thể trả lời câu hỏi và tư vấn dựa trên dữ liệu của dự án.

### Phase 6 — 3D Assets & Optimization

- Tạo hoặc chỉnh sửa mô hình 3D bằng Blender.
- Tối ưu kích thước và định dạng tài nguyên.
- Tối ưu tải bản đồ.
- Tối ưu hình ảnh.
- Kiểm tra hiệu suất trên desktop và mobile.

**Kết quả:** Cải thiện trải nghiệm trực quan và hiệu suất.

### Phase 7 — Testing & Demo

- Kiểm tra các trang.
- Kiểm tra bản đồ.
- Kiểm tra tuyến đường.
- Kiểm tra AI Chat.
- Kiểm tra API Key và lỗi API.
- Kiểm tra giao diện responsive.
- Chuẩn bị kịch bản demo.

---

## 11. Yêu cầu chất lượng và kiểm thử

### 11.1. Functional Testing

| Chức năng     | Kết quả mong muốn               |
| ------------- | ------------------------------- |
| Landing Page  | Hiển thị đầy đủ nội dung        |
| 3D Explorer   | Bản đồ tương tác được           |
| Landmark      | Chọn địa điểm và xem thông tin  |
| Route Planner | Trả về tuyến nếu dịch vụ hỗ trợ |
| Preparation   | Hiển thị checklist              |
| AI Chat       | Gửi câu hỏi và nhận phản hồi    |
| API Error     | Hiển thị lỗi dễ hiểu            |

### 11.2. Data Validation

- Không sử dụng tọa độ giả làm dữ liệu thật.
- Không tự tạo tuyến đường khi API lỗi.
- Không hiển thị thời gian di chuyển do AI tự ước lượng như kết quả định tuyến.
- Ghi rõ nguồn dữ liệu địa lý.
- Kiểm tra dữ liệu địa điểm trước khi đưa vào hệ thống.
- Phân biệt rõ dữ liệu mẫu và dữ liệu đã xác minh.

### 11.3. Performance

- Tải bản đồ theo nhu cầu.
- Lazy load các thành phần 3D nặng.
- Tối ưu mô hình Blender.
- Nén hình ảnh.
- Tránh tải tất cả địa điểm và tài nguyên cùng lúc.
- Tối ưu trải nghiệm trên thiết bị có cấu hình thấp.

---

## 12. Giới hạn và lưu ý kỹ thuật

### 12.1. Về bản đồ miễn phí

MapLibre là thư viện hiển thị bản đồ, không phải nhà cung cấp dữ liệu bản đồ.

OpenFreeMap có cung cấp bản đồ nền công khai và công bố chính sách sử dụng miễn phí tại thời điểm tham khảo. Tuy nhiên, dịch vụ công khai có thể thay đổi chính sách hoặc khả năng cung cấp.

Không nên mặc định rằng mọi dịch vụ bản đồ miễn phí đều có SLA hoặc phù hợp với lưu lượng lớn.

### 12.2. Về dữ liệu địa hình 3D

Muốn tạo địa hình 3D cần nguồn dữ liệu độ cao DEM phù hợp.

Nếu không có nguồn DEM phù hợp, phiên bản đầu tiên có thể sử dụng bản đồ 2D có hiệu ứng nghiêng và camera 3D, sau đó bổ sung địa hình thật khi có dữ liệu.

### 12.3. Về dữ liệu tuyến đường

Dữ liệu OpenStreetMap có thể không đầy đủ đối với một số đường mòn hoặc lối đi tại Sơn Trà.

Cần kiểm tra:

- Tuyến có tồn tại trong dữ liệu hay không.
- Tuyến có phù hợp với phương thức di chuyển không.
- Có hạn chế tiếp cận hay không.
- Có thông tin về độ dốc và mặt đường hay không.

Không sử dụng nhãn Easy Route nếu chưa có dữ liệu đủ tin cậy để đánh giá mức độ dễ đi.

### 12.4. Về AI

AI không phải nguồn xác thực dữ liệu bản đồ.

Các thông tin liên quan đến địa điểm, tọa độ, tuyến đường và điều kiện tham quan cần được lấy từ dữ liệu của hệ thống hoặc nguồn có thể kiểm tra.

---

## 13. Tiêu chí hoàn thành bản demo

Bản demo được xem là đạt mục tiêu khi:

- [ ] Có Landing Page hoàn chỉnh.
- [ ] Hiển thị được bản đồ khu vực Sơn Trà.
- [ ] Có thể tương tác với bản đồ.
- [ ] Có các marker địa điểm nổi bật.
- [ ] Có thông tin chi tiết địa điểm.
- [ ] Có giao diện lập kế hoạch tuyến đường.
- [ ] Có thể hiển thị tuyến đường từ dịch vụ định tuyến khi dữ liệu hỗ trợ.
- [ ] Có checklist chuẩn bị hành trang.
- [ ] Có AI Chat sử dụng OpenAI API Key.
- [ ] AI có thể trả lời dựa trên dữ liệu địa điểm.
- [ ] AI có thể giải thích dữ liệu tuyến đường.
- [ ] Không để lộ API Key ở phía client.
- [ ] Có thông báo khi thiếu dữ liệu hoặc API gặp lỗi.
- [ ] Giao diện responsive.
- [ ] Có thể trình diễn trọn vẹn một hành trình mẫu.

---

## 14. Kịch bản trình diễn

Một kịch bản demo đề xuất:

**Bước 1 — Khám phá**

Người dùng truy cập website và xem phần giới thiệu về Sơn Trà.

**Bước 2 — Mở bản đồ**

Người dùng mở 3D Explorer, quan sát địa hình và chọn một địa điểm.

**Bước 3 — Tìm hiểu địa điểm**

Người dùng xem thông tin Đỉnh Bàn Cờ hoặc Chùa Linh Ứng.

**Bước 4 — Lập kế hoạch**

Người dùng chọn điểm xuất phát, điểm đến và hình thức di chuyển.

**Bước 5 — Xem tuyến đường**

Website hiển thị tuyến đường, khoảng cách và thời gian ước tính từ dịch vụ định tuyến.

**Bước 6 — Chuẩn bị**

Người dùng mở checklist để xem những vật dụng nên chuẩn bị.

**Bước 7 — Hỏi AI**

Người dùng hỏi AI về địa điểm hoặc yêu cầu giải thích tuyến đường vừa chọn.

**Kết quả:** Người dùng có thể trải nghiệm một quy trình khám phá Sơn Trà từ tìm hiểu địa điểm đến lập kế hoạch và chuẩn bị hành trình.

---

## 15. Tài liệu tham khảo

Các tài liệu kỹ thuật chính:

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [OpenFreeMap](https://openfreemap.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [OpenStreetMap Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)
- [Valhalla Documentation](https://valhalla.github.io/valhalla/)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://r3f.docs.pmnd.rs/)
- [Blender Manual](https://docs.blender.org/manual/en/latest/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)

---

## 16. Định hướng phát triển

Sau khi hoàn thành bản demo, có thể cân nhắc mở rộng:

- Tạo các hành trình khám phá theo chủ đề.
- Thêm nhiều địa điểm và dữ liệu địa lý.
- Tích hợp dữ liệu thời tiết từ nguồn phù hợp.
- Hỗ trợ lưu lịch trình.
- Tích hợp GPS để theo dõi hành trình.
- Bổ sung mô hình 3D chi tiết.
- Tạo hướng dẫn bằng giọng nói.
- Xây dựng hệ thống quản lý dữ liệu địa điểm.

Các tính năng mở rộng chỉ nên triển khai khi có nguồn dữ liệu và điều kiện kỹ thuật phù hợp.

---

**SON TRA — Beyond The Map**

_Explore in 3D. Discover with AI. Experience Nature._
