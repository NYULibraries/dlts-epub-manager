"use strict";

/* global before, beforeEach */

let assert     = require( 'chai' ).assert;
let dircompare = require( 'dir-compare' );
let em         = require( '../../lib/bootstrap' );
let glob       = require( 'glob' );
let _          = require( 'lodash' );
let path       = require( 'path' );
let rimraf     = require( 'rimraf' );
let vorpal     = em.vorpal;

const CONF = 'intake-full';
const TMP_EPUBS    = __dirname + '/tmp/epubs';
const TMP_METADATA = __dirname + '/tmp/metadata';

vorpal.em.configDir        = __dirname + '/fixture/config';
vorpal.em.configPrivateDir = __dirname + '/fixture/config-private';

// NOTE: using `function()` instead of arrow functions because using the latter
// causes `this` to be bound incorrectly, and this test suite needs `this.timeout()`.
describe( 'intake command', function() {

    // Avoid "Error: timeout of 2000ms exceeded. Ensure the done() callback is being called in this test."
    this.timeout( 60000 );

    before( ( ) => {
        let loadSucceeded = vorpal.execSync( `load ${CONF}`, { fatal : true } );

        assert( loadSucceeded === true,
                'ERROR: before() is not set up right.  ' +
                `Failed to load configuration "${CONF}".` );

        assert(
            // Conf file epubOutputDir is relative path, have to change it to
            // absolute for comparison
            path.dirname( path.dirname ( __dirname ) ) + '/' +
                vorpal.em.conf.intakeOutputDir === TMP_EPUBS,
            `intakeOutputDir is ${TMP_EPUBS}`
        );

        assert(
            // Conf file metadataDir is relative path, have to change it to
            // absolute for comparison
            path.dirname( path.dirname ( __dirname ) ) + '/' +
                vorpal.em.conf.metadataDir === TMP_METADATA,
            `metadataDir is ${TMP_METADATA}`
        );
    } );

    it( 'should correctly intake all EPUBs and generate correct Readium versions', function() {
        var epubsComparison,
            intakeOutputDir   = vorpal.em.conf.intakeOutputDir,
            intakeExpectedDir = __dirname + '/expected/epubs-from-intake',
            compareOptions = {
                compareContent : true,
                // Excluding *-th.jpg because the thumbnails look identical, but
                // differ on a binary level.
                excludeFilter  : '.commit-empty-directory,*-th.jpg',
            };

        try {
            rimraf.sync( intakeOutputDir + '/*' );
        } catch ( error ) {
            vorpal.log( `ERROR clearing ${intakeOutputDir}: ${error}` );

            process.exit(1);
        }

        vorpal.parse( [ null, null, 'intake', 'add' ] );

        // Normally trying to keep to a single assert per test, but making an
        // exception here.

        // For now, just comparing thumbnail filenames since binary diffs will always fail.
        let thumbnailsExpected = glob.sync( '**/*-th.jpg', {cwd : intakeExpectedDir} );
        let thumbnailsGot = glob.sync( '**/*-th.jpg', {cwd : intakeOutputDir} );
        assert(
            _.isEqual( thumbnailsGot, thumbnailsExpected ),
            'All cover image thumbnails created'
        );

        epubsComparison = dircompare.compareSync(
            intakeOutputDir, intakeExpectedDir,
            compareOptions
        );

        assert( epubsComparison.same === true, `${intakeOutputDir} matched ${intakeExpectedDir}` );
    } );

    it( 'should correctly intake all EPUBs and generate correct metadata files', function() {
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

        assert( metadataComparison.same === true, `${metadataDir} matched ${metadataExpectedDir}` );
    } );

} );
