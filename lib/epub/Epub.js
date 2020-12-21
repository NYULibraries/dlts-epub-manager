"use strict";

const fs   = require( 'fs' );
const path = require( 'path' );
const XML  = require( 'pixl-xml' );

class Epub {
    constructor( explodedEpubDir ) {
        this.explodedEpubDir = explodedEpubDir;

        const containerFilePath = `${this.explodedEpubDir}/META-INF/container.xml`;

        this.container = {
            _xml : XML.parse(
                fs.readFileSync( containerFilePath, 'utf8' )
            ),
        };

        const rootfileFullPathAttribute = this.container._xml.rootfiles.rootfile[ 'full-path' ];

        this.rootDirectory = path.dirname( rootfileFullPathAttribute );

        const packageFilePath  = `${this.explodedEpubDir}/${rootfileFullPathAttribute}`;

        this.package = {
            _filePath : packageFilePath,
            _xml      : XML.parse(
                fs.readFileSync( packageFilePath, 'utf8' )
            )
        };

        let creators = this.package._xml.metadata[ 'dc:creator' ];
        if ( ! Array.isArray( creators ) ) {
            creators = [ creators ];
        }
        this.package.creators    = creators;
        this.package.coverage    = this.package._xml.metadata[ 'dc:coverage' ];

        this.package.date        = this.package._xml.metadata[ 'dc:date' ];
        if ( this.package.date === undefined ) {
            if ( Array.isArray( this.package._xml.metadata.meta ) ) {
                this.package.date = this.package._xml.metadata.meta.find( ( meta ) => {
                    return meta.property === 'dcterms:date';
                } )._Data;
            }
        }

        this.package.format      = this.package._xml.metadata[ 'dc:format' ];

        let identifiers = this.package._xml.metadata[ 'dc:identifier' ];
        if ( ! Array.isArray( identifiers ) ) {
            identifiers = [ identifiers ];
        }

        // All identifiers, including those not considered to be the unique identifier
        this.package.identifiers = identifiers.map( ( identifier ) => {
            return identifier._Data;
        } );

        // The unique identifier, designated by <package> attribute "unique-idenfitier"
        const packageUniqueIdentifierAttribute = this.package._xml[ 'unique-identifier' ];
        if ( ! Array.isArray( identifiers ) ) {
            identifiers = [ identifiers ];
        }
        this.package.uniqueIdentifier = identifiers.find( ( element ) => {
            return element.id === packageUniqueIdentifierAttribute;
        } )._Data;

        this.package.language    = this.package._xml.metadata[ 'dc:language' ];
        this.package.publisher   = this.package._xml.metadata[ 'dc:publisher' ];
        this.package.rights      = this.package._xml.metadata[ 'dc:rights' ];
        this.package.title       = this.package._xml.metadata[ 'dc:title' ];
        this.package.type        = this.package._xml.metadata[ 'dc:type' ];
    }
}

module.exports.Epub = Epub;
