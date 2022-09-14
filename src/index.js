import fs from "fs/promises";
import { unified } from "unified";

import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import generateJournal from "./journal.js";
import yamlParse from "./parse_yaml.js";
import yamlStringify from "./stringify_yaml.js";
import clearContent from "./clear.js";
import updateDate from "./update_date.js";
import updateUuid from "./update_uuid.js";
main();

async function main() {
  const argv = process.argv.splice(process.argv.indexOf("--") + 1);
  const data = await fs.readFile(argv[0], "utf-8");
  const date = new Date(argv[1]);
  const file = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(yamlParse)
    .use(generateJournal, { target_date: date })
    .use(clearContent)
    .use(updateDate, { date })
    .use(updateUuid)
    .use(yamlStringify)
    .use(remarkStringify, {
      bullet: "-",
      listItemIndent: "one",
    })
    .process(data);

  console.log(String(file));
}
