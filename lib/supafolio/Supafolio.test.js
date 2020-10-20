"use strict";

const fs   = require( 'fs' ),
      path = require( 'path' );

const Supafolio = require( './Supafolio' ).Supafolio;
const SupafolioAPIErrorProductNotInDatabase =
    require( './SupafolioApiErrorProductNotInDatabase' ).SupafolioAPIErrorProductNotInDatabase;
const SupafolioAPIErrorResourceNotFound =
    require( './SupafolioAPIErrorResourceNotFound' ).SupafolioAPIErrorResourceNotFound;
const SupafolioApiStub = require( '../../test/acceptance/SupafolioApiStub' );

const ADVENTURES_OF_THE_MIND = '9780814711774';
const LES_MISERABLES = '9780451419439';

describe( 'lib/supafolio/Supafolio.book', () => {
    let supafolio;

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

    it( `should return a correct Book for ${ ADVENTURES_OF_THE_MIND }`, () => {
        const book = supafolio.book( ADVENTURES_OF_THE_MIND );

        expect( book ).toMatchSnapshot();
    } );

    it( 'should throw a SupafolioAPIErrorResourceNotFound if given an empty ISBN', () => {
        expect( () => {
            const book = supafolio.book( '' );
        } ).toThrowError( SupafolioAPIErrorResourceNotFound );
    } );

    it( 'should throw a SupafolioAPIErrorProductNotInDatabase if ISBN is not valid', () => {
        expect( () => {
            const book = supafolio.book( '123456789' );
        } ).toThrowError( SupafolioAPIErrorProductNotInDatabase );
    } );

    it( 'should throw a SupafolioAPIErrorProductNotInDatabase if ISBN not found', () => {
        expect( () => {
            const book = supafolio.book( LES_MISERABLES );
        } ).toThrowError( SupafolioAPIErrorProductNotInDatabase );
    } );
} );

