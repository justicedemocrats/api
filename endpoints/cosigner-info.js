const db = require("../lib/db");
const crypt = require("../lib/crypt");

async function cosignerInfo(req, res) {
  const id = crypt.decrypt(req.params.id);
  const info = await db("cosigners")
    .where({ "cosigners.id": id })
    .leftJoin("nominations", "cosigners.nomination", "=", "nominations.id")
    .leftJoin(
      "people as nominator",
      "nominator.id",
      "=",
      "nominations.nominator"
    )
    .leftJoin("people as nominee", "nominee.id", "=", "nominations.nominee")
    .select("cosigners.id as cosigner_id")
    .select("nominations.id as nomination_id")
    .select("nominations.state as state")
    .select("nominations.district as district")
    .select("nominations.type as type")
    .select("nominator.name as nominator_name")
    .select("nominee.name as nominee_name");

  console.log(info);

  if (info[0]) {
    return res.json(info[0]);
  } else {
    console.error(
      `Error: Could not nomination with encrypted id ${
        req.params.id
      }, decrypted id ${id}`
    );
    return res.status(404).json({ error: "not found" });
  }
}

module.exports = cosignerInfo;
