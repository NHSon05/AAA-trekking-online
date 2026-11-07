---
title: Untitled

---

# SON TRA — BEYOND THE MAP
## IMMERSIVE 3D TREKKING WEBSITE — PROJECT SPECIFICATION

**Tagline:** Explore in 3D. Discover with AI. Experience Nature.

| Thông tin | Nội dung |
|---|---|
| Project | SON TRA — Beyond The Map |
| Location | Sơn Trà Peninsula, Đà Nẵng, Việt Nam |
| Product Type | Interactive 3D Exploration Website |
| Experience | First-Person / Third-Person |
| Main Technology | Next.js, React Three Fiber, Three.js |
| 3D Modeling | Blender |
| AI Integration | OpenAI API |
| Map & Terrain | MapLibre, OpenStreetMap, DEM |
| Project Scope | Web-based 3D trekking experience |

---

# 1. PROJECT VISION

## 1.1. Ý tưởng chính

Xây dựng một website cho phép người dùng tham gia chuyến trekking ảo tại bán đảo Sơn Trà, Đà Nẵng.

Thay vì chỉ quan sát bản đồ hoặc mô hình địa hình từ bên ngoài, người dùng sẽ nhập vai một nhân vật 3D và trực tiếp khám phá thế giới.

Người dùng có thể:

- Chọn nhân vật đại diện.
- Tùy chỉnh trang phục và trang bị.
- Chuẩn bị hành trang trước chuyến đi.
- Điều khiển nhân vật di chuyển trong môi trường 3D.
- Quan sát thế giới bằng góc nhìn thứ nhất.
- Chuyển sang góc nhìn thứ ba để quan sát nhân vật.
- Khám phá rừng, núi, đường đi và các địa điểm nổi tiếng.
- Tương tác với các landmark.
- Tìm hiểu thông tin địa điểm bằng AI.
- Lựa chọn hành trình khám phá.

## 1.2. Trải nghiệm mong muốn

Người dùng cần có cảm giác mình đang trực tiếp tham gia một chuyến trekking.

Ví dụ:

1. Người dùng mở website.
2. Chọn Start Exploring.
3. Chọn nhân vật.
4. Chuẩn bị balo, giày, nước uống và các vật dụng.
5. Bắt đầu tại một điểm xuất phát ở Sơn Trà.
6. Điều khiển nhân vật đi trên đường.
7. Quan sát rừng và cảnh quan xung quanh.
8. Tiến đến một địa điểm tham quan.
9. Nhấn nút tương tác để tìm hiểu địa điểm.
10. Hỏi AI về lịch sử, cảnh quan hoặc thông tin trekking.

**Nguyên tắc:** Người dùng là nhân vật đang khám phá thế giới, không phải người đứng ngoài quan sát một mô hình 3D.

---

# 2. EXPERIENCE DESIGN

## 2.1. Camera System

Website hỗ trợ hai chế độ camera.

### A. First-Person View — Góc nhìn thứ nhất

Đây là chế độ trải nghiệm chính.

Camera đặt tại vị trí mắt của nhân vật. Người dùng nhìn thấy môi trường từ góc nhìn của người đang trekking.

Các yêu cầu:

- Camera di chuyển theo nhân vật.
- Có thể nhìn trái, phải, lên và xuống.
- Có thể nhìn thấy tay hoặc một phần trang bị của nhân vật.
- Có hiệu ứng chuyển động nhẹ khi đi bộ.
- Có thể tương tác với vật thể phía trước.
- Không hiển thị toàn bộ cơ thể nhân vật trong góc nhìn này.

Tham khảo hình ảnh:

- https://www.google.com/search?tbm=isch&q=first+person+hiking+game+forest+environment
- https://www.pinterest.com/search/pins/?q=first%20person%20adventure%20game%20environment

### B. Third-Person View — Góc nhìn thứ ba

Camera đặt phía sau nhân vật.

Các yêu cầu:

- Hiển thị toàn bộ nhân vật.
- Camera theo dõi chuyển động.
- Có thể xoay camera quanh nhân vật.
- Có thể điều chỉnh khoảng cách camera.
- Camera không xuyên qua địa hình hoặc vật thể.
- Nhân vật có hoạt ảnh đi bộ, chạy và đứng.

Tham khảo hình ảnh:

- https://www.google.com/search?tbm=isch&q=third+person+hiking+adventure+game
- https://www.pinterest.com/search/pins/?q=third%20person%20adventure%20game%20environment

### C. Camera Switching

Người dùng có thể chuyển đổi giữa First Person và Third Person trong khi đang khám phá.

| Chế độ | Mục đích |
|---|---|
| First Person | Trải nghiệm nhập vai |
| Third Person | Quan sát nhân vật |
| Free Camera | Chỉ sử dụng khi cần xem hoặc kiểm tra môi trường, không phải chế độ trekking chính |

---

# 3. CHARACTER SYSTEM — HỆ THỐNG NHÂN VẬT

## 3.1. Character Model

Nhân vật là trung tâm của toàn bộ trải nghiệm.

Nhân vật phải có:

- Mô hình 3D hoàn chỉnh.
- Skeleton / Rig.
- Animation.
- Hệ thống điều khiển.
- Camera attachment.
- Collision.
- Tương tác với môi trường.

Tham khảo:

- https://www.pinterest.com/search/pins/?q=3d%20hiking%20game%20character
- https://www.pinterest.com/search/pins/?q=3d%20adventure%20game%20character
- https://www.mixamo.com/

## 3.2. Character Selection

Người dùng có thể chọn nhân vật trước khi bắt đầu.

Danh sách dự kiến:

| ID | Nhân vật | Mô tả |
|---|---|---|
| CH-001 | Male Explorer | Nhân vật nam |
| CH-002 | Female Explorer | Nhân vật nữ |
| CH-003 | Custom Explorer | Nhân vật tùy chỉnh trong tương lai |

Các tùy chỉnh có thể hỗ trợ:

- Kiểu tóc.
- Màu tóc.
- Trang phục.
- Màu trang phục.
- Balo.
- Giày.
- Phụ kiện.

## 3.3. Character Animation

| Animation | Mô tả | Ưu tiên |
|---|---|---|
| Idle | Đứng yên | High |
| Walk | Đi bộ | Critical |
| Run | Chạy | High |
| Turn | Xoay hướng | High |
| Jump | Nhảy | Medium |
| Look Around | Quan sát xung quanh | Medium |
| Interact | Tương tác | High |
| Climb | Leo địa hình | Future |
| Crouch | Ngồi thấp | Future |

Không cần triển khai tất cả animation ngay từ đầu. MVP cần có Idle, Walk, Run và Interact.

## 3.4. Character Controller

Điều khiển trên desktop:

| Phím | Hành động |
|---|---|
| W | Di chuyển về phía trước |
| S | Di chuyển lùi |
| A | Di chuyển sang trái |
| D | Di chuyển sang phải |
| Shift | Chạy |
| Space | Nhảy nếu được hỗ trợ |
| Mouse | Xoay camera |
| E | Tương tác |
| V | Chuyển góc nhìn |
| Esc | Mở menu |

Điều khiển trên mobile:

- Joystick ảo bên trái để di chuyển.
- Khu vực bên phải để xoay camera.
- Nút chạy.
- Nút tương tác.
- Nút chuyển camera.

---

# 4. EQUIPMENT SYSTEM — HỆ THỐNG TRANG BỊ

## 4.1. Mục tiêu

Người dùng có thể chuẩn bị trang bị trước khi bắt đầu chuyến trekking.

Trang bị cần được hiển thị trực quan và có thể gắn lên nhân vật khi phù hợp.

## 4.2. Danh sách trang bị

| ID | Item | Mô tả | 3D Asset |
|---|---|---|---|
| EQ-001 | Backpack | Balo trekking | Required |
| EQ-002 | Hiking Shoes | Giày trekking | Required |
| EQ-003 | Water Bottle | Bình nước | Required |
| EQ-004 | Compass | La bàn | Optional |
| EQ-005 | Trekking Poles | Gậy trekking | Optional |
| EQ-006 | Camera | Máy ảnh | Optional |
| EQ-007 | Hat | Mũ | Optional |
| EQ-008 | Map | Bản đồ | Required |
| EQ-009 | First Aid Kit | Bộ sơ cứu | Optional |
| EQ-010 | Raincoat | Áo mưa | Optional |

## 4.3. Equipment Interface

Giao diện chuẩn bị cần có:

- Character Preview.
- Equipment List.
- Item Detail.
- Selected Equipment.
- Preparation Checklist.
- Start Trekking Button.

## 4.4. Equipment Interaction

Trong phiên bản mở rộng:

- Người dùng có thể mở balo.
- Xem danh sách trang bị.
- Chọn vật phẩm.
- Xem mô hình vật phẩm.
- Gắn hoặc tháo phụ kiện khỏi nhân vật.

Không cần triển khai hệ thống inventory phức tạp trong MVP.

---

# 5. WORLD ENVIRONMENT — THẾ GIỚI 3D SƠN TRÀ

## 5.1. Mục tiêu

Tạo một môi trường 3D có thể di chuyển và khám phá.

Thế giới phải bao gồm:

- Địa hình.
- Núi.
- Rừng.
- Đường giao thông.
- Đường mòn.
- Biển.
- Landmark.
- Cây cối.
- Đá.
- Ánh sáng.
- Bầu trời.

## 5.2. Terrain System

Địa hình là nền tảng của thế giới.

Các thành phần:

| ID | Thành phần | Mô tả |
|---|---|---|
| TN-001 | Terrain Mesh | Bề mặt địa hình |
| TN-002 | Elevation | Dữ liệu độ cao |
| TN-003 | Mountain Slopes | Sườn núi |
| TN-004 | Valleys | Thung lũng |
| TN-005 | Coastline | Đường bờ biển |
| TN-006 | Ocean | Mặt biển |
| TN-007 | Terrain Collision | Va chạm địa hình |
| TN-008 | Terrain Texture | Chất liệu bề mặt |

Nguồn dữ liệu tham khảo:

- https://www.openstreetmap.org/
- https://opentopomap.org/
- https://maplibre.org/maplibre-gl-js/docs/examples/3d-terrain/

Lưu ý:

- MapLibre có thể hiển thị bản đồ và terrain nhưng không tự cung cấp toàn bộ dữ liệu địa hình.
- Cần lựa chọn nguồn DEM phù hợp.
- Không được tự tạo độ cao địa lý rồi xem đó là độ cao thực tế.
- Địa hình game cần có collision để nhân vật không đi xuyên qua núi hoặc rơi khỏi bề mặt.

## 5.3. Forest Environment

Các đối tượng:

| ID | Object | Mô tả |
|---|---|---|
| FO-001 | Large Tree | Cây lớn |
| FO-002 | Small Tree | Cây nhỏ |
| FO-003 | Bush | Cây bụi |
| FO-004 | Grass | Cỏ |
| FO-005 | Fern | Dương xỉ |
| FO-006 | Vine | Dây leo |
| FO-007 | Rock | Đá |
| FO-008 | Moss | Rêu |
| FO-009 | Fallen Leaves | Lá rụng |
| FO-010 | Forest Floor | Nền rừng |

Tham khảo:

- https://unsplash.com/s/photos/tropical-forest
- https://unsplash.com/s/photos/rainforest
- https://www.pinterest.com/search/pins/?q=tropical%20forest%203d%20game%20environment

## 5.4. Environment Effects

| Effect | Mô tả | Ưu tiên |
|---|---|---|
| Daylight | Ánh sáng ban ngày | High |
| Shadows | Bóng cây và vật thể | High |
| Wind | Hiệu ứng gió | Medium |
| Moving Leaves | Lá cây chuyển động | Medium |
| Clouds | Mây | Medium |
| Fog | Sương | Optional |
| Ocean Waves | Sóng biển | Optional |
| Ambient Sound | Âm thanh môi trường | High |
| Birds Sound | Tiếng chim | Medium |
| Footsteps | Tiếng bước chân | High |

Các hiệu ứng phải được tối ưu để không làm giảm tốc độ tải và hiệu năng trình duyệt.

---

# 6. LANDMARK SYSTEM — ĐỊA ĐIỂM KHÁM PHÁ

## 6.1. Ban Co Peak — Đỉnh Bàn Cờ

Đây là một landmark quan trọng trong thế giới 3D.

### Danh sách 3D assets

| ID | Object | Mô tả |
|---|---|---|
| BC-001 | Chess Statue | Tượng người đánh cờ |
| BC-002 | Chess Table | Bàn cờ |
| BC-003 | Chess Pieces | Quân cờ |
| BC-004 | Statue Base | Bệ tượng |
| BC-005 | Ground | Mặt đất |
| BC-006 | Surrounding Rocks | Đá xung quanh |
| BC-007 | Vegetation | Cây xanh |
| BC-008 | Viewpoint | Khu vực ngắm cảnh |

### Trải nghiệm

- Nhân vật đi đến khu vực Đỉnh Bàn Cờ.
- Tiếp cận tượng.
- Nhận diện landmark.
- Nhấn E để tương tác.
- Hiển thị thông tin địa điểm.
- Có thể chuyển sang chế độ quan sát để xem toàn cảnh.

Ảnh tham khảo:

- https://www.google.com/search?tbm=isch&q=%C4%90%E1%BB%89nh+B%C3%A0n+C%E1%BB%9D+S%C6%A1n+Tr%C3%A0
- https://www.pinterest.com/search/pins/?q=son%20tra%20ban%20co%20peak

## 6.2. Linh Ung Pagoda — Chùa Linh Ứng

### Danh sách 3D assets

| ID | Object | Mô tả |
|---|---|---|
| LU-001 | Lady Buddha Statue | Tượng Quan Âm |
| LU-002 | Statue Base | Bệ tượng |
| LU-003 | Main Pagoda | Chánh điện |
| LU-004 | Roof | Mái chùa |
| LU-005 | Gate | Cổng |
| LU-006 | Courtyard | Sân chùa |
| LU-007 | Stairs | Bậc thềm |
| LU-008 | Decorative Statues | Tượng trang trí |
| LU-009 | Trees | Cây xanh |
| LU-010 | Lighting | Ánh sáng |

### Trải nghiệm

- Nhân vật di chuyển trong khu vực tham quan.
- Có thể tiếp cận các điểm được phép tham quan.
- Tương tác để xem thông tin.
- AI giải thích về địa điểm.

Ảnh tham khảo:

- https://commons.wikimedia.org/wiki/Category:Linh_Ung_Pagoda
- https://www.google.com/search?tbm=isch&q=ch%C3%B9a+Linh+%E1%BB%A8ng+S%C6%A1n+Tr%C3%A0

Phải xác nhận đúng Chùa Linh Ứng trên bán đảo Sơn Trà, không nhầm với các địa điểm cùng tên.

## 6.3. Ancient Banyan Tree — Cây đa ngàn năm

### Danh sách 3D assets

| ID | Object | Mô tả |
|---|---|---|
| BT-001 | Main Trunk | Thân cây |
| BT-002 | Aerial Roots | Rễ phụ |
| BT-003 | Root System | Hệ thống rễ |
| BT-004 | Branches | Cành cây |
| BT-005 | Canopy | Tán cây |
| BT-006 | Leaves | Lá |
| BT-007 | Forest Ground | Nền rừng |
| BT-008 | Rocks | Đá |
| BT-009 | Moss | Rêu |

### Trải nghiệm

- Nhân vật đi đến khu vực cây đa.
- Có thể quan sát thân cây và rễ.
- Hiển thị thông tin về cây.
- Có thể tạo điểm chụp ảnh ảo.

Ảnh tham khảo:

- https://www.google.com/search?tbm=isch&q=c%C3%A2y+%C4%91a+ng%C3%A0n+n%C4%83m+S%C6%A1n+Tr%C3%A0
- https://www.pinterest.com/search/pins/?q=ancient%20banyan%20tree

## 6.4. Forest Exploration — Khám phá rừng

Các thành phần:

- Cây cổ thụ.
- Cây bụi.
- Dây leo.
- Đá.
- Lá rụng.
- Động vật.
- Âm thanh rừng.
- Ánh sáng xuyên tán cây.

Động vật cần được thể hiện dựa trên tư liệu phù hợp.

### Red-shanked Douc Langur — Voọc chà vá chân nâu

- Mô hình theo đúng đặc điểm loài.
- Có animation ngồi, bám cành và di chuyển.
- Không tạo hành vi tiếp xúc với du khách.
- Không đặt động vật tùy tiện ở những nơi không có căn cứ.

Tham khảo:

- https://commons.wikimedia.org/wiki/Category:Pygathrix_nemaeus
- https://www.google.com/search?tbm=isch&q=vo%E1%BB%8Dc+ch%C3%A0+v%C3%A1+ch%C3%A2n+n%C3%A2u+S%C6%A1n+Tr%C3%A0

---

# 7. MOVEMENT & INTERACTION SYSTEM

## 7.1. Movement

Nhân vật cần hỗ trợ:

- Walking.
- Running.
- Turning.
- Stopping.
- Jumping nếu địa hình cho phép.
- Camera rotation.
- Ground collision.

## 7.2. Interaction

Khi người chơi đến gần một đối tượng tương tác, website hiển thị thông báo.

Ví dụ:

`Press E to Explore`

Các đối tượng tương tác:

| Object | Interaction |
|---|---|
| Landmark | Xem thông tin |
| Information Board | Đọc nội dung |
| Viewpoint | Quan sát cảnh quan |
| Equipment | Xem trang bị |
| Map Point | Xem vị trí |
| Wildlife Observation Point | Tìm hiểu động vật |

Không cho phép tương tác với các đối tượng không phù hợp hoặc khu vực hạn chế.

## 7.3. Discovery System

Khi người dùng khám phá một landmark:

- Landmark được đánh dấu là đã khám phá.
- Hiển thị tên và thông tin.
- Cập nhật tiến độ hành trình.
- Có thể lưu lại điểm đã ghé thăm trong phiên.

MVP có thể lưu trạng thái trong bộ nhớ phiên hoặc local storage. Chỉ bổ sung tài khoản và cơ sở dữ liệu khi cần đồng bộ lâu dài.

---

# 8. ROUTE & TREKKING SYSTEM

## 8.1. Route Planner

Người dùng có thể chọn:

- Điểm xuất phát.
- Điểm đến.
- Các điểm dừng.
- Phương tiện di chuyển nếu được hỗ trợ.
- Tuyến đường.

## 8.2. Route Information

Thông tin có thể hiển thị:

| Field | Mô tả |
|---|---|
| Start Point | Điểm xuất phát |
| Destination | Điểm đến |
| Distance | Khoảng cách |
| Estimated Time | Thời gian ước tính |
| Elevation | Độ cao |
| Elevation Gain | Tổng độ cao tăng |
| Route Geometry | Hình dạng tuyến đường |
| Surface | Loại bề mặt nếu có dữ liệu |
| Difficulty | Độ khó nếu có dữ liệu đáng tin cậy |

## 8.3. Route Navigation

Trong khi trekking:

- Hiển thị tuyến đường trên mini map.
- Đánh dấu vị trí nhân vật.
- Hiển thị điểm đến.
- Có hướng dẫn hướng đi nếu dữ liệu hỗ trợ.
- Cảnh báo khi người chơi đi lệch khỏi tuyến trong môi trường mô phỏng.

Lưu ý:

- Không sử dụng AI để tự tạo khoảng cách hoặc tọa độ.
- Khoảng cách và tuyến đường lấy từ dữ liệu bản đồ hoặc routing engine.
- Không gọi tuyến đường trên bản đồ là đường trekking được phép đi nếu chưa xác minh.
- Đây là trải nghiệm mô phỏng, không thay thế thiết bị dẫn đường hoặc hướng dẫn an toàn ngoài thực địa.

---

# 9. UI/UX DESIGN

## 9.1. Main Pages

| Page | Chức năng |
|---|---|
| `/` | Landing Page |
| `/character` | Chọn và tùy chỉnh nhân vật |
| `/preparation` | Chuẩn bị trang bị |
| `/explore` | Thế giới trekking 3D |
| `/landmarks` | Danh sách địa điểm |
| `/routes` | Chọn hành trình |
| `/about` | Giới thiệu dự án |

## 9.2. Landing Page

Các thành phần:

- Hero Section.
- 3D preview.
- Giới thiệu Sơn Trà.
- Landmark highlights.
- Featured routes.
- How to Explore.
- CTA Start Exploring.

## 9.3. Character Selection Page

Các thành phần:

- 3D Character Preview.
- Character List.
- Outfit Selection.
- Equipment Preview.
- Confirm Character.

## 9.4. Preparation Page

Các thành phần:

- Character Preview.
- Equipment List.
- Checklist.
- Route Selection.
- Start Trekking.

## 9.5. Explore Page

Đây là trang quan trọng nhất.

### HUD — Heads-Up Display

| Component | Vị trí | Chức năng |
|---|---|---|
| Compass | Top Center | Hướng nhìn |
| Mini Map | Top Right | Vị trí và tuyến đường |
| Stamina | Bottom Left | Thể lực mô phỏng |
| Equipment | Bottom Left | Trang bị |
| Interaction Prompt | Center | Tương tác |
| AI Assistant | Right | Trợ lý AI |
| View Toggle | Top Right | Chuyển camera |
| Pause Menu | Top Left | Tạm dừng |
| Landmark Info | Contextual | Thông tin địa điểm |

HUD phải tối giản, không che khuất cảnh quan.

## 9.6. Visual Style

Đề xuất:

- Semi-realistic.
- Môi trường thiên nhiên gần thực tế.
- Nhân vật có thể cách điệu nhẹ.
- Ánh sáng tự nhiên.
- Màu xanh rừng.
- Màu xanh biển.
- Giao diện tối giản.
- Typography hiện đại.
- Hiệu ứng chuyển cảnh mượt.

Tham khảo:

- https://www.pinterest.com/search/pins/?q=immersive%203d%20adventure%20game%20environment
- https://www.pinterest.com/search/pins/?q=realistic%20forest%20game%20environment
- https://www.pinterest.com/search/pins/?q=outdoor%20adventure%20website%20design

---

# 10. AI TREKKING ASSISTANT — OPENAI API

## 10.1. Mục tiêu

Tích hợp OpenAI API để cung cấp trợ lý AI trong quá trình khám phá.

AI không điều khiển địa hình hoặc tự tạo dữ liệu bản đồ. AI đóng vai trò giải thích và hỗ trợ người dùng.

## 10.2. Chức năng

| Feature | Mô tả |
|---|---|
| Landmark Explanation | Giải thích địa điểm |
| Trekking Preparation | Tư vấn chuẩn bị |
| Equipment Advice | Tư vấn trang bị |
| Route Explanation | Giải thích tuyến đường từ dữ liệu có sẵn |
| Nature Guide | Giải thích hệ sinh thái |
| User Q&A | Trả lời câu hỏi |
| Exploration Guide | Hướng dẫn trải nghiệm |

## 10.3. Ví dụ hội thoại

**User:**

`Tôi đang ở Đỉnh Bàn Cờ. Hãy giới thiệu địa điểm này.`

**AI:**

Giải thích thông tin địa điểm dựa trên dữ liệu được cung cấp.

**User:**

`Tôi cần chuẩn bị gì cho chuyến trekking?`

**AI:**

Đưa ra checklist phù hợp với hành trình và thông tin điều kiện đã xác minh.

## 10.4. API Architecture

```text
Frontend
   |
   v
Next.js API Route
   |
   v
OpenAI API
   |
   v
AI Response
   |
   v
Frontend Chat Interface
```

API endpoints:

```text
POST /api/ai/chat
POST /api/ai/guide
POST /api/ai/landmark
```

## 10.5. Security

Sử dụng biến môi trường:

```env
OPENAI_API_KEY=your_api_key
```

Quy tắc:

- Không đặt API key trong frontend.
- Không sử dụng `NEXT_PUBLIC_OPENAI_API_KEY`.
- Chỉ gọi OpenAI từ server-side API.
- Có giới hạn request.
- Có xử lý lỗi.
- Có kiểm soát chi phí.
- Không gửi dữ liệu nhạy cảm không cần thiết.

---

# 11. TECH STACK

## 11.1. Core Stack

| Technology | Responsibility |
|---|---|
| Next.js App Router | Web framework |
| TypeScript | Type safety |
| React | UI |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| lucide-react | Icons |
| Three.js | 3D rendering |
| React Three Fiber | Three.js integration |
| Drei | 3D helpers |
| Blender | 3D modeling |
| Mixamo | Character animation support |
| MapLibre GL JS | Geographic map |
| OpenStreetMap | Geographic data |
| DEM | Elevation data |
| OpenAI SDK | AI integration |
| Zod | Validation |

## 11.2. 3D Physics & Collision

Có thể cân nhắc:

- Rapier.
- Three.js Raycaster.
- Custom character controller.

Mục đích:

- Nhân vật đứng trên mặt đất.
- Không xuyên qua vật thể.
- Không đi xuyên qua cây hoặc đá.
- Có kiểm tra va chạm.
- Hỗ trợ địa hình dốc trong giới hạn cho phép.

Chỉ chọn một hệ thống vật lý phù hợp cho MVP, tránh tích hợp quá nhiều thư viện trùng chức năng.

## 11.3. 3D Asset Pipeline

```text
Reference Images
      |
      v
Blender Modeling
      |
      v
UV Mapping
      |
      v
Texturing
      |
      v
Rigging (Character)
      |
      v
Animation
      |
      v
Export GLB / GLTF
      |
      v
React Three Fiber
      |
      v
Interactive 3D World
```

Ưu tiên định dạng GLB/GLTF cho asset 3D trên web.

---

# 12. SYSTEM ARCHITECTURE

```text
SON TRA — BEYOND THE MAP
|
|-- Frontend
|   |
|   |-- Landing Page
|   |-- Character Selection
|   |-- Preparation
|   |-- Explore World
|   |-- Landmark Guide
|   |-- Route Planner
|   |
|   |-- 3D Engine
|       |-- Scene Manager
|       |-- Terrain Manager
|       |-- Character Controller
|       |-- Camera Controller
|       |-- Animation Manager
|       |-- Collision System
|       |-- Interaction Manager
|       |-- Environment Manager
|       |-- Audio Manager
|       |-- HUD Manager
|
|-- Backend
|   |
|   |-- AI Chat API
|   |-- AI Guide API
|   |-- Landmark API
|   |-- Route API
|
|-- Data
|   |
|   |-- Landmarks JSON
|   |-- Routes GeoJSON
|   |-- Equipment JSON
|   |-- Character Config
|   |-- Environment Config
|
|-- External Services
    |
    |-- OpenAI API
    |-- Map Data
    |-- DEM Provider
    |-- Routing Provider
```

---

# 13. SUGGESTED PROJECT STRUCTURE

```text
son-tra-beyond-the-map/
|
|-- public/
|   |-- models/
|   |   |-- characters/
|   |   |-- landmarks/
|   |   |-- environment/
|   |   |-- equipment/
|   |   |-- vehicles/
|   |
|   |-- textures/
|   |-- audio/
|   |-- images/
|   |
|-- src/
|   |-- app/
|   |   |-- page.tsx
|   |   |-- character/
|   |   |-- preparation/
|   |   |-- explore/
|   |   |-- landmarks/
|   |   |-- routes/
|   |   |-- api/
|   |       |-- ai/
|   |       |-- routes/
|   |
|   |-- components/
|   |   |-- ui/
|   |   |-- layout/
|   |   |-- character/
|   |   |-- equipment/
|   |   |-- exploration/
|   |   |-- map/
|   |   |-- landmarks/
|   |   |-- ai/
|   |
|   |-- features/
|   |   |-- character/
|   |   |-- camera/
|   |   |-- movement/
|   |   |-- interaction/
|   |   |-- terrain/
|   |   |-- environment/
|   |   |-- route/
|   |   |-- discovery/
|   |
|   |-- data/
|   |   |-- landmarks/
|   |   |-- routes/
|   |   |-- characters/
|   |   |-- equipment/
|   |
|   |-- hooks/
|   |-- lib/
|   |-- types/
|   |
|-- .env.local
|-- .gitignore
|-- package.json
|-- README.md
```

---

# 14. DEVELOPMENT ROADMAP

## Phase 1 — Project Foundation

- [ ] Khởi tạo Next.js.
- [ ] Cấu hình TypeScript.
- [ ] Cấu hình Tailwind CSS.
- [ ] Cấu hình shadcn/ui.
- [ ] Thiết lập React Three Fiber.
- [ ] Tạo trang Landing Page.
- [ ] Tạo trang Explore.

**Deliverable:** Website có thể chạy và hiển thị một môi trường 3D cơ bản.

## Phase 2 — Character Prototype

- [ ] Import nhân vật GLB.
- [ ] Thiết lập rig.
- [ ] Thiết lập animation.
- [ ] Xây dựng Character Controller.
- [ ] Hỗ trợ đi bộ.
- [ ] Hỗ trợ chạy.
- [ ] Thiết lập First Person Camera.
- [ ] Thiết lập Third Person Camera.
- [ ] Chuyển đổi camera.

**Deliverable:** Người dùng điều khiển được nhân vật trong môi trường 3D.

## Phase 3 — Environment Prototype

- [ ] Tạo terrain.
- [ ] Thiết lập collision.
- [ ] Thêm cây.
- [ ] Thêm đá.
- [ ] Thêm thảm thực vật.
- [ ] Thêm ánh sáng.
- [ ] Thêm bầu trời.
- [ ] Thêm âm thanh môi trường.

**Deliverable:** Một khu vực rừng có thể khám phá.

## Phase 4 — Landmark Integration

- [ ] Dựng landmark đầu tiên.
- [ ] Thêm landmark vào môi trường.
- [ ] Tạo vùng tương tác.
- [ ] Hiển thị thông tin.
- [ ] Tạo Landmark Discovery.
- [ ] Thêm các landmark tiếp theo.

**Deliverable:** Người dùng có thể di chuyển và khám phá địa điểm.

## Phase 5 — Equipment & Route

- [ ] Tạo Character Selection.
- [ ] Tạo Equipment Selection.
- [ ] Tạo Preparation Checklist.
- [ ] Tạo Route Planner.
- [ ] Hiển thị mini map.
- [ ] Hiển thị tuyến đường.
- [ ] Đồng bộ vị trí mô phỏng với dữ liệu địa lý phù hợp.

**Deliverable:** Có trải nghiệm chuẩn bị và lựa chọn hành trình.

## Phase 6 — AI Integration

- [ ] Tích hợp OpenAI SDK.
- [ ] Tạo API Chat.
- [ ] Tạo AI Guide.
- [ ] Tạo Landmark Explanation.
- [ ] Thêm AI Chat Interface.
- [ ] Kiểm soát API key.
- [ ] Xử lý lỗi và giới hạn request.

**Deliverable:** Người dùng có thể hỏi AI trong quá trình khám phá.

## Phase 7 — Optimization

- [ ] Tối ưu model polygon.
- [ ] Tối ưu texture.
- [ ] Sử dụng LOD.
- [ ] Lazy load asset.
- [ ] Tối ưu draw calls.
- [ ] Tối ưu ánh sáng.
- [ ] Kiểm tra FPS.
- [ ] Kiểm tra thiết bị yếu.
- [ ] Kiểm tra responsive.
- [ ] Kiểm tra accessibility cơ bản.

**Deliverable:** Website hoạt động ổn định trên các thiết bị mục tiêu.

---

# 15. MVP SCOPE — PHẠM VI PHIÊN BẢN ĐẦU TIÊN

Không xây dựng toàn bộ Sơn Trà ngay từ đầu.

MVP chỉ cần một khu vực trekking có thể chơi được.

## Required Features

| Feature | MVP |
|---|---|
| 3D Environment | Yes |
| Character Model | Yes |
| First Person Camera | Yes |
| Third Person Camera | Yes |
| Character Movement | Yes |
| Walking Animation | Yes |
| Running Animation | Yes |
| Basic Collision | Yes |
| One Forest Area | Yes |
| One Landmark | Yes |
| Interaction | Yes |
| Landmark Information | Yes |
| Basic HUD | Yes |
| AI Assistant | Yes |
| Full Character Customization | Later |
| Full Peninsula Environment | Later |
| Multiplayer | No |
| Persistent User Account | Later |
| Real-time GPS Navigation | No |
| Advanced Survival System | Later |

## MVP Acceptance Criteria

MVP được xem là hoàn thành khi:

1. Website mở được môi trường 3D.
2. Người dùng điều khiển nhân vật.
3. Người dùng chuyển được hai chế độ camera.
4. Nhân vật có thể đi bộ và chạy.
5. Nhân vật không xuyên qua địa hình cơ bản.
6. Người dùng có thể tiếp cận landmark.
7. Người dùng có thể tương tác để xem thông tin.
8. AI trả lời được câu hỏi liên quan đến landmark dựa trên dữ liệu được cung cấp.
9. API key không xuất hiện trong mã frontend.
10. Trải nghiệm có thể chạy trên trình duyệt desktop mục tiêu.

---

# 16. PERFORMANCE REQUIREMENTS

3D trên trình duyệt có thể tốn nhiều tài nguyên. Cần tối ưu ngay từ đầu.

| Hạng mục | Hướng xử lý |
|---|---|
| 3D Models | Giảm polygon không cần thiết |
| Textures | Nén và giới hạn độ phân giải |
| Animation | Dùng animation clip phù hợp |
| Terrain | Chia tile hoặc phân vùng |
| Forest | Instancing cây và vật thể lặp |
| Lighting | Hạn chế real-time lights |
| Shadows | Chỉ bật ở đối tượng cần thiết |
| Loading | Lazy load khu vực |
| Rendering | Frustum culling |
| Models | LOD |
| Mobile | Giảm chất lượng đồ họa |

Không tải toàn bộ môi trường Sơn Trà ngay khi mở trang.

Chỉ tải các asset cần thiết cho khu vực người chơi đang khám phá.

---

# 17. DATA ACCURACY & SAFETY

Đây là dự án mô phỏng khám phá, không phải hệ thống dẫn đường ngoài thực địa.

Các nguyên tắc:

- Địa hình thực tế cần dựa trên nguồn dữ liệu địa lý.
- Vị trí landmark phải có nguồn xác minh.
- Đường đi cần dựa trên dữ liệu bản đồ.
- Khoảng cách cần được tính từ dữ liệu tuyến đường.
- Không tự tạo tọa độ.
- Không tự tạo độ cao.
- Không khẳng định đường mòn được phép tiếp cận khi chưa xác minh.
- Không dùng AI để bịa thông tin về địa điểm.
- Không khuyến khích người dùng tiếp cận khu vực nguy hiểm hoặc khu vực bảo tồn hạn chế.
- Nội dung về động vật cần tôn trọng môi trường sống tự nhiên.

Cần hiển thị thông báo rằng trải nghiệm mô phỏng không thay thế bản đồ dẫn đường, hướng dẫn địa phương hoặc thông tin an toàn ngoài thực địa.

---

# 18. FINAL PRODUCT EXPERIENCE

Trải nghiệm tổng thể:

```text
OPEN WEBSITE
     |
     v
LANDING PAGE
     |
     v
START EXPLORING
     |
     v
CHARACTER SELECTION
     |
     v
EQUIPMENT PREPARATION
     |
     v
SELECT TREKKING ROUTE
     |
     v
ENTER 3D WORLD
     |
     v
CONTROL CHARACTER
     |
     v
EXPLORE FOREST & LANDMARKS
     |
     v
INTERACT WITH ENVIRONMENT
     |
     v
ASK AI TREKKING ASSISTANT
     |
     v
DISCOVER SON TRA
```

---

# 19. FINAL DESIGN DIRECTION

**SON TRA — BEYOND THE MAP** không nên được định nghĩa là một website bản đồ 3D thông thường.

Đây là một trải nghiệm khám phá thiên nhiên tương tác trên nền tảng web.

Ba yếu tố cốt lõi:

1. **Immersion:** Người dùng nhập vai và nhìn thế giới qua góc nhìn nhân vật.
2. **Exploration:** Người dùng thực sự điều khiển nhân vật di chuyển, khám phá và tương tác.
3. **Discovery:** Người dùng tìm hiểu địa điểm, cảnh quan và hệ sinh thái với sự hỗ trợ của AI.

Định hướng đồ họa đề xuất:

- Semi-realistic 3D.
- Nhân vật 3D có animation.
- First-person là chế độ chính.
- Third-person là chế độ bổ sung.
- Địa hình dựa trên Sơn Trà thực tế.
- Landmark được dựng 3D chi tiết.
- Giao diện tối giản.
- Tập trung vào cảm giác khám phá.

**SON TRA — BEYOND THE MAP**

*Don't just see the mountain. Step into the mountain.*
