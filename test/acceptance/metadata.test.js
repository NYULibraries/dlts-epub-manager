"use strict";

const dircompare = require( 'dir-compare' );
const em         = require( '../../lib/bootstrap' );
const _          = require( 'lodash' );
const path       = require( 'path' );
const rimraf     = require( 'rimraf' );
const vorpal     = em.vorpal;

const SupafolioApiStub = require( './SupafolioApiStub' );

const CONF_METADATA_FULL = 'metadata-full';
const TMP_METADATA     = __dirname + '/tmp/metadata';

const EXPECTED_GENERATED_METADATA_FILES_FULL =
    path.join( __dirname, '/expected/generated-metadata-files-full' )
const EXPECTED_GENERATED_METADATA_FILES_3 =
    path.join( __dirname, '/expected/generated-metadata-files-3' )

vorpal.em.configDir        = __dirname + '/fixture/config';
vorpal.em.configPrivateDir = __dirname + '/fixture/config-private';

describe( 'metadata command', () => {
    let overriddenRequest;
    let supafolioApiKey;

    beforeAll( ( ) => {
        supafolioApiKey =
            require(
                path.join( vorpal.em.configPrivateDir, 'metadata-full.json' )
            ).supafolioApiKey;

        const supafolioApiStub = new SupafolioApiStub( supafolioApiKey );

        overriddenRequest = vorpal.em.request;

        vorpal.em.request =
            supafolioApiStub.request.bind( supafolioApiStub );
    });

    it(
        'should correctly generate correct metadata files for EPUBs in intakeEpubDir',
        () => {
            const loadSucceeded = vorpal.execSync( `load ${CONF_METADATA_FULL}`, { fatal : true } );

            expect( loadSucceeded ).toBeTruthy();

            expect( // Conf file metadataDir is relative path, have to change it to
            // absolute for comparison
            path.dirname( path.dirname ( __dirname ) ) + '/' +
            vorpal.em.conf.metadataDir ).toEqual( TMP_METADATA );

            const metadataDir = vorpal.em.conf.metadataDir;
            const metadataExpectedDir = EXPECTED_GENERATED_METADATA_FILES_FULL;
            const compareOptions = {
                compareContent : true,
                excludeFilter  : '.commit-empty-directory',
            };

            try {
                rimraf.sync( path.join( metadataDir, '*' ) );
            } catch ( error ) {
                vorpal.log( `ERROR clearing ${TMP_METADATA}: ${error}` );

                process.exit(1);
            }

            vorpal.execSync(  'metadata add', { fatal : true } );

            const metadataComparison = dircompare.compareSync(
                metadataDir, metadataExpectedDir,
                compareOptions
            );

            expect( metadataComparison.same ).toBeTruthy();
        }
    );

    it(
        'should correctly generate correct metadata files for 3 EPUBs in metadataEpubList',
        () => {
            const loadSucceeded = vorpal.execSync( `load ${CONF_METADATA_FULL}`, { fatal : true } );

            expect( loadSucceeded ).toBeTruthy();

            expect( // Conf file metadataDir is relative path, have to change it to
            // absolute for comparison
            path.dirname( path.dirname ( __dirname ) ) + '/' +
            vorpal.em.conf.metadataDir === TMP_METADATA).toBeTruthy();

            const metadataDir = vorpal.em.conf.metadataDir;
            const metadataExpectedDir = EXPECTED_GENERATED_METADATA_FILES_3;
            const compareOptions = {
                    compareContent : true,
                    excludeFilter  : '.commit-empty-directory',
                };

            try {
                rimraf.sync( path.join( metadataDir, '*' ) );
            } catch ( error ) {
                vorpal.log( `ERROR clearing ${TMP_METADATA}: ${error}` );

                process.exit(1);
            }

            vorpal.execSync(  'metadata add', { fatal : true } );

            const metadataComparison = dircompare.compareSync(
                metadataDir, metadataExpectedDir,
                compareOptions
            );

            expect( metadataComparison.same ).toBeTruthy();
        }
    );

    afterAll(( ) => {
        vorpal.em.request = overriddenRequest;
    });

} );
