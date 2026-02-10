import express from 'express';
import admin from '../config/firebase.js';

const router = express.Router();
const db = admin.firestore();

// Create teacher group assignment
router.post('/', async (req, res) => {
    try {
        const { teacherId, classCode, groupNumber, studentIds } = req.body;

        if (!teacherId || !classCode || !groupNumber || !studentIds || !Array.isArray(studentIds)) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: teacherId, classCode, groupNumber, studentIds'
            });
        }

        // Get teacher name
        const teacherDoc = await db.collection('users').doc(teacherId).get();
        if (!teacherDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        const teacherData = teacherDoc.data();

        // Check if any student is already assigned to another group in this class
        const existingGroups = await db.collection('teacher_groups')
            .where('classCode', '==', classCode)
            .get();

        const alreadyAssigned = [];
        existingGroups.forEach(doc => {
            const group = doc.data();
            const overlap = studentIds.filter(sid => group.studentIds.includes(sid));
            if (overlap.length > 0) {
                alreadyAssigned.push(...overlap);
            }
        });

        if (alreadyAssigned.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Some students are already assigned: ${alreadyAssigned.join(', ')}`
            });
        }

        // Create new group
        const groupData = {
            teacherId,
            teacherName: teacherData.displayName,
            classCode,
            groupNumber: parseInt(groupNumber),
            studentIds,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const docRef = await db.collection('teacher_groups').add(groupData);

        res.json({
            success: true,
            data: {
                id: docRef.id,
                ...groupData
            }
        });
    } catch (error) {
        console.error('Error creating teacher group:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create teacher group',
            error: error.message
        });
    }
});

// Get groups for a teacher
router.get('/teacher/:teacherId', async (req, res) => {
    try {
        const { teacherId } = req.params;

        const snapshot = await db.collection('teacher_groups')
            .where('teacherId', '==', teacherId)
            .get();

        const groups = [];
        snapshot.forEach(doc => {
            groups.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({
            success: true,
            data: groups
        });
    } catch (error) {
        console.error('Error fetching teacher groups:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch teacher groups',
            error: error.message
        });
    }
});

// Get all groups in a class
router.get('/class/:classCode', async (req, res) => {
    try {
        const { classCode } = req.params;

        const snapshot = await db.collection('teacher_groups')
            .where('classCode', '==', classCode)
            .get();

        const groups = [];
        snapshot.forEach(doc => {
            groups.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Sort by groupNumber on server side
        groups.sort((a, b) => a.groupNumber - b.groupNumber);

        res.json({
            success: true,
            data: groups
        });
    } catch (error) {
        console.error('Error fetching class groups:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch class groups',
            error: error.message
        });
    }
});

// Get teacher for a specific student
router.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        const snapshot = await db.collection('teacher_groups')
            .where('studentIds', 'array-contains', studentId)
            .get();

        if (snapshot.empty) {
            return res.json({
                success: true,
                data: null
            });
        }

        const groupDoc = snapshot.docs[0];
        const groupData = groupDoc.data();

        res.json({
            success: true,
            data: {
                id: groupDoc.id,
                ...groupData
            }
        });
    } catch (error) {
        console.error('Error fetching student teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student teacher',
            error: error.message
        });
    }
});

// Delete teacher group
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await db.collection('teacher_groups').doc(id).delete();

        res.json({
            success: true,
            message: 'Teacher group deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting teacher group:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete teacher group',
            error: error.message
        });
    }
});

// Update teacher group (e.g., add/remove students)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { studentIds } = req.body;

        if (!studentIds || !Array.isArray(studentIds)) {
            return res.status(400).json({
                success: false,
                message: 'studentIds array is required'
            });
        }

        await db.collection('teacher_groups').doc(id).update({
            studentIds,
            updatedAt: new Date()
        });

        res.json({
            success: true,
            message: 'Teacher group updated successfully'
        });
    } catch (error) {
        console.error('Error updating teacher group:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update teacher group',
            error: error.message
        });
    }
});

export default router;
