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

class HandleServerStub {
    constructor() {
        this.handlesData = new Map();
    }

    equals( map ) {
        return _.isEqual( this.handlesData, map );
    }

    error( statusCode, message ) {
        return {
            statusCode,
            body: `HandleServerStub ERROR: ${message}`,
        };
    }

    get( handle ) {
        return this.handlesData.get( handle );
    }

    has( handle ) {
        return this.handlesData.has( handle );
    }

    set( handle, url ) {
        this.handlesData.set( handle, url );
    }

    request( method, url, options ) {
        if ( method !== 'PUT' ) {
            return this.error( 400, `method is "${method}" instead of "PUT"` );
        }

        // Verify content-type
        // Get body
        // Get handle
        // Create handle URL
        // Create handlesMap entry
        // Send response:
        //     <?xml version="1.0"?>
        //     <hs:info xmlns:hs="info:nyu/dl/v1.0/identifiers/handles">
        //         <hs:binding> http://openaccessbooks.nyupress.org/details/9780814706404 </hs:binding>
        //         <hs:location> http://hdl.handle.net/2333.1/37pvmfhh</hs:location>
        //         <hs:response> version=2.1; oc=104; rc=1; snId=0 caCrt noAuth expires:Fri Dec 16 05:54:45 EST 2016 </hs:response>
        //     </hs:info>
    }
}

describe( 'handles command', () => {
    let handleServerStub;

    beforeEach( ( ) => {
        handleServerStub = new HandleServerStub();

        overriddenRequest = vorpal.em.request;

        vorpal.em.request = handleServerStub.request;

        let loadSucceeded = loadConfiguration( CONF );

        assert( loadSucceeded === true,
                'ERROR: beforeEach() is not set up right.  ' +
                `Failed to load configuration "${CONF}".` );
    } );

    it( 'should correctly add all handles to handle server', () => {
        let expected = require( './fixture/handles/expected_add_full-metadataDir.json' );

        vorpal.parse( [ null, null, 'handles', 'add', 'full-metadataDir' ] );

        assert( handleServerStub.equals( expected ), 'Added handles did not match expected.' );
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
