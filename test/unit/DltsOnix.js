"use strict";

/* global before, beforeEach */

let fs   = require( 'fs' ),
    path = require( 'path' ),

    assert   = require( 'chai' ).assert,
    _        = require( 'lodash' ),

    DltsOnix = require( '../../lib/onix/DltsOnix' ).DltsOnix;

const EXPECTED_DIR = __dirname + '/expected/onix';
const FIXTURE_DIR  = __dirname + '/fixture/onix';

describe( 'onix', () => {
    let expectedData = {};

    before( () => {
        let expectedOnixDataFiles = fs.readdirSync( EXPECTED_DIR );

        expectedOnixDataFiles.forEach( ( expectedOnixDataFile ) => {
            let epubId = path.basename( expectedOnixDataFile, '.json' );

            expectedData[ epubId ] =
                require( `${EXPECTED_DIR}/${expectedOnixDataFile}` );
        } );
    } );

    // Generally would like to stick to the principle of 1 assert per test, but
    // for now will try this construction for testing fields as it is quite simple,
    // succinct, and easy to understand, and which makes changes to testing of Onix
    // fields quiet easy.
    it( 'should construct a DltsOnix object with correct dlts fields', () => {
        Object.keys( expectedData ).forEach( ( epubId ) => {

            let dltsOnix             = new DltsOnix( `${FIXTURE_DIR}/${epubId}_onix.xml` );
            let expectedDltsMetadata = expectedData[ epubId ];
            let field;

            for ( field in expectedDltsMetadata ) {
                if ( expectedDltsMetadata.hasOwnProperty( field ) ) {
                    let got      = dltsOnix.dlts.metadata[ field ];
                    let expected = expectedDltsMetadata[ field ];

                    // expectedDltsMetadata was generated from Solr index.  Some of the
                    // values have leading or trailing whitespace.  These should
                    // probably be cleaned up.  For now, just trim().
                    if ( typeof expected === 'string' ) {
                        expected = expected.trim();
                    }

                    assert(
                        _.isEqual( got, expected ) === true,
                        `${epubId}: got field "${field}" value of "${got}" but was expecting "${expected}"`
                    );
                }
            }
        } );
    } );

} );
