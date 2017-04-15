"use strict";

/* global before, beforeEach */

let assert    = require( 'chai' ).assert;
let em        = require( '../../lib/bootstrap' );
let fs        = require( 'fs' );
let _         = require( 'lodash' );
let util      = require( '../../lib/util' );
let vorpal    = em.vorpal;

const CONF                        = 'full-metadataDir';

vorpal.em.configDir = __dirname + '/fixture/config';

describe( 'intake command', () => {

    before( ( ) => {
        let loadSucceeded = vorpal.execSync( `load ${CONF}`, { fatal : true } );

        assert( loadSucceeded === true,
                'ERROR: before() is not set up right.  ' +
                `Failed to load configuration "${CONF}".` );
    } );

    beforeEach( ( ) => {
    } );

    it( 'should correctly intake all EPUBs', () => {
        vorpal.parse( [ null, null, 'intake', 'add', 'full-metadataDir' ] );
    } );

    it( 'should correctly add 3 replacement EPUBs and 3 new EPUBs', () => {
        vorpal.parse( [ null, null, 'solr', 'add', 'replace-3-new-3' ] );
    } );

} );
