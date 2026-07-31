sql = """
-- Kích hoạt UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bảng parts (Linh kiện)
CREATE TABLE parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    "imageUrl" TEXT,
    location TEXT,
    unit TEXT NOT NULL,
    "currentStock" NUMERIC NOT NULL DEFAULT 0,
    "minStock" NUMERIC NOT NULL DEFAULT 0,
    barcode TEXT,
    "qrCode" TEXT,
    note TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng transactions (Giao dịch Nhập/Xuất)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "partId" UUID REFERENCES parts(id) ON DELETE CASCADE,
    "partCode" TEXT,
    "partName" TEXT,
    unit TEXT,
    type TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    person TEXT,
    "productionOrder" TEXT,
    "reasonOrPurpose" TEXT,
    notes TEXT,
    "stockBefore" NUMERIC,
    "stockAfter" NUMERIC,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng app_settings (Cài đặt hệ thống)
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "companyName" TEXT,
    "warehouseName" TEXT,
    address TEXT,
    "managerName" TEXT,
    phone TEXT,
    "staffList" JSONB,
    "stockInReasons" JSONB,
    "stockOutPurposes" JSONB,
    "productionOrders" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng model_boms (Định mức BOM)
CREATE TABLE model_boms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    items JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng container_batches (Lô Container)
CREATE TABLE container_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "contNumber" TEXT,
    "contDate" TEXT,
    "totalItems" NUMERIC,
    "totalQuantity" NUMERIC,
    items JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng fifo_lots (Lô FIFO)
CREATE TABLE fifo_lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "partId" UUID REFERENCES parts(id) ON DELETE CASCADE,
    "partCode" TEXT,
    "partName" TEXT,
    "contNumber" TEXT,
    "importDate" TIMESTAMP WITH TIME ZONE,
    "originalQty" NUMERIC,
    "consumedQty" NUMERIC,
    "remainingQty" NUMERIC,
    status TEXT,
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng stock_checks (Kiểm kê)
CREATE TABLE stock_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "partId" UUID REFERENCES parts(id) ON DELETE CASCADE,
    "partCode" TEXT,
    "partName" TEXT,
    unit TEXT,
    location TEXT,
    "expectedQuantity" NUMERIC,
    "actualQuantity" NUMERIC,
    discrepancy NUMERIC,
    reason TEXT,
    "checkDate" TIMESTAMP WITH TIME ZONE,
    "checkedBy" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng used_qr_tokens (Token QR đã sử dụng)
CREATE TABLE used_qr_tokens (
    id TEXT PRIMARY KEY,
    "scannedAt" TEXT,
    "scannedBy" TEXT,
    "partCode" TEXT,
    quantity NUMERIC,
    "contNumber" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tắt RLS để truy cập tự do (Chỉ dùng cho nội bộ/Dev)
ALTER TABLE parts DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE model_boms DISABLE ROW LEVEL SECURITY;
ALTER TABLE container_batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE fifo_lots DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_checks DISABLE ROW LEVEL SECURITY;
ALTER TABLE used_qr_tokens DISABLE ROW LEVEL SECURITY;
"""
print(sql)
