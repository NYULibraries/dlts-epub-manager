"use strict";

const fs = require( 'fs' ),
    _ = require( 'lodash' ),
    DltsEpub = require( './DltsEpub' ).DltsEpub;

const EXPECTED_DIR       = __dirname + '/expected/epubs';
const EXPECTED_DATA_FILE = 'expected-data.json';

const FIXTURES_DIR = __dirname + '/fixtures/epubs';

describe( 'epub', () => {
    const expectedData = {};

    beforeAll( () => {
        const epubId = fs.readdirSync( EXPECTED_DIR );

        epubId.forEach( ( epubId ) => {
            expectedData[ epubId ] =
                require( `${EXPECTED_DIR}/${epubId}/${EXPECTED_DATA_FILE}` );
        } );
    } );

    // Generally would like to stick to the principle of 1 assert per test, but
    // for now will try this construction for testing fields as it is quite simple,
    // succinct, and easy to understand, and which makes changes to testing of Epub
    // fields quiet easy.
    it( 'should construct a DltsEpub object with correct package fields', () => {
        Object.keys( expectedData ).forEach( ( epubId ) => {
            const dltsEpub        = new DltsEpub( `${FIXTURES_DIR}/${epubId}` );
            const expectedPackage = expectedData[ epubId ].package;
            let field;

            for ( field in expectedPackage ) {
                if ( expectedPackage.hasOwnProperty( field ) ) {
                    const got      = dltsEpub.package[ field ];
                    const expected = expectedPackage[ field ];

                    expect( got ).toEqual( expected );
                }
            }
        } );
    } );

    it( 'should construct a DltsEpub object with correct dlts fields', () => {
        Object.keys( expectedData ).forEach( ( epubId ) => {

            const dltsEpub             = new DltsEpub( `${FIXTURES_DIR}/${epubId}` );
            const expectedDltsMetadata = expectedData[ epubId ].dlts.metadata;
            let field;

            for ( field in expectedDltsMetadata ) {
                if ( expectedDltsMetadata.hasOwnProperty( field ) ) {
                    const got      = dltsEpub.dlts.metadata[ field ];
                    const expected = expectedDltsMetadata[ field ];

                    expect( got ).toEqual( expected );
                }
            }
        } );
    } );

    it( 'should construct a DltsEpub object with the correct rootDirectory', () => {
        Object.keys( expectedData ).forEach( ( epubId ) => {
                const dltsEpub = new DltsEpub( `${FIXTURES_DIR}/${epubId}` );
                const field    = 'rootDirectory';
                const got      = dltsEpub[ field ];
                const expected = expectedData[ epubId ][ field ];

                expect( got ).toEqual( expected );
        } );
    } );
} );
