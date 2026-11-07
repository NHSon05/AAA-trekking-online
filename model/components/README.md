# GLB components

Các component trong thư mục này là wrapper React Three Fiber cho toàn bộ GLB hiện có trong `model/glb/`.

| Component | Asset | Vai trò |
| --- | --- | --- |
| `Baboon` | `Baboon by Poly by Google - aeLFKp6X19x.glb` | Động vật quan sát trong môi trường |
| `Grass` | `Grass by Quaternius - UGTOzcO3P2.glb` | Cụm cỏ/thảm thực vật |
| `RoadBlock` | `Road block by Luca Regazzi (okon3) - e3QRTZLNQU5.glb` | Khối đường/mặt đường |
| `Tree` | `Tree by Marc Solà - 6Yjt8nIwLsD.glb` | Một cây đơn |
| `Trees` | `Trees by Quaternius - etFGNvsiFv.glb` | Cụm nhiều cây |

Ví dụ sử dụng:

```tsx
import { Tree, RoadBlock } from "@/../model/components";

<Tree position={[2, 0, -3]} scale={1.5} />
<RoadBlock position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
```

Mỗi component nhận toàn bộ props của `group` trong Three.js (`position`, `rotation`, `scale`, `visible`, …) và có thể nhận thêm `src` để thay asset GLB mặc định.
