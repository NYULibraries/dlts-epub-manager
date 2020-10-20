// See https://jira.nyu.edu/jira/browse/NYUP-738 for documentation on possible
// Supafolio API errors.

const SupafolioAPIError = require( './SupafolioApiError' ).SupafolioAPIError;

class SupafolioApiErrorInvalidApiKey extends SupafolioAPIError {
    static MESSAGE = 'Please provide a API key!';

    constructor() {
        super(
            'SupafolioApiErrorInvalidApiKey',
            SupafolioApiErrorInvalidApiKey.MESSAGE,
        );
    }
}

module.exports.SupafolioApiErrorInvalidApiKey = SupafolioApiErrorInvalidApiKey;
