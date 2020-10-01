"use strict";

const path = require( 'path' );

const Book = require( './Book' ).Book;

const SUPAFOLIO_API_BASE_URL = 'http://api.supafolio.com/v2/';
const SUPAFOLIO_API_BOOK_URL = path.join( SUPAFOLIO_API_BASE_URL, 'book' );

let request;

function book( isbn ) {
    const response = request(
        'GET',
        path.join( SUPAFOLIO_API_BOOK_URL, epubId ),
        {
            headers : {
                'x-apikey' : em.config.supafolioAPIKey,
            }
        }
    );

    return new Book( response );
}

module.exports = {
    book,
};
