"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Loader2, Image, X, XCircle, Maximize, Crop } from 'lucide-react';
import type { MessageAttachment } from '@/types';

interface Props {
  onSend: (text: string, attachments?: MessageAttachment[], selectedNodes?: string[]) => void;
  disabled?: boolean;
  initialValue?: string;
  selectedNodeCount?: number; // 选中的 Mermaid 节点数量
  onClearNodeSelection?: () => void; // 清空节点选择
  selectedNodes?: string[]; // 选中的节点 ID 列表
}

export default function ChatInput({ onSend, disabled, initialValue, selectedNodeCount = 0, onClearNodeSelection, selectedNodes = [] }: Props) {
  const [text, setText] = useState(initialValue ?? '');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [selection, setSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectStart, setSelectStart] = useState<{ x: number; y: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 自适应高度
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [text]);

  // 清理摄像头
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: MessageAttachment[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      
      const base64 = await fileToBase64(file);
      newAttachments.push({
        type: 'image',
        url: base64,
        mimeType: file.type,
      });
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    // 重置 input 以允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      setShowCamera(true);
      
      // 等待 DOM 更新后设置视频源并播放
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => {
            console.error('视频播放失败:', err);
          });
        }
      }, 100);
    } catch (err) {
      console.error('无法访问摄像头:', err);
      alert('无法访问摄像头，请确保已授予权限');
    }
  };

  const capturePhoto = (useFullImage: boolean = false) => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (useFullImage || !selection) {
      // 使用全图
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
    } else {
      // 使用框选区域
      const scaleX = video.videoWidth / video.clientWidth;
      const scaleY = video.videoHeight / video.clientHeight;
      
      canvas.width = selection.width;
      canvas.height = selection.height;
      
      ctx.drawImage(
        video,
        selection.x * scaleX,
        selection.y * scaleY,
        selection.width * scaleX,
        selection.height * scaleY,
        0,
        0,
        selection.width,
        selection.height
      );
    }
    
    const base64 = canvas.toDataURL('image/jpeg');
    
    setAttachments(prev => [...prev, {
      type: 'image',
      url: base64,
      mimeType: 'image/jpeg',
    }]);
    
    closeCamera();
  };

  // 鼠标按下开始选择
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSelectStart({ x, y });
    setSelection({ x, y, width: 0, height: 0 });
    setIsSelecting(true);
  };

  // 鼠标移动更新选择区域
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !selectStart || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const width = currentX - selectStart.x;
    const height = currentY - selectStart.y;
    
    setSelection({
      x: width < 0 ? currentX : selectStart.x,
      y: height < 0 ? currentY : selectStart.y,
      width: Math.abs(width),
      height: Math.abs(height),
    });
  };

  // 鼠标松开结束选择
  const handleMouseUp = () => {
    setIsSelecting(false);
    setSelectStart(null);
  };

  // 触摸支持
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setSelectStart({ x, y });
    setSelection({ x, y, width: 0, height: 0 });
    setIsSelecting(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSelecting || !selectStart || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;
    
    const width = currentX - selectStart.x;
    const height = currentY - selectStart.y;
    
    setSelection({
      x: width < 0 ? currentX : selectStart.x,
      y: height < 0 ? currentY : selectStart.y,
      width: Math.abs(width),
      height: Math.abs(height),
    });
  };

  const handleTouchEnd = () => {
    setIsSelecting(false);
    setSelectStart(null);
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if ((!trimmed && attachments.length === 0) || disabled) return;
    onSend(trimmed, attachments.length > 0 ? attachments : undefined, selectedNodes.length > 0 ? selectedNodes : undefined);
    setText('');
    setAttachments([]);
    // reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 图片预览 */}
      {attachments.length > 0 && (
        <div className="flex gap-2 px-4 py-2 border-t border-border bg-background overflow-x-auto">
          {attachments.map((att, idx) => (
            <div key={idx} className="relative shrink-0">
              <img
                src={att.url}
                alt="预览"
                className="h-20 w-20 object-cover rounded border"
              />
              <button
                onClick={() => removeAttachment(idx)}
                className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                type="button"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 摄像头模态框 */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-background rounded-lg p-4 max-w-md w-full mx-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg bg-muted"
              />
              {/* 选择遮罩层 */}
              <div
                ref={overlayRef}
                className="absolute inset-0 cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {selection && selection.width > 0 && selection.height > 0 && (
                  <div
                    className="absolute border-2 border-white pointer-events-none"
                    style={{
                      left: selection.x,
                      top: selection.y,
                      width: selection.width,
                      height: selection.height,
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                    }}
                  />
                )}
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSelection(null);
                  closeCamera();
                }}
                className="flex-1"
              >
                <XCircle />
                取消
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelection(null);
                  capturePhoto(true);
                }}
                className="flex-1"
              >
                <Maximize />
                使用全图
              </Button>
              <Button
                onClick={() => capturePhoto(false)}
                disabled={!selection || selection.width === 0 || selection.height === 0}
                className="flex-1"
              >
                <Crop />
                框选拍照
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              在画面上拖动选择要截取的区域，或点击"使用全图"截取完整画面
            </p>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 px-4 py-3 border-t border-border bg-background shrink-0">
        {/* 显示选中的节点数量 */}
        {selectedNodeCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg shrink-0">
            <span className="text-xs text-primary font-medium">
              已选择 {selectedNodeCount} 个节点
            </span>
            {onClearNodeSelection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearNodeSelection}
                className="h-5 w-5 p-0 hover:bg-primary/20"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
        
        {/* <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          size="icon"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          aria-label="上传图片"
          className="shrink-0 size-10"
        >
          <Image className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={openCamera}
          disabled={disabled}
          aria-label="打开摄像头"
          className="shrink-0 size-10"
        >
          <Image className="size-4" />
        </Button> */}
        <Textarea
          ref={textareaRef}
          rows={1}
          placeholder="输入消息…（Shift+Enter 换行）"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="resize-none min-h-10 max-h-45 overflow-y-auto"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={disabled || (!text.trim() && attachments.length === 0)}
          aria-label="发送"
          className="shrink-0 size-10"
        >
          {disabled ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <SendHorizonal className="size-4" />
          )}
        </Button>
      </div>
    </>
  );
}
