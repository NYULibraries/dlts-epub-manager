"use strict";

/* global before, beforeEach */

let assert    = require( 'chai' ).assert;
let em        = require( '../../lib/bootstrap' );
let util      = require( '../../lib/util' );
let vorpal    = em.vorpal;

vorpal.em.configDir        = __dirname + '/fixture/config';

describe( 'intake command', () => {

    describe( 'intake EPUBs', () => {
        it( 'should correctly intake EPUBs', () => {
            vorpal.parse( [ null, null, 'intake', 'full-metadataDir' ] );

            // Assert that output EPUBs match test/acceptance/expected/epubs-from-intake/
            // Assert that output metadata match test/acceptance/expected/metadata-from-intake/
        } );
    } );

} );

