"use strict";

/* global before, beforeEach */

let assert     = require( 'chai' ).assert;
let dircompare = require( 'dir-compare' );
let em         = require( '../../lib/bootstrap' );
let _          = require( 'lodash' );
let path       = require( 'path' );
let rimraf     = require( 'rimraf' );
let vorpal     = em.vorpal;

const SupafolioAPIStub = require( './SupafolioAPIStub' );

const CONF_METADATA_FULL = 'metadata-full';
const TMP_METADATA     = __dirname + '/tmp/metadata';

vorpal.em.configDir        = __dirname + '/fixture/config';
vorpal.em.configPrivateDir = __dirname + '/fixture/config-private';

describe( 'metadata command', () => {
    let overriddenRequest;
    let supafolioAPIKey;

    before( ( ) => {
        supafolioAPIKey =
            require(
                path.join( vorpal.em.configPrivateDir, 'metadata-full.json' )
            ).supafolioAPIKey;

        const supafolioAPIStub = new SupafolioAPIStub( supafolioAPIKey );

        overriddenRequest = vorpal.em.request;

        vorpal.em.request =
            supafolioAPIStub.request.bind( supafolioAPIStub );
    } );

    it( 'should correctly generate correct metadata files for EPUBs in intakeEpubDir', function() {
        let loadSucceeded = vorpal.execSync( `load ${CONF_METADATA_FULL}`, { fatal : true } );

        assert( loadSucceeded === true,
                'ERROR: test is not set up right.  ' +
                `Failed to load configuration "${CONF_METADATA_FULL}".` );

        assert(
            // Conf file metadataDir is relative path, have to change it to
            // absolute for comparison
            path.dirname( path.dirname ( __dirname ) ) + '/' +
            vorpal.em.conf.metadataDir === TMP_METADATA,
            `metadataDir is not ${TMP_METADATA}`
        );

        let metadataDir = vorpal.em.conf.metadataDir,
            metadataComparison,
            metadataExpectedDir = __dirname + '/expected/generated-metadata-files',

            compareOptions = {
                compareContent : true,
                excludeFilter  : '.commit-empty-directory',
            };

        try {
            rimraf.sync( TMP_METADATA + '/*' );
        } catch ( error ) {
            vorpal.log( `ERROR clearing ${TMP_METADATA}: ${error}` );

            process.exit(1);
        }

        vorpal.execSync(  'metadata add', { fatal : true } );

        metadataComparison = dircompare.compareSync(
            metadataDir, metadataExpectedDir,
            compareOptions
        );

        assert( metadataComparison.same === true, `${metadataDir} does not match ${metadataExpectedDir}` );
    } );

    it( 'should correctly generate correct metadata files for 3 EPUBs in metadataEpubList', function() {
        let loadSucceeded = vorpal.execSync( `load ${CONF_METADATA_FULL}`, { fatal : true } );

        assert( loadSucceeded === true,
                'ERROR: test is not set up right.  ' +
                `Failed to load configuration "${CONF_METADATA_FULL}".` );

        assert(
            // Conf file metadataDir is relative path, have to change it to
            // absolute for comparison
            path.dirname( path.dirname ( __dirname ) ) + '/' +
            vorpal.em.conf.metadataDir === TMP_METADATA,
            `metadataDir is not ${TMP_METADATA}`
        );

        let metadataDir = vorpal.em.conf.metadataDir,
            metadataComparison,
            metadataExpectedDir = __dirname + '/expected/generated-metadata-files',

            compareOptions = {
                compareContent : true,
                excludeFilter  : '.commit-empty-directory',
            };

        try {
            rimraf.sync( TMP_METADATA + '/*' );
        } catch ( error ) {
            vorpal.log( `ERROR clearing ${TMP_METADATA}: ${error}` );

            process.exit(1);
        }

        vorpal.execSync(  'metadata add', { fatal : true } );

        metadataComparison = dircompare.compareSync(
            metadataDir, metadataExpectedDir,
            compareOptions
        );

        assert( metadataComparison.same === true, `${metadataDir} does not match ${metadataExpectedDir}` );
    } );

    after( ( ) => {
        vorpal.em.request = overriddenRequest;
    } );

} );
