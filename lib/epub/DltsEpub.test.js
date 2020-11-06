"use strict";

let fs = require( 'fs' ),
    _ = require( 'lodash' ),
    DltsEpub = require( './DltsEpub' ).DltsEpub;

const EXPECTED_DIR       = __dirname + '/expected/epubs';
const EXPECTED_DATA_FILE = 'expected-data.json';

const FIXTURE_DIR = __dirname + '/fixture/epubs';

describe( 'epub', () => {
    let expectedData = {};

    beforeAll( () => {
        let epubId = fs.readdirSync( EXPECTED_DIR );

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
            let dltsEpub        = new DltsEpub( `${FIXTURE_DIR}/${epubId}` );
            let expectedPackage = expectedData[ epubId ].package;
            let field;

            for ( field in expectedPackage ) {
                if ( expectedPackage.hasOwnProperty( field ) ) {
                    let got      = dltsEpub.package[ field ];
                    let expected = expectedPackage[ field ];

                    expect( got ).toEqual( expected );
                }
            }
        } );
    } );

    it( 'should construct a DltsEpub object with correct dlts fields', () => {
        Object.keys( expectedData ).forEach( ( epubId ) => {

            let dltsEpub             = new DltsEpub( `${FIXTURE_DIR}/${epubId}` );
            let expectedDltsMetadata = expectedData[ epubId ].dlts.metadata;
            let field;

            for ( field in expectedDltsMetadata ) {
                if ( expectedDltsMetadata.hasOwnProperty( field ) ) {
                    let got      = dltsEpub.dlts.metadata[ field ];
                    let expected = expectedDltsMetadata[ field ];

                    expect( got ).toEqual( expected );
                }
            }
        } );
    } );

    it( 'should construct a DltsEpub object with the correct rootDirectory', () => {
        Object.keys( expectedData ).forEach( ( epubId ) => {
                let dltsEpub = new DltsEpub( `${FIXTURE_DIR}/${epubId}` );
                let field    = 'rootDirectory';
                let got      = dltsEpub[ field ];
                let expected = expectedData[ epubId ][ field ];

                expect( got ).toEqual( expected );
        } );
    } );
} );
