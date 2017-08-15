"use strict";

/* global before, beforeEach */

let assert    = require( 'chai' ).assert;
let em        = require( '../../lib/bootstrap' );
let util      = require( '../../lib/util' );
let vorpal    = em.vorpal;

vorpal.em.configDir        = __dirname + '/fixture/config';
vorpal.em.configPrivateDir = __dirname + '/fixture/config-private';

describe( 'load command', () => {

    describe( 'configuration', () => {
        let expectedRhsUsername;
        let expectedRhsPassword;

        before( ( ) => {
            let privateConfig = require( './fixture/config-private/full-metadataDir.json' );
            expectedRhsUsername = privateConfig.restfulHandleServerUsername;
            expectedRhsPassword = privateConfig.restfulHandleServerPassword;
        } );

        it( 'should correctly load the corresponding private config file ', () => {
            vorpal.parse( [ null, null, 'load', 'full-metadataDir' ] );

            assert.equal(
                `${vorpal.em.conf.restfulHandleServerUsername}:${vorpal.em.conf.restfulHandleServerPassword}`,
                `${expectedRhsUsername}:${expectedRhsPassword}`,
                'Wrong restful handle server credentials'
            );
        } );

    } );

    describe( 'metadata loading', () => {
        let expected;

        before( ( ) => {
            expected = util.jsonStableStringify(
                require( './expected/metadata-dumps/expected-full')
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

} );

