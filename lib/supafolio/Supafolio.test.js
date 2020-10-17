"use strict";

const fs   = require( 'fs' ),
      path = require( 'path' );

const Book = require( './Book' ).Book;
const Supafolio = require( './Supafolio' ).Supafolio;
const SupafolioApiStub = require( '../../test/acceptance/SupafolioApiStub' );

describe( 'lib/supafolio/Supafolio.book', () => {
    let supafolio;
    let supafolioApiKey;

    beforeAll( () => {
        const SUPAFOLIO_API_KEY = require(
            path.join( __dirname, '../../test/acceptance/fixture/config-private/metadata-full.json' )
        ).supafolioApiKey;

        const supafolioApiStub = new SupafolioApiStub( SUPAFOLIO_API_KEY );

        supafolio = new Supafolio(
            SUPAFOLIO_API_KEY,
            supafolioApiStub.request.bind( supafolioApiStub ),
        );
    } );

    it( 'should return a correct Book for 9780814706404', () => {
        const book = supafolio.book( '9780814706404' );

        expect( book ).toMatchSnapshot();
    } );
} );

