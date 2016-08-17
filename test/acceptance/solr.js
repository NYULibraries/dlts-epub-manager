"use strict";

/* global before, beforeEach */

let assert    = require( 'chai' ).assert;
let em        = require( '../../lib/bootstrap' );
let fs        = require( 'fs' );
let request   = require( 'sync-request' );
let util      = require( '../../lib/util' );
let vorpal    = em.vorpal;

const SOLR_TEST_CORE = 'em-test';

vorpal.em.configDir = __dirname + '/fixture/config';

let conf;

describe( 'solr command', () => {
    let expectedFull;

    before( ( ) => {
        expectedFull = util.jsonStableStringify(
            require( './fixture/solr-responses/full.json' )
        );
    } );

    beforeEach( ( ) => {
        const BEFORE_EACH_CONF_NAME = 'full-metadataDir';
        let loadSucceeded = loadConfiguration( BEFORE_EACH_CONF_NAME );

        assert( loadSucceeded === true,
                'ERROR: beforeEach() is not set up right.  ' +
                `Failed to load configuration "${BEFORE_EACH_CONF_NAME}".` );

        try {
            clearSolrIndex( vorpal.em.conf );
        } catch ( error ) {
            assert.fail( error.statusCode, 200, error.message );
        }

        let epubsAfter = getEpubs( vorpal.em.conf );

        assert( epubsAfter.length === 0,
                'ERROR: beforeEach() is not set up right.  ' +
                `Test Solr index still contains still contains ${epubsAfter.length} EPUBs.`
        );
    } );

    it( 'should correctly delete all EPUBs from Solr index', () => {
        // First, put something in the index.  If it is already empty we can't
        // be sure that the deletion actually worked.
        const NUM_FIXTURE_EPUBS = 4;
        let numFixtureEpubsAdded;

        try {
            numFixtureEpubsAdded =
                addEpubs( vorpal.em.conf, require( `./fixture/epub-json/${NUM_FIXTURE_EPUBS}-epubs.json` ) );
        } catch( error ) {
            assert.fail( error.statusCode, 200, error.message );
        }

        let epubsBefore = getEpubs( vorpal.em.conf );

        assert( epubsBefore.length === NUM_FIXTURE_EPUBS,
                `Test is not set up right.  The test Solr index should contain ${NUM_FIXTURE_EPUBS} ` +
                'EPUBs before the `delete all` operation, and it currently contains '                 +
                numFixtureEpubsAdded + ' EPUBs.'
        );

        vorpal.parse( [ null, null, 'solr', 'delete', 'all' ] );

        let epubsAfter = getEpubs( vorpal.em.conf );

        assert( epubsAfter.length === 0,
                `Test Solr index still contains still contains ${epubsAfter.length} EPUBs.`
        );
    } );

    it( 'should correctly delete 3 EPUBs from Solr index', () => {
        const TEST_CONF_NAME = 'delete-3';
        let loadSucceeded = loadConfiguration( TEST_CONF_NAME );

        assert( loadSucceeded === true,
                'ERROR: test is not set up right.  ' +
                `Failed to load configuration "${TEST_CONF_NAME}".` );

        // First, put something in the index.  If it is already empty we can't
        // be sure that the deletion actually worked.
        const NUM_FIXTURE_EPUBS = 4;
        let numFixtureEpubsAdded;

        try {
            numFixtureEpubsAdded =
                addEpubs( vorpal.em.conf, require( `./fixture/epub-json/${NUM_FIXTURE_EPUBS}-epubs.json` ) );
        } catch( error ) {
            assert.fail( error.statusCode, 200, error.message );
        }

        let epubsBefore = getEpubs( vorpal.em.conf );

        assert( epubsBefore.length === NUM_FIXTURE_EPUBS,
                `Test is not set up right.  The test Solr index should contain ${NUM_FIXTURE_EPUBS} ` +
                'EPUBs before the `delete all` operation, and it currently contains '                 +
                numFixtureEpubsAdded + ' EPUBs.'
        );

        vorpal.parse( [ null, null, 'solr', 'delete' ] );

        let epubsAfter = getEpubs( vorpal.em.conf );

        assert( epubsAfter.length === 4,
                'Test Solr index should contain only 1 EPUB, and it currently ' +
                `contains ${epubsAfter.length} EPUBs.`
        );

        const EXPECTED_EPUB_ID = '9780814712481';
        let actualEpubId = epubsAfter[ 0 ].identifier;
        assert( actualEpubId === EXPECTED_EPUB_ID,
                `Remaining EPUB has identifier "${actualEpubId}" instead of expected "${EXPECTED_EPUB_ID}".` );
    } );

    it( 'should correctly add all EPUBs to Solr index', () => {
     } );

    it( 'should correctly add 3 replacement EPUBs and 3 new EPUBs to Solr index', () => {
    } );

    it( 'should correctly full-replace all EPUBs in Solr index', () => {
    } );
} );

function loadConfiguration( confName ) {
    let loadSucceeded = vorpal.execSync( `load ${confName}`, { fatal : true } );

    if ( loadSucceeded ) {
        let solrPath = vorpal.em.conf.solrPath ;

        if ( ! solrPath.endsWith( SOLR_TEST_CORE ) ) {
            console.log( `ERROR: solrPath option ${solrPath} does not end with required "${SOLR_TEST_CORE}".` );
            return false;
        }

        conf = vorpal.em.conf;

        return true;
    } else {
        return false;
    }
}

function clearSolrIndex( conf ) {
    let solrHost = conf.solrHost;
    let solrPort = conf.solrPort;
    let solrPath = conf.solrPath;

    let solrDeleteAllUrl = `http://${solrHost}:${solrPort}${solrPath}/update/?` +
                           'commit=true&stream.body=<delete><query>*:*</query></delete>';

    let response = request( 'GET', solrDeleteAllUrl );

    if ( response.statusCode !== 200 ) {
        throw response.body.toString();
    }
}

// This needs to be synchronous, so using `sync-request` instead of `solr-client`.
function addEpubs( conf, epubs ) {
    let solrHost = conf.solrHost;
    let solrPort = conf.solrPort;
    let solrPath = conf.solrPath;

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
    let solrHost = conf.solrHost;
    let solrPort = conf.solrPort;
    let solrPath = conf.solrPath;

    let solrSelectUrl = `http://${solrHost}:${solrPort}${solrPath}/select?rows=100&wt=json`;

    let response = request( 'GET', solrSelectUrl );

    if ( response.statusCode !== 200 ) {
        throw response.body.toString();
    }

    return JSON.parse( response.body.toString() ).response.docs;
}
