import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import * as projectService from '../../services/api/project.service';
import { Project } from '../../types/project.types';
import styles from './Supervisor.module.css';

interface CalendarEvent {
    date: Date;
    title: string;
    type: 'deadline' | 'report' | 'meeting';
    projectId?: string;
    studentName?: string;
}

const TeacherCalendar: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadEvents();
    }, [user, currentDate]);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const allProjects = await projectService.getAllProjects();
            const myProjects = allProjects.filter((p: Project) => p.supervisor.id === user?.uid);

            const calendarEvents: CalendarEvent[] = [];

            // Add project deadlines
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

            setEvents(calendarEvents);
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setLoading(false);
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
                            {dayEvents.slice(0, 2).map((event, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: event.type === 'deadline' ? '#ef4444' : '#3b82f6',
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
                                    {event.type === 'deadline' ? '⏰' : '📝'} {event.title.substring(0, 15)}
                                </div>
                            ))}
                            {dayEvents.length > 2 && (
                                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                                    +{dayEvents.length - 2} more
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
                            <h1 className={styles.title}>📅 Lịch Làm Việc</h1>
                            <p className={styles.subtitle}>Quản lý deadline và sự kiện</p>
                        </div>
                    </div>
                </div>

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
                            <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '0.25rem' }}></div>
                            <span>Báo cáo</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '12px', height: '12px', background: '#fef3c7', borderRadius: '0.25rem', border: '1px solid #d4d4d8' }}></div>
                            <span>Hôm nay</span>
                        </div>
                    </div>
                </div>

                {/* Selected Date Events */}
                {selectedDate && (
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '1rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
                            Sự kiện ngày {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
                        </h3>
                        {selectedDateEvents.length === 0 ? (
                            <p style={{ color: '#64748b' }}>Không có sự kiện nào</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {selectedDateEvents.map((event, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: '0.75rem',
                                            background: '#f8fafc',
                                            borderRadius: '0.375rem',
                                            borderLeft: `4px solid ${event.type === 'deadline' ? '#ef4444' : '#3b82f6'}`
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                            {event.type === 'deadline' ? '⏰' : '📝'}  {event.title}
                                        </div>
                                        {event.studentName && (
                                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                                Sinh viên: {event.studentName}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default TeacherCalendar;
