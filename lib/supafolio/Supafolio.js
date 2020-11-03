"use strict";

const path = require( 'path' );

const Book = require( './Book' ).Book;

const SUPAFOLIO_API_BASE_URL = 'http://api.supafolio.com/v2/';
const SUPAFOLIO_API_BOOK_URL = SUPAFOLIO_API_BASE_URL + 'book/';

const SupafolioApiError = require( './SupafolioApiError' ).SupafolioApiError;
const SupafolioApiErrorInvalidApiKey =
    require( './SupafolioApiErrorInvalidApiKey' ).SupafolioApiErrorInvalidApiKey;
const SupafolioApiErrorProductNotInDatabase =
    require( './SupafolioApiErrorProductNotInDatabase' ).SupafolioApiErrorProductNotInDatabase;
const SupafolioApiErrorResourceNotFound =
    require( './SupafolioApiErrorResourceNotFound' ).SupafolioApiErrorResourceNotFound;

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

        const responseBody = JSON.parse( response.body.toString() );

        if ( Supafolio.#isError( responseBody ) ) {
            throw Supafolio.#newSupafolioApiError( responseBody );
        }

        return new Book( responseBody );
    }

    static #isError( response ) {
        if ( response.status === 'error' ) {
            return true;
        }

        return false;
    }
    // See https://jira.nyu.edu/jira/projects/NYUP/issues/NYUP-73
    //     "Document Supafolio API error responses and their structure"
    static #newSupafolioApiError( response ) {
        const message = response.data.errors[ 0 ].message;

        switch ( message ) {
            case SupafolioApiErrorInvalidApiKey.MESSAGE :
                return new SupafolioApiErrorInvalidApiKey();
            case SupafolioApiErrorProductNotInDatabase.MESSAGE :
                return new SupafolioApiErrorProductNotInDatabase();
            case SupafolioApiErrorResourceNotFound.MESSAGE :
                return new SupafolioApiErrorResourceNotFound();
            default :
                return new SupafolioApiError( 'Unknown error', message );
        }
    }
}

module.exports = {
    Supafolio,
};
