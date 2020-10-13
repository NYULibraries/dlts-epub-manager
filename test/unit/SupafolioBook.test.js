"use strict";

const fs   = require( 'fs' ),
      path = require( 'path' );

const Book = require( '../../lib/supafolio/Book' ).Book;

const SUPAFOLIO_API_RESPONSES_FIXTURE_FILES_DIR = path.join( __dirname, '../acceptance/fixture/supafolio-api' );

describe( 'lib/supafolio/Book', () => {
    const supafolioApiResponses = {};

    beforeAll( () => {
        const supafolioApiResponsesFixtureFiles = fs.readdirSync( SUPAFOLIO_API_RESPONSES_FIXTURE_FILES_DIR );

        supafolioApiResponsesFixtureFiles.forEach( ( supafolioApiResponseFixtureFile ) => {
            if ( ! supafolioApiResponseFixtureFile.endsWith( '.json' ) ) {
                return;
            }

            const epubId = path.basename( supafolioApiResponseFixtureFile, '.json' );

            supafolioApiResponses[ epubId ] =
                require( path.join( SUPAFOLIO_API_RESPONSES_FIXTURE_FILES_DIR, supafolioApiResponseFixtureFile ) );
        } );
    } );

    it( 'should produce a correct book for a Supafolio API response', () => {
        Object.keys( supafolioApiResponses ).sort().forEach( epubId => {
            const supafolioApiResponse = supafolioApiResponses[ epubId ];
            const book = new Book( supafolioApiResponse );

            expect( book ).toMatchSnapshot();
        } );
    } );

    it( 'authors getter', () => {
        testGetter( supafolioApiResponses, 'authors' );
    } );

    // Don't need a test for authorsForDisplay because that is covered by the book test.

    it( 'date getter', () => {
        testGetter( supafolioApiResponses, 'date' );
    } );

} );

function testGetter( supafolioApiResponses, getter ) {
    Object.keys( supafolioApiResponses ).sort().forEach( epubId => {
        const supafolioApiResponse = supafolioApiResponses[ epubId ];
        const book = new Book( supafolioApiResponse );

        expect( book[ getter ] ).toMatchSnapshot();
    } );
}
