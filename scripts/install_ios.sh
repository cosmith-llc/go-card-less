#!/bin/bash
set -e
set -x

project_path=$(pwd)
name=$PROJECT_NAME
dir=$(dirname "${0}")

alias react-native="$(pwd)/node_modules/.bin/react-native"

cd ios

pod install

sed -i.bak '1i\
#import <React/RCTLinkingManager.h>\
' ./${name}/AppDelegate.h

sed -i.bak '/@end/c\
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {\
  return [RCTLinkingManager application:application openURL:url options:options];\
}\
@end\
' ./${name}/AppDelegate.mm

sed -i.bak '/<key>CFBundleDisplayName<\/key>/c\
    <key>CFBundleURLTypes</key> \
        <array> \
                <dict> \
                        <key>CFBundleURLName</key> \
                        <string>cosm.gocardless.do</string> \
                        <key>CFBundleURLSchemes</key> \
                        <array> \
                                <string>cosm</string> \
                        </array> \
                </dict> \
        </array> \
    <key>CFBundleDisplayName</key> \
' ./${name}/Info.plist

cd ..
