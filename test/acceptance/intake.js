"use strict";

/* global before, beforeEach */

let assert     = require( 'chai' ).assert;
let dircompare = require( 'dir-compare' );
let em         = require( '../../lib/bootstrap' );
let path       = require( 'path' );
let rimraf     = require( 'rimraf' );
let vorpal     = em.vorpal;

const CONF = 'intake';
const TMP_EPUBS    = __dirname + '/tmp/epubs';
const TMP_METADATA = __dirname + '/tmp/metadata';

vorpal.em.configDir        = __dirname + '/fixture/config';
vorpal.em.configPrivateDir = __dirname + '/fixture/config-private';

describe( 'intake command', () => {

    before( ( ) => {
        let loadSucceeded = vorpal.execSync( `load ${CONF}`, { fatal : true } );

        assert( loadSucceeded === true,
                'ERROR: before() is not set up right.  ' +
                `Failed to load configuration "${CONF}".` );

        assert(
            // Conf file epubOutputDir is relative path, have to change it to
            // absolute for comparison
            path.dirname( path.dirname ( __dirname ) ) + '/' +
                vorpal.em.conf.epubOutputDir === TMP_EPUBS,
            `epubOutputDir is ${TMP_EPUBS}`
        );

        assert(
            // Conf file metadataDir is relative path, have to change it to
            // absolute for comparison
            path.dirname( path.dirname ( __dirname ) ) + '/' +
                vorpal.em.conf.metadataDir === TMP_METADATA,
            `metadataDir is ${TMP_METADATA}`
        );
    } );

    it( 'should correctly intake all EPUBs and generate correct Readium versions', () => {
        var epubsComparison,
            epubOutputDir = vorpal.em.conf.epubOutputDir,
            epubExpectedDir = __dirname + '/expected/epubs-from-intake',
            compareOptions = {
                compareContent : true,
                excludeFilter  : '.commit-empty-directory',
            };

        try {
            rimraf.sync( epubOutputDir + '/*' );
        } catch ( error ) {
            vorpal.log( `ERROR clearing ${epubOutputDir}: ${error}` );

            process.exit(1);
        }

        vorpal.parse( [ null, null, 'intake', 'add' ] );

        epubsComparison = dircompare.compareSync(
            epubOutputDir, epubExpectedDir,
            compareOptions
        );

        assert( epubsComparison.same === true, 'Generated Readium versions match expected' );
    } );

    it( 'should correctly intake all EPUBs and generate correct metadata files', () => {
        var metadataComparison,
            metadataDir = vorpal.em.conf.metadataDir,
            metadataExpectedDir = __dirname + '/expected/metadata-from-intake',
            compareOptions = {
                compareContent : true,
                excludeFilter  : '.commit-empty-directory',
            };

        try {
            rimraf.sync( metadataDir + '/*' );
        } catch ( error ) {
            vorpal.log( `ERROR clearing ${metadataDir}: ${error}` );

            process.exit(1);
        }

        vorpal.parse( [ null, null, 'intake', 'add' ] );

        metadataComparison = dircompare.compareSync(
            metadataDir, metadataExpectedDir,
            compareOptions
        );

        assert( metadataComparison.same === true, 'Metadata files match expected' );
    } );

} );
