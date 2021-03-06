"use strict";

const em     = require( '../../lib/bootstrap' );
const util   = require( '../../lib/util' );
const vorpal = em.vorpal;

vorpal.em.configDir        = __dirname + '/fixtures/config';
vorpal.em.configPrivateDir = __dirname + '/fixtures/config-private';

describe( 'load command', () => {

    describe( 'configuration', () => {
        let expectedRhsUsername;
        let expectedRhsPassword;

        beforeAll( ( ) => {
            const privateConfig = require( './fixtures/config-private/full-metadataDir.json' );
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
            const actual = vorpal.em.metadata.dumpCanonical();

            expect( actual ).toEqual( expectedFullLocalMetadataDir );
        });

        it('should correctly load from local metadataRepo', () => {
            vorpal.execSync( 'load full-metadataRepo', { fatal : true } );
            const actual = vorpal.em.metadata.dumpCanonical();

            expect( actual ).toEqual( expectedFullLocalMetadataRepo );
        });
    } );

} );

