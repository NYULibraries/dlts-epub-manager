"use strict";

const path = require( 'path' );

const Supafolio = require( './Supafolio' ).Supafolio;
const SupafolioApiErrorInvalidApiKey =
    require( './SupafolioApiErrorInvalidApiKey' ).SupafolioApiErrorInvalidApiKey;
const SupafolioApiErrorProductNotInDatabase =
    require( './SupafolioApiErrorProductNotInDatabase' ).SupafolioApiErrorProductNotInDatabase;
const SupafolioApiErrorResourceNotFound =
    require( './SupafolioApiErrorResourceNotFound' ).SupafolioApiErrorResourceNotFound;
const SupafolioApiStub = require( '../../test/acceptance/SupafolioApiStub' );
const SupafolioHttpError =  require( './SupafolioHttpError' ).SupafolioHttpError;

const ADVENTURES_OF_THE_MIND = '9780814711774';
const LES_MISERABLES = '9780451419439';

describe( 'lib/supafolio/Supafolio.book', () => {
    let supafolio;

    beforeAll( () => {
        const SUPAFOLIO_API_KEY = require(
            path.join( __dirname, '../../test/acceptance/fixtures/config-private/metadata-full.json' )
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

    it( 'should throw a SupafolioHttpError if HTTP response with status code other than 200 received', () => {
        expect( () => {
            const book = supafolio.book( SupafolioApiStub.TRIGGER_HTTP_ERROR_ISBN );
        } ).toThrowError( SupafolioHttpError );
    } );

    it( 'should throw a SupafolioApiErrorInvalidApiKey if the API key is invalid', () => {
        const supafolioApiStub = new SupafolioApiStub( 'VALID API KEY' );

        const supafolioInvalidApiKey = new Supafolio(
            'INVALID API KEY!',
            supafolioApiStub.request.bind( supafolioApiStub ),
        );

        expect( () => {
            const book = supafolioInvalidApiKey.book( ADVENTURES_OF_THE_MIND );
        } ).toThrowError( SupafolioApiErrorInvalidApiKey );
    } );

    it( 'should throw a SupafolioApiErrorResourceNotFound if given an empty ISBN', () => {
        expect( () => {
            const book = supafolio.book( '' );
        } ).toThrowError( SupafolioApiErrorResourceNotFound );
    } );

    it( 'should throw a SupafolioApiErrorProductNotInDatabase if ISBN is not valid', () => {
        expect( () => {
            const book = supafolio.book( '123456789' );
        } ).toThrowError( SupafolioApiErrorProductNotInDatabase );
    } );

    it( 'should throw a SupafolioApiErrorProductNotInDatabase if ISBN not found', () => {
        expect( () => {
            const book = supafolio.book( LES_MISERABLES );
        } ).toThrowError( SupafolioApiErrorProductNotInDatabase );
    } );
} );

