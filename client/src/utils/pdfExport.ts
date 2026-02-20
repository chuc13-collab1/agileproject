import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export grading sheet for a project as PDF
 */
export const exportGradingSheet = (project: any) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text('PHIEU CHAM DIEM DO AN', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text('He Thong Quan Ly Do An', 105, 27, { align: 'center' });

    // Line separator
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);

    // Project info
    doc.setFontSize(11);
    let y = 42;
    const info = [
        ['De tai:', project.title || 'N/A'],
        ['Sinh vien:', project.studentName || 'N/A'],
        ['MSSV:', project.studentCode || 'N/A'],
        ['GVHD:', project.supervisorName || 'N/A'],
        ['Trang thai:', project.status || 'N/A'],
    ];

    info.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), 60, y);
        y += 8;
    });

    // Grading table
    y += 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bang Diem:', 20, y);
    y += 5;

    const scores = [
        ['GVHD', project.supervisorScore ?? 'Chua cham'],
        ['GVPB', project.reviewerScore ?? 'Chua cham'],
        ['Hoi dong', project.councilScore ?? 'Chua cham'],
        ['Diem tong ket', project.finalScore ?? 'Chua cham'],
        ['Xep loai', project.grade || 'N/A'],
    ];

    autoTable(doc, {
        startY: y,
        head: [['Thanh phan', 'Diem']],
        body: scores,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable?.finalY || y + 60;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(`Xuat tu He Thong Quan Ly Do An - ${new Date().toLocaleDateString('vi-VN')}`, 105, finalY + 15, { align: 'center' });

    // Signatures
    const sigY = finalY + 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('GVHD', 50, sigY, { align: 'center' });
    doc.text('GVPB', 160, sigY, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('(Ky va ghi ro ho ten)', 50, sigY + 6, { align: 'center' });
    doc.text('(Ky va ghi ro ho ten)', 160, sigY + 6, { align: 'center' });

    doc.save(`Phieu_Cham_Diem_${(project.studentName || 'SV').replace(/\s+/g, '_')}.pdf`);
};

/**
 * Export project list as PDF
 */
export const exportProjectList = (projects: any[], title?: string) => {
    const doc = new jsPDF('landscape');

    // Title
    doc.setFontSize(14);
    doc.text(title || 'DANH SACH DO AN', 148, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 148, 22, { align: 'center' });

    // Table
    const headers = [['STT', 'Ten de tai', 'Sinh vien', 'GVHD', 'Trang thai', 'Diem TK', 'Xep loai']];
    const rows = projects.map((p, i) => [
        i + 1,
        (p.title || p.topicTitle || 'N/A').substring(0, 50),
        p.studentName || 'N/A',
        p.supervisorName || 'N/A',
        p.status || 'N/A',
        p.finalScore ?? '-',
        p.grade || '-',
    ]);

    autoTable(doc, {
        startY: 28,
        head: headers,
        body: rows,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 80 },
            4: { cellWidth: 25, halign: 'center' },
            5: { cellWidth: 20, halign: 'center' },
            6: { cellWidth: 20, halign: 'center' },
        },
    });

    // Summary
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFontSize(9);
    doc.text(`Tong so: ${projects.length} do an`, 20, finalY + 10);

    const passed = projects.filter(p => p.finalScore && p.finalScore >= 5).length;
    doc.text(`Dat: ${passed} | Khong dat: ${projects.length - passed}`, 20, finalY + 16);

    doc.setFont('helvetica', 'italic');
    doc.text('Xuat tu He Thong Quan Ly Do An', 148, finalY + 25, { align: 'center' });

    doc.save(`Danh_Sach_Do_An_${new Date().toISOString().slice(0, 10)}.pdf`);
};
