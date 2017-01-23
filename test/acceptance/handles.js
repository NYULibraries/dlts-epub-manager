"use strict";

/* global after, before, beforeEach */

let assert    = require( 'chai' ).assert;
let em        = require( '../../lib/bootstrap' );
let _         = require( 'lodash' );
let vorpal    = em.vorpal;

let RestfulHandleServerStub = require( './RestfulHandleServerStub' );

const CONF                       = 'full-metadataDir';
const RESTFUL_HANDLE_TEST_SERVER = 'handle';

let overriddenRequest;

vorpal.em.configDir = __dirname + '/fixture/config';

let conf;

describe( 'handles command', () => {
    let restfulHandleServerStub;

    before( ( ) => {
        restfulHandleServerStub = new RestfulHandleServerStub();

        overriddenRequest = vorpal.em.request;

        vorpal.em.request =
            restfulHandleServerStub.request.bind( restfulHandleServerStub );
    } );

    beforeEach( ( ) => {
        let loadSucceeded = loadConfiguration( CONF );

        assert( loadSucceeded === true,
                'ERROR: beforeEach() is not set up right.  ' +
                `Failed to load configuration "${CONF}".` );
    } );

    it( 'should correctly add all handles to handle server', () => {
        let expected = require( './fixture/handles/expected_add_full-metadataDir.json' );

        vorpal.parse( [ null, null, 'handles', 'add', 'full-metadataDir' ] );

        assert(
            restfulHandleServerStub.stateEquals( expected ),
            'Added handles did not match expected.'
        );
    } );

    it( 'should correctly delete all handles from handles server', () => {
        addFixtureFullHandles( restfulHandleServerStub );

        vorpal.parse( [ null, null, 'handles', 'delete', 'all' ] );

        let handlesRemaining = restfulHandleServerStub.size();
        assert( handlesRemaining === 0,
                `RestfulHandleServerStub still contains ${handlesRemaining} handles.`
        );
    } );

    it( 'should correctly delete 3 handles from handles server', () => {

        vorpal.parse( [ null, null, 'handles', 'delete', 'delete-3' ] );

    } );

    it( 'should correctly add 3 replacement handles and 3 new handles to handles server', () => {

        vorpal.parse( [ null, null, 'handles', 'add', 'replace-3-new-3' ] );

    } );

    it( 'should correctly full-replace full handles with replace-3-add-3 handles in handles server', () => {

        vorpal.parse( [ null, null, 'handles', 'full-replace', 'replace-3-new-3' ] );

    } );

    after( ( ) => {
        vorpal.em.request = overriddenRequest;
    } );

} );

function loadConfiguration( confName ) {
    let loadSucceeded = vorpal.execSync( `load ${confName}`, { fatal : true } );

    if ( loadSucceeded ) {
        let restfulHandleServerPath = vorpal.em.conf.restfulHandleServerPath;

        if ( ! restfulHandleServerPath.endsWith( RESTFUL_HANDLE_TEST_SERVER ) ) {
            console.log(
                `ERROR: restfulHandleServerPath option ${restfulHandleServerPath}` +
                ` does not end with required "${RESTFUL_HANDLE_TEST_SERVER}".`
            );
            return false;
        }

        conf = vorpal.em.conf;

        return true;
    } else {
        return false;
    }
}

function addFixtureFullHandles( restfulHandleServerStub ) {
    let handleBindings = require( './fixture/handles/expected_add_full-metadataDir.json' );

    handleBindings.forEach( ( pair ) => {
        restfulHandleServerStub.set( pair[ 0 ], pair[ 1 ] );
    } );
}
