function buildOrder(){
    // Check module need.
    var powerModuleNeeded = checkNeedPowerModule();
    var researchModuleNeeded = checkNeedResearchModule();

    // If production has begun, give orders to idle Cyborg Factories.
    if(productionBegin){
        var cyborgFactories = enumStruct(
          me,
          'A0CyborgFactory',
          me
        );

        cyborgFactories.some(function check_cyborgFactory(checked_cyborgFactory){
            if(checked_cyborgFactory.status !== BUILT
              || !structureIdle(checked_cyborgFactory)){
                return;
            }

            buildDroid(
              checked_cyborgFactory,
              'cyborg',
              'CyborgLightBody',
              'CyborgLegs',
              '',
              DROID_CYBORG,
              'CyborgChaingun'
            );
        });
    }

    // Give orders to idle construction droids.
    var droids = enumDroid(
      me,
      DROID_CONSTRUCT,
      me
    );
    droids.some(function check_droid_idle(checked_droid){
        if(!checkDroidIdle(checked_droid)){
            return;
        }

        // Finish incomplete buildings first.
        var structures = enumStruct(me);
        for(var structure in structures){
            if(structures[structure].status !== BUILT){
                orderDroidObj(
                  checked_droid,
                  DORDER_HELPBUILD,
                  structures[structure]
                );
            }
        }

        // Build 1 Research Facility.
        if(checkStructure(
            'A0ResearchFacility',
            1
          )){
            buildStructure(
              checked_droid,
              'A0ResearchFacility'
            );

        // Build 1 Power Generator.
        }else if(checkStructure(
            'A0PowerGenerator',
            1
          )){
            buildStructure(
              checked_droid,
              'A0PowerGenerator'
            );

        // Build 4 Resource Extractors.
        }else if(checkStructure(
            'A0ResourceExtractor',
            4
          )){
            buildStructure(
              checked_droid,
              'A0ResourceExtractor'
            );

        // Build as many Research Facilities as possible.
        }else if(checkStructure(
            'A0ResearchFacility',
            maxResearchFacilities
          )){
            buildStructure(
              checked_droid,
              'A0ResearchFacility'
            );

        // Build 1 Command Center.
        }else if(checkStructure(
            'A0CommandCentre',
            1
          )){
            buildStructure(
              checked_droid,
              'A0CommandCentre'
            );

        // Build 1 Factory.
        }else if(checkStructure(
            'A0LightFactory',
            1
          )){
            buildStructure(
              checked_droid,
              'A0LightFactory'
            );

        // Build as many Cyborg Factories as possible.
        }else if(checkStructure(
            'A0CyborgFactory',
            maxCyborgFactories
          )){
            buildStructure(
              checked_droid,
              'A0CyborgFactory'
            );

        // Build Power Modules.
        }else if(powerModuleNeeded !== false){
            buildStructure(
              checked_droid,
              'A0PowMod1',
              powerModuleNeeded.x,
              powerModuleNeeded.y
            );

        // Build Research Modules.
        }else if(researchModuleNeeded !== false){
            buildStructure(
              checked_droid,
              'A0ResearchModule1',
              researchModuleNeeded.x,
              researchModuleNeeded.y
            );
        }
    });

    // Give orders to idle Research Facilities if needed.
    if(!researchDone){
        var researchFacilities = enumStruct(
          me,
          'A0ResearchFacility',
          me
        );
        researchFacilities.some(function check_researchFacility_idle(checked_researchFacility){
            if(checked_researchFacility.status !== BUILT
              || !structureIdle(checked_researchFacility)){
                return;
            }

            pursueResearch(
              checked_researchFacility,
              researchOrder
            );
        });
    }

    // Make sure we have enough construction droids.
    if(droids.length < maxConstructionDroids){
        var factories = enumStruct(
          me,
          'A0LightFactory',
          me
        );

        if(factories.length > 0
          && structureIdle(factories[0])){
            buildDroid(
              factories[0],
              'Drone',
              'Body1REC',
              'wheeled01',
              '',
              DROID_CONSTRUCT,
              'Spade1Mk1'
            );
        }
    }

    queue(
      'buildOrder',
      0
    );
}

function buildStructure(droid, structure, x, y){
    x = x || droid.x;
    y = y || droid.y;

    var location = pickStructLocation(
      droid,
      structure,
      x,
      y
    );

    if(location){
        orderDroidBuild(
          droid,
          DORDER_BUILD,
          structure,
          location.x,
          location.y
        );
    }
}

function checkDroidIdle(droid){
    return !(droid.order === DORDER_BUILD
      || droid.order === DORDER_HELPBUILD);
}

function checkNeedPowerModule(){
    if(!isStructureAvailable(
        'A0PowMod1',
        me
      )){
        return false;
    }

    var generator = false;
    var powerGenerators = enumStruct(
      me,
      'A0PowerGenerator',
      me
    ).reverse();

    powerGenerators.some(function check_powerGenerator_needmodule(checked_powerGenerator){
        if(checked_powerGenerator.modules !== 0){
            return;
        }

        generator = checked_powerGenerator;
    });

    return generator;
}

function checkNeedResearchModule(){
    if(!isStructureAvailable(
        'A0ResearchModule1',
        me
      )){
        return false;
    }

    var facility = false;
    var researchFacilities = enumStruct(
      me,
      'A0ResearchFacility',
      me
    ).reverse();

    researchFacilities.some(function check_researchFacility_needmodule(checked_researchFacility){
        if(checked_researchFacility.modules !== 0){
            return;
        }

        facility = checked_researchFacility;
    });

    return facility;
}

function checkStructure(structure, count){
    return isStructureAvailable(
      structure,
      me
    ) && countStruct(structure) < count;
}

function eventAttacked(victim, attacker){
    if(me !== victim.player){
        return;
    }

    var cyborgs = enumDroid(me);

    for(var cyborg in cyborgs){
        if(cyborgs[cyborg].droidType !== DROID_CONSTRUCT){
            orderDroidLoc(
              cyborgs[cyborg],
              DORDER_MOVE,
              attacker.x,
              attacker.y
            );
        }
    }

    productionBegin = true;
}

function eventGameLoaded(){
    init();
}

function eventResearched(research, structure, player){
    if(me !== player){
        return;
    }

    if(research.name === researchOrder[researchOrder.length - 1]){
        maxConstructionDroids = 5;
        researchDone = true;

    }else if(research.name === 'R-Sys-Autorepair-General'){
        productionBegin = true;
    }
}

function eventStartLevel(){
    init();
}

function init(){
    // Get limitations.
    maxCyborgFactories = getStructureLimit(
      'A0CyborgFactory',
      me
    );
    maxResearchFacilities = getStructureLimit(
      'A0ResearchFacility',
      me
    );

    // Start build order loop.
    queue(
      'buildOrder',
      0
    );
}

var maxConstructionDroids = 2;
var maxCyborgFactories = 5;
var maxResearchFacilities = 5;
var productionBegin = false;
var researchDone = false;
const researchOrder = [
  'R-Sys-Engineering01',        // Engineering
  'R-Vehicle-Engine01',         // Fuel Injection Engine
  'R-Struc-Factory-Cyborg',     // Cyborg Factory
  'R-Sys-Sensor-Turret01',      // Sensor Turret
  'R-Wpn-MG1Mk1',               // Machinegun
  'R-Sys-Sensor-Tower01',       // Sensor Tower
  'R-Struc-PowerModuleMk1',     // Power Module
  'R-Struc-CommandRelay',       // Command Relay Post
  'R-Struc-Research-Module',    // Research Module
  'R-Wpn-MG-Damage01',          // Hardened MG Bullets
  'R-Struc-Research-Upgrade01', // Synaptic Link Data Analysis
  'R-Wpn-MG-Damage02',          // APDSB MG Bullets
  'R-Struc-Research-Upgrade02', // Synaptic Link Data Analysis Mk2
  'R-Wpn-MG-Damage03',          // APDSB MG Bullets Mk2
  'R-Struc-Research-Upgrade03', // Synaptic Link Data Analysis Mk3
  'R-Wpn-MG-Damage04',          // APDSB MG Bullets Mk4
  'R-Struc-Research-Upgrade04', // Dedicated Synaptic Link Data Analysis
  'R-Struc-Power-Upgrade01',    // Gas Turbine Generator
  'R-Struc-Research-Upgrade05', // Dedicated Synaptic Link Data Analysis Mk2
  'R-Struc-Power-Upgrade01b',   // Gas Turbine Generator Mk2
  'R-Struc-Research-Upgrade06', // Dedicated Synaptic Link Data Analysis Mk3
  'R-Struc-Power-Upgrade01c',   // Gas Turbine Generator Mk3
  'R-Struc-Research-Upgrade07', // Neural Synapse Research Brain
  'R-Struc-Power-Upgrade02',    // Vapor Turbine Generator
  'R-Struc-Research-Upgrade08', // Neural Synapse Research Brain Mk2
  'R-Sys-Autorepair-General',   // Auto-Repair
  'R-Struc-Power-Upgrade03',    // Vapor Turbine Generator Mk2
  'R-Struc-Research-Upgrade09', // Neural Synapse Research Brain Mk3
  'R-Struc-Power-Upgrade03a',   // Vapor Turbine Generator Mk3
  'R-Wpn-MG-Damage08',          // Depleted Uranium MG Bullets
  'R-Struc-Factory-Upgrade01',  // Automated Manufacturing
  'R-Cyborg-Metals01',          // Cyborg Composite Alloys
  'R-Struc-Factory-Upgrade04',  // Robotic Manufacturing
  'R-Cyborg-Metals02',          // Cyborg Composite Alloys Mk2
  'R-Struc-Factory-Upgrade07',  // Advanced Manufacturing
  'R-Cyborg-Metals03',          // Cyborg Composite Alloys Mk3
  'R-Struc-Factory-Upgrade09',  // Self-Replicating Manufacturing
  'R-Cyborg-Metals04',          // Cyborg Dense Composite Alloys
  'R-Cyborg-Armor-Heat01',      // Cyborg Thermal Armor
  'R-Cyborg-Armor-Heat02',      // Cyborg Thermal Armor Mk2
  'R-Cyborg-Metals05',          // Cyborg Dense Composite Alloys Mk2
  'R-Cyborg-Armor-Heat03',      // Cyborg Thermal Armor Mk3
  'R-Cyborg-Metals06',          // Cyborg Dense Composite Alloys Mk3
  'R-Cyborg-Armor-Heat04',      // Cyborg High Intensity Thermal Armor
  'R-Cyborg-Metals07',          // Cyborg Superdense Composite Alloys
  'R-Cyborg-Armor-Heat05',      // Cyborg High Intensity Thermal Armor Mk2
  'R-Cyborg-Metals08',          // Cyborg Superdense Composite Alloys Mk2
  'R-Cyborg-Armor-Heat05',      // Cyborg High Intensity Thermal Armor Mk3
  'R-Cyborg-Metals09',          // Cyborg Superdense Composite Alloys Mk3
  'R-Cyborg-Armor-Heat09',      // Cyborg Superdense Thermal Armor Mk3
  'R-Sys-Resistance-Circuits',  // Nexus Resistance Circuits
];