#!/bin/bash

# This script is based on Django Haystack `test_haystack/solr_tests/server/start-solr-test-server.sh`:
# https://github.com/django-haystack/django-haystack/blob/802b0f6f4b3b99314453261876a32bac2bbec94f/test_haystack/solr_tests/server/start-solr-test-server.sh

set -e

SOLR_VERSION=6.6.5

export ROOT=$(cd "$(dirname "$0")" ; pwd -P )
cd $ROOT

export CONFIG_FILES=${ROOT}/config-files
export SOLR_ARCHIVE="${ROOT}/download-cache/${SOLR_VERSION}.tgz"
export SOLR_ROOT=${ROOT}/solr-${SOLR_VERSION}
export SOLR_CORE=${SOLR_ROOT}/server/solr/test-core
export SOLR_PORT=9001

if [ -f ${SOLR_ARCHIVE} ]; then
    # If the tarball doesn't extract cleanly, remove it so it'll download again:
    tar -tf ${SOLR_ARCHIVE} > /dev/null || rm ${SOLR_ARCHIVE}
fi

if [ ! -f ${SOLR_ARCHIVE} ]; then
    SOLR_DOWNLOAD_URL="http://archive.apache.org/dist/lucene/solr/${SOLR_VERSION}/solr-${SOLR_VERSION}.tgz"
    curl -Lo $SOLR_ARCHIVE ${SOLR_DOWNLOAD_URL} || ( echo "Unable to download ${SOLR_DOWNLOAD_URL}"; exit 2 )
fi

echo "Extracting Solr ${SOLR_ARCHIVE} to $(basename ${SOLR_ROOT})"
rm -rf $SOLR_ROOT
mkdir $SOLR_ROOT
tar -C ${SOLR_ROOT} -xf ${SOLR_ARCHIVE} --strip-components=1

# These tuning options will break on Java 10 and for testing we don't care about
# production server optimizations:
export GC_LOG_OPTS=""
export GC_TUNE=""

export SOLR_LOGS_DIR="${SOLR_ROOT}/logs"

cd ${SOLR_ROOT}

export SOLR_START_CMD="${SOLR_ROOT}/bin/solr start -p ${SOLR_PORT}"
export SOLR_STOP_CMD="${SOLR_ROOT}/bin/solr stop -p ${SOLR_PORT}"

echo "Creating Solr Core"
$SOLR_START_CMD
./bin/solr create -c test-core -p ${SOLR_PORT} -n basic_config

echo "Solr system information:"
curl --fail --silent "http://localhost:${SOLR_PORT}/solr/admin/info/system?wt=json&indent=on" | python -m json.tool
$SOLR_STOP_CMD

cp -p ${CONFIG_FILES}/schema.xml ${SOLR_CORE}/conf/schema.xml
cp -p ${CONFIG_FILES}/solrconfig.xml ${SOLR_CORE}/conf/solrconfig.xml

echo 'Starting server'
$SOLR_START_CMD

echo -e "To stop the server, run:\n\n\t ${SOLR_STOP_CMD}\n"
