import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import * as projectService from '../../services/api/project.service';
import * as schedulingService from '../../services/api/scheduling.service';
import { Project } from '../../types/project.types';
import styles from './Supervisor.module.css';

interface CalendarEvent {
    id?: string;
    date: Date;
    title: string;
    type: 'deadline' | 'report' | 'meeting_slot' | 'booking';
    projectId?: string;
    studentName?: string;
    // Meeting specific
    startTime?: string;
    endTime?: string;
    isBooked?: boolean;
    location?: string;
}

const TeacherCalendar: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);

    // Form state for creating slot
    const [showCreateSlot, setShowCreateSlot] = useState(false);
    const [newSlotStart, setNewSlotStart] = useState('');
    const [newSlotEnd, setNewSlotEnd] = useState('');
    const [newSlotLocation, setNewSlotLocation] = useState('Online (Google Meet)');

    useEffect(() => {
        if (user) loadEvents();
    }, [user, currentDate]);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const allProjects = await projectService.getAllProjects();
            // Filter projects where user is supervisor (using user.uid or user.id depending on auth structure)
            // Assuming user.uid matches supervisor_id key in projects
            const myProjects = allProjects.filter((p: Project) =>
                (p.supervisor && p.supervisor.id === user?.uid) || (p.supervisor?.id === (user as any)?.id)
            );

            const calendarEvents: CalendarEvent[] = [];

            // 1. Add project deadlines
            myProjects.forEach((project: Project) => {
                if (project.status === 'in_progress' && project.reportDeadline) {
                    calendarEvents.push({
                        date: new Date(project.reportDeadline),
                        title: 'Deadline nộp báo cáo',
                        type: 'deadline',
                        projectId: project.id,
                        studentName: project.studentName
                    });
                }
            });

            // 2. Add Meeting Slots & Bookings
            if (user?.uid) {
                // Fetch slots for this month
                const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

                const slots = await schedulingService.getSlots({
                    teacher_id: user.uid, // Ideally backend handles "my slots" but we reusing filter
                    from_date: firstDay.toISOString(),
                    to_date: lastDay.toISOString()
                });

                // Also fetch bookings details to see student notes
                // For simplicity, we assume getSlots returns basic info, and we might overlay bookings
                // But let's use the 'bookings' query if we implemented "getMyBookings" for teachers.
                // For now, let's map slots to events
                slots.forEach((slot: any) => {
                    calendarEvents.push({
                        id: slot.id,
                        date: new Date(slot.start_time),
                        title: slot.is_booked ? `Hẹn GV: ${slot.student_name || 'Đã đặt'}` : 'Giờ rảnh (Trống)',
                        type: slot.is_booked ? 'booking' : 'meeting_slot',
                        startTime: slot.start_time,
                        endTime: slot.end_time,
                        isBooked: slot.is_booked,
                        location: slot.location
                    });
                });
            }

            setEvents(calendarEvents);
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !newSlotStart || !newSlotEnd) return;

        try {
            // Combine selectedDate with time strings
            // format: YYYY-MM-DDTHH:mm
            const dateStr = selectedDate.toISOString().split('T')[0];
            const startDateTime = `${dateStr}T${newSlotStart}:00`;
            const endDateTime = `${dateStr}T${newSlotEnd}:00`;

            await schedulingService.createSlot({
                start_time: startDateTime,
                end_time: endDateTime,
                location: newSlotLocation,
                max_students: 1
            });

            alert('Đã tạo lịch rảnh thành công!');
            setShowCreateSlot(false);
            loadEvents();
        } catch (error) {
            console.error('Create slot failed', error);
            alert('Lỗi tạo lịch');
        }
    };

    const handleDeleteSlot = async (id: string) => {
        if (!window.confirm('Xóa khung giờ này?')) return;
        try {
            await schedulingService.deleteSlot(id);
            loadEvents();
        } catch (error) {
            console.error('Delete failed', error);
            alert('Không thể xóa (có thể đã có người đặt)');
        }
    };

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
        setSelectedDate(null); // Reset selection
    };

    const getEventsForDate = (day: number) => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === day &&
                eventDate.getMonth() === currentDate.getMonth() &&
                eventDate.getFullYear() === currentDate.getFullYear();
        });
    };

    const handleDateClick = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(date);
        setShowCreateSlot(false); // Reset form visibility
    };

    // Render calendar grid
    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} style={{ padding: '0.5rem' }}></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = getEventsForDate(day);
            const isToday = new Date().getDate() === day &&
                new Date().getMonth() === currentDate.getMonth() &&
                new Date().getFullYear() === currentDate.getFullYear();
            const isSelected = selectedDate?.getDate() === day &&
                selectedDate?.getMonth() === currentDate.getMonth();

            days.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    style={{
                        padding: '0.5rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        minHeight: '80px',
                        backgroundColor: isSelected ? '#dbeafe' : isToday ? '#fef3c7' : 'white',
                        transition: 'all 0.2s',
                        position: 'relative'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isSelected ? '#dbeafe' : isToday ? '#fef3c7' : 'white';
                    }}
                >
                    <div style={{ fontWeight: isToday ? 'bold' : 'normal', marginBottom: '0.25rem' }}>
                        {day}
                    </div>
                    {dayEvents.length > 0 && (
                        <div style={{ fontSize: '0.75rem' }}>
                            {dayEvents.slice(0, 3).map((event, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background:
                                            event.type === 'deadline' ? '#ef4444' :
                                                event.type === 'booking' ? '#8b5cf6' :
                                                    event.type === 'meeting_slot' ? '#10b981' : '#3b82f6',
                                        color: 'white',
                                        padding: '0.125rem 0.25rem',
                                        borderRadius: '0.25rem',
                                        marginBottom: '0.125rem',
                                        fontSize: '0.7rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {event.type === 'deadline' ? '⏰' :
                                        event.type === 'meeting_slot' ? '🆓' : '🤝'} {event.title.substring(0, 15)}
                                </div>
                            ))}
                            {dayEvents.length > 3 && (
                                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                                    +{dayEvents.length - 3} more
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    const selectedDateEvents = selectedDate ? events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === selectedDate.getDate() &&
            eventDate.getMonth() === selectedDate.getMonth() &&
            eventDate.getFullYear() === selectedDate.getFullYear();
    }) : [];

    if (loading) {
        return <MainLayout><div style={{ padding: '2rem' }}>Đang tải lịch...</div></MainLayout>;
    }

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                padding: '0.5rem'
                            }}
                        >
                            ⬅️
                        </button>
                        <div>
                            <h1 className={styles.title}>📅 Lịch Làm Việc & Hẹn Gặp</h1>
                            <p className={styles.subtitle}>Quản lý thời gian và lịch hẹn với sinh viên</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', alignItems: 'start' }}>
                    {/* Calendar Column */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        {/* Calendar Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <button
                                onClick={() => changeMonth(-1)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#f1f5f9',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                ← Tháng trước
                            </button>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                                Tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
                            </h2>
                            <button
                                onClick={() => changeMonth(1)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#f1f5f9',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                Tháng sau →
                            </button>
                        </div>

                        {/* Day Headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.5rem' }}>
                            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                                <div key={day} style={{ fontWeight: 'bold', textAlign: 'center', padding: '0.5rem', color: '#64748b' }}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                            {renderCalendar()}
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '0.25rem' }}></div>
                                <span>Deadline</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '0.25rem' }}></div>
                                <span>Giờ rảnh</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '12px', height: '12px', background: '#8b5cf6', borderRadius: '0.25rem' }}></div>
                                <span>Đã hẹn</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '12px', height: '12px', background: '#fef3c7', borderRadius: '0.25rem', border: '1px solid #d4d4d8' }}></div>
                                <span>Hôm nay</span>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {selectedDate ? (
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                                        {selectedDate.getDate()}/{selectedDate.getMonth() + 1}
                                    </h3>
                                    <button
                                        onClick={() => setShowCreateSlot(!showCreateSlot)}
                                        style={{
                                            background: '#3b82f6', color: 'white', border: 'none',
                                            borderRadius: '50%', width: '32px', height: '32px',
                                            cursor: 'pointer', fontSize: '1.25rem', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center'
                                        }}
                                        title="Thêm giờ rảnh"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Create Slot Form */}
                                {showCreateSlot && (
                                    <form onSubmit={handleCreateSlot} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#eff6ff', borderRadius: '0.5rem' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>Tạo khung giờ rảnh</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Bắt đầu</label>
                                                <input required type="time" value={newSlotStart} onChange={e => setNewSlotStart(e.target.value)} style={{ width: '100%', padding: '0.25rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Kết thúc</label>
                                                <input required type="time" value={newSlotEnd} onChange={e => setNewSlotEnd(e.target.value)} style={{ width: '100%', padding: '0.25rem' }} />
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Địa điểm / Link Meet</label>
                                            <input required type="text" value={newSlotLocation} onChange={e => setNewSlotLocation(e.target.value)} style={{ width: '100%', padding: '0.25rem' }} placeholder="VD: Phòng A1.2 hoặc Link Meet" />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button type="button" onClick={() => setShowCreateSlot(false)} style={{ padding: '0.25rem 0.5rem', background: 'transparent', border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}>Hủy</button>
                                            <button type="submit" style={{ padding: '0.25rem 0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>Lưu</button>
                                        </div>
                                    </form>
                                )}

                                {selectedDateEvents.length === 0 ? (
                                    <p style={{ color: '#64748b', fontStyle: 'italic' }}>Không có sự kiện nào</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {selectedDateEvents.map((event, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    padding: '0.75rem',
                                                    background: '#f8fafc',
                                                    borderRadius: '0.375rem',
                                                    borderLeft: `4px solid ${event.type === 'deadline' ? '#ef4444' :
                                                        event.type === 'booking' ? '#8b5cf6' :
                                                            event.type === 'meeting_slot' ? '#10b981' : '#3b82f6'
                                                        }`,
                                                    position: 'relative'
                                                }}
                                            >
                                                <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                                    {event.type === 'deadline' ? '⏰' :
                                                        event.type === 'meeting_slot' ? '🆓' : '🤝'} {event.title}
                                                </div>

                                                {(event.type === 'meeting_slot' || event.type === 'booking') && (
                                                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                                                        <div>🕒 {new Date(event.startTime || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endTime || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                        <div>📍 {event.location}</div>
                                                        {event.type === 'meeting_slot' && !event.isBooked && (
                                                            <button
                                                                onClick={() => event.id && handleDeleteSlot(event.id)}
                                                                style={{
                                                                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                                                                    background: 'none', border: 'none', color: '#ef4444',
                                                                    cursor: 'pointer', padding: '0'
                                                                }}
                                                                title="Xóa giờ rảnh"
                                                            >
                                                                🗑️
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {event.studentName && (
                                                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                                                        SV: {event.studentName}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '0.75rem', textAlign: 'center', color: '#64748b', border: '2px dashed #e2e8f0' }}>
                                👆 Chọn một ngày để xem chi tiết hoặc thêm lịch hẹn
                            </div>
                        )}

                        {/* Quick Stats or Tips */}
                        <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '0.75rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>💡 Mẹo quản lý</h4>
                            <p style={{ fontSize: '0.875rem', color: '#1e3a8a', margin: 0 }}>
                                Tạo các khung giờ rảnh (Office hours) để sinh viên có thể chủ động đặt lịch hẹn sửa bài.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default TeacherCalendar;
