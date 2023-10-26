import MarkdownIt from "markdown-it";
import { sub } from "@mdit/plugin-sub";
import { sup } from "@mdit/plugin-sup";
import { tasklist } from "@mdit/plugin-tasklist";
import { imgLazyload } from "@mdit/plugin-img-lazyload";

export const converter = new MarkdownIt()
converter.use(sub);
converter.use(sup)
converter.use(tasklist)
converter.use(imgLazyload)