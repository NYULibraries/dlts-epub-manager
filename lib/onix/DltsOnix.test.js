"use strict";

const fs   = require( 'fs' ),
    path = require( 'path' ),
    _    = require( 'lodash' ),
    DltsOnix = require( './DltsOnix' ).DltsOnix;

const EXPECTED_DIR = __dirname + '/expected/onix';
const FIXTURES_DIR  = __dirname + '/fixtures/onix';

describe( 'onix', () => {
    const expectedData = {};

    beforeAll( () => {
        const expectedOnixDataFiles = fs.readdirSync( EXPECTED_DIR );

        expectedOnixDataFiles.forEach( ( expectedOnixDataFile ) => {
            const epubId = path.basename( expectedOnixDataFile, '.json' );

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

            const dltsOnix             = new DltsOnix( `${FIXTURES_DIR}/${epubId}_onix.xml` );
            const expectedDltsMetadata = expectedData[ epubId ];
            let field;

            for ( field in expectedDltsMetadata ) {
                if ( expectedDltsMetadata.hasOwnProperty( field ) ) {
                    const got    = dltsOnix.dlts.metadata[ field ];
                    let expected = expectedDltsMetadata[ field ];

                    // expectedDltsMetadata was generated from Solr index.  Some of the
                    // values have leading or trailing whitespace.  These should
                    // probably be cleaned up.  For now, just trim().
                    if ( typeof expected === 'string' ) {
                        expected = expected.trim();
                    }

                    expect( got ).toEqual( expected );
                }
            }
        } );
    } );

} );
