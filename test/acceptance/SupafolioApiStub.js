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

const SUPAFOLIO_API_FIXTURE_DIRECTORY = __dirname + '/fixture/supafolio-api/';
const SUPAFOLIO_API_URL = 'http://api.supafolio.com/v2/book/';

class SupafolioApiStub {
    #apiKey

    constructor( apiKey ) {
        this.apiKey = apiKey;
    }

    static error( statusCode, message ) {
        return {
            statusCode,
            body: `SupafolioApiStub ERROR: ${message}`,
        };
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
        let response;

        const isbn = SupafolioApiStub.parseIsbn( url );

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

        const fixtureFile = path.join( SUPAFOLIO_API_FIXTURE_DIRECTORY, `${ isbn }.json` );

        if ( fs.existsSync( fixtureFile ) ) {
            return require( fixtureFile );
        } else {
            return SupafolioApiStub.supafolioErrorResponse(
                SupafolioApiErrorProductNotInDatabase.MESSAGE,
            );
        }
function createResponse( body ) {
    return {
        statusCode : 200,
        // Following node_modules/sync-fetch/shared.js: parseBody() for type String
        body       : Buffer.from( String( JSON.stringify( body ) ) ),
    }
}

module.exports = SupafolioApiStub;
