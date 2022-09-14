import YAML from "yaml";

const parse_yaml = () => {
   return (tree, file) => {
      if (tree.children[0].type === "yaml") {
         const yaml = YAML.parse(tree.children[0].value);
         tree.children[0].value = yaml;
      }
   };
};

export default parse_yaml;
