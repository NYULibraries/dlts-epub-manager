"use strict";

let em     = require( '../../lib/bootstrap' );
let _      = require( 'lodash' );
let vorpal = em.vorpal;

let RestfulHandleServerStub = require( './RestfulHandleServerStub' );

const CONF                       = 'full-metadataDir';
const RESTFUL_HANDLE_TEST_SERVER = 'handle';

let conf;
let overriddenRequest;

vorpal.em.configDir        = __dirname + '/fixture/config';
vorpal.em.configPrivateDir = __dirname + '/fixture/config-private';

describe( 'handles command', () => {
    let restfulHandleServerStub;
    let expectedFullMetadataDirHandles;

    beforeAll( ( ) => {
        expectedFullMetadataDirHandles = require( './expected/handles/expected_add_full-metadataDir.json' );

        restfulHandleServerStub = new RestfulHandleServerStub();

        overriddenRequest = vorpal.em.request;

        vorpal.em.request =
            restfulHandleServerStub.request.bind( restfulHandleServerStub );
    });

    beforeEach( ( ) => {
        let loadSucceeded = loadConfiguration( CONF );

        expect( loadSucceeded ).toBeTruthy();
    });

    it('should correctly add all handles to handle server', () => {
        vorpal.execSync(  'handles add full-metadataDir', { fatal : true } );

        expect( restfulHandleServerStub.stateEquals( expectedFullMetadataDirHandles )).toBeTruthy();
    });

    it('should correctly delete 3 handles from handles server', () => {
        let expected = _.cloneDeep( expectedFullMetadataDirHandles );
        expected.splice( 0, 3 );

        vorpal.execSync(  'handles add full-metadataDir', { fatal : true } );
        vorpal.execSync(  'handles delete delete-3', { fatal : true } );


        expect( restfulHandleServerStub.stateEquals( expected )).toBeTruthy();
    });

    afterAll(( ) => {
        vorpal.em.request = overriddenRequest;
    });

} );

function loadConfiguration( confName ) {
    let loadSucceeded = vorpal.execSync( `load ${confName}`, { fatal : true } );

    if ( loadSucceeded ) {
        let restfulHandleServerPath = vorpal.em.conf.restfulHandleServerPath;

        if ( ! restfulHandleServerPath.endsWith( RESTFUL_HANDLE_TEST_SERVER ) ) {
            console.log(
                `ERROR: restfulHandleServerPath option ${restfulHandleServerPath}` +
                ` does not end with required "${RESTFUL_HANDLE_TEST_SERVER}".`
            );
            return false;
        }

        conf = vorpal.em.conf;

        return true;
    } else {
        return false;
    }
}
