"use strict";

/* global before, beforeEach */

let assert    = require( 'chai' ).assert;
let em        = require( '../../lib/bootstrap' );
let fs        = require( 'fs' );
let util      = require( '../../lib/util' );
let vorpal    = em.vorpal;

vorpal.em.configDir = __dirname + '/fixture/config';

// NOTE: can't use `require` for this before/after because `require`
// caches -- it only loads the file once.
function getJsonFromFile( jsonFile ) {
   return JSON.parse( fs.readFileSync( jsonFile ) )
}

describe( 'readium-json command', () => {
    let expected;

    before( ( ) => {
        expected = util.jsonStableStringify(
            require( './fixture/readiumJsonFiles/expected-full-epub_library.json')
        );
    } );

    beforeEach( ( ) => {
        vorpal.parse( [ null, null, 'readium-json', 'delete', 'all', 'full-metadataDir' ] );
    } );

    it( 'should correctly delete all EPUBs from epub_library.json', () => {
        let readiumJsonFile = `${vorpal.em.rootDir}/${vorpal.em.conf.readiumJsonFile}`;

        // First, fill up the file so we can be sure EPUBs were there that were
        // later deleted.
        let countOfExpectedEpubs = JSON.parse( expected ).length;
        fs.writeFileSync( readiumJsonFile, expected, { flag : 'w' } );
        let epubsBefore = getJsonFromFile( readiumJsonFile );
        assert( epubsBefore.length === countOfExpectedEpubs,
            `Test is not set up right.  ${readiumJsonFile} should contain ${countOfExpectedEpubs}` +
            ' EPUBs before the `delete all` operation.' );

        vorpal.parse( [ null, null, 'readium-json', 'delete', 'all', 'full-metadataDir' ] );

        let epubsAfter = JSON.parse( fs.readFileSync( readiumJsonFile ) );

        assert( epubsAfter.length === 0,
                `${readiumJsonFile} still contains ${epubsAfter.length} EPUBs.` );
    } );

    it( 'should correctly add all EPUBs to epub_library.json', () => {
        vorpal.parse( [ null, null, 'readium-json', 'add', 'full-metadataDir' ] );

        let readiumJsonFile = `${vorpal.em.rootDir}/${vorpal.em.conf.readiumJsonFile}`;

        let actual = util.jsonStableStringify( require( readiumJsonFile ) );

        assert( actual === expected, 'epub_library.json file did not match expected.' );
    } );
} );

