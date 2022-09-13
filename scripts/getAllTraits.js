const smolBrains = require("../data/smolsToTextTraits.json");
const fs = require("fs");
const path = require("path");
const Promise = require("bluebird");

// function to encode file data to base64 encoded string
function base64_encode(file) {
  // convert binary data to base64 encoded string
  return `data:image/png;base64,${new Buffer.from(file).toString("base64")}`;
}

var traits = [];

var traitId = 0;
(async () => {
  var smols = Object.keys(smolBrains);

  //smols = smols.slice(0, 1000);

  smols.forEach((smol) => {
    const thisSmol = smolBrains[smol];

    ["Background", "Body", "Clothes", "Mouth", "Glasses", "Hat", "Hair"].forEach(
      (traitType) => {
        if (
          !traits.find(
            (a) =>
              a.traitName == thisSmol[traitType] &&
              a.traitType == traitType &&
              a.gender == thisSmol.Gender
          )
        ) {
          traits.push({
            gender: thisSmol.Gender,
            traitName: thisSmol[traitType],
            traitType: traitType,
          });
        }
      }
    );
  });

  traits = traits.sort((a, b) => a.gender.localeCompare(b.gender));
  traits = traits.sort((a, b) => a.traitName.localeCompare(b.traitName));
  traits = traits.sort((a, b) => a.traitType.localeCompare(b.traitType));

  traits = traits.map(({ traitType, traitName, gender }) => {
    console.log({ traitType, traitName, gender });
    if (traitType == "Body" || traitType == "Hat"|| traitType == "Hair") {
      const iqImages = [0, 1, 2, 3, 4, 5].map((iq) => {
        const image = fs.readFileSync(
          path.join(
            __dirname,
            `../data/36x36/${gender}/`,
            `${traitType}/${traitName}/${iq.toString()}.png`
          )
        );
        return image;
      });

      traitId++;
      return {
        traits: iqImages.map((iqImage) => {
          return {
            gender,
            pngImage: base64_encode(iqImage),
            traitName,
            traitType,
          };
        }),
        traitId,
      };
    } else {
      const image = fs.readFileSync(
        path.join(
          __dirname,
          `../data/36x36/${gender}/`,
          `${traitType}/${traitName}.png`
        )
      );
      traitId++;
      return {
        traits: [
          {
            gender,
            pngImage: base64_encode(image),
            traitName,
            traitType,
          },
        ],
        traitId,
      };
    }
  });

  fs.writeFileSync(
    path.join(__dirname, "../data/traits.json"),
    JSON.stringify(traits, undefined, 4)
  );

  const convertedSmols = smols.map((smol, index) => {
    const thisSmol = smolBrains[smol];
    const convertedSmol = {
      tokenId: index,
      gender: thisSmol.Gender == "male" ? 1 : 2
    };

    const traitTypes = [
      "Background",
      "Body",
      "Clothes",
      "Mouth",
      "Glasses",
      "Hat",
      "Hair"
    ];

    traitTypes.forEach((traitType) => {
      const traitName = thisSmol[traitType];

      const traitId = traits.find((a) => {
        return (
          a.traits[0].traitType == traitType &&
          a.traits[0].traitName == traitName &&
          a.traits[0].gender == thisSmol.Gender
        );
      }).traitId;
      convertedSmol[traitType.toLowerCase()] = traitId;
    });

    return {...convertedSmol,
      skin: 0,
      iq: 0};
  });

  fs.writeFileSync(path.join(__dirname, "../data/smolsToTraitId.json"), JSON.stringify(convertedSmols, undefined, 4));
})();
