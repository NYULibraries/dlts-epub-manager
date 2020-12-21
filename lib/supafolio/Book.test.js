"use strict";

const fs   = require( 'fs' ),
      path = require( 'path' );

const Book = require( './Book' ).Book;

const SUPAFOLIO_API_RESPONSES_FIXTURE_FILES_DIR = path.join( __dirname, '../../test/acceptance/fixture/supafolio-api' );

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

    it( 'getters should produce the correct metadata', () => {
        Object.keys( supafolioApiResponses ).sort().forEach( epubId => {
            const supafolioApiResponse = supafolioApiResponses[ epubId ];
            const book = new Book( supafolioApiResponse );

            const gettersInSingleObject = {};
            [
                'authors',
                'authorsForDisplay',
                'collectionCode',
                'coverage',
                'date',
                'description',
                'isbn',
                'languageCode',
                'license',
                'pages',
                'publisher',
                'subjects',
                'subtitle',
                'title',
                'titleWithoutPrefix',
                'year',
            ].forEach( getter => {
                gettersInSingleObject[ getter ] = book[ getter ];
            } );

            expect( gettersInSingleObject ).toMatchSnapshot();
        } );
    } );

} );

