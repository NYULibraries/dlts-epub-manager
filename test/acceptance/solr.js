"use strict";

/* global before, beforeEach */

let assert    = require( 'chai' ).assert;
let em        = require( '../../lib/bootstrap' );
let fs        = require( 'fs' );
let _         = require( 'lodash' );
let request   = require( 'sync-request' );
let util      = require( '../../lib/util' );
let vorpal    = em.vorpal;

const CONF                        = 'full-metadataDir';

const SOLR_SETUP_AND_START_SCRIPT = 'test/solr/start-solr-test-server.sh'
const SOLR_TEST_CORE              = 'test-core';

vorpal.em.configDir = __dirname + '/fixture/config';

let conf;

describe( 'solr command', () => {

    before( ( ) => {
        let loadSucceeded = loadConfiguration( CONF );

        assert( loadSucceeded === true,
                'ERROR: beforeEach() is not set up right.  ' +
                `Failed to load configuration "${CONF}".` );

        let requestError = {};
        if ( ! util.isSolrResponding( conf, requestError ) ) {
            let errorMessage = '\n\nSolr is not responding.  '                  +
                               'Try running Solr setup and start script:\n\n\t' +
                               SOLR_SETUP_AND_START_SCRIPT;

            if ( requestError.message ) {
                errorMessage += `\n\n${requestError.message}`;
            }

            assert.fail( null, null, errorMessage );
        }
    } );

    beforeEach( ( ) => {
        try {
            clearSolrIndex();
        } catch ( error ) {
            assert.fail( null, null, error );
        }

        let epubs = getEpubs();

        assert( epubs.length === 0,
                'ERROR: beforeEach() is not set up right.  ' +
                `Test Solr index still contains still contains ${epubs.length} EPUBs.`
        );
    } );

    it( 'should correctly delete all EPUBs from Solr index', () => {
        try {
            addFixtureSmallSubsetEpubs();
        } catch (error ) {
            assert.fail( null, null, error );
        }

        vorpal.parse( [ null, null, 'solr', 'delete', 'all' ] );

        let epubs = getEpubs();

        assert( epubs.length === 0,
                `Test Solr index still contains still contains ${epubs.length} EPUBs.`
        );
    } );

    it( 'should correctly delete 3 EPUBs from Solr index', () => {
        try {
            addFixtureSmallSubsetEpubs();
        } catch (error ) {
            assert.fail( null, null, error );
        }

        vorpal.parse( [ null, null, 'solr', 'delete', 'delete-3' ] );

        let epubs = getEpubs();

        assert( epubs.length === 1,
                'Test Solr index should contain only 1 EPUB, and it currently ' +
                `contains ${epubs.length} EPUBs.`
        );

        const EXPECTED_EPUB_ID = '9780814712481';
        let actualEpubId = epubs[ 0 ].identifier;
        assert( actualEpubId === EXPECTED_EPUB_ID,
                `Remaining EPUB has identifier "${actualEpubId}" instead of expected "${EXPECTED_EPUB_ID}".` );
    } );

    it( 'should correctly add all EPUBs to Solr index', () => {
        vorpal.parse( [ null, null, 'solr', 'add', 'full-metadataDir' ] );

        let epubs = getEpubs();

        let expectedDocs = require( './fixture/solr-response-docs/expected-full.json' );
        assert( _.isEqual( epubs, expectedDocs ), 'Added EPUBs did not match expected.' );
    } );

    it( 'should correctly add 3 replacement EPUBs and 3 new EPUBs to Solr index', () => {
        try {
            addFixtureFullEpubs();
        } catch (error ) {
            assert.fail( null, null, error );
        }

        vorpal.parse( [ null, null, 'solr', 'add', 'replace-3-new-3' ] );

        let epubs = getEpubs();

        let expectedDocs = require( './fixture/solr-response-docs/expected-full-followed-by-replace-3-add-3.json' );

        assert( _.isEqual( epubs, expectedDocs ), 'Added EPUBs did not match expected.' );
    } );

    it( 'should correctly full-replace full EPUBs with replace-3-add-3 EPUBs in Solr index', () => {
        try {
            addFixtureSmallSubsetEpubs();
        } catch (error ) {
            assert.fail( null, null, error );
        }

        vorpal.parse( [ null, null, 'solr', 'full-replace', 'replace-3-new-3' ] );

        let epubs = getEpubs();

        let expectedDocs = require( './fixture/solr-response-docs/expected-replace-3-add-3.json' );

        assert( _.isEqual( epubs, expectedDocs ), 'Added EPUBs did not match expected.' );
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

function clearSolrIndex() {
    let solrDeleteAllUrl = util.getSolrUpdateUrl( conf ) +
                           '/?commit=true&stream.body=<delete><query>*:*</query></delete>';

    let response = request( 'GET', solrDeleteAllUrl );

    if ( response.statusCode !== 200 ) {
        throw response.body.toString();
    }
}

function addFixtureSmallSubsetEpubs() {
    let smallSubsetJson = require( `./fixture/epub-json/small-subset-epubs.json` );

    // This function throws errors.  Let caller handle them.
    addFixtureEpubs( smallSubsetJson );
}

function addFixtureFullEpubs() {
    let fullEpubs = require( `./fixture/epub-json/full-epubs.json` );

    // This function throws errors.  Let caller handle them.
    addFixtureEpubs( fullEpubs );
}

function addFixtureEpubs( json ) {
    const NUM_FIXTURE_EPUBS = Object.keys( json ).length;

    try {
        addEpubs( json );
    } catch( error ) {
        throw error.message;
    }

    let epubs = getEpubs();

    if ( epubs.length !== NUM_FIXTURE_EPUBS ) {
        throw `ERROR: attempted to add ${NUM_FIXTURE_EPUBS} fixture EPUBs, but there ` +
              `are ${epubs.length} EPUBs currently in the index after add operation.`;
    }
}

// This needs to be synchronous, so using `sync-request` instead of `solr-client`.
function addEpubs( epubs ) {
    let solrUpdateUrl = util.getSolrUpdateUrl( conf ) + '/json?commit=true';

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
        throw response.body.toString();
    }

    return addRequest.length;
}

function getEpubs() {
    // Request all fields except for timestamp.
    const FIELDS = [
        'id',
        'author',
        'author_sort',
        'coverHref',
        'coverage',
        'date',
        'description',
        'description_html',
        'format',
        'handle',
        'identifier',
        'language',
        'packageUrl',
        'publisher',
        'rights',
        'subject',
        'subtitle',
        'thumbHref',
        'title',
        'title_sort',
        'type',
        'collection_code',
        'author',
        'spell',
    ];

    let solrSelectUrl = util.getSolrSelectUrl( conf ) + '/?rows=100&wt=json';
    solrSelectUrl += '&fl=' + FIELDS.join( ',' );

    let response = request( 'GET', solrSelectUrl );

    if ( response.statusCode !== 200 ) {
        throw response.body.toString();
    }

    return JSON.parse( response.body.toString() ).response.docs;
}
