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

        date          : '1998',
        format        :'351 Pages',
        identifier    : '9780814780978',
        language      : 'En',
        paths         : {
            containerFile : TEST_EXPLODED_EPUB_DIR + '/META-INF/container.xml',
            packageFile   : TEST_EXPLODED_EPUB_DIR + '/ops/9780814780978.opf',
        },
        publisher     : 'New York University Press',
        rights        : 'All rights reserved.',
        title         : 'Integrity and Conscience',
    };
    Object.freeze( EXPECTED );

    it( 'should construct an Epub object with correct fields', () => {
        let epub = new Epub( TEST_EXPLODED_EPUB_DIR );
        let field;

        for ( field in EXPECTED ) {
            if ( EXPECTED.hasOwnProperty( field ) ) {
                let got      = epub[ field ];
                let expected = EXPECTED[ field ];

                assert(
                    _.isEqual( got, expected ) === true,
                    `Incorrect field "${field}": got "${got}" but was expecting "${expected}"`
                );
            }
        }

    } );
} );