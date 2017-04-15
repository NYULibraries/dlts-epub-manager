"use strict";

/* global before, beforeEach */

let assert     = require( 'chai' ).assert;
let dircompare = require( 'dir-compare' );
let em         = require( '../../lib/bootstrap' );
let fs         = require( 'fs' );
let _          = require( 'lodash' );
let util       = require( '../../lib/util' );
let vorpal     = em.vorpal;

const CONF                        = 'full-metadataDir';

vorpal.em.configDir        = __dirname + '/fixture/config';
vorpal.em.configPrivateDir = __dirname + '/fixture/config-private';

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

        var res = dircompare.compareSync(
            __dirname + '/tmp/epubs',
            __dirname + '/expected/epubs-from-intake'
        );
        console.log( res );
    } );

    it( 'should correctly add 3 replacement EPUBs and 3 new EPUBs', () => {
        vorpal.parse( [ null, null, 'solr', 'add', 'replace-3-new-3' ] );
    } );

} );
