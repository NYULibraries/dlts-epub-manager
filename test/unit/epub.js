"use strict";

let assert = require( 'chai' ).assert,
    _      = require( 'lodash' ),
    Epub   = require( '../../lib/epub' ).Epub;

describe( 'epub', () => {
    const TEST_EXPLODED_EPUB_DIR = __dirname + '/fixture/9780814780978';
    const EXPECTED_MANIFEST_ITEM_FILEPATHS = [
        'ops/toc.ncx',
        'ops/styles/9780814780978.css',
        'ops/styles/page-template.xpgt',
        'ops/xhtml/cover.html',
        'ops/xhtml/halftitle.html',
        'ops/xhtml/fm01.html',
        'ops/xhtml/fm02.html',
        'ops/xhtml/title.html',
        'ops/xhtml/copyright.html',
        'ops/xhtml/contents.html',
        'ops/xhtml/preface.html',
        'ops/xhtml/contrib.html',
        'ops/xhtml/ch01.html',
        'ops/xhtml/part01.html',
        'ops/xhtml/ch02.html',
        'ops/xhtml/ch03.html',
        'ops/xhtml/ch04.html',
        'ops/xhtml/ch05.html',
        'ops/xhtml/part02.html',
        'ops/xhtml/ch06.html',
        'ops/xhtml/ch07.html',
        'ops/xhtml/ch08.html',
        'ops/xhtml/part03.html',
        'ops/xhtml/ch09.html',
        'ops/xhtml/ch10.html',
        'ops/xhtml/ch11.html',
        'ops/xhtml/ch12.html',
        'ops/xhtml/ch13.html',
        'ops/xhtml/ch14.html',
        'ops/xhtml/index.html',
        'ops/page-map.xml',
    ];

    describe( '#getManifestItemsFilePaths', () => {

        it( 'should return the desired filepaths', () => {
            let epub = new Epub( TEST_EXPLODED_EPUB_DIR );

            let got = epub.getManifestItemsFilePaths();
            assert(
                _.isEqual( got, EXPECTED_MANIFEST_ITEM_FILEPATHS ) === true,
                'epub.getManifestItemsFilePaths() returned:\n\n' +
                got.join( '\n' )                                 +
                '\n\n...but was expecting:\n\n'                  +
                EXPECTED_MANIFEST_ITEM_FILEPATHS.join( '\n' )
            );
        } );

    } );
} );