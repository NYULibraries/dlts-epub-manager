"use strict";

/* global before, beforeEach */

let assert     = require( 'chai' ).assert;
let dircompare = require( 'dir-compare' );
let em         = require( '../../lib/bootstrap' );
let vorpal     = em.vorpal;

const CONF = 'full-metadataDir';

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

    it( 'should correctly intake all EPUBs and generate correct Readium versions', () => {
        vorpal.parse( [ null, null, 'intake', 'add', 'full-metadataDir' ] );

        var epubsComparison,
            compareOptions = {
                compareContent : true,
                excludeFilter  : '.commit-empty-directory',
            };

        epubsComparison = dircompare.compareSync(
            __dirname + '/tmp/epubs',
            __dirname + '/expected/epubs-from-intake',
            compareOptions
        );

        assert( epubsComparison.same === true, 'Generated Readium versions match expected' );
    } );

    it( 'should correctly intake all EPUBs and generate correct metadata files', () => {
        vorpal.parse( [ null, null, 'intake', 'add', 'full-metadataDir' ] );

        var metadataComparison,
            compareOptions = {
                compareContent : true,
                excludeFilter  : '.commit-empty-directory',
            };

        metadataComparison = dircompare.compareSync(
            __dirname + '/tmp/metadata',
            __dirname + '/expected/metadata-from-intake',
            compareOptions
        );

        assert( metadataComparison.same === true, 'Metadata files match expected' );
    } );

} );
