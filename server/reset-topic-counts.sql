-- Reset current_students về 0 cho tất cả topics
UPDATE topics SET current_students = 0;

-- Kiểm tra lại sau khi reset
SELECT id, title, current_students, max_students, status FROM topics;
