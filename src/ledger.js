import { parse_meta } from "./util.js";
const parse_balance = (balancesNode) => {
   return balancesNode.children.map((x) => {
      return x.children[0].children[0].value;
   });
};
const parse_ledger = (ledgerItems) => {
   const new_items = (desc, balance) => ({ desc, balance });
   const items = ledgerItems.children.map((x) => {
      const meta = parse_meta(x.children[0]);
      const balances = parse_balance(x.children[1]);
      return new_items(meta.desc, balances);
   });
   return items;
};
const generate = function () {
   // eslint-disable-next-line
   Object.assign(this, {
      Compiler: (tree) => {
         let journalMeta = {};
         const nodeMark = {
            ledger: undefined,
         };

         tree.children.forEach((node, index) => {
            switch (node.type) {
               case "yaml":
                  journalMeta = node.value;
                  if (!journalMeta["ledger"]) {
                     console.log("Missing `ledger`");
                     return;
                  }
                  if (!journalMeta["date"]) {
                     console.log("Missing `date`");
                     return;
                  }

                  break;
               case "heading":
                  if (node.children[0].value == journalMeta["ledger"]) {
                     nodeMark["ledger"] = index;
                  }
                  break;
               default:
                  break;
            }
         });

         const ledgerItems = tree.children[nodeMark["ledger"] + 1];
         if (
            nodeMark["ledger"] === undefined ||
            ledgerItems === undefined ||
            ledgerItems.type != "list"
         ) {
            // there is no ledger items
            return "";
         }
         const ledgerParsedItems = parse_ledger(ledgerItems);
         return ledgerParsedItems
            .map((x) => {
               return (
                  `${journalMeta["date"]} ${x.desc}\n    ` +
                  x.balance.join("\n    ")
               );
            })
            .join("\n\n");
      },
   });
};
export default generate;
