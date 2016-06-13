"use strict";

let assert = require( 'chai' ).assert;
let em     = require( '../../lib/bootstrap' );
let stringify = require( 'json-stable-stringify' );
let vorpal = em.vorpal;

vorpal.em.configDir = __dirname + '/fixture/config';

describe( 'load command', () => {
    let expected;

    before( ( ) => {
        expected = stringify(
            require( './fixture/metadata/expected-full'),
            { stable : '    ' }
        );
    } );

    it( 'should correctly load from local metadataDir', () => {
        vorpal.parse( [ null, null, 'load', 'full-metadataDir' ] );
        let actual = vorpal.em.metadata.dumpCanonical();

        assert( actual === expected, 'Loaded metadata did not match expected.' );
    } );
} );

