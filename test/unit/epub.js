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
        // identifier    : '9780814780978',
        language      : 'En',
        publisher     : 'New York University Press',
        rights        : 'All rights reserved.',
        title         : 'Integrity and Conscience',
    };
    Object.freeze( EXPECTED );

    // Generally would like to stick to the principle of 1 assert per test, but
    // for now will try this construction, which is quite simple, succinct, and
    // easy to understand, and which makes changes to testing of Epub
    // fields quiet easy.
    it( 'should construct an Epub object with correct package fields', () => {
        let epub = new Epub( TEST_EXPLODED_EPUB_DIR );
        let field;

        for ( field in EXPECTED ) {
            if ( EXPECTED.hasOwnProperty( field ) ) {
                let got      = epub.package[ field ];
                let expected = EXPECTED[ field ];

                assert(
                    _.isEqual( got, expected ) === true,
                    `Incorrect field "${field}": got "${got}" but was expecting "${expected}"`
                );
            }
        }

    } );
} );