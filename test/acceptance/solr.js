"use strict";

/* global before, beforeEach */

let assert    = require( 'chai' ).assert;
let em        = require( '../../lib/bootstrap' );
let fs        = require( 'fs' );
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

function addFixtureEpubsForDeleteTests( client, callback ) {
    let epubsJson = require( './fixture/epub-json/3-epubs.json' );

    epubsJson.forEach( ( epub ) => {
        let id       = epub[ 0 ];
        let metadata = epub[ 1 ];
        let doc      = { id };

        Object.keys( metadata ).forEach(
            ( key ) => {
                doc[key] = metadata[key];
            }
        );

        client.add(
            doc, { commitWithin : 3000 }, ( error, obj ) => {
                if ( error ) {
                    console.log( JSON.stringify( error, null, 4 ) );
                } else {
                    // Not sure if a status check is necessary or not.  Maybe if
                    // status is non-zero there will always been an error thrown?
                    let status = obj.responseHeader.status;
                    if ( status === 0 ) {
                        callback( null );
                    } else {
                        callback( null );
                    }
                }
            }
        );
    } );
}