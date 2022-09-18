const smols = require('../data/smolsToTextTraits.json');
const path = require("path");
const fs = require("fs");
const smolsDuplicate = {};

for(var i =0;i<13422;i++){
    const thisSmol = smols[i.toString()];
    console.log(thisSmol);

    if(thisSmol.Gender == "male") {
        thisSmol.Hair = "none";
        smolsDuplicate[i.toString()] = (thisSmol);
        continue;
    }

    if(thisSmol.Gender == "female") {
        thisSmol.Hair = `${thisSmol.Body}`;
        smolsDuplicate[i.toString()] = (thisSmol);
        continue;
    }
}

fs.writeFileSync(path.join(__dirname, "../data/smolsToTextTraitsDup.json"), JSON.stringify(smolsDuplicate, undefined, 4));
