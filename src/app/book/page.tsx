"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./pdf.css";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  List,
  Book,
  Pen,
  Eraser,
  Palette,
  Trash2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  AnnotationCanvas,
  AnnotationCanvasHandle,
} from "@/components/AnnotationCanvas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Set up worker using the locally installed pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// 页数偏移：代码中的第 1 页对应 PDF 的第 PAGE_OFFSET + 1 页
const PAGE_OFFSET = 7;

// 预设颜色（适合批注的深色系与柔和色系）
const ANNOTATION_COLORS = [
  "#2C3E50", // 深海蓝 (类似墨水)
  "#E74C3C", // 铁锈红 (醒目批注)
  "#27AE60", // 翡翠绿 (柔和批注)
  "#8E44AD", // 紫晶色 (辅助标记)
  "#F39C12", // 琥珀黄 (重点强调)
  "#2980B9", // 宝石蓝 (经典笔迹)
];

// 手动定义目录
const BOOK_DIRECTORY = [
  { title: "第一单元", page: 1 },
  { title: "1 社戏 / 鲁迅", page: 2 },
  { title: "2 回延安 / 贺敬之", page: 10 },
  { title: "3* 安塞腰鼓 / 刘成章", page: 17 },
  { title: "4* 灯笼 / 吴伯箫", page: 21 },
  { title: "阅读综合实践", page: 25 },
  { title: "写作：考虑目的和对象", page: 26 },
  { title: "第二单元", page: 29 },
  { title: "5 大自然的语言 / 竺可桢", page: 30 },
  { title: "6 阿西莫夫短文两篇", page: 34 },
  { title: "7* 月亮是从哪里来的 / 卞毓麟", page: 40 },
  { title: "8* 时间的脚印 / 陶世龙", page: 45 },
  { title: "阅读综合实践", page: 50 },
  { title: "写作：说明的顺序", page: 52 },
  { title: "专题学习活动：绿水青山，低碳生活", page: 55 },
  { title: "第三单元", page: 61 },
  { title: "9 桃花源记 / 陶渊明", page: 62 },
  { title: "10 小石潭记 / 柳宗元", page: 66 },
  { title: "11* 核舟记 / 魏学洢", page: 68 },
  { title: "12 《诗经》二首（关雎、蒹葭）", page: 71 },
  { title: "阅读综合实践", page: 74 },
  { title: "写作：学写读后感", page: 75 },
  { title: "整本书阅读：《经典常谈》怎样读知识性作品", page: 77 },
  { title: "课外古诗词诵读", page: 81 },
  { title: "第四单元：活动·探究", page: 83 },
  { title: "任务一：学习演讲词", page: 84 },
  { title: "13 最后一次讲演 / 闻一多", page: 85 },
  { title: "14 敬业与乐业 / 梁启超", page: 89 },
  { title: "15 应有格物致知精神 / 丁肇中", page: 95 },
  { title: "16 我一生中的重要抉择 / 王选", page: 99 },
  { title: "任务二：撰写演讲稿", page: 104 },
  { title: "任务三：举办演讲比赛", page: 106 },
  { title: "第五单元", page: 109 },
  { title: "17 壶口瀑布 / 梁衡", page: 110 },
  { title: "18 在长江源头各拉丹冬 / 马丽华", page: 114 },
  { title: "19* 登勃朗峰 / 马克·吐温", page: 119 },
  { title: "20* 一滴水经过丽江 / 阿来", page: 123 },
  { title: "阅读综合实践", page: 127 },
  { title: "写作：学写游记", page: 129 },
  { title: "整本书阅读：《昆虫记》", page: 132 },
  { title: "第六单元", page: 133 },
  { title: "21 《庄子》二则", page: 134 },
  { title: "22 《礼记》二则", page: 137 },
  { title: "23* 马说 / 韩愈", page: 140 },
  { title: "24 唐诗三首（石壕吏、茅屋为秋风所破歌、卖炭翁）", page: 142 },
  { title: "阅读综合实践", page: 146 },
  { title: "写作：负责任地表达", page: 148 },
  { title: "专题学习活动：以和为贵", page: 151 },
  { title: "课外古诗词诵读", page: 156 },
];

export default function BookPage() {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState<string>(ANNOTATION_COLORS[0]);
  const [pageDimensions, setPageDimensions] = useState<{
    [key: number]: { width: number; height: number };
  }>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const canvasRefs = useRef<{ [key: number]: AnnotationCanvasHandle | null }>(
    {},
  );

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  // Handle page render success to get its original size
  const onPageRenderSuccess = (page: any) => {
    setPageDimensions((prev) => ({
      ...prev,
      [page.pageNumber]: {
        width: page.view[2], // Correct way to get the original width
        height: page.view[3], // Correct way to get the original height
      },
    }));
  };

  // 滚动时检测当前是在第几页
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;

    // 找到当前视口中占据比例最大的页面
    let currentPage = 1;
    let maxVisibleHeight = 0;

    for (let i = 1; i <= numPages; i++) {
      const pageEl = pageRefs.current[i];
      if (pageEl) {
        const rect = pageEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const visibleTop = Math.max(rect.top, containerRect.top);
        const visibleBottom = Math.min(rect.bottom, containerRect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        if (visibleHeight > maxVisibleHeight) {
          maxVisibleHeight = visibleHeight;
          currentPage = i;
        }
      }
    }

    if (currentPage !== pageNumber) {
      setPageNumber(currentPage);
    }
  };

  // 点击目录跳转
  const scrollToPage = (pageIdx: number) => {
    const actualPage = pageIdx + PAGE_OFFSET;
    const pageEl = pageRefs.current[actualPage];
    if (pageEl && scrollAreaRef.current) {
      pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/30">
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* 使用原生的 div 配合 scroll-area 的类名以便更好地控制滚动事件 */}
          <div
            ref={scrollAreaRef}
            onScroll={handleScroll}
            className="flex-1 w-full overflow-y-auto overflow-x-hidden bg-muted/20 scroll-smooth"
          >
            <div className="flex flex-col items-center p-4 min-h-full space-y-4">
              <Document
                file="/book.pdf"
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => console.error("Error while loading document!", error)}
                loading={
                  <div className="flex items-center justify-center h-full py-20">
                    加载中...
                  </div>
                }
                className="flex flex-col items-center"
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <div
                    key={`page_${index + 1}`}
                    ref={(el) => {
                      pageRefs.current[index + 1] = el;
                    }}
                    className="shadow-lg bg-white mb-4 transition-transform duration-200 relative"
                  >
                    <Page
                      pageNumber={index + 1}
                      scale={scale}
                      devicePixelRatio={Math.min(
                        2,
                        window.devicePixelRatio || 1,
                      )}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      onRenderSuccess={onPageRenderSuccess}
                      loading={
                        <div
                          className="flex items-center justify-center bg-white"
                          style={{
                            width: 600 * scale,
                            height: 800 * scale,
                          }}
                        >
                          正在加载第 {index + 1} 页...
                        </div>
                      }
                    />
                    {pageDimensions[index + 1] && (
                      <AnnotationCanvas
                        ref={(el) => {
                          canvasRefs.current[index + 1] = el;
                        }}
                        pageNumber={index + 1}
                        width={pageDimensions[index + 1].width * scale}
                        height={pageDimensions[index + 1].height * scale}
                        color={color}
                        tool={tool}
                        scale={scale}
                      />
                    )}
                  </div>
                ))}
              </Document>
            </div>
          </div>
        </div>

        {/* Directory Sidebar */}
        <div
          className={cn("w-64 border-l bg-background flex flex-col h-full p-2")}
        >
          <div className="flex flex-col gap-1 flex-1 overflow-auto">
            {BOOK_DIRECTORY.map((item, index) => {
              const nextItem = BOOK_DIRECTORY[index + 1];
              const displayPage = pageNumber - PAGE_OFFSET;
              const isActive = nextItem
                ? displayPage >= item.page && displayPage < nextItem.page
                : displayPage >= item.page;

              return (
                <button
                  key={index}
                  onClick={() => scrollToPage(item.page)}
                  className={cn(
                    "w-full text-left px-2 py-1 text-sm transition-colors hover:bg-accent rounded-md flex justify-between items-center group",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  <span>{item.title}</span>
                  <span className="text-xs">{item.page}</span>
                </button>
              );
            })}
          </div>

          {/* Annotation Tools */}
          <div className="flex flex-col gap-2 p-2 border-t mt-auto">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant={tool === "pen" ? "default" : "outline"}
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => setTool("pen")}
                >
                  <Pen className="w-4 h-4" />
                </Button>
                <Button
                  variant={tool === "eraser" ? "default" : "outline"}
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => setTool("eraser")}
                >
                  <Eraser className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => {
                    const canvas = canvasRefs.current[pageNumber];
                    if (canvas) {
                      canvas.undo();
                    }
                  }}
                  title="撤销"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="w-8 h-8">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        const canvas = canvasRefs.current[pageNumber];
                        if (canvas) {
                          canvas.clear();
                        }
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      清空本页笔迹
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="grid grid-cols-3 gap-1 justify-end">
                {ANNOTATION_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      setTool("pen");
                    }}
                    className={cn(
                      "w-5 h-5 rounded-full border border-muted-foreground/20 transition-transform",
                      color === c && tool === "pen"
                        ? "scale-125 border-primary ring-1 ring-primary"
                        : "hover:scale-110",
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 pt-0">
            <Button
              variant="outline"
              size="icon"
              onClick={zoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut />
            </Button>
            <span>{Math.round(scale * 100)}%</span>
            <Button
              variant="outline"
              size="icon"
              onClick={zoomIn}
              disabled={scale >= 3.0}
            >
              <ZoomIn />
            </Button>
            <span>当前: P{Math.max(1, pageNumber - PAGE_OFFSET)}</span>
          </div>

          <div className="flex items-center gap-2">{/* ... */}</div>
        </div>
      </div>
    </div>
  );
}
