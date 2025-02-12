#!/bin/bash
set -e
set -x

project_path=$(pwd)
name=$PROJECT_NAME
dir=$(dirname "${0}")

uri_hostname=$("${dir}/get_uri_data.js" uriHostname)
echo $uri_hostname

uri_schema=$("${dir}/get_uri_data.js" uriSchema)
echo $uri_schema

uri_path=$("${dir}/get_uri_data.js" uriPath)
echo $uri_path

alias react-native="$(pwd)/node_modules/.bin/react-native"

cd ios

pod install

sed -i.bak '1i\
#import <React/RCTLinkingManager.h>\
' ./${name}/AppDelegate.h

if grep -q "openURL:(NSURL" ./${name}/AppDelegate.mm; then
  echo "application openURL already implemented"
else
  sed -i.bak '/@end/c\
  - (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {\
    return [RCTLinkingManager application:application openURL:url options:options];\
  }\
  @end\
  ' ./${name}/AppDelegate.mm
fi


if grep -q "CFBundleURLTypes" ./${name}/Info.plist; then
  echo "application openURL already implemented"
  plutil -replace CFBundleURLTypes.0.CFBundleURLName -string "$uri_hostname" ./${name}/Info.plist
  #plutil -replace CFBundleURLSchemes -string "$uri_schema" ./${name}/Info.plist
  #if grep -q "<key>CFBundleURLSchemes" ./$name/Info.plist; then
#  echo "CFBundleURLSchemes exist"

   plutil -insert CFBundleURLTypes.0.CFBundleURLSchemes.1 -xml "<string>$uri_schema</string>" ./$name/Info.plist

else
sed -i.bak '/<key>CFBundleDisplayName<\/key>/c\
<key>CFBundleURLTypes<\/key>\
  <array>\
     <dict>\
         <key>CFBundleURLName<\/key>\
         <string>'"$uri_hostname"'<\/string>\
         <key>CFBundleURLSchemes<\/key>\
         <array>\
             <string>'"$uri_schema"'<\/string>\
         <\/array>\
     <\/dict>\
  <\/array>\
<key>CFBundleDisplayName<\/key>' ./${name}/Info.plist
fi

cat ./${name}/Info.plist

#exit 125

cd ..
