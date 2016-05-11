"use strict";

const ERROR_METADATA_NOT_LOADED =
    'No metadata has been loaded.  Please run "load [configuration]" first.';

function isValidIsbn13( str ) {
    // So far NYU Press appears to be using ISBN-13.
    // Regular Expressions Cookbook, 2nd Edition, has regexp for ISBN-13
    // https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9781449327453/ch04s13.html
    // NOTE: For JavaScript, need to double the backslashes to get a literal single backslash in the string.
    const ISBN_13_REGEX_STRING =
                        '^'                           +
                        '(?:ISBN(?:-13)?:?\\ )?'      + // Optional ISBN/ISBN-13 identifier.
                        '(?='                         + // Basic format pre-checks (lookahead):
                          '[0-9]{13}$'                + //   Require 13 digits (no separators).
                         '|'                          + //  Or:
                          '(?=(?:[0-9]+[-\\ ]){4})'   + //   Require 4 separators
                          '[-\ 0-9]{17}$'             + //     out of 17 characters total.
                        ')'                           + // End format pre-checks.
                        '97[89][-\\ ]?'               + // ISBN-13 prefix.
                        '[0-9]{1,5}[-\\ ]?'           + // 1-5 digit group identifier.
                        '[0-9]+[-\\ ]?[0-9]+[-\\ ]?'  + // Publisher and title identifiers.
                        '[0-9]'                       + // Check digit.
                        '$'
        ;
    const ISBN_13_REGEX = new RegExp( ISBN_13_REGEX_STRING );

    return str.match( ISBN_13_REGEX ) !== null;
}

function isValidNormalizedIsbn13( str ) {
    // Regular Expressions Cookbook, 2nd Edition, has regexp for ISBN-13
    // https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9781449327453/ch04s13.html

    // Allows an ISBN-13 with no separators (13 total characters)
    const NORMALIZED_ISBN_REGEX = /^97[89][0-9]{10}$/;

    return str.match( NORMALIZED_ISBN_REGEX ) !== null;
}

module.exports = {
    ERROR_METADATA_NOT_LOADED,
    isValidIsbn13,
    isValidNormalizedIsbn13
};