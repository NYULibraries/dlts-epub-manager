"use strict";

const Book = require( './Book' ).Book;

let request;

function book( isbn ) {
    return new Book( { } );
}

module.exports = {
    book,
};
