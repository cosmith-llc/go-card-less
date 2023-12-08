#!/bin/bash
set -e
set -x

project_path=$(pwd)
dir=$(dirname "${0}")

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
        <data android:scheme="cosm" android:host="cosm.gocardless.do" />\
      </intent-filter>
  }
}' ./app/src/main/AndroidManifest.xml
