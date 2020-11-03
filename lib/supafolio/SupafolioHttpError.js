class SupafolioHttpError extends Error {
    constructor( httpStatusCode, message) {
        super(
            'SupafolioHttpError',
            `${ httpStatusCode }: ${ message }`,
        );
    }
}

module.exports.SupafolioHttpError = SupafolioHttpError;
