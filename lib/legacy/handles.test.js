"use strict";

const legacyHandles = require( './handles' );

describe( 'handles', () => {
    describe( 'getHandleForEpub', () => {
        it( 'should return the correct handle for an EPUB', () => {
            expect( legacyHandles.getHandleForEpub( '9780814706404' ) )
                .toEqual( '2333.1/37pvmfhh' );
        } );

        it( 'should return undefined for an EPUB that is not a legacy EPUB with a handle', () => {
            expect( legacyHandles.getHandleForEpub( '9999999999999' ) )
                .toBeUndefined();
        } );

        it( 'should return the correct handle URL for an EPUB', () => {
            expect( legacyHandles.getHandleUrlForEpub( '9780814706404' ) )
                .toEqual( 'http://hdl.handle.net/2333.1/37pvmfhh' );
        } );
    } );
} );
