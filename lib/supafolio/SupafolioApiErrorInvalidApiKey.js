// See https://jira.nyu.edu/jira/browse/NYUP-738 for documentation on possible
// Supafolio API errors.

const SupafolioApiError = require( './SupafolioApiError' ).SupafolioApiError;

class SupafolioApiErrorInvalidApiKey extends SupafolioApiError {
    static MESSAGE = 'Please provide a correct API key!';

    constructor() {
        super(
            'SupafolioApiErrorInvalidApiKey',
            SupafolioApiErrorInvalidApiKey.MESSAGE,
        );
    }
}

module.exports.SupafolioApiErrorInvalidApiKey = SupafolioApiErrorInvalidApiKey;
