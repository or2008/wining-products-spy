//
exports.getAppId = () => {
    return '';
};

exports.getDevId = () => {
    return '';
};

exports.getCertId = () => {
    return '';
};

exports.getAuthToken = () => {
    return '';
};

// Item Fitler
exports.getItemFilterMinPrice = () => {
    return 20; // in $
};

exports.getItemFilterLocatedIn = () => {
    return 'CN';
};

exports.getItemFilterFeedbackScoreMin = () => {
    return '10';
};

exports.getItemFilterMinPositiveFeedbackPercent = () => {
    return 90;
};

// in last 30 days
exports.getItemFilterMinTxs = () => {
    return 2;
};

module.exports = exports;
