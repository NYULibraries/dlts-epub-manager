"use strict";

/* global before, beforeEach */

let assert    = require( 'chai' ).assert;
let em        = require( '../../lib/bootstrap' );
let stringify = require( 'json-stable-stringify' );
let vorpal    = em.vorpal;

vorpal.em.configDir = __dirname + '/fixture/config';

describe( 'readium-json command', () => {
    let expected;

    before( ( ) => {
        expected = stringify(
            require( './fixture/readiumJsonFiles/epub_library.json'),
            { space : '    ' }
        );
    } );

    beforeEach( ( ) => {
        vorpal.parse( [ null, null, 'readium-json', 'delete', 'all' ] );
    } );

    it( 'should correctly add all EPUBs to epub_library.json', () => {
        vorpal.parse( [ null, null, 'readium-json', 'add', 'full-metadataDir' ] );
        let actual = stringify(
            require( vorpal.em.conf.readiumJsonFile ),
            { space : '    ' }
        );

        assert( actual === expected, 'epub_library.json file did not match expected.' );
    } );
} );

