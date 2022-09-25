import YAML from "yaml";

const stringify_yaml = () => {
   return (tree, _file) => {
      if (tree.children[0].type === "yaml") {
         if (typeof tree.children[0].value === "object") {
            const yaml = YAML.stringify(tree.children[0].value).trim();
            tree.children[0].value = yaml;
         }
      }
   };
};

export default stringify_yaml;
