import { join } from 'https://deno.land/std@0.224.0/path/mod.ts'

import { backupFile, insertLineAfterString } from './common.ts'
import { getComponent } from './component.ts';

const projectPath = Deno.env.get('ADALO_APP_PROJECT_PATH') // The path of the mobile build project

const projectName = Deno.env.get('ADALO_APP_PROJECT_NAME')  // The name of the project, it can be used in iOS to access certain directories

const bundleId = Deno.env.get('ADALO_APP_BUNDLE_ID') // The bundle id is passed too, used in android instead of the project name

const platform = Deno.env.get('ADALO_APP_PLATFORM') // "ios" or "android"

const getParameter = async (projectPath: string, paramaterKey) => {
  try {
    const protonBundlePath = join(projectPath, 'proton-bundle.json')

    const { default: protonBundle } = await import(protonBundlePath, {
      with: { type: 'json' },
    })

    const micUsageText = getComponent(protonBundle)['DeepLinkingHandler'][paramaterKey]

    return micUsageText
  } catch (error) {
    console.error(
      'Error looking for maps api key in proton-bundle.json: ',
      error.message
    )
    throw error
  }
}

const uriHostname = await getParameter(projectPath, 'uriHostname');
const uriSchema = await getParameter(projectPath, 'uriSchema');
const uriPath = await getParameter(projectPath, 'uriPath');

const infoPlistPath = join(projectPath, `ios/${projectName}/Info.plist`)
const plutilBasicContent = await Deno.readTextFile(infoPlistPath);
const entitlementsPath = join(projectPath, `ios/${projectName}/${projectName}.entitlements`)
const entitlementsBasicContent = await Deno.readTextFile(entitlementsPath);


if (!entitlementsBasicContent.includes('com.apple.developer.associated-domains')) {
  console.log('Adding Associated Domains...');
  const associatedDomains = `
  <key>com.apple.developer.associated-domains</key>
  <array>
    <string>applinks:${uriHostname}</string>
  </array>`;

  const entitlementsContentModified = insertLineAfterString(
    entitlementsBasicContent,
    '<dict>',
    associatedDomains,
    { insertBefore: false }
  );

  await Deno.writeTextFile(entitlementsPath, entitlementsContentModified);
}

if (!plutilBasicContent.includes('CFBundleURLTypes')) {
  console.log('CFBundleURLTypes not exist');
  const plutilContenttModified = insertLineAfterString(
    plutilBasicContent,
    '<key>CFBundleDisplayName</key>',
    `<key>CFBundleURLTypes</key>
    <array>
        <dict>
         <key>CFBundleURLName<\/key>\
         <string>${uriHostname}<\/string>\
          <key>CFBundleURLSchemes</key>
           <array>
            <string>${uriSchema}</string>
           </array>
        </dict>
    </array>
    `,
    { insertBefore: true }
  )
  await Deno.writeTextFile(infoPlistPath, plutilContenttModified)
} else {
  const plutilContenttModified = insertLineAfterString(
    plutilBasicContent,
    '<key>CFBundleTypeRole</key>',
    `<key>CFBundleURLName</key>
       <string>${uriHostname}</string>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>${uriSchema}</string>
       </array>
       </dict>
       <dict>`,
    { insertBefore: true }
  )
  await Deno.writeTextFile(infoPlistPath, plutilContenttModified)
}

const infoPlistContent = await Deno.readTextFile(infoPlistPath);
console.log(`Text Info: ${infoPlistContent}`)

const appDelegatePath = join(projectPath, `ios/${projectName}/AppDelegate.mm`)

await backupFile(appDelegatePath)

const modifyAppDelegateFile = async (searchText, addText) => {
  const appDelegateContent = await Deno.readTextFile(appDelegatePath);
  const appDelegateContentModified = insertLineAfterString(
    appDelegateContent,
    searchText,
    addText,
    { insertBefore: true }
  )
  await Deno.writeTextFile(appDelegatePath, appDelegateContentModified)
}

const appDelegateHeaderPath = join(projectPath, `ios/${projectName}/AppDelegate.h`)

await backupFile(appDelegateHeaderPath)

const modifyAppDelegateHeaderFile = async (searchText, addText) => {
  const appDelegateContent = await Deno.readTextFile(appDelegateHeaderPath);
  const appDelegateContentModified = insertLineAfterString(
    appDelegateContent,
    searchText,
    addText,
    { insertBefore: false }
  )
  await Deno.writeTextFile(appDelegateHeaderPath, appDelegateContentModified)
}

const appDelegateHeaderBaseContent = await Deno.readTextFile(appDelegateHeaderPath);
if (appDelegateHeaderBaseContent.includes('React/RCTLinkingManager.h')) {
  console.log('RCTLinkingManager Already implemented');
} else {
  await modifyAppDelegateHeaderFile('<RCTAppDelegate.h>', `
    #import <React/RCTLinkingManager.h>`);
}

// const appDelegateHeaderContent = await Deno.readTextFile(appDelegateHeaderPath);
// console.log(`Text: ${appDelegateHeaderContent}`)


const appDelegateBaseContent = await Deno.readTextFile(appDelegatePath);
if (appDelegateBaseContent.includes('RCTLinkingManager application:application openURL:url options:options')) {
  console.log('Already implemented #1');
} else {
  await modifyAppDelegateFile(`@end`, `
    - (BOOL)application:(UIApplication *)application
              openURL:(NSURL *)url
              options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
    {
      return [RCTLinkingManager application:application openURL:url options:options];
    }
  `);
}

if (!appDelegateBaseContent.includes('continueUserActivity')) {
  console.log('Adding Universal Link handler...');
  await modifyAppDelegateFile(`@end`, `
    - (BOOL)application:(UIApplication *)application
              continueUserActivity:(NSUserActivity *)userActivity
              restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
          NSURL *url = userActivity.webpageURL;
          return [RCTLinkingManager application:application openURL:url options:@{}];
    }
  `);
}

const appDelegateContent = await Deno.readTextFile(appDelegatePath);
console.log(`Text: ${appDelegateContent}`)
