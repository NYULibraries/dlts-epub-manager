"use strict";

let assert = require( 'chai' ).assert,
    _      = require( 'lodash' ),
    util   = require( '../../lib/util/index' );

describe( 'util', () => {
    // From https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9781449327453/ch04s13.html
    const VALID_ISBN_13_STRINGS = [
        'ISBN 978-0-596-52068-7',
        'ISBN-13: 978-0-596-52068-7',
        '978 0 596 52068 7',
        '9780596520687',

        'ISBN 979-0-596-52068-7',
        'ISBN-13: 979-0-596-52068-7',
        '979 0 596 52068 7',
        '9790596520687'
    ];

    const VALID_ISBN_10_STRINGS = [
        'ISBN-10 0-596-52068-9',
        '0-596-52068-9'
    ];

    const INVALID_ISBN_STRINGS = [
        // 3rd digit is invalid
        'ISBN 976-0-596-52068-7',
        'ISBN-13: 976-0-596-52068-7',
        '976 0 596 52068 7',
        '9760596520687',

        // Incorrect separation
        'ISBN 9780-596-52068-7',
        'ISBN-13: 9780-596-52068-7',
        '9780 596 52068 7',
        '978 0  596 52068 7',
        '978-0596520687',

        // Leading and trailing whitespace
        ' 978 0 596 52068 7',
        '978 0 596 52068 7 ',

        'total garbage'
    ];

    const VALID_NORMALIZED_ISBN_13_STRINGS= [
        '9790814793114',
        '9790814793398',
        '9791479824243',
        '9791479899982',

        '9780814793114',
        '9780814793398',
        '9781479824243',
        '9781479899982'
    ];

    const INVALID_NORMALIZED_ISBN_13_STRINGS = [
        // Not normalized
        'ISBN 978-0-596-52068-7',
        'ISBN-13: 978-0-596-52068-7',
        '978 0 596 52068 7',

        // 3rd digit is invalid
        '9760814793114',
        '9760814793398',
        '9761479824243',
        '9761479899982',

        // Normalized, but ISBN-10
        '0596520689',

        ...INVALID_ISBN_STRINGS
    ];

    describe( '#isValidIsbn13', () => {

        it( 'should return true for valid ISBN-13 strings', () => {
            VALID_ISBN_13_STRINGS.forEach( str => {
                assert( util.isValidIsbn13( str ) === true,
                        `Did not return true for '${str}'` );
            } );
        } );

        it( 'should return false for valid ISBN-10 strings', () => {
            VALID_ISBN_10_STRINGS.forEach( str => {
                assert( util.isValidIsbn13( str ) === false,
                        `Did not return false for '${str}'` );
            } );
        } );

        it( 'should return false for invalid strings', () => {
            INVALID_ISBN_STRINGS.forEach( str => {
                assert( util.isValidIsbn13( str ) === false,
                        `Did not return false for '${str}'` );
            } );
        } );

    } );

    describe( '#isValidNormalizedIsbn', () => {

        it( 'should return true for valid normalized ISBN-13 strings', () => {
            VALID_NORMALIZED_ISBN_13_STRINGS.forEach( str => {
                assert( util.isValidNormalizedIsbn13( str ) === true,
                        `Did not return true for '${str}'` );
            } );
        } );

        it( 'should return false for invalid normalized ISBN-13 strings', () => {
            INVALID_NORMALIZED_ISBN_13_STRINGS.forEach( str => {
                assert( util.isValidNormalizedIsbn13( str ) === false,
                        `Did not return false for '${str}'` );
            } );
        } );

    } );

    // This test will be moving to wherever the final EPUB metadata parsing code
    // lives.
    const TEST_EPUB_DIR = __dirname + '/fixture/9780814780978';
    const EXPECTED_MANIFEST_ITEM_FILEPATHS = [
        'toc.ncx',
        'styles/9780814780978.css',
        'styles/page-template.xpgt',
        'images/9780814780978.jpg',
        'fonts/CharisSILB.ttf',
        'fonts/CharisSILBI.ttf',
        'fonts/CharisSILI.ttf',
        'fonts/CharisSILR.ttf',
        'xhtml/cover.xhtml',
        'xhtml/halftitle.html',
        'xhtml/fm01.html',
        'xhtml/fm02.html',
        'xhtml/title.html',
        'xhtml/copyright.html',
        'xhtml/contents.html',
        'xhtml/preface.html',
        'xhtml/contrib.html',
        'xhtml/ch01.html',
        'xhtml/part01.html',
        'xhtml/ch02.html',
        'xhtml/ch03.html',
        'xhtml/ch04.html',
        'xhtml/ch05.html',
        'xhtml/part02.html',
        'xhtml/ch06.html',
        'xhtml/ch07.html',
        'xhtml/ch08.html',
        'xhtml/part03.html',
        'xhtml/ch09.html',
        'xhtml/ch10.html',
        'xhtml/ch11.html',
        'xhtml/ch12.html',
        'xhtml/ch13.html',
        'xhtml/ch14.html',
        'xhtml/index.html',
        'images/pub.jpg',
        'images/f0221-01.jpg',
        'page-map.xml',
    ];
    describe( '#tempGetManifestItemsFilePathsFromEpubPackageFile', () => {

        it( 'should return the desired filepaths', () => {
            let got = util.tempGetManifestItemsFilePathsFromEpubPackageFile( TEST_EPUB_DIR );
            assert(
                _.isEqual( got, EXPECTED_MANIFEST_ITEM_FILEPATHS ) === true,
                'util.tempGetManifestItemsFilePathsFromEpubPackageFile() returned:\n\n' +
                    got.join( '\n' )                                                    +
                    '\n\n...but was expecting:\n\n'                                          +
                    EXPECTED_MANIFEST_ITEM_FILEPATHS.join( '\n' )
            );
        } );

    } );
} );