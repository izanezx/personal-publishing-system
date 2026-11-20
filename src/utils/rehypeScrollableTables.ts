import { visit } from "unist-util-visit";
import type { RehypePlugin } from "@astrojs/markdown-remark";

const rehypeScrollableTables: RehypePlugin = () => tree => {
  visit(tree, "element", (node, index, parent) => {
    if (node.tagName !== "table" || !parent || index === undefined) return;
    if (
      parent.type === "element" &&
      Array.isArray(parent.properties.className) &&
      parent.properties.className.includes("table-scroll")
    )
      return;
    parent.children[index] = {
      type: "element",
      tagName: "div",
      properties: { className: ["table-scroll"], tabIndex: 0 },
      children: [node],
    };
  });
};
export default rehypeScrollableTables;
