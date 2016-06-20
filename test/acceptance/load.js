"use strict";

/* global before, beforeEach */

let assert    = require( 'chai' ).assert;
let em        = require( '../../lib/bootstrap' );
let stringify = require( 'json-stable-stringify' );
let vorpal    = em.vorpal;

vorpal.em.configDir = __dirname + '/fixture/config';

describe( 'load command', () => {
    let expected;

    before( ( ) => {
        expected = stringify(
            require( './fixture/metadata/expected-full'),
            { stable : '    ' }
        );
    } );

    beforeEach( ( ) => {
        vorpal.parse( [ null, null, 'load', 'clear' ] );
    } );

    it( 'should correctly load from local metadataDir', () => {
        vorpal.parse( [ null, null, 'load', 'full-metadataDir' ] );
        let actual = vorpal.em.metadata.dumpCanonical();

        assert( actual === expected, 'Metadata loaded from metadataDir did not match expected.' );
    } );

    it( 'should correctly load from local metadataRepo', () => {
        vorpal.parse( [ null, null, 'load', 'full-metadataRepo' ] );
        let actual = vorpal.em.metadata.dumpCanonical();

        assert( actual === expected, 'Metadata loaded from metadataRepo did not match expected.' );
    } );
} );

