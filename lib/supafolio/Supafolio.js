"use strict";

const path = require( 'path' );

const Book = require( './Book' ).Book;

const SUPAFOLIO_API_BASE_URL = 'http://api.supafolio.com/v2/';
const SUPAFOLIO_API_BOOK_URL = SUPAFOLIO_API_BASE_URL + 'book/';

const SupafolioAPIError = require( './SupafolioApiError' ).SupafolioAPIError;
const SupafolioAPIErrorProductNotInDatabase =
    require( './SupafolioApiErrorProductNotInDatabase' ).SupafolioAPIErrorProductNotInDatabase;
const SupafolioAPIErrorResourceNotFound =
    require( './SupafolioAPIErrorResourceNotFound' ).SupafolioAPIErrorResourceNotFound;

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

        if ( Supafolio.#isError( response ) ) {
            throw Supafolio.#newSupafolioAPIError( response );
        }

        return new Book( response );
    }

    static #isError( response ) {
        if ( response.status === 'error' ) {
            return true;
        }

        return false;
    }
    // See https://jira.nyu.edu/jira/projects/NYUP/issues/NYUP-73
    //     "Document Supafolio API error responses and their structure"
    static #newSupafolioAPIError( response ) {
        const message = response.data.errors[ 0 ].message;

        switch ( message ) {
            case SupafolioAPIErrorProductNotInDatabase.MESSAGE :
                return new SupafolioAPIErrorProductNotInDatabase();
            case SupafolioAPIErrorResourceNotFound.MESSAGE :
                return new SupafolioAPIErrorResourceNotFound();
            default :
                return new SupafolioAPIError( 'Unknown error', message );
        }
    }
}

module.exports = {
    Supafolio,
};
