# 民宿管理系统 - API 文档

## 基础信息

- **基础URL**: `http://localhost:3000/api`（开发）/ `https://<your-domain>/api`（生产）
- **数据格式**: JSON
- **认证**: 前端简单密码验证（密码：`bnb2026`）

---

## 接口列表

### 1. 房间管理

#### GET `/api/rooms`
获取所有房间列表

**响应示例：**
```json
{
  "rooms": [
    {
      "id": "r1",
      "number": "101",
      "type": "single",
      "status": "occupied",
      "currentBookingId": "b1"
    }
  ]
}
```

---

### 2. 入住登记

#### POST `/api/bookings`
登记新客户入住

**请求体：**
```json
{
  "roomId": "r2",
  "guestName": "赵六",
  "checkInDate": "2026-04-23",
  "checkOutDate": "2026-04-25"
}
```

**响应示例：**
```json
{
  "success": true,
  "booking": {
    "id": "b4",
    "roomId": "r2",
    "roomNumber": "102",
    "guestName": "赵六",
    "checkInDate": "2026-04-23",
    "checkOutDate": "2026-04-25",
    "status": "active",
    "createdAt": "2026-04-23T12:00:00Z"
  }
}
```

---

### 3. 退房登记

#### POST `/api/rooms/:id/checkout`
退房并自动扣减布草库存、创建清洁任务

**请求体：**
```json
{
  "operator": "小王",
  "linens": {
    "l1": 1,
    "l3": 2,
    "l4": 3
  }
}
```

**响应示例：**
```json
{
  "success": true,
  "room": { "id": "r1", "number": "101", "status": "cleaning" },
  "booking": { "id": "b1", "status": "checked_out" },
  "usageRecords": [
    {
      "id": "u_1234567890_l1",
      "date": "2026-04-23",
      "roomId": "r1",
      "roomNumber": "101",
      "linenId": "l1",
      "linenName": "床单",
      "quantity": 1,
      "operator": "小王",
      "bookingId": "b1"
    }
  ],
  "cleaningTask": {
    "id": "c_1234567890",
    "roomId": "r1",
    "roomNumber": "101",
    "status": "pending",
    "assignee": "待分配"
  }
}
```

---

### 4. 布草库存

#### GET `/api/linens`
获取布草库存列表

**响应示例：**
```json
{
  "linens": [
    {
      "id": "l1",
      "name": "床单",
      "category": "bedding",
      "quantity": 50,
      "threshold": 15,
      "unit": "套",
      "standardUsage": { "single": 1, "double": 1, "suite": 2 }
    }
  ]
}
```

#### PUT `/api/linens`
更新布草库存或安全阈值

**请求体：**
```json
{
  "id": "l1",
  "quantity": 48,
  "threshold": 15
}
```

**响应示例：**
```json
{
  "success": true,
  "linen": { "id": "l1", "name": "床单", "quantity": 48, "threshold": 15 }
}
```

---

### 5. 布草使用记录

#### GET `/api/linen-usage?start=2026-04-20&end=2026-04-26`
获取布草使用记录（可选日期范围筛选）

**响应示例：**
```json
{
  "usage": [
    {
      "id": "u_1234567890_l1",
      "date": "2026-04-23",
      "roomId": "r1",
      "roomNumber": "101",
      "linenId": "l1",
      "linenName": "床单",
      "quantity": 1,
      "operator": "小王",
      "bookingId": "b1"
    }
  ]
}
```

---

### 6. 清洁任务

#### GET `/api/cleaning`
获取清洁任务列表

**响应示例：**
```json
{
  "tasks": [
    {
      "id": "c1",
      "roomId": "r6",
      "roomNumber": "302",
      "status": "pending",
      "assignee": "李阿姨",
      "createdAt": "2026-04-22T11:00:00Z"
    }
  ]
}
```

#### PUT `/api/cleaning`
更新清洁任务（标记完成或分配负责人）

**标记完成：**
```json
{
  "id": "c1",
  "status": "completed"
}
```

**分配负责人：**
```json
{
  "id": "c1",
  "assignee": "张阿姨"
}
```

**响应示例：**
```json
{
  "success": true,
  "task": {
    "id": "c1",
    "roomId": "r6",
    "roomNumber": "302",
    "status": "completed",
    "assignee": "李阿姨",
    "completedAt": "2026-04-23T12:00:00Z"
  }
}
```

> 标记完成后，对应房间状态自动变为「空闲」

---

### 7. 周报表

#### GET `/api/reports/weekly?start=2026-04-20&end=2026-04-26`
获取周报表数据

**响应示例：**
```json
{
  "start": "2026-04-20",
  "end": "2026-04-26",
  "totalCheckouts": 3,
  "report": [
    {
      "linenId": "l1",
      "name": "床单",
      "unit": "套",
      "currentStock": 48,
      "threshold": 15,
      "totalUsed": 5,
      "theoretical": 4,
      "waste": 1,
      "suggestPurchase": 0
    }
  ]
}
```

**字段说明：**
- `totalUsed`: 实际总消耗量
- `theoretical`: 理论用量（退房次数 × 标准用量）
- `waste`: 损耗量（实际 - 理论）
- `suggestPurchase`: 建议采购量（库存低于阈值时计算）

---

## 错误响应

所有接口在出错时返回 HTTP 4xx/5xx 状态码，响应体格式：

```json
{
  "error": "错误描述"
}
```

常见错误：
- `400` - 请求参数错误
- `404` - 资源不存在
- `500` - 服务器内部错误
