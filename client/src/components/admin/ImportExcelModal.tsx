import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { StudentFormData, ExcelImportResult } from '../../types/user.types';
import { Class } from '../../types/class.types';
import styles from './ProjectModal.module.css';

interface ImportExcelModalProps {
  targetClassCode?: string;
  classes?: Class[]; // Optional list of classes for selection
  onClose: () => void;
  onImport: (students: StudentFormData[]) => Promise<ExcelImportResult>;
}

interface ParsedStudent {
  row: number;
  data: StudentFormData;
  errors: string[];
}

function ImportExcelModal({ targetClassCode, classes = [], onClose, onImport }: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>(targetClassCode || '');
  const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ExcelImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    parseExcelFile(selectedFile, selectedClass);
  };

  // Re-parse when class selection changes
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newClass = e.target.value;
    setSelectedClass(newClass);
    if (file) {
      parseExcelFile(file, newClass);
    }
  };

  const parseExcelFile = (file: File, overrideClass: string = '') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

        // Skip all header rows - start from row that has valid student ID (numeric)
        const students: ParsedStudent[] = [];
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue; // Skip empty rows

          const maSV = row[1]?.toString().trim();

          // Skip header rows: check if MA SV column contains actual student ID (numbers only or alphanumeric)
          if (!maSV || maSV.toLowerCase().includes('sv') || maSV.toLowerCase().includes('sinh')) {
            continue; // This is a header row
          }

          const ho = row[2]?.toString().trim() || '';
          const ten = row[3]?.toString().trim() || '';
          // const ngaySinh = row[4];
          // Use override class (from dropdown/prop) or fallback to Excel column
          const lop = overrideClass || row[5]?.toString().trim() || '';

          const errors: string[] = [];

          // Validation
          if (!maSV) errors.push('Thiếu mã sinh viên');
          if (!ho || !ten) errors.push('Thiếu họ tên');
          if (!lop) errors.push('Thiếu lớp');

          // Generate email from student ID
          const email = maSV ? `${maSV}@test2026.edu.vn` : '';

          // Parse date


          // Extract academic year from class name (e.g., DH22TIN06 -> 2022-2026)
          const yearMatch = lop.match(/(\d{2})/);
          const startYear = yearMatch ? `20${yearMatch[1]}` : '2024';
          const academicYear = `${startYear}-${parseInt(startYear) + 4}`;

          students.push({
            row: i + 1,
            data: {
              email,
              displayName: `${ho} ${ten}`.trim(),
              studentId: maSV,
              className: lop,
              academicYear,
              major: 'Công nghệ thông tin',
              password: maSV, // Default password = student ID
            },
            errors,
          });
        }

        setParsedData(students);
      } catch (error) {
        alert('Lỗi đọc file Excel: ' + (error as Error).message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    const validStudents = parsedData.filter(s => s.errors.length === 0);
    if (validStudents.length === 0) {
      alert('Không có sinh viên hợp lệ để import!');
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn import ${validStudents.length} sinh viên?`)) {
      return;
    }

    setImporting(true);
    try {
      const result = await onImport(validStudents.map(s => s.data));
      setResult(result);
    } catch (error) {
      alert('Lỗi import: ' + (error as Error).message);
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsedData.filter(s => s.errors.length === 0).length;
  const errorCount = parsedData.filter(s => s.errors.length > 0).length;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}
      >
        <div className={styles.modalHeader}>
          <h2>📥 Import Danh Sách Sinh Viên {targetClassCode ? `cho lớp ${targetClassCode}` : 'từ Excel'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          {/* Instructions */}
          <div style={{
            background: '#f0f9ff',
            border: '2px solid #0ea5e9',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369a1' }}>📋 Hướng dẫn:</h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#0c4a6e' }}>
              <li>File Excel phải có các cột: <strong>MÃ SV | HỌ | TÊN | NGÀY SINH | LỚP</strong></li>
              <li>Dòng đầu tiên là tiêu đề, dữ liệu bắt đầu từ dòng 2</li>
              <li>Mật khẩu mặc định = Mã sinh viên</li>
              <li>Email tự động: <code>masv@student.edu.vn</code></li>
            </ul>
          </div>



          {/* Class Selection Dropdown (Only if not fixed target) */}
          {!targetClassCode && classes.length > 0 && !result && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Chọn lớp để gán cho tất cả sinh viên (Không bắt buộc):
              </label>
              <select
                value={selectedClass}
                onChange={handleClassChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem'
                }}
              >
                <option value="">-- Sử dụng cột 'Lớp' trong file Excel --</option>
                {classes.filter(c => c.isActive).map(cls => (
                  <option key={cls.id} value={cls.classCode}>
                    {cls.classCode} - {cls.className} ({cls.currentStudents}/{cls.maxStudents})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* File Upload */}
          {!result && (
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: '2px dashed white',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {file ? `📄 ${file.name}` : '📁 Chọn file Excel (.xlsx, .xls)'}
              </button>
            </div>
          )}

          {/* Preview Data */}
          {parsedData.length > 0 && !result && (
            <>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                padding: '1rem',
                background: '#f7fafc',
                borderRadius: '8px'
              }}>
                <div>
                  <strong>Tổng số: {parsedData.length}</strong>
                  <span style={{ marginLeft: '1rem', color: '#10b981' }}>
                    ✓ Hợp lệ: {validCount}
                  </span>
                  <span style={{ marginLeft: '1rem', color: '#ef4444' }}>
                    ✗ Lỗi: {errorCount}
                  </span>
                </div>
              </div>

              <div style={{
                maxHeight: '400px',
                overflow: 'auto',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}>
                <table style={{ width: '100%', fontSize: '0.875rem' }}>
                  <thead style={{ background: '#f7fafc', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Dòng</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Mã SV</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Họ tên</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Lớp</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((student, idx) => (
                      <tr
                        key={idx}
                        style={{
                          background: student.errors.length > 0 ? '#fee2e2' : 'white',
                          borderBottom: '1px solid #e2e8f0'
                        }}
                      >
                        <td style={{ padding: '0.75rem' }}>{student.row}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                          {student.data.studentId}
                        </td>
                        <td style={{ padding: '0.75rem' }}>{student.data.displayName}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                          {student.data.email}
                        </td>
                        <td style={{ padding: '0.75rem' }}>{student.data.className}</td>
                        <td style={{ padding: '0.75rem' }}>
                          {student.errors.length === 0 ? (
                            <span style={{ color: '#10b981', fontWeight: 600 }}>✓ OK</span>
                          ) : (
                            <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>
                              {student.errors.join(', ')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Import Result */}
          {result && (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: result.failed === 0 ? '#d1fae5' : '#fef3c7',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {result.failed === 0 ? '🎉' : '⚠️'}
              </div>
              <h3 style={{ margin: '0 0 1rem 0' }}>Kết quả Import</h3>
              <div style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ color: '#10b981', fontWeight: 700 }}>
                  ✓ Thành công: {result.success} sinh viên
                </div>
                {result.failed > 0 && (
                  <div style={{ color: '#ef4444', fontWeight: 700, marginTop: '0.5rem' }}>
                    ✗ Thất bại: {result.failed} sinh viên
                  </div>
                )}
              </div>
              {result.errors.length > 0 && (
                <div style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '6px',
                  marginTop: '1rem',
                  textAlign: 'left',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}>
                  <strong>Chi tiết lỗi:</strong>
                  {result.errors.map((err, idx) => (
                    <div key={idx} style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                      Dòng {err.row} ({err.email}): {err.reason}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            {result ? 'Đóng' : 'Hủy'}
          </button>
          {parsedData.length > 0 && !result && (
            <button
              onClick={handleImport}
              disabled={importing || validCount === 0}
              style={{
                padding: '0.75rem 1.5rem',
                background: validCount > 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: validCount > 0 ? 'pointer' : 'not-allowed'
              }}
            >
              {importing ? '⏳ Đang import...' : `✓ Import ${validCount} sinh viên`}
            </button>
          )}
        </div>
      </div >
    </div >
  );
}

export default ImportExcelModal;
