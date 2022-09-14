/* 
type Agenda = {
  meta: {
    [key]: string;
  };
  items: [
    {
      content: string;
      start: string?;
      end: string?;
      done: boolean?;
    }
  ]
};
*/
import * as cronjsMatcher from "@datasert/cronjs-matcher";

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
      meta[k] = v;
    }
  });
  return meta;
};

export const parse_planning = (list_node) => {
  const ret = list_node.children.map((x) => {
    if (x.type != "listItem") {
      console.log("Not a list item, found " + x.type);
      return null;
    }
    if (x.checked != null) {
      const time = x.children[0].children[0].value.split(" ")[0];
      let start;
      let end;
      if (time.indexOf(":") != -1 && time.indexOf("-") != -1) {
        start = time.split("-")[0];
        end = time.split("-")[1];
      } else {
        if (time.indexOf(":") != -1) {
          start = time;
        }
      }
      return {
        meta: {},
        items: [{ content: x.children, start, end, done: x.checked }],
      };
    } else {
      const meta = parse_meta(x.children[0]);

      return {
        meta,
        items: x.children[1].children.map((x) => {
          const time = x.children[0].children[0].value.split(" ")[0];
          let start;
          let end;
          if (time.indexOf(":") != -1 && time.indexOf("-") != -1) {
            start = time.split("-")[0];
            end = time.split("-")[1];
          } else {
            if (time.indexOf(":") != -1) {
              start = time;
            }
          }
          return { content: x.children, start, end, done: x.checked };
        }),
      };
    }
  });
  return ret;
};

const new_list_item = (meta, items) => {
  const new_meta_item = (k, v) => ({
    type: "inlineCode",
    value: v == true ? `:${k}` : `:${k} ${v}`,
  });
  const meta_items = Object.keys(meta).map((k) => new_meta_item(k, meta[k]));
  items.sort((a, b) => {
    const [ha, ma] = a.start.split(":");
    const [hb, mb] = b.start.split(":");
    return ha == hb ? ma - mb : ha - hb;
  });
  const content_items = items.map((x) => {
    return {
      type: "listItem",
      spread: false,
      checked: x.done,
      children: x.content,
    };
  });
  return {
    type: "listItem",
    spread: false,
    checked: null,
    children: [...meta_items, ...content_items],
  };
};

export const generate_todo = (items, date) => {
  return items
    .map((x) => {
      if (x.meta["date"] == format_date(date)) {
        return new_list_item(x.meta, x.items);
      }
      if (new Date(format_date(date)) < new Date(x.meta["due"])) {
        return new_list_item(x.meta, x.items);
      }
      if (Object.keys(x.meta).length == 0) {
        return new_list_item({ oneshot: true }, x.items);
      }
      if (
        x.meta["cron"] !== undefined &&
        cronjsMatcher.isTimeMatches(x.meta["cron"], date.toISOString())
      ) {
        return new_list_item(x.meta, x.items);
      }
    })
    .filter((x) => x != null || x !== undefined);
};

export const generate_planning = (items, date) => {
  return items
    .map((x) => {
      if (x.meta["date"] == format_date(date)) {
      } else if (Object.keys(x.meta).length == 0) {
      } else {
        return new_list_item(x.meta, x.items);
      }
    })
    .filter((x) => x != null || x !== undefined);
};
