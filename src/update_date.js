const pad_zero = (s) => s.toString().padStart(2, "0");

const format_date = (d) =>
   `${pad_zero(d.getFullYear())}-${pad_zero(d.getMonth() + 1)}-${pad_zero(
      d.getDate()
   )}`;

const update_date = (options) => {
   if (!options || !options.date) {
      throw new Error("Missing `options.date`");
   }
   return (tree, _file) => {
      if (tree.children[0].type === "yaml") {
         tree.children[0].value["date"] = format_date(options.date);
      }
   };
};

export default update_date;
