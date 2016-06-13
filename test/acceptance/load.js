"use strict";

let assert = require( 'chai' ).assert;
let em     = require( '../../lib/bootstrap' );
let stringify = require( 'json-stable-stringify' );
let vorpal = em.vorpal;

vorpal.em.configDir = __dirname + '/fixture/config';

describe( 'load command', () => {
    it( 'should correctly load from local metadataDir', () => {
        let expected = stringify(
            require( './fixture/metadata/full'),
            { stable : '    ' }
        );

        vorpal.parse( [ null, null, 'load', 'test-full-filesystem-load' ] );
        let actual = vorpal.em.metadata.dumpCanonical();

        assert( actual === expected, 'Loaded metadata did not match expected.' );
    } );
} );

