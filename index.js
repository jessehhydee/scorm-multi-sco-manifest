const { create }  = require('xmlbuilder2');
const fs          = require('fs');

const timestamp   = Date.now();
const config      = {
  buildDir: "./dist/digital-zone/",
  manifestOptions: {
    courseId:     `Digital_Zone_1.0.0${timestamp}`,
    SCORMtitle:   "Digital_Zone_1.0.0",
    items: [
      {
        identifier:  "sco-a",
        moduleTitle: "SCO-A"
      },
      {
        identifier:  "sco-b",
        moduleTitle: "SCO-B"
      }
    ],
    launchPage: "index.html",
    fileName:   "imsmanifest.xml"
  }
}

const dir = fs.readdirSync(`~/${config.buildDir}`);

const fetchBuildFiles = async () => {

  const filesArr  = [
    {'@identifier':      'resource_1'},
    {'@type':            'webcontent'},
    {'@adlcp:scormtype': 'sco'},
    {'@href':            config.manifestOptions.launchPage}
  ];
  const dir = await fs.promises.readdir(`~/${config.buildDir}`);

  dir.forEach(el => {
    const fileObj = {
      file: {
        '@href': el
      }
    }
    filesArr.push(fileObj);
  });

  return filesArr;

}

const createItems = () => {

  const organization = {
    '@identifier': `${config.manifestOptions.courseId}-org`,
    title:         config.manifestOptions.SCORMtitle
  };

  config.manifestOptions.items.forEach(el => {
    organization['']
    const item = {
      item: {
        '@identifier':    el.identifier,
        '@identifierref': 'resource_1',
        title:            el.moduleTitle
      }
    }
    organization.push(item);
  });

  return organization;

}

// let xmlObj = {
//   manifest: {
//     '@identifier':          config.manifestOptions.courseId,
//     '@version':             '1',
//     '@xmlns':               'http://www.imsproject.org/xsd/imscp_rootv1p1p2',
//     '@xmlns:adlcp':         'http://www.adlnet.org/xsd/adlcp_rootv1p2',
//     '@xmlns:xsi':           'http://www.w3.org/2001/XMLSchema-instance',
//     '@xsi:schemaLocation':  'http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd',
//     metadata: {
//       schema:         'ADL SCORM',
//       schemaversion:  '1.2'
//     },
//     organizations: {
//       '@default': `${config.manifestOptions.courseId}-org`,
//       organization: createItems()
//     },
//     resources: {
//       resource: fetchBuildFiles()
//     }
//   },
// };

const doc = 
  create({ version: '1.0', encoding: 'UTF-8', standalone: 'yes' })
    .ele('manifest', {
      identifier:           config.manifestOptions.courseId,
      version:              '1',
      xmlns:                'http://www.imsproject.org/xsd/imscp_rootv1p1p2',
      'xmlns:adlcp':        'http://www.adlnet.org/xsd/adlcp_rootv1p2',
      'xmlns:xsi':          'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation': 'http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd'
    })
      .ele('metadata')
        .ele('schema')
          .txt('ADL SCORM')
          .up()
        .ele('schemaversion')
          .txt('1.2')
          .up()
      .up()
      .ele('organizations', {
        default: `${config.manifestOptions.courseId}-org`
      })
        .ele('organization', {
          identifier: `${config.manifestOptions.courseId}-org`
        })
          .ele('title')
            .txt(config.manifestOptions.SCORMtitle)
            .up();

for(let i = 0; i < config.manifestOptions.items.length; i++) {
  doc.ele('item', {
    identifier:     config.manifestOptions.items[i].identifier,
    identifierref:  'resource_1'
  })
    .ele('title')
      .txt(config.manifestOptions.items[i].moduleTitle)
    .up()
  .up()
}

doc.up()
  .up()
  .ele('resources')
    .ele('resource', {
      identifier: 'resource_1',
      type: 'webcontent',
      href: 'sco',
      'adlcp:scormtype': config.manifestOptions.launchPage
    });

for(let i = 0; i < dir.length; i++) {
  doc.ele('file', {
    href: dir[i]
  })
  .up()
}

doc.up()
.up();

const xml = doc.end({ prettyPrint: true });
console.log(xml);