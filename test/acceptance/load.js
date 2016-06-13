"use strict";

let assert = require( 'chai' ).assert;
let em     = require( '../../lib/bootstrap' );
let vorpal = em.vorpal;

vorpal.em.configDir = __dirname + '/fixture/config';

describe( 'load', () => {
    it( 'should work', () => {
        vorpal.parse( [ null, null, 'load', 'test-full-repo-load' ] );
    } );
} );

