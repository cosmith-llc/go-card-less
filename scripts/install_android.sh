#!/bin/bash
set -e
set -x

project_path=$(pwd)
dir=$(dirname "${0}")

uri_hostname=$("${dir}/get_uri_data.js" uriHostname)
echo $uri_hostname

uri_schema=$("${dir}/get_uri_data.js" uriSchema)
echo $uri_schema

uri_path=$("${dir}/get_uri_data.js" uriPath)
echo $uri_path

cd android

sed -i.bak '/android:name="android.intent.category.LAUNCHER"/a\
    </intent-filter>\
    <intent-filter>\
        <action android:name="android.intent.action.VIEW" />\
        <category android:name="android.intent.category.DEFAULT" />\
        <category android:name="android.intent.category.BROWSABLE" />\
        <data android:scheme="'"$uri_schema"'" android:host="'"$uri_hostname"'" android:pathPrefix="'"$uri_path"'" />\
' ./app/src/main/AndroidManifest.xml

cat ./app/src/main/AndroidManifest.xml
