const { create }  = require('xmlbuilder2');
const fs          = require('fs');
const zip         = require('zip-a-folder');

const json    = fs.readFileSync('./scorm.manifest.json');
const config  = JSON.parse(json);

console.log(`Creating: ${config.manifestOptions.fileName}`);

const createSequencingRules = (index) => {

  if(index === 0) return create().ele('');

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

  if(index === 0) return create().ele('');

  const objective =
    create()
      .ele('imsss:objective', {
        objectiveID: 'previous_sco_satisfied'
      })
        .ele('imsss:mapInfo', {
          targetObjectiveID:    `com.scorm.sequencing.forcedsequential.${config.manifestOptions.items[index - 1].buildDirName.toLowerCase()}-satisfied`,
          readSatisfiedStatus:  'true',
          writeSatisfiedStatus: 'false'
        })
        .up()
      .up();

  return objective;

}

const createResource = () => {

  const resources = 
    create()
      .ele('resources');

        config.manifestOptions.items.forEach(el => {

          const buildir = fs.readdirSync(`${config.buildsDir}/${el.buildDirName}`);

          resources.ele('resource', {
            identifier:         `${el.buildDirName.toLowerCase()}-resource`,
            type:               'webcontent',
            href:               'sco',
            'adlcp:scormtype':  el.index
          });
    
            buildir.forEach(el => {
              resources.ele('file', {
                href: el
              })
              .up();
            })
    
          resources.up()

        });

      resources.up();

  return resources;

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
            
          config.manifestOptions.items.forEach((el, i) => {

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
      .import(createResource())
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
    `${config.buildsDir}/${config.manifestOptions.fileName}`,
    xml
    );

  console.log(`Created: ${config.manifestOptions.fileName}`);

}

const zipBuild = async () => {

  await zip(`${config.buildsDir}/`, config.archiveDir);
  console.log(`Zipped: ${config.archiveDir}`);

}

createDocu();
if(config.zip) zipBuild();

