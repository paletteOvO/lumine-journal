const pad_zero = (s) => s.toString().padStart(2, "0");
const format_date = (d) =>
   `${pad_zero(d.getFullYear())}-${pad_zero(d.getMonth() + 1)}-${pad_zero(
      d.getDate()
   )}`;

const parse_meta = (meta_node) => {
   const meta = {};
   meta_node.children.forEach((x) => {
      if (x.value.indexOf(":") == 0) {
         const [k, v] = x.value.slice(1).split(/ (.*)/s);
         if (v === undefined) {
            meta[k] = true;
         } else {
            meta[k] = v;
         }
      }
   });
   return meta;
};

export { pad_zero, format_date, parse_meta };
