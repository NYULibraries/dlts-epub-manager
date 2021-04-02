"use strict";

const path = require( 'path' );

const _    = require( 'lodash' );
const load = require( './load.js' );

describe( 'load', () => {

    describe( '#getEpubList', () => {
        const EXPECTED_EPUBS_FROM_INTAKE_EPUBS = [
            '9780814706404',
            '9780814706657',
            '9780814711774',
            '9780814712481',
            '9780814712771',
            '9780814712917',
            '9780814713013',
            '9780814713266',
            '9780814714218',
            '9780814714539',
            '9780814715123',
            '9780814715352',
            '9780814715383',
            '9780814715635',
            '9780814718124',
            '9780814718766',
            '9780814718803',
            '9780814726815',
            '9780814726846',
            '9780814730911',
            '9780814731437',
            '9780814735053',
            '9780814735084',
            '9780814735190',
            '9780814735206',
            '9780814735237',
            '9780814735282',
            '9780814735305',
            '9780814735336',
            '9780814735923',
            '9780814742297',
            '9780814742303',
            '9780814742358',
            '9780814746622',
            '9780814746677',
            '9780814746929',
            '9780814747148',
            '9780814750957',
            '9780814751008',
            '9780814751213',
            '9780814755112',
            '9780814755297',
            '9780814755471',
            '9780814755969',
            '9780814757970',
            '9780814761908',
            '9780814766569',
            '9780814774410',
            '9780814774434',
            '9780814774458',
            '9780814774632',
            '9780814774694',
            '9780814774755',
            '9780814774816',
            '9780814774823',
            '9780814779163',
            '9780814779170',
            '9780814779965',
            '9780814780015',
            '9780814780213',
            '9780814780978',
            '9780814782194',
            '9780814787922',
            '9780814793114',
            '9780814793398',
            '9781479824243',
            '9781479899982',
        ];

        const EXPECTED_EPUBS_FROM_METADATA_DIRS_REPLACE_3_NEW_3 = [
            '9780000000000',
            '9780000000001',
            '9780000000002',
            '9780814706404',
            '9780814706657',
            '9780814711774',
        ]

        const NULL_CONF = {};
        const NULL_EPUB_LIST_TYPE = null;

        const INTAKE_EPUBS_PATH =
            path.resolve( __dirname, '../../test/acceptance/fixtures/intake-epubs' );
        const METADATA_DIRS_REPLACE_3_NEW_3 =
            path.resolve( __dirname, '../../test/acceptance/fixtures/metadataDirs/replace-3-new-3' );

        it( 'should return the correct EPUBs list given a directory containing subdirectories', () => {
            const epubs = load.getEpubList( NULL_CONF, NULL_EPUB_LIST_TYPE, INTAKE_EPUBS_PATH );

            expect( epubs ).toEqual( EXPECTED_EPUBS_FROM_INTAKE_EPUBS );
        } );

        it( 'should return the correct EPUBs list given a directory containing *.epub files', () => {
            const epubs = load.getEpubList( NULL_CONF, NULL_EPUB_LIST_TYPE, METADATA_DIRS_REPLACE_3_NEW_3 );

            expect( epubs ).toEqual( EXPECTED_EPUBS_FROM_METADATA_DIRS_REPLACE_3_NEW_3 );
        } );

    } );

} );
