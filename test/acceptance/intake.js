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

const CONF_INTAKE_FULL = 'intake-full';
const CONF_INTAKE_1    = 'intake-1';
const TMP_EPUBS        = __dirname + '/tmp/epubs';
const TMP_METADATA     = __dirname + '/tmp/metadata';

vorpal.em.configDir        = __dirname + '/fixture/config';
vorpal.em.configPrivateDir = __dirname + '/fixture/config-private';

// NOTE: using `function()` instead of arrow functions because using the latter
// causes `this` to be bound incorrectly, and this test suite needs `this.timeout()`.
describe( 'intake command', function() {

    // Avoid "Error: timeout of 2000ms exceeded. Ensure the done() callback is being called in this test."
    this.timeout( 60000 );

    // it( 'should correctly intake all EPUBs and generate correct Readium versions and metadata files', function() {
    //     let loadSucceeded = vorpal.execSync( `load ${CONF_INTAKE_FULL}`, { fatal : true } );
    //
    //     assert( loadSucceeded === true,
    //             'ERROR: test is not set up right.  ' +
    //             `Failed to load configuration "${CONF_INTAKE_FULL}".` );
    //
    //     assert(
    //         // Conf file epubOutputDir is relative path, have to change it to
    //         // absolute for comparison
    //         path.dirname( path.dirname ( __dirname ) ) + '/' +
    //         vorpal.em.conf.intakeOutputDir === TMP_EPUBS,
    //         `intakeOutputDir is not ${TMP_EPUBS}`
    //     );
    //
    //     assert(
    //         // Conf file metadataDir is relative path, have to change it to
    //         // absolute for comparison
    //         path.dirname( path.dirname ( __dirname ) ) + '/' +
    //         vorpal.em.conf.metadataDir === TMP_METADATA,
    //         `metadataDir is not ${TMP_METADATA}`
    //     );
    //
    //     let epubsComparison,
    //
    //         intakeOutputDir   = vorpal.em.conf.intakeOutputDir,
    //         intakeExpectedDir = __dirname + '/expected/epubs-from-intake-full',
    //
    //         metadataDir = vorpal.em.conf.metadataDir,
    //         metadataComparison,
    //         metadataExpectedDir = __dirname + '/expected/metadata-from-intake',
    //
    //         // For now, just comparing thumbnail filenames since binary diffs will always fail.
    //         thumbnailsExpected = glob.sync( '**/*-th.jpg', {cwd : intakeExpectedDir} ),
    //         thumbnailsGot,
    //
    //         compareOptions = {
    //             compareContent : true,
    //             // Excluding *-th.jpg because the thumbnails look identical, but
    //             // differ on a binary level.
    //             excludeFilter  : '.commit-empty-directory,*-th.jpg',
    //         };
    //
    //     try {
    //         rimraf.sync( intakeOutputDir + '/*' );
    //     } catch ( error ) {
    //         vorpal.log( `ERROR clearing ${intakeOutputDir}: ${error}` );
    //
    //         process.exit(1);
    //     }
    //
    //     try {
    //         rimraf.sync( TMP_METADATA + '/*' );
    //     } catch ( error ) {
    //         vorpal.log( `ERROR clearing ${TMP_METADATA}: ${error}` );
    //
    //         process.exit(1);
    //     }
    //
    //     vorpal.parse( [ null, null, 'intake', 'add' ] );
    //
    //     // Normally would like to keep to a single assert per test, but making an
    //     // exception here because the test intake is such an expensive operation,
    //     // would like to avoid repeating it unecessarily.
    //
    //     thumbnailsGot = glob.sync( '**/*-th.jpg', {cwd : intakeOutputDir} );
    //     assert(
    //         _.isEqual( thumbnailsGot, thumbnailsExpected ),
    //         'Not all cover image thumbnails were created'
    //     );
    //
    //     epubsComparison = dircompare.compareSync(
    //         intakeOutputDir, intakeExpectedDir,
    //         compareOptions
    //     );
    //
    //     assert( epubsComparison.same === true, `${intakeOutputDir} matched ${intakeExpectedDir}` );
    //
    //     metadataComparison = dircompare.compareSync(
    //         metadataDir, metadataExpectedDir,
    //         compareOptions
    //     );
    //
    //     assert( metadataComparison.same === true, `${metadataDir} does not match ${metadataExpectedDir}` );
    // } );

    it( 'should correctly intake an EPUB with --skip-metadata and generate correct Readium version but not generate metadata files', function() {
        let loadSucceeded = vorpal.execSync( `load ${CONF_INTAKE_1}`, { fatal : true } );

        assert( loadSucceeded === true,
                'ERROR: test is not set up right.  ' +
                `Failed to load configuration "${CONF_INTAKE_1}".` );

        assert(
            // Conf file epubOutputDir is relative path, have to change it to
            // absolute for comparison
            path.dirname( path.dirname ( __dirname ) ) + '/' +
            vorpal.em.conf.intakeOutputDir === TMP_EPUBS,
            `intakeOutputDir is not ${TMP_EPUBS}`
        );

        assert(
            // Conf file metadataDir is relative path, have to change it to
            // absolute for comparison
            path.dirname( path.dirname ( __dirname ) ) + '/' +
            vorpal.em.conf.metadataDir === TMP_METADATA,
            `metadataDir is not ${TMP_METADATA}`
        );

        let epubsComparison,

            intakeOutputDir   = vorpal.em.conf.intakeOutputDir,
            intakeExpectedDir = __dirname + '/expected/epubs-from-intake-1',

            metadataDir = vorpal.em.conf.metadataDir,

            // For now, just comparing thumbnail filenames since binary diffs will always fail.
            thumbnailsExpected = glob.sync( '**/*-th.jpg', {cwd : intakeExpectedDir} ),
            thumbnailsGot,

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

        try {
            rimraf.sync( TMP_METADATA + '/*' );
        } catch ( error ) {
            vorpal.log( `ERROR clearing ${TMP_METADATA}: ${error}` );

            process.exit(1);
        }

        vorpal.parse( [ null, null, 'intake', 'add', '--skip-metadata' ] );

        // Normally would like to keep to a single assert per test, but making an
        // exception here because the test intake is such an expensive operation,
        // would like to avoid repeating it unecessarily.

        thumbnailsGot = glob.sync( '**/*-th.jpg', {cwd : intakeOutputDir} );
        assert(
            _.isEqual( thumbnailsGot, thumbnailsExpected ),
            'Not all cover image thumbnails were created'
        );

        epubsComparison = dircompare.compareSync(
            intakeOutputDir, intakeExpectedDir,
            compareOptions
        );

        assert( epubsComparison.same === true, `${intakeOutputDir} matched ${intakeExpectedDir}` );

        const filesInMetadataDir = glob.sync( '**/*', {cwd : metadataDir} );
        assert(
            filesInMetadataDir.length === 0,
            `${metadataDir} is not empty, it contains:\n\n` + filesInMetadataDir.join( '\n' ) + '\n'
        );
    } );
} );
