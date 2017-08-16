"use strict";

let fs   = require( 'fs' );
let path = require( 'path' );
let XML  = require( 'pixl-xml' );

class Epub {
    constructor( epubDir ) {
        this.explodedEpubDir           = epubDir;
        this.getManifestItemsFilePaths = getManifestItemsFilePaths;
        this.getPackageFilePath        = getPackageFilePath;
    }
}

function getManifestItemsFilePaths() {
    let packageFile          = this.getPackageFilePath( this.explodedEpubDir );
    let packageFileParentDir = path.basename( path.dirname( packageFile ) );
    let packageFileXmlString = fs.readFileSync( packageFile, 'utf8' );

    let xml = XML.parse( packageFileXmlString );

    return xml.manifest.item
        .filter( ( item ) => {
            return item[ 'media-type' ].match( /text|xml/ );
        } )
        .map( ( item ) => {
            return `${packageFileParentDir}/${item.href}`;
        } );
}

function getPackageFilePath() {
    let containerFileXmlString = fs.readFileSync( `${this.explodedEpubDir}/META-INF/container.xml` );
    let containerXml           = XML.parse( containerFileXmlString );
    let packageFile            = `${this.explodedEpubDir}/${containerXml.rootfiles.rootfile[ 'full-path' ]}`;

    return packageFile;
}

module.exports = {
    Epub: Epub,
};
