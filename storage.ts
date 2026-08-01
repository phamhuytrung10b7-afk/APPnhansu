import { Part, Transaction, AppSettings, ContainerBatch, ContainerQrTag, FifoLot, ModelBOM, ModelBOMItem, StockCheckRecord } from './types';
import { initialParts, initialTransactions, initialSettings } from './sampleData';
import { supabase } from './supabaseClient';
import * as XLSX from 'xlsx';

let cachedParts: Part[] = [];
let cachedTransactions: Transaction[] = [];
let cachedSettings: AppSettings = initialSettings;
let cachedContainerBatches: ContainerBatch[] = [];
let cachedUsedQrTokens: Record<string, any> = {};
let cachedModelBOMs: ModelBOM[] = [];
let cachedStockChecks: StockCheckRecord[] = [];
let isInitialized = false;

export const storageService = {
  async refreshFromServer() {
    isInitialized = false;
    await this.initialize();
  },

  async initialize() {
    if (isInitialized) return;
    try {
        const [partsRes, txRes, settingsRes, batchesRes, tokensRes, bomsRes, checksRes] = await Promise.all([
          supabase.from('parts').select('*'),
          supabase.from('transactions').select('*'),
          supabase.from('app_settings').select('*').limit(1).maybeSingle(),
          supabase.from('container_batches').select('*'),
          supabase.from('used_qr_tokens').select('*'),
          supabase.from('model_boms').select('*'),
          supabase.from('stock_checks').select('*'),
        ]);

        if (partsRes.data && partsRes.data.length > 0) cachedParts = partsRes.data;
        else cachedParts = initialParts;

        if (txRes.data && txRes.data.length > 0) cachedTransactions = txRes.data;
        else cachedTransactions = initialTransactions;

        if (settingsRes.data) cachedSettings = settingsRes.data;
        else cachedSettings = initialSettings;

        if (batchesRes.data) cachedContainerBatches = batchesRes.data;
        if (bomsRes.data) cachedModelBOMs = bomsRes.data;
        if (checksRes.data) cachedStockChecks = checksRes.data;
        
        cachedUsedQrTokens = {};
        if (tokensRes.data) {
            tokensRes.data.forEach((t: any) => {
                cachedUsedQrTokens[t.id] = t;
            });
        }
    } catch (err) {
        console.error("Lỗi khởi tạo Supabase:", err);
    }
    isInitialized = true;
  },

  getSettings(): AppSettings {
    return cachedSettings;
  },
  saveSettings(settings: AppSettings): void {
    cachedSettings = settings;
    supabase.from('app_settings').upsert({ id: 'settings-1', ...settings }).then();
  },
  getParts(): Part[] {
    return cachedParts;
  },
  getPartById(id: string): Part | undefined {
    return cachedParts.find((p) => p.id === id);
  },
  saveParts(parts: Part[]): void {
    cachedParts = parts;
    supabase.from('parts').upsert(parts).then();
  },
  addPart(partData: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>): Part {
    const newPart: Part = {
      ...partData,
      id: 'part-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    cachedParts.push(newPart);
    supabase.from('parts').insert(newPart).then();
    return newPart;
  },
  updatePart(id: string, updatedData: Partial<Part>): Part {
    const index = cachedParts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Không tìm thấy linh kiện');
    cachedParts[index] = { ...cachedParts[index], ...updatedData, updatedAt: new Date().toISOString() };
    supabase.from('parts').update({ ...updatedData, updatedAt: new Date().toISOString() }).eq('id', id).then();
    return cachedParts[index];
  },
  deletePart(id: string): void {
    cachedParts = cachedParts.filter((p) => p.id !== id);
    supabase.from('parts').delete().eq('id', id).then();
  },
  getTransactions(): Transaction[] {
    return cachedTransactions;
  },
  saveTransactions(txs: Transaction[]): void {
    cachedTransactions = txs;
    // Cảnh báo: Việc upsert toàn bộ mảng có thể chậm với số lượng lớn
    supabase.from('transactions').upsert(txs).then();
  },
  getBinCardHistory(partId: string): Transaction[] {
    const txs = cachedTransactions.filter((t) => t.partId === partId);
    return txs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
  addStockIn(params: {
    partId: string;
    quantity: number;
    date: string;
    person: string;
    reasonOrPurpose?: string;
    notes?: string;
  }): Transaction {
    const part = this.getPartById(params.partId);
    if (!part) throw new Error('Linh kiện không tồn tại');
    const stockBefore = part.currentStock;
    const stockAfter = stockBefore + params.quantity;
    
    this.updatePart(part.id, { currentStock: stockAfter });
    
    const newTx: Transaction = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      partId: part.id,
      partCode: part.code,
      partName: part.name,
      unit: part.unit,
      type: 'IN',
      quantity: params.quantity,
      date: params.date || new Date().toISOString(),
      person: params.person,
      reasonOrPurpose: params.reasonOrPurpose || 'Nhập kho',
      notes: params.notes || '',
      stockBefore,
      stockAfter,
    };
    cachedTransactions.push(newTx);
    supabase.from('transactions').insert(newTx).then();
    return newTx;
  },
  addStockOut(params: {
    partId: string;
    quantity: number;
    date: string;
    person: string;
    productionOrder?: string;
    reasonOrPurpose?: string;
    notes?: string;
  }): Transaction {
    const part = this.getPartById(params.partId);
    if (!part) throw new Error('Linh kiện không tồn tại');
    if (part.currentStock < params.quantity) {
      throw new Error(`Không đủ tồn kho! Tồn hiện tại: ${part.currentStock}, Số lượng xuất yêu cầu: ${params.quantity}`);
    }
    const stockBefore = part.currentStock;
    const stockAfter = stockBefore - params.quantity;
    
    this.updatePart(part.id, { currentStock: stockAfter });
    
    const newTx: Transaction = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      partId: part.id,
      partCode: part.code,
      partName: part.name,
      unit: part.unit,
      type: 'OUT',
      quantity: params.quantity,
      date: params.date || new Date().toISOString(),
      person: params.person,
      productionOrder: params.productionOrder,
      reasonOrPurpose: params.reasonOrPurpose || 'Xuất kho',
      notes: params.notes || '',
      stockBefore,
      stockAfter,
    };
    cachedTransactions.push(newTx);
    supabase.from('transactions').insert(newTx).then();
    return newTx;
  },
  performStockCheck(params: {
    partId: string;
    actualQuantity: number;
    checkedBy: string;
    reason?: string;
  }): { checkRecord: StockCheckRecord; adjustmentTx?: Transaction } {
    const part = this.getPartById(params.partId);
    if (!part) throw new Error('Không tìm thấy linh kiện');
    const expectedQuantity = part.currentStock;
    const discrepancy = params.actualQuantity - expectedQuantity;
    
    const checkRecord: StockCheckRecord = {
      id: 'chk-' + Date.now(),
      partId: part.id,
      partCode: part.code,
      partName: part.name,
      unit: part.unit,
      location: part.location,
      expectedQuantity,
      actualQuantity: params.actualQuantity,
      discrepancy,
      reason: params.reason || '',
      checkDate: new Date().toISOString(),
      checkedBy: params.checkedBy,
    };
    
    cachedStockChecks.push(checkRecord);
    supabase.from('stock_checks').insert(checkRecord).then();
    
    let adjustmentTx: Transaction | undefined;
    if (discrepancy !== 0) {
      this.updatePart(part.id, { currentStock: params.actualQuantity });
      adjustmentTx = {
        id: 'tx-adj-' + Date.now(),
        partId: part.id,
        partCode: part.code,
        partName: part.name,
        unit: part.unit,
        type: 'AUDIT_ADJUSTMENT',
        quantity: Math.abs(discrepancy),
        date: new Date().toISOString(),
        person: params.checkedBy,
        reasonOrPurpose: 'Điều chỉnh kiểm kê',
        notes: params.reason || (discrepancy > 0 ? 'Phát sinh thừa' : 'Phát sinh thiếu'),
        stockBefore: expectedQuantity,
        stockAfter: params.actualQuantity,
      };
      cachedTransactions.push(adjustmentTx);
      supabase.from('transactions').insert(adjustmentTx).then();
    }
    return { checkRecord, adjustmentTx };
  },
  getStockCheckRecords(): StockCheckRecord[] {
    return cachedStockChecks;
  },
  resetToSampleData(): void {
    cachedParts = initialParts;
    cachedTransactions = initialTransactions;
    cachedSettings = initialSettings;
    cachedStockChecks = [];
    cachedContainerBatches = [];
    cachedUsedQrTokens = {};
    cachedModelBOMs = [];
    // Để cho nhanh trong dev, có thể làm một lệnh supabase delete all, nhưng ở đây tạm thời bỏ qua phần xóa trên Supabase để an toàn
  },
  getContainerBatches(): ContainerBatch[] {
    return cachedContainerBatches;
  },
  saveContainerBatch(batch: ContainerBatch): void {
    const idx = cachedContainerBatches.findIndex(b => b.id === batch.id);
    if (idx >= 0) cachedContainerBatches[idx] = batch;
    else cachedContainerBatches.push(batch);
    supabase.from('container_batches').upsert(batch).then();
  },
  deleteContainerBatch(id: string): void {
    cachedContainerBatches = cachedContainerBatches.filter(b => b.id !== id);
    supabase.from('container_batches').delete().eq('id', id).then();
  },
  getModelBOMs(): ModelBOM[] {
    return cachedModelBOMs;
  },
  saveModelBOM(bom: ModelBOM): void {
    const idx = cachedModelBOMs.findIndex(b => b.id === bom.id);
    if (idx >= 0) cachedModelBOMs[idx] = bom;
    else cachedModelBOMs.push(bom);
    supabase.from('model_boms').upsert(bom).then();
  },
  deleteModelBOM(id: string): void {
    cachedModelBOMs = cachedModelBOMs.filter(b => b.id !== id);
    supabase.from('model_boms').delete().eq('id', id).then();
  },
  getUsedQrTokens(): Record<string, { scannedAt: string; scannedBy?: string; partCode: string; quantity: number; contNumber: string }> {
    return cachedUsedQrTokens;
  },
  isQrTokenUsed(tokenOrPayload: string): { isUsed: boolean; scannedAt?: string; scannedBy?: string; partCode?: string; quantity?: number; contNumber?: string } {
    if (!tokenOrPayload) return { isUsed: false };
    const tokens = this.getUsedQrTokens();
    if (tokens[tokenOrPayload]) {
      const info = tokens[tokenOrPayload];
      return { isUsed: true, ...info };
    }
    const keyStr = tokenOrPayload.trim();
    if (tokens[keyStr]) {
      const info = tokens[keyStr];
      return { isUsed: true, ...info };
    }
    return { isUsed: false };
  },
  markQrTokenAsUsed(tokenOrPayload: string, details: { partCode: string; quantity: number; contNumber: string; person?: string }): void {
    if (!tokenOrPayload) return;
    const nowStr = new Date().toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
    });
    const info = {
      id: tokenOrPayload,
      scannedAt: nowStr,
      scannedBy: details.person || 'Thủ kho',
      partCode: details.partCode,
      quantity: details.quantity,
      contNumber: details.contNumber,
    };
    cachedUsedQrTokens[tokenOrPayload] = info;
    supabase.from('used_qr_tokens').upsert(info).then();
    
    if (tokenOrPayload.includes('|')) {
      const parts = tokenOrPayload.split('|');
      if (parts[4]) {
        const infoTag = { ...info, id: parts[4] };
        cachedUsedQrTokens[parts[4]] = infoTag;
        supabase.from('used_qr_tokens').upsert(infoTag).then();
      }
    }
  },
  getPartFifoLots(partId: string): FifoLot[] {
    const part = this.getPartById(partId);
    if (!part) return [];
    const txs = this.getTransactions().filter((t) => t.partId === partId);
    const inTxs = txs.filter((t) => t.type === 'IN').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const outTxs = txs.filter((t) => t.type === 'OUT');
    const totalInQty = inTxs.reduce((sum, t) => sum + t.quantity, 0);
    const totalOutQty = outTxs.reduce((sum, t) => sum + t.quantity, 0);
    const rawLots: { id: string; contNumber: string; importDate: string; originalQty: number; notes?: string }[] = [];
    const initialBaselineQty = part.currentStock + totalOutQty - totalInQty;
    if (initialBaselineQty > 0) {
      rawLots.push({
        id: `init-lot-${part.id}`,
        contNumber: 'Lô Tồn Khởi Tạo (Lô #1)',
        importDate: part.createdAt || '2026-01-01T00:00:00.000Z',
        originalQty: initialBaselineQty,
        notes: 'Dữ liệu tồn kho ban đầu',
      });
    }
    inTxs.forEach((tx) => {
      let contNum = '';
      if (tx.reasonOrPurpose) {
        const match = tx.reasonOrPurpose.match(/Cont\s*([\w\d-]+)/i);
        if (match) contNum = match[1];
      }
      if (!contNum && tx.notes) {
        const match = tx.notes.match(/Cont\s*([\w\d-]+)/i);
        if (match) contNum = match[1];
      }
      const displayCont = contNum ? `Cont ${contNum}` : (tx.reasonOrPurpose || 'Lô Nhập Kho');
      rawLots.push({
        id: `tx-in-${tx.id}`,
        contNumber: displayCont,
        importDate: tx.date,
        originalQty: tx.quantity,
        notes: tx.notes || tx.reasonOrPurpose,
      });
    });
    if (rawLots.length === 0 && part.currentStock > 0) {
      rawLots.push({
        id: `init-lot-${part.id}`,
        contNumber: 'Lô Tồn Khởi Tạo (Lô #1)',
        importDate: part.createdAt || new Date().toISOString(),
        originalQty: part.currentStock + totalOutQty,
        notes: 'Dữ liệu tồn kho ban đầu',
      });
    }
    rawLots.sort((a, b) => new Date(a.importDate).getTime() - new Date(b.importDate).getTime());
    let remainingOutDeduction = totalOutQty;
    let foundFirstActive = false;
    const fifoLots: FifoLot[] = rawLots.map((lot) => {
      let consumed = 0;
      let remaining = lot.originalQty;
      if (remainingOutDeduction >= lot.originalQty) {
        consumed = lot.originalQty;
        remaining = 0;
        remainingOutDeduction -= lot.originalQty;
      } else if (remainingOutDeduction > 0) {
        consumed = remainingOutDeduction;
        remaining = lot.originalQty - remainingOutDeduction;
        remainingOutDeduction = 0;
      }
      let status: 'FIFO_NEXT' | 'WAITING' | 'DEPLETED' = 'DEPLETED';
      if (remaining > 0) {
        if (!foundFirstActive) {
          status = 'FIFO_NEXT';
          foundFirstActive = true;        } else {
          status = 'WAITING';
        }
      }
      return {
        id: lot.id,
        partId: part.id,
        partCode: part.code,
        partName: part.name || part.code,
        contNumber: lot.contNumber,
        importDate: lot.importDate,
        originalQty: lot.originalQty,
        consumedQty: consumed,
        remainingQty: remaining,
        status,
        notes: lot.notes,
      };
    });
    return fifoLots;
  },

  importPartsFromRows(rawRows: any[]): { added: number; updated: number } {
    let added = 0;
    let updated = 0;
    const existingParts = this.getParts();
    rawRows.forEach((row) => {
      let code = ''; let name = ''; let desc = ''; let loc = ''; let unit = '';
      let qty = 0; let minSt = 0;
      if (Array.isArray(row)) {
        code = String(row[0] ?? '').trim();
        name = String(row[1] ?? '').trim();
        desc = String(row[2] ?? '').trim();
        loc = String(row[3] ?? '').trim();
        unit = String(row[4] ?? '').trim();
        qty = Number(row[5]) || 0;
        minSt = Number(row[6]) || 0;
      } else if (typeof row === 'object' && row !== null) {
        code = String(row['Mã linh kiện'] || row['Code'] || '').trim();
        name = String(row['Tên linh kiện'] || row['Name'] || '').trim();
        desc = String(row['Mô tả'] || row['Description'] || '').trim();
        loc = String(row['Vị trí'] || row['Location'] || '').trim();
        unit = String(row['Đơn vị'] || row['Unit'] || '').trim();
        qty = Number(row['Tồn hiện tại'] || row['Quantity'] || 0);
        minSt = Number(row['Tồn tối thiểu'] || row['Min Stock'] || 0);
      }
      if (!code || !name) return;
      if (code.toLowerCase() === 'mã linh kiện') return;
      const existing = existingParts.find((p) => p.code.toLowerCase() === code.toLowerCase());
      if (existing) {
        existing.name = name;
        if (desc) existing.description = desc;
        if (loc) existing.location = loc;
        if (unit) existing.unit = unit;
        if (qty > 0) existing.currentStock = qty;
        if (minSt > 0) existing.minStock = minSt;
        existing.updatedAt = new Date().toISOString();
        updated++;
      } else {
        existingParts.push({
          id: 'part-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          code, name, description: desc, location: loc, unit: unit || 'Cái',
          currentStock: qty, minStock: minSt, barcode: code, qrCode: code,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        });
        added++;
      }
    });
    this.saveParts(existingParts);
    return { added, updated };
  },
  importModelBOMFromRows(rawRows: any[], modelName: string): { added: number; name: string } {
    const items: ModelBOMItem[] = [];
    const validPartCodes = new Set(this.getParts().map((p) => p.code.toLowerCase()));
    rawRows.forEach((row) => {
      let itemCode = ''; let itemName = ''; let quantityVal: any = 0; let unit = '';
      if (Array.isArray(row)) {
        itemCode = String(row[0] ?? '').trim();
        itemName = String(row[1] ?? '').trim();
        quantityVal = row[2];
        unit = String(row[3] ?? '').trim();
      } else if (typeof row === 'object' && row !== null) {
        itemCode = String(row['Item'] || row['Mã linh kiện'] || row['Code'] || '').trim();
        itemName = String(row['Description'] || row['Tên linh kiện'] || row['Name'] || '').trim();
        quantityVal = row['Quantity'] || row['Số lượng'] || row['Định mức'] || 0;
        unit = String(row['Unit'] || row['Đơn vị'] || row['ĐVT'] || '').trim();
      }
      if (!itemCode || !itemName || itemCode.toLowerCase() === 'item' || !validPartCodes.has(itemCode.toLowerCase())) return;
      let quantity = typeof quantityVal === 'number' ? quantityVal : parseFloat(String(quantityVal).replace(/\./g, '').replace(',', '.')) || 0;
      if (quantity > 0) {
        items.push({ partCode: itemCode, partName: itemName, quantity, unit: unit || 'Cái' });
      }
    });
    if (items.length > 0) {
      const bom: ModelBOM = { id: 'bom-' + Date.now(), name: modelName, items, createdAt: new Date().toISOString() };
      this.saveModelBOM(bom);
      return { added: items.length, name: modelName };
    }
    return { added: 0, name: modelName };
  },
  downloadImportTemplate(): void {
    const ws = XLSX.utils.aoa_to_sheet([['Mã linh kiện', 'Tên linh kiện', 'Mô tả', 'Vị trí', 'Đơn vị', 'Tồn hiện tại', 'Tồn tối thiểu']]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Nhap_Kho');
    XLSX.writeFile(wb, 'Template_Nhap_Kho_TheKho.xlsx');
  },
  exportPartsToExcel(parts: Part[], fileName = 'danh_sach_linh_kien.xlsx'): void {
    const exportData = parts.map((p) => ({
      'Mã linh kiện': p.code, 'Tên linh kiện': p.name, 'Mô tả': p.description, 'Vị trí': p.location,
      'Đơn vị': p.unit, 'Tồn hiện tại': p.currentStock, 'Tồn tối thiểu': p.minStock, 'Mã vạch': p.barcode,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TonKho');
    XLSX.writeFile(wb, fileName);
  },
  exportBinCardToExcel(part: Part, transactions: Transaction[], fileName?: string): void {
    const exportData = transactions.map((t) => ({
      'Ngày giao dịch': new Date(t.date).toLocaleString('vi-VN'),
      'Loại': t.type === 'IN' ? 'Nhập' : t.type === 'OUT' ? 'Xuất' : 'Điều chỉnh',
      'Số lượng': t.quantity, 'Đơn vị': t.unit, 'Tồn trước': t.stockBefore, 'Tồn sau': t.stockAfter,
      'Người thực hiện': t.person, 'Lý do/Mục đích': t.reasonOrPurpose, 'Lệnh SX/PO': t.productionOrder || '', 'Ghi chú': t.notes || '',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `TheKho_${part.code}`);
    XLSX.writeFile(wb, fileName || `TheKho_${part.code}.xlsx`);
  },
  backupData(): string {
    return JSON.stringify({
      parts: cachedParts,
      transactions: cachedTransactions,
      settings: cachedSettings,
      stockChecks: cachedStockChecks,
      containerBatches: cachedContainerBatches,
      usedQrTokens: cachedUsedQrTokens,
      modelBOMs: cachedModelBOMs,
    });
  },
  restoreData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.parts && data.transactions) {
        cachedParts = data.parts;
        cachedTransactions = data.transactions;
        if (data.settings) cachedSettings = data.settings;
        if (data.stockChecks) cachedStockChecks = data.stockChecks;
        if (data.containerBatches) cachedContainerBatches = data.containerBatches;
        if (data.usedQrTokens) cachedUsedQrTokens = data.usedQrTokens;
        if (data.modelBOMs) cachedModelBOMs = data.modelBOMs;
        
        // Push all to supabase
        supabase.from('parts').upsert(cachedParts).then();
        supabase.from('transactions').upsert(cachedTransactions).then();
        supabase.from('app_settings').upsert({ id: 'settings-1', ...cachedSettings }).then();
        supabase.from('container_batches').upsert(cachedContainerBatches).then();
        supabase.from('model_boms').upsert(cachedModelBOMs).then();
        supabase.from('stock_checks').upsert(cachedStockChecks).then();
        
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
};
