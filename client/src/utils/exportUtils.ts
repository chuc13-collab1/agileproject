import * as XLSX from 'xlsx';

/**
 * Export data to Excel file
 */
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Export multiple sheets to Excel
 */
export const exportMultipleSheets = (
    sheets: { name: string; data: any[] }[],
    filename: string
) => {
    const workbook = XLSX.utils.book_new();

    sheets.forEach(sheet => {
        const worksheet = XLSX.utils.json_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    });

    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Export teacher's students list to Excel
 */
export const exportStudentsList = (projects: any[]) => {
    const data = projects.map((project, index) => ({
        'STT': index + 1,
        'Mã sinh viên': project.studentCode || 'N/A',
        'Họ tên': project.studentName,
        'Email': project.studentEmail || 'N/A',
        'Đề tài': project.title,
        'Trạng thái': getStatusText(project.status),
        'Điểm hướng dẫn': project.supervisorScore || 'Chưa chấm',
        'Năm học': project.academicYear,
        'Học kỳ': project.semester
    }));

    const filename = `Danh_sach_sinh_vien_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(data, filename, 'Danh sách sinh viên');
};

/**
 * Export progress reports to Excel
 */
export const exportProgressReports = (reports: any[]) => {
    const data = reports.map((report, index) => ({
        'STT': index + 1,
        'Sinh viên': report.student_name,
        'Mã SV': report.student_code || 'N/A',
        'Đề tài': report.topic_title || 'N/A',
        'Tuần': report.week_number,
        'Tiêu đề': report.report_title,
        'Trạng thái': getReportStatusText(report.status),
        'Ngày nộp': new Date(report.submitted_date).toLocaleDateString('vi-VN')
    }));

    const filename = `Bao_cao_tien_do_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(data, filename, 'Báo cáo tiến độ');
};

/**
 * Helper function to get status text in Vietnamese
 */
const getStatusText = (status: string): string => {
    const statusMap: { [key: string]: string } = {
        'pending': 'Chờ duyệt',
        'approved': 'Đã duyệt',
        'in-progress': 'Đang thực hiện',
        'submitted': 'Đã nộp',
        'completed': 'Hoàn thành',
        'rejected': 'Từ chối',
        'failed': 'Không đạt'
    };
    return statusMap[status] || status;
};

/**
 * Helper function to get report status text
 */
const getReportStatusText = (status: string): string => {
    const statusMap: { [key: string]: string } = {
        'submitted': 'Đã nộp',
        'reviewed': 'Đã xem',
        'approved': 'Đã duyệt',
        'revision_needed': 'Cần sửa'
    };
    return statusMap[status] || status;
};
