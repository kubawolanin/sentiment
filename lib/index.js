var afinn = require('../build/build.json');
var tokenize = require('./tokenize');

/**
 * These words "flip" the sentiment of the following word.
 */
var negators = {
    'nie': 1,
    'nic': 1,
    'żaden': 1,
    'żadne': 1,
    'żadna': 1,
    'nigdzie': 1,
    'nigdy': 1,
    'nikt': 1,
    'nikogo': 1,
    'niczego': 1,
    'niczym': 1,
    'donikąd': 1
};

/**
 * Performs sentiment analysis on the provided input 'phrase'.
 *
 * @param {String} Input phrase
 * @param {Object} Optional sentiment additions to AFINN (hash k/v pairs)
 *
 * @return {Object}
 */
module.exports = function (phrase, inject, callback) {
    // Parse arguments
    if (typeof phrase === 'undefined') phrase = '';
    if (typeof inject === 'undefined') inject = null;
    if (typeof inject === 'function') callback = inject;
    if (typeof callback === 'undefined') callback = null;

    // Merge
    if (inject !== null) {
        afinn = Object.assign(afinn, inject);
    }

    // Storage objects
    var tokens      = tokenize(phrase),
        score       = 0,
        words       = [],
        positive    = [],
        negative    = [];

    // Iterate over tokens
    var len = tokens.length;
    while (len--) {
        var obj = tokens[len];
        var item = afinn[obj];
        if (!afinn.hasOwnProperty(obj)) continue;

        // Check for negation
        if (len > 0) {
            var prevtoken = tokens[len-1];
            if (negators[prevtoken]) item = -item;
        }

        words.push(obj);
        if (item > 0) positive.push(obj);
        if (item < 0) negative.push(obj);

        score += item;
    }

    // Handle optional async interface
    var result = {
        score:          score,
        comparative:    tokens.length > 0 ? score / tokens.length : 0,
        tokens:         tokens,
        words:          words,
        positive:       positive,
        negative:       negative
    };

    if (callback === null) return result;
    process.nextTick(function () {
        callback(null, result);
    });
};
