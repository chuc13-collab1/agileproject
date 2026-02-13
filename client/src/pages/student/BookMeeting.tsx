import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
// import { useAuth } from '../../contexts/AuthContext';
import * as schedulingService from '../../services/api/scheduling.service';
import * as userService from '../../services/api/user.service';
import { Teacher } from '../../types/user.types';

interface MeetingSlot {
    id: string;
    teacher_id: string;
    start_time: string;
    end_time: string;
    location: string;
    is_booked: boolean;
}

const BookMeeting: React.FC = () => {
    const navigate = useNavigate();
    // const { user } = useAuth(); // kept for context if needed later, or remove if strictly unused. 
    // Actually user is used in hook but variable might be unused in component body. 
    // Lint says 'user' is declared but never read. 
    // Let's check if we use 'user' in the code. 
    // Looking at previous write_to_file for BookMeeting.tsx:
    // const { user } = useAuth();
    // It is indeed not used in the render or logic, only for AuthContext. 
    // I will remove it.
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
    const [slots, setSlots] = useState<MeetingSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [myBookings, setMyBookings] = useState<any[]>([]);

    // Booking modal
    const [selectedSlot, setSelectedSlot] = useState<MeetingSlot | null>(null);
    const [bookingNote, setBookingNote] = useState('');

    useEffect(() => {
        loadTeachers();
        loadMyBookings();
    }, []);

    useEffect(() => {
        if (selectedTeacherId) {
            loadSlots(selectedTeacherId);
        } else {
            setSlots([]);
        }
    }, [selectedTeacherId]);

    const loadTeachers = async () => {
        try {
            const data = await userService.getAllTeachers();
            setTeachers(data);
        } catch (error) {
            console.error('Failed to load teachers', error);
        }
    };

    const loadMyBookings = async () => {
        try {
            const data = await schedulingService.getMyBookings();
            setMyBookings(data);
        } catch (error) {
            console.error('Failed to load bookings', error);
        }
    };

    const loadSlots = async (teacherId: string) => {
        setLoading(true);
        try {
            // Get slots for next 30 days
            const fromDate = new Date().toISOString();
            const toDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            const data = await schedulingService.getSlots({
                teacher_id: teacherId,
                from_date: fromDate,
                to_date: toDate
            });
            setSlots(data);
        } catch (error) {
            console.error('Failed to load slots', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookSlot = async () => {
        if (!selectedSlot) return;
        try {
            await schedulingService.bookSlot({
                slot_id: selectedSlot.id,
                notes: bookingNote
            });
            alert('Đã gửi yêu cầu đặt lịch! Vui lòng chờ giảng viên xác nhận.');
            setSelectedSlot(null);
            setBookingNote('');
            loadSlots(selectedTeacherId); // Reload slots
            loadMyBookings(); // Reload my bookings
        } catch (error: any) {
            alert(error.response?.data?.message || 'Đặt lịch thất bại');
        }
    };

    return (
        <MainLayout>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                    >
                        ⬅️
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                            📅 Đặt Lịch Hẹn GV
                        </h1>
                        <p style={{ color: '#64748b', margin: 0 }}>Xem giờ rảnh của giảng viên và đặt lịch</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                    {/* Left Column: Bookings */}
                    <div>
                        {/* Teacher Selection */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>Chọn Giảng Viên:</label>
                            <select
                                value={selectedTeacherId}
                                onChange={(e) => setSelectedTeacherId(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                            >
                                <option value="">-- Chọn Giảng Viên --</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.teacherId} - {t.displayName}</option>
                                ))}
                            </select>
                        </div>

                        {/* Slots Grid */}
                        {selectedTeacherId && (
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                    Khung Giờ Còn Trống
                                </h3>

                                {loading ? (
                                    <p>Đang tải...</p>
                                ) : slots.length === 0 ? (
                                    <p style={{ color: '#64748b', fontStyle: 'italic' }}>Giảng viên chưa có lịch rảnh nào trong 30 ngày tới.</p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                        {slots.map(slot => {
                                            const start = new Date(slot.start_time);
                                            const end = new Date(slot.end_time);
                                            const isPast = new Date() > start;

                                            if (isPast) return null; // Don't show past slots

                                            return (
                                                <div
                                                    key={slot.id}
                                                    style={{
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '0.5rem',
                                                        padding: '1rem',
                                                        backgroundColor: slot.is_booked ? '#f1f5f9' : '#f0fdf4',
                                                        opacity: slot.is_booked ? 0.6 : 1,
                                                        cursor: slot.is_booked ? 'not-allowed' : 'pointer',
                                                        transition: 'transform 0.2s',
                                                        borderLeft: `4px solid ${slot.is_booked ? '#cbd5e1' : '#22c55e'}`
                                                    }}
                                                    onClick={() => !slot.is_booked && setSelectedSlot(slot)}
                                                >
                                                    <div style={{ fontWeight: 600, color: slot.is_booked ? '#64748b' : '#15803d', marginBottom: '0.25rem' }}>
                                                        {start.toLocaleDateString('vi-VN')}
                                                    </div>
                                                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                                                        📍 {slot.location}
                                                    </div>
                                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: slot.is_booked ? '#94a3b8' : '#16a34a' }}>
                                                        {slot.is_booked ? 'ĐÃ ĐẶT' : 'CÒN TRỐNG'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column: My Bookings */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>
                            Lịch Hẹn Của Tôi
                        </h3>

                        {myBookings.length === 0 ? (
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Bạn chưa có lịch hẹn nào.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {myBookings.map(booking => {
                                    const start = new Date(booking.start_time);
                                    return (
                                        <div key={booking.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                                                {booking.teacher_name}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#334155', marginBottom: '0.25rem' }}>
                                                📅 {start.toLocaleDateString('vi-VN')} {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                                📍 {booking.location}
                                            </div>
                                            <div style={{
                                                marginTop: '0.5rem',
                                                display: 'inline-block',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: booking.status === 'confirmed' ? '#dcfce7' : booking.status === 'pending' ? '#fef9c3' : '#f1f5f9',
                                                color: booking.status === 'confirmed' ? '#166534' : booking.status === 'pending' ? '#854d0e' : '#64748b'
                                            }}>
                                                {booking.status === 'confirmed' ? 'Đã xác nhận' : booking.status === 'pending' ? 'Chờ xác nhận' : booking.status}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Booking Modal */}
                {selectedSlot && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '500px' }}>
                            <h3 style={{ margin: '0 0 1rem 0' }}>Xác Nhận Đặt Lịch</h3>
                            <div style={{ marginBottom: '1rem', background: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem' }}>
                                <div><strong>Thời gian:</strong> {new Date(selectedSlot.start_time).toLocaleString('vi-VN')}</div>
                                <div><strong>Địa điểm:</strong> {selectedSlot.location}</div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nội dung/Câu hỏi:</label>
                                <textarea
                                    rows={4}
                                    value={bookingNote}
                                    onChange={e => setBookingNote(e.target.value)}
                                    placeholder="Em muốn hỏi về vấn đề..."
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    onClick={() => setSelectedSlot(null)}
                                    style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer' }}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleBookSlot}
                                    style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Xác Nhận Đặt
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default BookMeeting;
