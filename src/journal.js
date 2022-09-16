import {
  parse_planning,
  generate_todo,
  generate_planning,
} from "./planning.js";

export const generate = (options) => {
  if (!options || !options.target_date) {
    throw new Error("Missing `options.target_date`");
  }

  return (tree, file) => {
    let journalMeta = {};
    let nodeMark = { "journal-agenda": undefined, "journal-todo": undefined };

    tree.children.forEach((node, index) => {
      switch (node.type) {
        case "yaml":
          journalMeta = node.value;
          if (
            !journalMeta["journal-planning"] ||
            !journalMeta["journal-todo"]
          ) {
            console.log("Missing `journal-planning` or `journal-todo`");
            return;
          }
          break;
        case "heading":
          if (node.children[0].value == journalMeta["journal-planning"]) {
            nodeMark["journal-planning"] = index;
          }
          if (node.children[0].value == journalMeta["journal-todo"]) {
            nodeMark["journal-todo"] = index;
          }
          break;
        default:
          break;
      }
    });

    // make reference to the nodes
    const todoPlanningItems = tree.children[nodeMark["journal-planning"] + 1];
    let todoDailyItems = tree.children[nodeMark["journal-todo"] + 1];

    // insert todo daily items if not existed
    if (todoDailyItems.type != "list") {
      tree.children.splice(nodeMark["journal-todo"] + 1, 0, {
        type: "list",
        ordered: false,
        start: null,
        spread: false,
        children: [],
      });
      todoDailyItems = tree.children[nodeMark["journal-todo"] + 1];
    }

    todoDailyItems.children = [];

    if (todoPlanningItems.type != "list") {
      // there is no planning items,
      return;
    }

    const planningItems = parse_planning(todoPlanningItems);

    todoDailyItems.children = generate_todo(planningItems, options.target_date);
    todoPlanningItems.children = generate_planning(
      planningItems,
      options.target_date
    );
  };
};

export default generate;
