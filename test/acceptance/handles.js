"use strict";

/* global after, before, beforeEach */

let assert    = require( 'chai' ).assert;
let em        = require( '../../lib/bootstrap' );
let _         = require( 'lodash' );
let vorpal    = em.vorpal;

const CONF               = 'full-metadataDir';
const HANDLE_TEST_SERVER = 'handle';

let overriddenRequest;

vorpal.em.configDir = __dirname + '/fixture/config';

let conf;

describe( 'handles command', () => {

    before( ( ) => {
        overriddenRequest = vorpal.em.request;

        vorpal.em.request = httpRequestStub();

        let loadSucceeded = loadConfiguration( CONF );

        assert( loadSucceeded === true,
                'ERROR: beforeEach() is not set up right.  ' +
                `Failed to load configuration "${CONF}".` );
    } );

    it( 'should correctly add all handles to handle server', () => {
        vorpal.parse( [ null, null, 'handles', 'add', 'full-metadataDir' ] );
    } );

    it( 'should correctly delete all handles from handles server', () => {

        vorpal.parse( [ null, null, 'handles', 'delete', 'all' ] );

    } );

    it( 'should correctly delete 3 handles from handles server', () => {

        vorpal.parse( [ null, null, 'handles', 'delete', 'delete-3' ] );

    } );

    it( 'should correctly add all handles to handles server', () => {

        vorpal.parse( [ null, null, 'handles', 'add', 'full-metadataDir' ] );

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

function httpRequestStub() {
    return function( method, url, options ) {
        console.log( `${method} ${url} with options ${options}!` );
    }
}

function loadConfiguration( confName ) {
    let loadSucceeded = vorpal.execSync( `load ${confName}`, { fatal : true } );

    if ( loadSucceeded ) {
        let handleServerPath = vorpal.em.conf.handleServerPath;

        if ( ! handleServerPath.endsWith( HANDLE_TEST_SERVER ) ) {
            console.log( `ERROR: handleServerPath option ${handleServerPath} does not end with required "${HANDLE_TEST_SERVER}".` );
            return false;
        }

        conf = vorpal.em.conf;

        return true;
    } else {
        return false;
    }
}
