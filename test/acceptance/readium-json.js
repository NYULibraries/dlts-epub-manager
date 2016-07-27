"use strict";

/* global before, beforeEach */

let assert    = require( 'chai' ).assert;
let em        = require( '../../lib/bootstrap' );
let fs        = require( 'fs' );
let util      = require( '../../lib/util' );
let vorpal    = em.vorpal;

vorpal.em.configDir = __dirname + '/fixture/config';

describe( 'readium-json command', () => {
    let expectedFull;

    before( ( ) => {
        expectedFull = util.jsonStableStringify(
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
        let countOfExpectedEpubs = JSON.parse( expectedFull ).length;
        fs.writeFileSync( readiumJsonFile, expectedFull, { flag : 'w' } );
        let epubsBefore = util.getJsonFromFile( readiumJsonFile );
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

        let actual = util.jsonStableStringify( util.getJsonFromFile( readiumJsonFile ) );

        assert( actual === expectedFull, 'epub_library.json file did not match expected.' );
    } );

    it( 'should correctly add 3 replacement EPUBs and 3 new EPUBs to epub_library.json', () => {
        let readiumJsonFile = `${vorpal.em.rootDir}/${vorpal.em.conf.readiumJsonFile}`;

        // First, fill up the file.  There have to be existing EPUBs to be replaced
        // and added to.
        fs.writeFileSync( readiumJsonFile, expectedFull, { flag : 'w' } );

        vorpal.parse( [ null, null, 'readium-json', 'add', 'replace-3-new-3' ] );

        let expectedReplace3New3 = util.jsonStableStringify(
            require( './fixture/readiumJsonFiles/expected-full-replace-3-new-3-epub_library.json')
        );

        let actual = util.jsonStableStringify( util.getJsonFromFile( readiumJsonFile ) );

        assert( actual === expectedReplace3New3, 'epub_library.json file did not match expected.' );
    } );

    it( 'should correctly full-replace all EPUBs in epub_library.json', () => {
        let readiumJsonFile = `${vorpal.em.rootDir}/${vorpal.em.conf.readiumJsonFile}`;

        /// First, fill up the file so we can be sure EPUBs were there that were
        // later deleted.
        let countOfExpectedEpubs = JSON.parse( expectedFull ).length;
        fs.writeFileSync( readiumJsonFile, expectedFull, { flag : 'w' } );
        let epubsBefore = util.getJsonFromFile( readiumJsonFile );
        assert( epubsBefore.length === countOfExpectedEpubs,
                `Test is not set up right.  ${readiumJsonFile} should contain ${countOfExpectedEpubs}` +
                ' EPUBs before the `delete all` operation.' );

        vorpal.parse( [ null, null, 'readium-json', 'full-replace', 'replace-3-new-3' ] );

        let expectedReplace3New3 = util.jsonStableStringify(
            require( './fixture/readiumJsonFiles/expected-only-replace-3-new-3-epub_library.json')
        );

        let actual = util.jsonStableStringify( util.getJsonFromFile( readiumJsonFile ) );

        assert( actual === expectedReplace3New3, 'epub_library.json file did not match expected.' );
    } );
} );

