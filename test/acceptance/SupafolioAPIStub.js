const fs = require( 'fs' );
const path = require( 'path' );
const url = require( 'url' );

const SUPAFOLIO_API_FIXTURE_DIRECTORY = __dirname + '/fixture/supafolio-api/';
const SUPAFOLIO_API_URL = 'http://api.supafolio.com/v2/book/';

class SupafolioAPIStub {
    #apiKey

    constructor( apiKey ) {
        this.apiKey = apiKey;
    }

    static error( statusCode, message ) {
        return {
            statusCode,
            body: `SupafolioAPIStub ERROR: ${message}`,
        };
    }

    static parseIsbn( urlString ) {
        const urlObject = url.parse( urlString );

        const parts = urlObject.pathname.split( '/' );

        return parts[ parts.length - 1 ];
    }

    static supafolioErrorResponse( message ) {
        return {
            status : "error",
            data   : {
                errors :
                    [
                        { message },
                    ]
            }
        };
    }

    // Example: http://api.supafolio.com/v2/book/9780814706404
    request( method, url, options ) {
        let response;

        const isbn = SupafolioAPIStub.parseIsbn( url );
        const expectedUrl = SUPAFOLIO_API_URL + isbn;
        if ( url !== expectedUrl ) {
            return SupafolioAPIStub.error(
                400, `url is "${url}" instead of "${expectedUrl}"` );
        }

        if ( method !== 'GET' ) {
            return SupafolioAPIStub.error(
                400,
                `method is "${method}" instead of "GET"`
            );
        }

        if ( ! ( options && options.headers && options.headers[ 'x-apikey' ] ) ) {
            return SupafolioAPIStub.supafolioErrorResponse( 'Please provide a API key!' );
        }

        if ( options.headers[ 'x-apikey' ] !== this.apiKey ) {
            return SupafolioAPIStub.supafolioErrorResponse( 'Please provide a correct API key!' );
        }

        const fixtureFile = path.join( SUPAFOLIO_API_FIXTURE_DIRECTORY, `${ isbn }.json` );

        if ( fs.existsSync( fixtureFile ) ) {
            return require( fixtureFile );
        } else {
            return SupafolioAPIStub.error(
                400, `fixture response file ${ fixtureFile } does not exist.`
            );
        }
    }
}

module.exports = SupafolioAPIStub;
