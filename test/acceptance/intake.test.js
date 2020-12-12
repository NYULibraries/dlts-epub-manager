"use strict";

let dircompare = require( 'dir-compare' );
let em         = require( '../../lib/bootstrap' );
let glob       = require( 'glob' );
let _          = require( 'lodash' );
let path       = require( 'path' );
let rimraf     = require( 'rimraf' );
let vorpal     = em.vorpal;

const CONF_INTAKE_FULL = 'intake-full';
const TMP_EPUBS        = __dirname + '/tmp/epubs';

vorpal.em.configDir        = __dirname + '/fixture/config';
vorpal.em.configPrivateDir = __dirname + '/fixture/config-private';

// NOTE: using `function()` instead of arrow functions because using the latter
// causes `this` to be bound incorrectly, and this test suite needs `this.timeout()`.
describe( 'intake command', () => {

    // Avoid "Error: timeout of 2000ms exceeded. Ensure the done() callback is being called in this test."
    jest.setTimeout( 60000 );

    it(
        'should correctly intake all EPUBs and generate correct Readium versions',
        () => {
            let loadSucceeded = vorpal.execSync( `load ${CONF_INTAKE_FULL}`, { fatal : true } );

            expect( loadSucceeded ).toBeTruthy();

            expect( // Conf file epubOutputDir is relative path, have to change it to
            // absolute for comparison
            path.dirname( path.dirname ( __dirname ) ) + '/' +
            vorpal.em.conf.intakeOutputDir ).toEqual( TMP_EPUBS ).toBeTruthy();

            let epubsComparison,

                intakeOutputDir   = vorpal.em.conf.intakeOutputDir,
                intakeExpectedDir = __dirname + '/expected/epubs-from-intake-full',

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

            vorpal.execSync(  'intake add', { fatal : true } );

            // Normally would like to keep to a single assert per test, but making an
            // exception here because the test intake is such an expensive operation,
            // would like to avoid repeating it unnecessarily.

            thumbnailsGot = glob.sync( '**/*-th.jpg', {cwd : intakeOutputDir} );
            expect( _.isEqual( thumbnailsGot, thumbnailsExpected )).toBeTruthy();

            epubsComparison = dircompare.compareSync(
                intakeOutputDir, intakeExpectedDir,
                compareOptions
            );

            expect( epubsComparison.same ).toBeTruthy();
        }
    );
} );
