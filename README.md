# SCORM Multi SCO Manifest

### Installation

``` sh
npm install scorm-multi-sco-manifest
```

### Description

This script creates a `imsmanifest.xml` file in your `./dist/` directory as per SCORM requirements.

### Usage

Add the following to your `package.json` build script:
``` sh
&& node ./node_modules/scorm-multi-sco-manifest/index.js
```

At the root of your project, create the following JSON file: `scorm.manifest.json`

Within `scorm.manifest.json`, paste the following JSON and adjust to suit your project.
If `"zip": true`, your build will be zipped in preperation of uploading to your LMS.
Each element in 'items' refers to a SCO within your project.

``` json
{
  "buildsDir":  "./dist/",
  "zip":        true,
  "archiveDir": "./archive/Example_Course_1.0.0.zip",   // Only required if zip: true
  "manifestOptions": {
    "SCORMVersion": "1.2",   // '1.2', '2004 3rd Edition', '2004 4th Edition'
    "courseId":     "Example_Course_1.0.0",
    "SCORMTitle":   "Example_Course_1.0.0",
    "SCORMParent":  {   // Only required if project uses multiple SCO's
      "buildDirName": "parent",
      "index":        "index.html"
    },
    "SCOs": [   // File output differs depending on if you list multiple SCO's or a single SCO below
      {
        "buildDirName": "sco-a",
        "index":        "index-sco-a.html",
        "objectives":   [   // Creates Metadata outlining each objective - do not add if not needed
          {
            "description": "This objective is the first objective within sco-a"
          },
          {
            "description": "This objective is the second objective within sco-a"
          },
          {
            "description": "This objective is the third objective within sco-a"
          }
        ]
      },
      {
        "buildDirName": "sco-b",
        "index":        "index-sco-b.html"
      }
    ]
  }
}
```

Run `npm run-script build` to create `imsmanifest.xml` file in your `./dist/` directory.



If your project contains multiple SCO's:
This package expects your SCO's to be presented within an iFrame held in your SCORM parent. Your SCORM parent must interpret two URL params in order to receive the iFrames source.
<ol>
<li>content</li>
<li>file</li>
</ol>
Your iFrames src will look like this:

``` js
this.scoUrl = `../${params['content']}/${params['file']}`;
```