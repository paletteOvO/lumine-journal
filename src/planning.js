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
import _ from "lodash";

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
      if (time.indexOf(":") != -1) {
        if (time.indexOf("-") != -1) {
          [start, end] = time.split("-");
        } else {
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
          if (time.indexOf(":") != -1) {
            if (time.indexOf("-") != -1) {
              [start, end] = time.split("-");
            } else {
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
    if (a.start == null || a.start == "" || a.start == undefined) {
      return -1;
    } else if (b.start == null || b.start == "" || b.start == undefined) {
      return 1;
    }
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

const cond = {
  daily: (_meta, _date) => {
    return {
      planning: true,
      todo: true,
    };
  },
  date: (meta, date) => {
    const a = new Date(meta["date"]).getTime();
    const b = new Date(format_date(date)).getTime();

    if (a == b) {
      return {
        planning: false,
        todo: true,
      };
    } else if (a > b) {
      return {
        planning: true,
        todo: false,
      };
    } else {
      return {
        planning: false,
        todo: false,
      };
    }
  },
  due: (meta, date) => {
    const a = new Date(meta["due"]).getTime();
    const b = new Date(format_date(date)).getTime();
    if (a > b) {
      return { todo: true, planning: true };
    } else if (b == a) {
      return { todo: true, planning: false };
    } else {
      return { todo: false, planning: false };
    }
  },
  cron: (meta, date) => {
    if (cronjsMatcher.isTimeMatches(meta["cron"], date.toISOString())) {
      return { planning: true, todo: true };
    } else {
      return { planning: true, todo: false };
    }
  },
};

export const generate_todo = (items, date) => {
  const ret = _.chain(items)
    .map((x) => {
      if (Object.keys(x.meta).length == 0) {
        return new_list_item({ oneshot: true }, x.items);
      }

      if (
        _.some(Object.keys(x.meta), (k) => {
          return cond[k] !== undefined && cond[k](x.meta, date).todo === true;
        })
      ) {
        return new_list_item(x.meta, x.items);
      }

      return null;
    })
    .filter((x) => x != null && x !== undefined)
    .value();
  return ret;
};

export const generate_planning = (items, date) => {
  const ret = _.chain(items)
    .map((x) => {
      if (Object.keys(x.meta).length == 0) {
        return;
      }
      if (
        _.chain(Object.keys(x.meta))
          .map((k) => {
            if (cond[k] !== undefined) {
              const ret = cond[k](x.meta, date);
              return ret;
            }
            return undefined;
          })
          .filter((x) => x !== undefined && x !== null)
          .some((x) => x.planning === true)
          .value()
      ) {
        return new_list_item(x.meta, x.items);
      }
    })
    .filter((x) => x !== null && x !== undefined)
    .value();

  return ret;
};
