/**
 * @param {Object} res 
 * @param {number} statusCode 
 * @param {string} message
 */
const sendResponse = (res, statusCode, message, data = null, error = null) => {
    return res.status(statusCode).json({
        status: statusCode,
        message: message,
        data: data,
        erreur: error
    });
};

export default sendResponse;


