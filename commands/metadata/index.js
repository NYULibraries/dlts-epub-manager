"use strict";

const fs        = require( 'fs' );

const helpers   = require( '../../lib/command-helpers/metadata' );
const Supafolio = require( '../../lib/supafolio/Supafolio' ).Supafolio;
const util      = require( '../../lib/util' );

let em;

module.exports = function( vorpal ){
    em = vorpal.em;

    vorpal.command( 'metadata add [configuration]' )
        .description( 'Generate metadata files from Supafolio API.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
                if ( args.configuration ) {
                    const loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

                    if ( ! loadSucceeded ) {
                        vorpal.log( `ERROR: \`load ${args.configuration}\` failed.` );

                        if ( callback ) { callback(); }
                        return false;
                    }
                }

                const supafolio = new Supafolio( em.conf.supafolioApiKey, em.request );

                const metadataDir = util.getMetadataDir( em );
                if ( ! metadataDir ) {
                    vorpal.log( util.ERROR_CONF_MISSING_METADATA_DIR );

                    if ( callback ) { callback(); }
                    return false;
                }

                if ( ! fs.existsSync( metadataDir ) ) {
                    vorpal.log( `ERROR: metadataDir "${metadataDir}" does not exist.`);

                    if ( callback ) { callback(); }
                    return false;
                }

                if ( ! em.intakeEpubList ) {
                    vorpal.log( util.ERROR_INTAKE_EPUB_LIST_NOT_LOADED );

                    if ( callback ) { callback(); }
                    return false;
                }

                const epubIdList = em.intakeEpubList;

                try {
                    const epubsCompleted = helpers.generateMetadataFiles(
                        supafolio,
                        epubIdList,
                        metadataDir
                    );

                    vorpal.log( `Metadata files created for ${epubIdList.length} EPUBs:\n` + epubsCompleted.join( '\n' ) );

                    if ( callback ) { callback(); }
                    return true;
                } catch ( error ) {
                    vorpal.log( 'ERROR in generation of metadata file for EPUBs:\n' +
                                error );

                    if ( callback ) { callback(); }
                    return false;
                }
            }
        );

};
