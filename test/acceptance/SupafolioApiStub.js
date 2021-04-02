const fs = require( 'fs' );
const path = require( 'path' );
const url = require( 'url' );

const util = require( '../../lib/util' );

const SupafolioApiErrorInvalidApiKey =
    require( '../../lib/supafolio/SupafolioApiErrorInvalidApiKey' ).SupafolioApiErrorInvalidApiKey;
const SupafolioApiErrorProductNotInDatabase =
    require( '../../lib/supafolio/SupafolioApiErrorProductNotInDatabase' ).SupafolioApiErrorProductNotInDatabase;
const SupafolioApiErrorResourceNotFound =
    require( '../../lib/supafolio/SupafolioApiErrorResourceNotFound' ).SupafolioApiErrorResourceNotFound;

const SUPAFOLIO_API_FIXTURES_DIRECTORY = path.join( __dirname, '/fixtures/supafolio-api/' );
const SUPAFOLIO_API_URL = 'http://api.supafolio.com/v2/book/';

class SupafolioApiStub {
    static TRIGGER_HTTP_ERROR_ISBN = '0000000000000';

    #apiKey
    #triggerHttpErrorResponse

    constructor( apiKey ) {
        this.apiKey = apiKey;
        this.#triggerHttpErrorResponse = false;
    }

    static error( statusCode, message ) {
        return {
            statusCode,
            body: `SupafolioApiStub ERROR: ${message}`,
        };
    }

    static getAllBookResponses() {
        const supafolioApiResponses = {};
        const supafolioApiResponsesFixtureFiles = fs.readdirSync( SUPAFOLIO_API_FIXTURES_DIRECTORY );

        supafolioApiResponsesFixtureFiles.forEach( ( supafolioApiResponseFixtureFile ) => {
            if ( ! supafolioApiResponseFixtureFile.endsWith( '.json' ) ) {
                return;
            }

            const epubId = path.basename( supafolioApiResponseFixtureFile, '.json' );

            supafolioApiResponses[ epubId ] =
                require( path.join( SUPAFOLIO_API_FIXTURES_DIRECTORY, supafolioApiResponseFixtureFile ) );
        } );

        return supafolioApiResponses;
    }

    static parseIsbn( urlString ) {
        const urlObject = url.parse( urlString );

        const parts = urlObject.pathname.split( '/' );

        return parts[ parts.length - 1 ];
    }

    static supafolioErrorResponse( message, extra ) {
        const errors = [
            { message },
        ];

        if ( extra ) {
            Object.assign( errors[ 0 ], extra );
        }

        return createResponse(
            {
                status : "error",
                data   : {
                    errors,
                }
            }
        );
    }

    // Example: http://api.supafolio.com/v2/book/9780814706404
    request( method, url, options ) {
        const isbn = SupafolioApiStub.parseIsbn( url );

        if ( isbn === SupafolioApiStub.TRIGGER_HTTP_ERROR_ISBN ) {
            return SupafolioApiStub.error(
                500, 'Internal Server Error' );
        }

        if ( isbn === '' ) {
            return SupafolioApiStub.supafolioErrorResponse(
                SupafolioApiErrorResourceNotFound.MESSAGE,
                {
                    "error": "error-router-no-match",
                    "exception": [],
                }
            );
        }

        if ( ! util.isValidNormalizedIsbn13( isbn ) ) {
            return SupafolioApiStub.supafolioErrorResponse(
                SupafolioApiErrorProductNotInDatabase.MESSAGE,
            );
        }

        const expectedUrl = SUPAFOLIO_API_URL + isbn;
        if ( url !== expectedUrl ) {
            return SupafolioApiStub.error(
                400, `url is "${url}" instead of "${expectedUrl}"` );
        }

        if ( method !== 'GET' ) {
            return SupafolioApiStub.error(
                400,
                `method is "${method}" instead of "GET"`
            );
        }

        if ( ! ( options && options.headers && options.headers[ 'x-apikey' ] ) ) {
            return SupafolioApiStub.supafolioErrorResponse( 'Please provide a API key!' );
        }

        if ( options.headers[ 'x-apikey' ] !== this.apiKey ) {
            return SupafolioApiStub.supafolioErrorResponse(
                SupafolioApiErrorInvalidApiKey.MESSAGE,
            );
        }

        const fixtureFile = path.join( SUPAFOLIO_API_FIXTURES_DIRECTORY, `${ isbn }.json` );

        let body;
        if ( fs.existsSync( fixtureFile ) ) {
            body = require( fixtureFile );
        } else {
            return SupafolioApiStub.supafolioErrorResponse(
                SupafolioApiErrorProductNotInDatabase.MESSAGE,
            );
        }

        return createResponse( body );
    }
}

function createResponse( body ) {
    return {
        statusCode : 200,
        // Following node_modules/sync-fetch/shared.js: parseBody() for type String
        body       : Buffer.from( String( JSON.stringify( body ) ) ),
    }
}

module.exports = SupafolioApiStub;
