const clear_content = () => {
  return (tree, file) => {
    let journalMeta = {};
    let nodeMark = [];
    tree.children.forEach((node, index) => {
      switch (node.type) {
        case "yaml":
          journalMeta = node.value;
          if (!journalMeta["clear-content"]) {
            console.log("Missing `clear-content`");
            return;
          }
          break;
        case "heading":
          if (
            journalMeta["clear-content"].indexOf(node.children[0].value) != -1
          ) {
            nodeMark.push(index);
          }
          break;
        default:
          break;
      }
    });

    nodeMark.reverse().forEach((eachMark) => {
      eachMark += 1;
      while (true) {
        if (
          tree.children[eachMark] == undefined ||
          tree.children[eachMark].type == "heading"
        ) {
          break;
        } else {
          tree.children.splice(eachMark, 1);
        }
      }
    });
  };
};

export default clear_content;
