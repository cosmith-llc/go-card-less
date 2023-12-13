#!/bin/bash
set -e
set -x

project_path=$(pwd)
dir=$(dirname "${0}")

url_hostname=$("${dir}/get_uri_data.js" urlHostname)
echo $url_hostname

uri_schema=$("${dir}/get_uri_data.js" uriSchema)
echo $uri_schema

cd android

sed -i.bak '/<activity android:name=".MainActivity"/,/<\/activity>/{/<\/activity>/{i\
      <intent-filter>\
        <action android:name="android.intent.action.MAIN" />\
        <category android:name="android.intent.category.LAUNCHER" />\
      </intent-filter>\
      <intent-filter>\
        <action android:name="android.intent.action.VIEW" />\
        <category android:name="android.intent.category.DEFAULT" />\
        <category android:name="android.intent.category.BROWSABLE" />\
        <data android:scheme='"$uri_schema"' android:host='"$url_hostname"' />\
      </intent-filter>
  }
}' ./app/src/main/AndroidManifest.xml
