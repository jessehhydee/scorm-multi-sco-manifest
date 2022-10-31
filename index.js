const { create }  = require('xmlbuilder2');
const fs          = require('fs');
const { zip }     = require('zip-a-folder');

const json    = fs.readFileSync('./scorm.manifest.json');
const config  = JSON.parse(json);

console.log(`Creating: imsmanifest.xml`);

const createSequencingRules = (index) => {

  if(index === 0) return create().ele('ex');

  const rules =
    create()
      .ele('imsss:sequencingRules')
        .ele('imsss:preConditionRule')
          .ele('imsss:ruleConditions', {
            conditionCombination: 'any'
          })
            .ele('imsss:ruleCondition', {
              referencedObjective:  'previous_sco_satisfied',
              operator:             'not',
              condition:            'satisfied'
            })
            .up()
            .ele('imsss:ruleCondition', {
              referencedObjective:  'previous_sco_satisfied',
              operator:             'not',
              condition:            'objectiveStatusKnown'
            })
            .up()
          .up()
          .ele('imsss:ruleAction', {
            action: 'disabled'
          })
          .up()
        .up()
      .up();

    return rules;

}

const createPreviousSCOObjective = (index) => {

  if(index === 0) return create().ele('ex');

  const objective =
    create()
      .ele('imsss:objective', {
        objectiveID: 'previous_sco_satisfied'
      })
        .ele('imsss:mapInfo', {
          targetObjectiveID:    `com.scorm.sequencing.forcedsequential.${config.manifestOptions.SCOs[index - 1].buildDirName.toLowerCase()}-satisfied`,
          readSatisfiedStatus:  'true',
          writeSatisfiedStatus: 'false'
        })
        .up()
      .up();

  return objective;

}

const createFiles = (sco, howManyMoreResources) => {

  let files;
  const buildDir = fs.readdirSync(`${config.buildsDir}/${sco.buildDirName}`);

  if(howManyMoreResources === 0) {

    files =
      create()
        .ele('resource', {
          identifier:         'common_files',
          type:               'webcontent',
          'adlcp:scormtype':  'asset'
        });

          buildDir.forEach(el => {
            files.ele('file', {
              href: `${sco.buildDirName}/${el}`
            })
            .up();
          })

        files.up();

  }
  else {

    files =
      create()
        .ele('resource', {
          identifier:         `${sco.buildDirName.toLowerCase()}-resource`,
          type:               'webcontent',
          'adlcp:scormtype':  'sco',
          href:               `${config.manifestOptions.SCORMParent.buildDirName}/${config.manifestOptions.SCORMParent.index}?content=${sco.buildDirName}&file=${sco.index}`
        });

          buildDir.forEach(el => {
            files.ele('file', {
              href: `${sco.buildDirName}/${el}`
            })
            .up();
          })

          files.ele('dependency', {
            identifierref: 'common_files'
          })
          .up()
        .up();

  }

  return files;

}

const createResources = () => {

  const resourceItems = [...config.manifestOptions.SCOs];
  resourceItems.push(config.manifestOptions.SCORMParent);

  const resources = 
    create()
      .ele('resources');

        resourceItems.forEach((el, i) => {
          resources.import(createFiles(el, resourceItems.length - (i + 1)));
        });

      resources.up();

  return resources;

}

const createMultiSCODocu = () => {

  const docu = 
  create({
    version:    '1.0', 
    encoding:   'UTF-8', 
    standalone: 'yes'
  })
    .ele('manifest', {
      identifier:           config.manifestOptions.courseId,
      version:              '1',
      xmlns:                'http://www.imsglobal.org/xsd/imscp_v1p1',
      'xmlns:adlcp':        'http://www.adlnet.org/xsd/adlcp_v1p3',
      'xmlns:adlseq':       'http://www.adlnet.org/xsd/adlseq_v1p3',
      'xmlns:xsi':          'http://www.w3.org/2001/XMLSchema-instance',
      'xmlns:adlnav':       'http://www.adlnet.org/xsd/adlnav_v1p3',
      'xmlns:imsss':        'http://www.imsglobal.org/xsd/imsss',
      'xsi:schemaLocation': 'http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd'
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
            
          config.manifestOptions.SCOs.forEach((el, i) => {

            docu.ele('item', {
              identifier:     el.buildDirName.toLowerCase(),
              identifierref:  `${el.buildDirName.toLowerCase()}-resource`
            })
              .ele('title')
                .txt(`${el.buildDirName.toUpperCase()}`)
              .up()
              .ele('imsss:sequencing', {
                IDRef: 'common_seq_rules'
              })
                .import(createSequencingRules(i))
                .ele('imsss:objectives')
                  .ele('imsss:primaryObjective', {
                    objectiveID: `${el.buildDirName.toLowerCase()}-satisfied`
                  })
                    .ele('imsss:mapInfo', {
                      targetObjectiveID:    `com.scorm.sequencing.forcedsequential.${el.buildDirName.toLowerCase()}-satisfied`,
                      readSatisfiedStatus:  'true',
                      writeSatisfiedStatus: 'true'
                    })
                    .up()
                  .up()
                  .import(createPreviousSCOObjective(i))
                .up()
              .up()
            .up();

          });

          docu.ele('imsss:sequencing')
            .ele('imsss:controlMode', {
              choice: 'true',
              flow:   'true'
            })
            .up()
          .up()
        .up()
      .up()
      .import(createResources())
      .ele('imsss:sequencingCollection')
        .ele('imsss:sequencing', {
          ID: 'common_seq_rules'
        })
          .ele('imsss:rollupRules', {
            objectiveMeasureWeight: '0'
          })
          .up()
          .ele('imsss:deliveryControls', {
            completionSetByContent: 'true',
            objectiveSetByContent:  'true'
          })
          .up()
        .up()
      .up()
    .up();

  const xml = docu.end({
    prettyPrint: true
  });

  fs.writeFileSync(
    `${config.buildsDir}/imsmanifest.xml`,
    xml
    );

  console.log(`Created: imsmanifest.xml`);

}

const createSingleSCODocu = () => {

  const buildDir = fs.readdirSync(`${config.buildsDir}/${config.manifestOptions.SCOs[0].buildDirName}`);

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
          .up()
          .ele('item', {
            identifier:     config.manifestOptions.SCOs[0].buildDirName.toLowerCase(),
            identifierref:  `${config.manifestOptions.SCOs[0].buildDirName.toLowerCase()}-resource`
          })
            .ele('title')
              .txt(`${config.manifestOptions.SCOs[0].buildDirName.toUpperCase()}`)
            .up()
          .up()
        .up()
      .up()
      .ele('resources')
        .ele('resource', {
          identifier:         `${config.manifestOptions.SCOs[0].buildDirName.toLowerCase()}-resource`,
          type:               'webcontent',
          'adlcp:scormtype':  'sco',
          href:               `${config.manifestOptions.SCOs[0].buildDirName}/${config.manifestOptions.SCOs[0].index}`
        });

          buildDir.forEach(el => {
            docu.ele('file', {
              href: `${config.manifestOptions.SCOs[0].buildDirName}/${el}`
            })
            .up();
          })

        docu.up()
      .up()
    .up();

  const xml = docu.end({
    prettyPrint: true
  });

  fs.writeFileSync(
    `${config.buildsDir}/imsmanifest.xml`,
    xml
    );

  console.log(`Created: imsmanifest.xml`);

}

const zipBuild = async () => {

  archiveDirPath = config.archiveDir.split('/');
  archiveDirPath.pop();
  archiveDirPath = archiveDirPath.join('/');

  if (!fs.existsSync(archiveDirPath)) fs.mkdirSync(archiveDirPath);

  await zip(`${config.buildsDir}/`, config.archiveDir);
  console.log(`Zipped: ${config.archiveDir}`);

}

if(config.manifestOptions.SCOs.length > 1) createMultiSCODocu();
else createSingleSCODocu();

if(config.zip) zipBuild();

