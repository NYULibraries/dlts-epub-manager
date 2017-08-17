"use strict";

let assert = require( 'chai' ).assert,
    _      = require( 'lodash' ),
    Epub   = require( '../../lib/epub' ).Epub;

describe( 'epub', () => {
    const TEST_EXPLODED_EPUB_DIR = __dirname + '/fixture/9780814780978';

    const EXPECTED_PATHS = {
        containerFile: TEST_EXPLODED_EPUB_DIR + '/META-INF/container.xml',
        packageFile: TEST_EXPLODED_EPUB_DIR + '/ops/9780814780978.opf'
    };

    const EXPECTED_AUTHORS= [
        'Ian Shapiro',
        'Robert Adams'
    ];

    it( 'should have the correct containerFile', () => {
        let epub = new Epub( TEST_EXPLODED_EPUB_DIR );

        let got = epub.paths.containerFile;
        assert(
            _.isEqual( got, EXPECTED_PATHS.containerFile ) === true,
            `got ${got} but was expecting ${EXPECTED_PATHS.containerFile}`
        );
    } );

    it( 'should have the correct packageFile', () => {
        let epub = new Epub( TEST_EXPLODED_EPUB_DIR );

        let got = epub.paths.packageFile;
        assert(
            _.isEqual( got, EXPECTED_PATHS.packageFile ) === true,
            `got ${got} but was expecting ${EXPECTED_PATHS.packageFile}`
        );
    } );

    it( 'should have the correct author', () => {
        let epub = new Epub( TEST_EXPLODED_EPUB_DIR );

        let got      = epub.authors;
        let expected = EXPECTED_AUTHORS;

        assert(
            _.isEqual( got, expected ) === true,
            `got ${got} but was expecting ${expected}`
        );
    } );
} );