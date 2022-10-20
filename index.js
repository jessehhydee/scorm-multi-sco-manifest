const { create } = require('xmlbuilder2');

const timestamp         = Date.now();
const manifestOptions   = {
  courseId:     `Digital_Zone_1.0.0${timestamp}`,
  SCORMtitle:   "Digital_Zone_1.0.0",
  items:        [
    {
      identifier:  "sco-a",
      moduleTitle: "SCO-A"
    }
  ],
  launchPage:   "index.html",
  fileName:     "imsmanifest.xml"
}

var xmlObj = {
  manifest: {
    '@identifier':          manifestOptions.courseId,
    '@version':             '1',
    '@xmlns':               'http://www.imsproject.org/xsd/imscp_rootv1p1p2',
    '@xmlns:adlcp':         'http://www.adlnet.org/xsd/adlcp_rootv1p2',
    '@xmlns:xsi':           'http://www.w3.org/2001/XMLSchema-instance',
    '@xsi:schemaLocation':  'http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd',
    metadata: {
      schema:         'ADL SCORM',
      schemaversion:  '1.2'
    },
    organizations: {
      '@default': `${options.courseId}-org`,
      organization: {
        '@identifier': `${options.courseId}-org`,
        title: options.SCOtitle,
        // item: {
        //   '@identifier': 'item_1',
        //   '@identifierref': 'resource_1',
        //   title: options.moduleTitle
        // },
        // item: {
        //   '@identifier': 'item_2',
        //   '@identifierref': 'resource_1',
        //   title: options.moduleTitle
        // },
        // item: {
        //   '@identifier': 'item_3',
        //   '@identifierref': 'resource_1',
        //   title: options.moduleTitle
        // }
      }
    },
    resources: {
      resource: {
        '@identifier':      'resource_1',
        '@type':            'webcontent',
        '@adlcp:scormtype': 'sco',
        '@href':            (options.path ? `${options.path}/` : "").replace(/\\/g, '/') + options.launchPage
      }
    }
  },
};