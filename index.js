const { create }  = require('xmlbuilder2');
const fs          = require('fs');
const zip         = require('zip-a-folder');

const json    = fs.readFileSync('./scorm.manifest.json');
const config  = JSON.parse(json);

const dir     = fs.readdirSync(`${config.buildDir}`);

console.log(`Creating: ${config.manifestOptions.fileName}`);

const createResource = () => {

  const resourse =
    create()
      .ele('resource', {
        identifier:         'resource_1',
        type:               'webcontent',
        href:               'sco',
        'adlcp:scormtype':  config.manifestOptions.launchPage
      });

      dir.forEach(el => {
        resourse.ele('file', {
          href: el
        })
        .up();
      })

    resourse.up()

  return resourse;

}

const createDocu = () => {

  const docu = 
  create({
    version:    '1.0', 
    encoding:   'UTF-8', 
    standalone: 'yes'
  })
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
            
          config.manifestOptions.items.forEach(el => {
            docu.ele('item', {
              identifier:     el.identifier,
              identifierref:  'resource_1'
            })
              .ele('title')
                .txt(el.moduleTitle)
              .up()
            .up();
          });

          docu.up()
      .up()
      .ele('resources')
        .import(createResource())
      .up()
    .up();

  const xml = docu.end({
    prettyPrint: true
  });

  fs.writeFileSync(
    `${config.buildDir}/${config.manifestOptions.fileName}`,
    xml
    );

  console.log(`Created: ${config.manifestOptions.fileName}`);

}

const zipBuild = async () => {

  await zip(`${config.buildDir}/`, config.archiveDir);
  console.log(`Zipped: ${config.archiveDir}`);

}

createDocu();
if(config.zip) zipBuild();

