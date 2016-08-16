"use strict";

/* global before, beforeEach */

let assert    = require( 'chai' ).assert;
let em        = require( '../../lib/bootstrap' );
let fs        = require( 'fs' );
let request   = require( 'sync-request' );
let util      = require( '../../lib/util' );
let vorpal    = em.vorpal;

vorpal.em.configDir = __dirname + '/fixture/config';

describe( 'solr command', () => {
    let expectedFull;

    before( ( ) => {
        expectedFull = util.jsonStableStringify(
            require( './fixture/solr-responses/full.json' )
        );
    } );

    beforeEach( ( ) => {
        vorpal.parse( [ null, null, 'solr', 'delete', 'all' ] );

        vorpal.parse( [ null, null, 'load', 'full-metadataDir' ] );
    } );

    it( 'should correctly delete all EPUBs from Solr index', () => {
        // First, put something in the index.  If it is already empty we can't
        // be sure that the deletion actually worked.
        let numFixtureEpubsAdded;

        try {
            numFixtureEpubsAdded =
                addEpubs( vorpal.em.conf, require( './fixture/epub-json/4-epubs.json' ) );
        } catch( error ) {
            assert.fail( error.statusCode, 200, error.message );
        }

        assert( numFixtureEpubsAdded === 4,
                'Test is not set up right.  The test Solr index should contain 4 '    +
                'EPUBs before the `delete all` operation, and it currently contains ' +
                numFixtureEpubsAdded + ' EPUBs.'
        );

        vorpal.parse( [ null, null, 'solr', 'delete', 'all' ] );

        let epubsAfter = getEpubs( vorpal.em.conf );

        assert( epubsAfter.length === 0,
                `Test Solr index still contains still contains ${epubsAfter.length} EPUBs.`
        );
    } );

    it( 'should correctly delete 3 EPUBs from Solr index', () => {
    } );

    it( 'should correctly add all EPUBs to Solr index', () => {
     } );

    it( 'should correctly add 3 replacement EPUBs and 3 new EPUBs to Solr index', () => {
    } );

    it( 'should correctly full-replace all EPUBs in Solr index', () => {
    } );
} );

// This needs to be synchronous, so using `sync-request` instead of `solr-client`.
function addEpubs( conf, epubs ) {
    let solrHost = conf.test.solrHost;
    let solrPort = conf.test.solrPort;
    let solrPath = conf.test.solrPath;

    let solrUpdateUrl = `http://${solrHost}:${solrPort}${solrPath}/update/json?commit=true`;

    let addRequest = [];

    Object.keys( epubs ).forEach(
        ( id ) => {
            let metadata = epubs[ id ];
            let doc      = { id };

            Object.keys( metadata ).forEach(
                ( key ) => {
                    doc[ key ] = metadata[ key ];
                }
            );

            addRequest.push( doc );
        }
    );

    let response = request(
        'POST', solrUpdateUrl, {
            body : JSON.stringify( addRequest )
        }
    );

    if ( response.statusCode !== 200 ) {
        throw response.getBody();
    }

    return addRequest.length;
}

function getEpubs( conf ) {
    let solrHost = conf.test.solrHost;
    let solrPort = conf.test.solrPort;
    let solrPath = conf.test.solrPath;

    let solrSelectUrl = `http://${solrHost}:${solrPort}${solrPath}/select?rows=100&wt=json`;

    let response = request( 'GET', solrSelectUrl );

    if ( response.statusCode !== 200 ) {
        throw response.body.toString();
    }

    return JSON.parse( response.body.toString() ).response.docs;
}
