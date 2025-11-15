import { cn } from "@/lib/utils";
import "@/markdown.css";
import { useEffect, useState } from "react";
import production from "react/jsx-runtime";
import rehypeReact from "rehype-react";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export default function Markdown({
  source,
  className = "",
}: {
  source: string;
  className?: string;
}) {
  const [content, setContent] = useState(<>loading</>);

  useEffect(() => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkBreaks)
      .use(remarkRehype)
      .use(rehypeReact, production);
    processor.process(source).then((data: any) => {
      setContent(data.result);
    });
  }, [source]);

  return <div className={cn(className, "markdown-body")}>{content}</div>;
}
