import fs from "fs/promises";
import { unified } from "unified";

import clearContent from "./clear.js";
import generateJournal from "./journal.js";
import generateLedger from "./ledger.js";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import updateDate from "./update_date.js";
import updateUuid from "./update_uuid.js";
import yamlParse from "./parse_yaml.js";
import yamlStringify from "./stringify_yaml.js";

const main = async () => {
   const argv = process.argv.splice(process.argv.indexOf("--") + 1);

   const generator = argv[0];
   const data = await fs.readFile(argv[1], "utf-8");
   const date = new Date(argv[2]);
   switch (generator) {
      case "journal": {
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
               // auto link causing more trouble than resource link
               resourceLink: true,
            })
            .process(data);
         console.log(String(file));
         break;
      }
      case "ledger": {
         const file = await unified()
            .use(remarkParse)
            .use(remarkFrontmatter)
            .use(remarkGfm)
            .use(yamlParse)
            .use(generateLedger)
            .process(data);
         console.log(String(file));
         break;
      }
   }
};

main();
