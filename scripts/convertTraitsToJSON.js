const fs = require("fs");
const path = require("path");
const Promise = require("bluebird");

// function to encode file data to base64 encoded string
function base64_encode(file) {
  // convert binary data to base64 encoded string
  return `data:image/png;base64,${new Buffer.from(file).toString("base64")}`;
}

(async () => {
  const traitTypes = ["background", "body", "clothes", "glasses", "hat", "mouth"];
  const allTraits = [];
  var traitId = 1;

  await Promise.each(traitTypes, async (traitType) => {
    const traits = fs.readdirSync(
      path.join(__dirname, "../data/images/male/", traitType)
    );

    await Promise.each(traits, async (trait) => {
      if (!trait.includes(".png")) {
        const iqImages = await Promise.mapSeries([0, 1, 2, 3, 4, 5], (iq) => {
          const image = fs.readFileSync(
            path.join(
              __dirname,
              "../data/images/male/",
              `${traitType}/${trait.split(".png")[0]}/${iq.toString()}.png`
            )
          );
          return image;
        });

        traitId++;
        allTraits.push({
          traits: iqImages.map((iqImage) => {
            return {
              pngImage: base64_encode(iqImage),
              traitName: trait.split(".png")[0],
              traitType: traitType
            };
          }),
          traitId,
        });
      } else {
        const image = fs.readFileSync(
          path.join(__dirname, "../data/images/male/", traitType, trait)
        );
        traitId++;
        allTraits.push({
          traits: [
            {
              pngImage: base64_encode(image),
              traitName: trait.split(".png")[0],
              traitType: traitType,
            },
          ],
          traitId,
        });
      }
    });
  });

  console.log(allTraits);

  fs.writeFileSync(
    path.join(__dirname, "../data/traits.json"),
    JSON.stringify(allTraits, undefined, 4)
  );
})();
