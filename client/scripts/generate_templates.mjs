
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, '../public/templates');

// 1. Student Template
const studentHeaders = ['STT', 'Mã SV', 'Họ', 'Tên', 'Ngày Sinh', 'Lớp'];
const studentData = [
    studentHeaders,
    [1, 'SV001', 'Nguyễn Văn', 'A', '01/01/2004', 'DH22TIN01'],
    [2, 'SV002', 'Lê Thị', 'B', '15/05/2004', 'DH22TIN02'],
    [3, 'SV003', 'Phạm Minh', 'C', '20/11/2004', 'DH22TIN01']
];

const wbStudent = XLSX.utils.book_new();
const wsStudent = XLSX.utils.aoa_to_sheet(studentData);

// Set column widths
wsStudent['!cols'] = [
    { wch: 5 },  // STT
    { wch: 15 }, // Ma SV
    { wch: 20 }, // Ho
    { wch: 15 }, // Ten
    { wch: 15 }, // Ngay Sinh
    { wch: 15 }  // Lop
];

XLSX.utils.book_append_sheet(wbStudent, wsStudent, 'SinhVien');
XLSX.writeFile(wbStudent, path.join(outputDir, 'Student_Import_Template.xlsx'));
console.log('✅ Created Student_Import_Template.xlsx');

// 2. Teacher Template
const teacherHeaders = ['STT', 'Mã GV', 'Họ Tên', 'Email', 'Khoa/Bộ Môn', 'Học Vị'];
const teacherData = [
    teacherHeaders,
    [1, 'GV001', 'Tiến sĩ Nguyễn Văn X', 'nguyenvanx@school.edu.vn', 'Công nghệ phần mềm', 'Tiến sĩ'],
    [2, 'GV002', 'Thạc sĩ Lê Thị Y', 'lethiy@school.edu.vn', 'Hệ thống thông tin', 'Thạc sĩ'],
];

const wbTeacher = XLSX.utils.book_new();
const wsTeacher = XLSX.utils.aoa_to_sheet(teacherData);

// Set column widths
wsTeacher['!cols'] = [
    { wch: 5 },  // STT
    { wch: 15 }, // Ma GV
    { wch: 25 }, // Ho Ten
    { wch: 30 }, // Email
    { wch: 20 }, // Khoa
    { wch: 15 }  // Hoc Vi
];

XLSX.utils.book_append_sheet(wbTeacher, wsTeacher, 'GiangVien');
XLSX.writeFile(wbTeacher, path.join(outputDir, 'Teacher_Import_Template.xlsx'));
console.log('✅ Created Teacher_Import_Template.xlsx');
