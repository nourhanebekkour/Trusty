/**
 * @param {Object} res 
 * @param {number} statusCode 
 * @param {boolean} success
 * @param {string} message
 */
const sendResponse = (res, statusCode, success, message, data = null, error = null) => {
    return res.status(statusCode).json({
        status: statusCode,
        success: success,
        message: message,
        data: data,
        erreur: error
    });
};

export default sendResponse;


