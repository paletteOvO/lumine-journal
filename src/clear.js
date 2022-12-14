const clear_content = () => {
   return (tree, _file) => {
      const journalMeta = {};
      const nodeMark = [];
      tree.children.forEach((node, index) => {
         switch (node.type) {
            case "yaml":
               Object.assign(journalMeta, node.value);
               if (!journalMeta["clear-content"]) {
                  console.log("Missing `clear-content`");
                  return;
               }
               break;
            case "heading":
               if (
                  journalMeta["clear-content"].indexOf(
                     node.children[0].value
                  ) != -1
               ) {
                  nodeMark.push({
                     index,
                     node: node,
                  });
               }
               break;
            default:
               break;
         }
      });

      nodeMark.reverse().forEach((eachMark) => {
         let i = eachMark.index;
         i += 1;
         while (true) {
            if (
               tree.children[i] == undefined ||
               (tree.children[i].type == "heading" &&
                  tree.children[i].depth <= eachMark.node.depth)
            ) {
               break;
            } else {
               tree.children.splice(i, 1);
            }
         }
      });
   };
};

export default clear_content;
