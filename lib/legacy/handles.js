"use strict";

// See https://jira.nyu.edu/jira/browse/NYUP-736:
//     "epub-manager: write lib/legacy/handles.js"

const BASE_URL = 'http://hdl.handle.net/';
const EPUB_HANDLES = {
    "9780814707517": {
        "handle": "2333.1/4tmpg641"
    },
    "9780814707821": {
        "handle": "2333.1/37pvmfhh"
    },
    "9780814709108": {
        "handle": "2333.1/pzgmsd4z"
    },
    "9780814720981": {
        "handle": "2333.1/rr4xh056"
    },
    "9780814721100": {
        "handle": "2333.1/n2z34wct"
    },
    "9780814723418": {
        "handle": "2333.1/9s4mw88v"
    },
    "9780814723425": {
        "handle": "2333.1/612jm7ss"
    },
    "9780814723708": {
        "handle": "2333.1/1893212z"
    },
    "9780814723715": {
        "handle": "2333.1/51c5b1k3"
    },
    "9780814725078": {
        "handle": "2333.1/zgmsbf5k"
    },
    "9780814728048": {
        "handle": "2333.1/41ns1tbw"
    },
    "9780814728901": {
        "handle": "2333.1/08kprss5"
    },
    "9780814733158": {
        "handle": "2333.1/rr4xh3qp"
    },
    "9780814733486": {
        "handle": "2333.1/gb5mknmc"
    },
    "9780814738573": {
        "handle": "2333.1/qv9s4pmq"
    },
    "9780814739617": {
        "handle": "2333.1/000001ns"
    },
    "9780814741498": {
        "handle": "2333.1/c866t382"
    },
    "9780814743959": {
        "handle": "2333.1/dbrv175n"
    },
    "9780814743973": {
        "handle": "2333.1/8kprr6mx"
    },
    "9780814743980": {
        "handle": "2333.1/15dv439j"
    },
    "9780814744147": {
        "handle": "2333.1/wh70s0pf"
    },
    "9780814744758": {
        "handle": "2333.1/tmpg4gx5"
    },
    "9780814744765": {
        "handle": "2333.1/pvmcvgdw"
    },
    "9780814744772": {
        "handle": "2333.1/k3j9kfwk"
    },
    "9780814744789": {
        "handle": "2333.1/fbg79fcf"
    },
    "9780814744819": {
        "handle": "2333.1/9kd51dv3"
    },
    "9780814744840": {
        "handle": "2333.1/2280gcth"
    },
    "9780814744871": {
        "handle": "2333.1/xd25496n"
    },
    "9780814749234": {
        "handle": "2333.1/7m0cg0c2"
    },
    "9780814752685": {
        "handle": "2333.1/3xsj3wkj"
    },
    "9780814752715": {
        "handle": "2333.1/05qftw3j"
    },
    "9780814759271": {
        "handle": "2333.1/jwstqmh0"
    },
    "9780814759714": {
        "handle": "2333.1/2z34tpd1"
    },
    "9780814762622": {
        "handle": "2333.1/f4qrfm0w"
    },
    "9780814763148": {
        "handle": "2333.1/qnk98v8h"
    },
    "9780814763179": {
        "handle": "2333.1/bcc2fspb"
    },
    "9780814763223": {
        "handle": "2333.1/z612jp24"
    },
    "9780814763520": {
        "handle": "2333.1/wdbrv30q"
    },
    "9780814763551": {
        "handle": "2333.1/rn8pk2gc"
    },
    "9780814763582": {
        "handle": "2333.1/h44j11fx"
    },
    "9780814767917": {
        "handle": "2333.1/9ghx3h44"
    },
    "9780814769409": {
        "handle": "2333.1/sf7m0f78"
    },
    "9780814769423": {
        "handle": "2333.1/hx3ffd6n"
    },
    "9780814769447": {
        "handle": "2333.1/8gtht8zb"
    },
    "9780814769461": {
        "handle": "2333.1/4qrfj8f6"
    },
    "9780814769485": {
        "handle": "2333.1/0zpc87xv"
    },
    "9780814771037": {
        "handle": "2333.1/v6wwq19j"
    },
    "9780814771501": {
        "handle": "2333.1/w6m907jq"
    },
    "9780814771518": {
        "handle": "2333.1/rfj6q71f"
    },
    "9780814772195": {
        "handle": "2333.1/djh9w2k9"
    },
    "9780814773130": {
        "handle": "2333.1/z8w9gkqf"
    },
    "9780814773215": {
        "handle": "2333.1/5tb2rd9k"
    },
    "9780814776636": {
        "handle": "2333.1/d7wm39fk"
    },
    "9780814784488": {
        "handle": "2333.1/qjq2bxgz"
    },
    "9780814784600": {
        "handle": "2333.1/2rbnztw9"
    },
    "9780814784891": {
        "handle": "2333.1/b8gthvz5"
    },
    "9780814786086": {
        "handle": "2333.1/tqjq2dn7"
    },
    "9780814786123": {
        "handle": "2333.1/ffbg7c4r"
    },
    "9780814788462": {
        "handle": "2333.1/g1jwswgh"
    },
    "9780814788707": {
        "handle": "2333.1/msbcc48d"
    },
    "9780814788745": {
        "handle": "2333.1/7h44j2rq"
    },
    "9780814788806": {
        "handle": "2333.1/3r22827k"
    },
    "9780814790144": {
        "handle": "2333.1/xgxd26xf"
    },
    "9780814790168": {
        "handle": "2333.1/sqv9s6cx"
    },
    "9780814790175": {
        "handle": "2333.1/j6q575cq"
    },
    "9781479807185": {
        "handle": "2333.1/f1vhhwrf"
    },
    "9781479811908": {
        "handle": "2333.1/k3j9kppk"
    },
    "9781479829712": {
        "handle": "2333.1/brv15j8p"
    },
    "9781479863570": {
        "handle": "2333.1/73n5tfjs"
    },
    "9781479882281": {
        "handle": "2333.1/r7sqvjrf"
    },
    "9781479888788": {
        "handle": "2333.1/w0vt4k7p"
    },
    "9781479888900": {
        "handle": "2333.1/0p2ngnvk"
    },
    "9781479891672": {
        "handle": "2333.1/c866tbmx"
    },
    "9781479898626": {
        "handle": "2333.1/vdncjvrd"
    }
};

function getHandleForEpub( epubId ) {
    if ( epubId in EPUB_HANDLES ) {
        return EPUB_HANDLES[ epubId ].handle;
    } else {
        return;
    }
}

function getHandleUrlForEpub( epubId ) {
    if ( epubId in EPUB_HANDLES ) {
        // Can't use path.join() because it changes "http://" to "http:/".
        return `${ BASE_URL }${ getHandleForEpub( epubId ) }`;
    } else {
        return;
    }
}

module.exports = {
    getHandleForEpub,
    getHandleUrlForEpub,
};
