import { join } from "https://deno.land/std@0.224.0/path/mod.ts"

import { backupFile, getMapsApiKey, insertLineAfterString, updateBackgroundControl } from './common.ts'
import { getComponent }  from './component.ts';

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

const uriHostname =  await getParameter(projectPath, 'uriHostname');
const uriSchema =  await getParameter(projectPath, 'uriSchema');
const uriPath =  await getParameter(projectPath, 'uriPath');

const _manifestFilePath = join(projectPath, 'android/app/src/main/AndroidManifest.xml');
// await backupFile(stringValuesPath)
const manifestContent = await Deno.readTextFile(_manifestFilePath)
 const mmanifestContent = insertLineAfterString(
  manifestContent,
  'android:name="android.intent.category.LAUNCHER"',
  `</intent-filter>\
    <intent-filter android:autoVerify="true">\
        <action android:name="android.intent.action.VIEW" />\
        <category android:name="android.intent.category.DEFAULT" />\
        <category android:name="android.intent.category.BROWSABLE" />\
        <data android:scheme="${uriSchema}" android:host="${uriHostname}" android:pathPrefix="${uriPath}" />`,
  { insertBefore: false }
)
await Deno.writeTextFile(_manifestFilePath, mmanifestContent)

console.log(`print: ${mmanifestContent}`);
