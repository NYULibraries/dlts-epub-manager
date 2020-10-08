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
} );
