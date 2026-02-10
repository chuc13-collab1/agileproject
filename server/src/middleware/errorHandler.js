/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // MySQL duplicate entry error
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
            success: false,
            message: 'Duplicate entry. Email or ID already exists.',
            error: err.sqlMessage
        });
    }

    // MySQL foreign key constraint error
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            success: false,
            message: 'Invalid reference. Related record does not exist.'
        });
    }

    // Default error response
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
};
