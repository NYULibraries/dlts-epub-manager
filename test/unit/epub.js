"use strict";

let assert = require( 'chai' ).assert,
    _      = require( 'lodash' ),
    Epub   = require( '../../lib/epub' ).Epub;

describe( 'epub', () => {
    const TEST_EXPLODED_EPUB_DIR = __dirname + '/fixture/9780814780978';

    const EXPECTED = {
        authors       : [
            'Ian Shapiro',
            'Robert Adams',
        ],
        containerFile : TEST_EXPLODED_EPUB_DIR + '/META-INF/container.xml',
        packageFile   : TEST_EXPLODED_EPUB_DIR + '/ops/9780814780978.opf',
    };
    Object.freeze( EXPECTED );

    it( 'should have the correct containerFile', () => {
        let epub = new Epub( TEST_EXPLODED_EPUB_DIR );

        let got      = epub.paths.containerFile;
        let expected = EXPECTED.containerFile;

        assert(
            _.isEqual( got, expected ) === true,
            `got ${got} but was expecting ${expected}`
        );
    } );

    it( 'should have the correct packageFile', () => {
        let epub = new Epub( TEST_EXPLODED_EPUB_DIR );

        let got      = epub.paths.packageFile;
        let expected = EXPECTED.packageFile;

        assert(
            _.isEqual( got, expected ) === true,
            `got ${got} but was expecting ${expected}`
        );
    } );

    it( 'should have the correct author', () => {
        let epub = new Epub( TEST_EXPLODED_EPUB_DIR );

        let got      = epub.authors;
        let expected = EXPECTED.authors;

        assert(
            _.isEqual( got, expected ) === true,
            `got ${got} but was expecting ${expected}`
        );
    } );
} );