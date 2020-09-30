const path = require( 'path' );
const url = require( 'url' );

const SUPAFOLIO_API_FIXTURE_DIRECTORY = __dirname + '/fixture/supafolio-api/';
const SUPAFOLIO_API_URL = 'http://api.supafolio.com/v2/book/';

class SupafolioAPIStub {
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

    // Example: http://api.supafolio.com/v2/book/9781776143955
    static request( method, url, options ) {
        let response;

        const isbn = SupafolioAPIStub.parseIsbn( url );
        const expectedUrl = SUPAFOLIO_API_URL + isbn;
        if ( url !== expectedUrl ) {
            return SupafolioAPIStub.error(
                400, `url is "${url}" instead of "${expectedUrl}"` );
        }

        if ( method === 'GET' ) {
            response = require(
                path.join( SUPAFOLIO_API_FIXTURE_DIRECTORY, `${ isbn }.json` )
            );
        } else {
            return SupafolioAPIStub.error(
                400,
                `method is "${method}" instead of "GET"`
            );
        }

        return response;
    }
}

module.exports = SupafolioAPIStub;
