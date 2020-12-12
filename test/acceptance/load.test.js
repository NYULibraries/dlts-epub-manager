"use strict";

let em     = require( '../../lib/bootstrap' );
let util   = require( '../../lib/util' );
let vorpal = em.vorpal;

vorpal.em.configDir        = __dirname + '/fixture/config';
vorpal.em.configPrivateDir = __dirname + '/fixture/config-private';

describe( 'load command', () => {

    describe( 'configuration', () => {
        let expectedRhsUsername;
        let expectedRhsPassword;

        beforeAll( ( ) => {
            let privateConfig = require( './fixture/config-private/full-metadataDir.json' );
            expectedRhsUsername = privateConfig.restfulHandleServerUsername;
            expectedRhsPassword = privateConfig.restfulHandleServerPassword;
        });

        it('should correctly load the corresponding private config file ', () => {
            vorpal.execSync(  'load full-metadataDir', { fatal : true } );

            expect(
                `${vorpal.em.conf.restfulHandleServerUsername}:${vorpal.em.conf.restfulHandleServerPassword}`
            ).toEqual(`${expectedRhsUsername}:${expectedRhsPassword}`);
        });

    } );

    describe( 'metadata loading', () => {
        let expectedFullLocalMetadataDir;
        let expectedFullLocalMetadataRepo;

        beforeAll( ( ) => {
            expectedFullLocalMetadataDir = util.jsonStableStringify(
                require( './expected/metadata-dumps/expected-full-local-metadatadir.json' )
            );
            expectedFullLocalMetadataRepo = util.jsonStableStringify(
                require( './expected/metadata-dumps/expected-full-local-metadatarepo.json' )
            );
        });

        beforeEach( ( ) => {
            vorpal.execSync( 'load clear', { fatal : true } );
        });

        it('should correctly load from local metadataDir', () => {
            vorpal.execSync( 'load full-metadataDir', { fatal : true } );
            let actual = vorpal.em.metadata.dumpCanonical();

            expect( actual === expectedFullLocalMetadataDir ).toBeTruthy();
        });

        it('should correctly load from local metadataRepo', () => {
            vorpal.execSync( 'load full-metadataRepo', { fatal : true } );
            let actual = vorpal.em.metadata.dumpCanonical();

            expect( actual === expectedFullLocalMetadataRepo ).toBeTruthy();
        });
    } );

} );

