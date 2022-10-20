# SCORM Multi SCO Manifest

### Installation

``` sh
npm install scorm-multi-sco-manifest
```

### Description

This script creates a `imsmanifest.xml` file in your `./dist/` directory as per SCORM requirements.

DISCLAIMER:
Built for SCORM version 1.2 - not SCORM 2004.

### Usage

Add the following to your `package.json` build script:
``` sh
&& node ./node_modules/scorm-multi-sco-manifest/index.js
```

At the root of your project, create the following JSON file: `scorm.manifest.json`

Within `scorm.manifest.json`, paste the following JSON and adjust to suit your project. Each element in 'items' refers to a SCO within your project.

``` json
{
  "buildDir": "./dist/",
  "manifestOptions": {
    "courseId":     "Example_Course_1.0.0",
    "SCORMtitle":   "Example_Course_1.0.0",
    "items": [
      {
        "identifier":  "sco-a",
        "moduleTitle": "SCO-A"
      },
      {
        "identifier":  "sco-b",
        "moduleTitle": "SCO-B"
      }
    ],
    "launchPag": "index.html",
    "fileName":   "imsmanifest.xml"
  }
}
```

Run `npm run-script build` to create `imsmanifest.xml` file in your `./dist/` directory.