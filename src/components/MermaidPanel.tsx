"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { X, Maximize2, Minimize2, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MermaidNode {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MermaidPanelProps {
  mermaidCode: string;
  isOpen: boolean;
  onClose: () => void;
  onNodeSelect: (nodeIds: string[]) => void;
}

export default function MermaidPanel({ mermaidCode, isOpen, onClose, onNodeSelect }: MermaidPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [nodes, setNodes] = useState<MermaidNode[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // 初始化 mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '16px',
        primaryColor: '#444444',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#666666',
        lineColor: '#ffffff',
        secondaryColor: '#444444',
        tertiaryColor: '#444444',
        mainBkg: '#333333',
        nodeBorder: '#666666',
        clusterBkg: '#222222',
        clusterBorder: '#555555',
        titleColor: '#ffffff',
        edgeLabelBackground: '#333333',
        textColor: '#ffffff',
        darkMode: false,
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 20,
        nodeSpacing: 50,
        rankSpacing: 50,
      },
      sequence: {
        useMaxWidth: true,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        messageAlign: 'center',
      },
      class: {
        useMaxWidth: true,
      },
    });
  }, []);

  // 渲染 mermaid 图表
  useEffect(() => {
    if (!isOpen || !mermaidCode || !containerRef.current) return;

    const renderMermaid = async () => {
      try {
        setRenderError(null);
        const { svg } = await mermaid.render('mermaid-svg-' + Date.now(), mermaidCode);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          svgRef.current = containerRef.current.querySelector('svg');
          
          // 重置缩放和平移
          setScale(1);
          setPosition({ x: 0, y: 0 });
          
          // 设置 mindmap 的 section edge 颜色为白色
          if (svgRef.current) {
            const sectionEdges = svgRef.current.querySelectorAll('.sectionEdge, .mindmap-section-edge, [class*="section-edge"]');
            sectionEdges.forEach(edge => {
              if (edge.tagName === 'path' || edge.tagName === 'line') {
                edge.setAttribute('stroke', '#ffffff');
                const existingStyle = edge.getAttribute('style') || '';
                if (!existingStyle.includes('stroke')) {
                  edge.setAttribute('style', `${existingStyle} stroke: #ffffff;`);
                }
              }
            });
          }
          
          // 提取节点信息
          extractNodes();
        }
      } catch (error) {
        console.error('Mermaid render error:', error);
        setRenderError(error instanceof Error ? error.message : '渲染失败');
      }
    };

    renderMermaid();
  }, [mermaidCode, isOpen]);

  // 处理滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const newScale = Math.min(Math.max(0.1, scale + delta), 5);
    
    setScale(newScale);
  }, [scale]);

  // 处理鼠标按下开始平移
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 只有点击背景时才平移（不是节点）
    const target = e.target as Element;
    if (target.closest('.node, .vertex, .actor, .classGroup, .entity, .pieSlice')) {
      return;
    }
    
    setIsPanning(true);
    setPanStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  // 处理鼠标移动进行平移
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    
    e.preventDefault();
    const newX = e.clientX - panStart.x;
    const newY = e.clientY - panStart.y;
    
    setPosition({ x: newX, y: newY });
  }, [isPanning, panStart]);

  // 处理鼠标释放停止平移
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // 放大
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 5));
  };

  // 缩小
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.1));
  };

  // 重置视图
  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // 提取节点信息
  const extractNodes = useCallback(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const extractedNodes: MermaidNode[] = [];
    
    // 查找所有节点（支持多种 mermaid 版本和图表类型）
    const selectors = [
      '.node',           // flowchart, stateDiagram
      '.vertex',         // flowchart
      '.actor',          // sequenceDiagram
      '.classGroup',     // classDiagram
      '.entity',         // erDiagram
      '.pieSlice',       // pie
      'g[id^="flowchart"]',
      'g[id^="sequence"]',
      'g[id^="class"]',
    ];
    
    const nodeElements = svg.querySelectorAll(selectors.join(', '));
    
    nodeElements.forEach((el, index) => {
      try {
        const bbox = el.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();
        
        // 计算相对于 SVG 的坐标
        const x = bbox.left - svgRect.left;
        const y = bbox.top - svgRect.top;
        
        // 尝试获取节点 ID 和标签
        let id = el.id || `node-${index}`;
        let label = el.textContent?.trim() || `节点 ${index + 1}`;
        
        // 对于没有 ID 的元素，尝试从子元素获取
        if (!el.id) {
          const textEl = el.querySelector('text');
          if (textEl && textEl.textContent) {
            label = textEl.textContent.trim();
          }
        }
        
        // 只添加有实际尺寸的节点
        if (bbox.width > 10 && bbox.height > 10) {
          extractedNodes.push({
            id,
            label,
            x,
            y,
            width: bbox.width,
            height: bbox.height,
          });
        }
      } catch (error) {
        console.warn('Failed to extract node:', error);
      }
    });

    setNodes(extractedNodes);
    
    // 为节点添加点击事件
    extractedNodes.forEach((nodeInfo, index) => {
      const el = nodeElements[index];
      if (el) {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleNodeSelection(nodeInfo.id);
        });
        
        // 添加可点击样式
        el.classList.add('cursor-pointer', 'hover:opacity-80', 'transition-opacity');
      }
    });
  }, []);

  // 切换节点选择
  const toggleNodeSelection = (nodeId: string) => {
    setSelectedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      
      // 更新视觉样式
      if (svgRef.current) {
        const selectors = [
          '.node', '.vertex', '.actor', '.classGroup', '.entity', '.pieSlice',
          'g[id^="flowchart"]', 'g[id^="sequence"]', 'g[id^="class"]',
        ];
        const nodeElements = svgRef.current.querySelectorAll(selectors.join(', '));
        
        nodeElements.forEach((el, index) => {
          const nodeInfo = nodes[index];
          if (nodeInfo && nodeInfo.id === nodeId) {
            if (next.has(nodeId)) {
              // 添加选中样式
              el.classList.add('stroke-2', 'stroke-primary');
              if (el.tagName === 'rect' || el.tagName === 'circle' || el.tagName === 'ellipse') {
                el.classList.add('fill-primary/10');
              }
            } else {
              // 移除选中样式
              el.classList.remove('stroke-2', 'stroke-primary', 'fill-primary/10');
            }
          }
        });
      }
      
      // 通知父组件
      onNodeSelect(Array.from(next));
      return next;
    });
  };

  // 清空选择
  const clearSelection = useCallback(() => {
    setSelectedNodes(new Set());
    onNodeSelect([]);
    
    // 清理所有节点的选中样式
    if (svgRef.current) {
      const selectors = [
        '.node', '.vertex', '.actor', '.classGroup', '.entity', '.pieSlice',
        'g[id^="flowchart"]', 'g[id^="sequence"]', 'g[id^="class"]',
      ];
      const nodeElements = svgRef.current.querySelectorAll(selectors.join(', '));
      
      nodeElements.forEach(el => {
        el.classList.remove('stroke-2', 'stroke-primary', 'fill-primary/10');
      });
    }
  }, [onNodeSelect]);

  // 点击背景清空选择
  useEffect(() => {
    if (!svgRef.current) return;
    
    const handleSvgClick = (e: MouseEvent) => {
      const target = e.target as Element;
      // 如果点击的是 SVG 背景而不是节点
      if (target === svgRef.current || target.tagName === 'svg') {
        clearSelection();
      }
    };

    svgRef.current.addEventListener('click', handleSvgClick);
    return () => {
      svgRef.current?.removeEventListener('click', handleSvgClick);
    };
  }, [clearSelection]);

  // 切换全屏
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isOpen) return null;

  return (
    <Card className={`
      relative bg-background border-l shadow-lg transition-all duration-300 ease-in-out
      ${isFullscreen ? 'fixed inset-4 z-50 m-auto w-fit h-fit' : 'w-1/2 h-full rounded-none'}
      ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
    `}>
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">Mermaid 图表</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="h-7 w-7 p-0"
              title="缩小"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              className="h-7 w-7 p-0"
              title="放大"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetView}
              className="h-7 px-2 text-xs"
              title="重置视图"
            >
              <Move className="h-3 w-3 mr-1" />
              重置
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-7 w-7 p-0"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        className="p-4 h-[calc(100%-50px)] overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {renderError ? (
          <div className="text-red-500 text-sm p-4">
            <p className="font-semibold mb-2">渲染错误:</p>
            <pre className="whitespace-pre-wrap text-xs">{renderError}</pre>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.1s ease-out',
              }}
              ref={containerRef}
              className="inline-block"
            />
          </div>
        )}
      </div>
      
      {selectedNodes.size > 0 && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary font-medium">
                已选择 {selectedNodes.size} 个节点
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="h-6 text-xs"
              >
                清除选择
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {Array.from(selectedNodes).map(nodeId => {
                const node = nodes.find(n => n.id === nodeId);
                return (
                  <span
                    key={nodeId}
                    className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full"
                  >
                    {node?.label || nodeId}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
