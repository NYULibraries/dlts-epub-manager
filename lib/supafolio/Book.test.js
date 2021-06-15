"use strict";

const fs   = require( 'fs' ),
      path = require( 'path' );

const Book = require( './Book' ).Book;
const SupafolioApiStub = require( '../../test/acceptance/SupafolioApiStub' );

describe( 'lib/supafolio/Book', () => {
    let supafolioApiResponses = {};

    beforeAll( () => {
        supafolioApiResponses = SupafolioApiStub.getAllBookResponses();
    } );

    it( 'should produce a correct book for a Supafolio API response', () => {
        Object.keys( supafolioApiResponses ).sort().forEach( epubId => {
            const supafolioApiResponse = supafolioApiResponses[ epubId ];
            const book = new Book( supafolioApiResponse );

            expect( book ).toMatchSnapshot();
        } );
    } );

    it( 'getters should produce the correct metadata', () => {
        Object.keys( supafolioApiResponses ).sort().forEach( epubId => {
            const supafolioApiResponse = supafolioApiResponses[ epubId ];
            const book = new Book( supafolioApiResponse );

            const gettersInSingleObject = {};
            [
                'authors',
                'authorsForDisplay',
                'collectionCode',
                'coverage',
                'date',
                'description',
                'isbn',
                'isbnForPrimaryFormat',
                'languageCode',
                'license',
                'nyuPressWebsiteBuyTheBookUrl',
                'pages',
                'permanentUrl',
                'publisher',
                'subjects',
                'subtitle',
                'title',
                'titleWithoutPrefix',
                'year',
            ].forEach( getter => {
                gettersInSingleObject[ getter ] = book[ getter ];
            } );

            expect( gettersInSingleObject ).toMatchSnapshot();
        } );
    } );

} );

