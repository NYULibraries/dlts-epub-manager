"use strict";

const path = require( 'path' );

const Book = require( './Book' ).Book;

const SUPAFOLIO_API_BASE_URL = 'http://api.supafolio.com/v2/';
const SUPAFOLIO_API_BOOK_URL = SUPAFOLIO_API_BASE_URL + 'book/';

class Supafolio {
    constructor( apiKey, request ) {
        this.apiKey = apiKey;
        this.request = request;
    }

    book( epubId ) {
        const response = this.request(
            'GET',
            SUPAFOLIO_API_BOOK_URL + epubId,
            {
                headers : {
                    'x-apikey' : this.apiKey,
                }
            }
        );

        return new Book( response );
    }
}

module.exports = {
    Supafolio,
};
