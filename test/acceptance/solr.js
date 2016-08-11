"use strict";

/* global before, beforeEach */

let assert    = require( 'chai' ).assert;
let em        = require( '../../lib/bootstrap' );
let fs        = require( 'fs' );
let request   = require( 'sync-request' );
let solr      = require( 'solr-client' );
let util      = require( '../../lib/util' );
let vorpal    = em.vorpal;

vorpal.em.configDir = __dirname + '/fixture/config';

let client = solr.createClient();

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

        client = setupClient( vorpal.em.conf );
    } );

    it( 'should correctly delete all EPUBs from Solr index', () => {
        // First, put something in the index.  If it is already empty we can't
        // be sure that the deletion actually worked.
        let numFixtureEpubsAdded =
                addFixtureEpubs( vorpal.em.conf, './fixture/epub-json/3-epubs.json' );
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

function setupClient( conf ) {
    let client = solr.createClient();

    // This doesn't seem to do anything.  Also looked through the code and tests
    // and found no reference to this option.
    // client.autoCommit = true;

    client.options.host = conf.solrHost;
    client.options.port = conf.solrPort;
    client.options.path = conf.solrPath;

    return client;
}

// This needs to be synchronous, so using `sync-request` instead of `solr-client`.
function addFixtureEpubs( conf, fixtureFile ) {
    let epubs = require( fixtureFile );

    return addEpubs( conf, epubs );
}

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
        // TODO: add error handling.  Throw error?  Return falsy value?
    }

    return addRequest.length;
}
