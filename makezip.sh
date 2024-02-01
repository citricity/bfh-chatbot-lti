#!/bin/bash
scriptDir=$(realpath $(dirname $0))
baseDir=$(basename $scriptDir)
zipName="${baseDir}.zip"
echo "Zipping to ${zipName}"
cd ../
parentDir=$(pwd)
zip -r6 $zipName $baseDir -x="*.git*" -x="*.idea*" -x="*node_modules*" -x="*DS_Store*" -x="*makezip.sh*"
cd -
echo "----------------------------------------------------------------"
echo "Zipped to $parentDir/${zipName}"
echo "----------------------------------------------------------------"
