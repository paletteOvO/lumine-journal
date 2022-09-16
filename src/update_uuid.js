import { webcrypto as crypto } from "crypto";

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

const update = () => {
  return (tree, _file) => {
    if (tree.children[0].type === "yaml") {
      tree.children[0].value["uuid"] = uuidv4();
    }
  };
};

export default update;
