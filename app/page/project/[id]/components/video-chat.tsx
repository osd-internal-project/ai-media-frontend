import React, { useEffect, useRef, useState, useCallback, type FC } from 'react';
import {
  Avatar,
  Button,
  Form,
  Input,
  message,
  Upload,
  type UploadFile,
  type UploadProps,
  notification,
  Spin,
  Select,
  Space,
} from 'antd';
import { UserOutlined, PaperClipOutlined, SendOutlined, LikeOutlined, LoadingOutlined } from '@ant-design/icons';
import { axiosCore } from '@/app/lib/axios/axios';
import LogsServices from '@/app/services/logs.service';
import GenerateImageServices from '@/app/services/generate-image.service';
import GalleryServices from '@/app/services/gellory.service';
import Avatars from '@/public/images/Avatar.jpg';
import VideoPlayer from './video-player'; // Import the optimized player
import type { ITFromGenerate } from '@/app/common';
import { TPromptGuideType, TPromptGuide } from '@/app/common/prompt-guide.type';
import PromptGuideServices from '@/app/services/prompt-guide.service';
import type { RcFile } from 'antd/es/upload';
import { Download, Trash } from 'lucide-react';
import VideoItem from './video-player';

interface VideoChatProps {
  projectId: string;
  userId?: string;
  activeKey: 'image' | 'vdo' | 'omnihuman';
  promptGuideTypes?: TPromptGuideType[];
  promptGuideOpenStatus: boolean;
}

interface ChatMessage {
  id?: string;
  type: 'user' | 'ai';
  content?: string;
  images?: { imageUrl: string; thumbnailUrl: string }[]; // We'll store video URLs here for consistency
  username?: string;
  time: string;
  taskId?: string;
  status?: boolean;
}

const VideoChat: FC<VideoChatProps> = ({
  projectId,
  userId,
  activeKey,
  promptGuideTypes = [],
  promptGuideOpenStatus,
}) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const promptguideService = PromptGuideServices(axiosCore);

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const pageSize = 3;

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef<boolean>(true);
  const scrollHeightRef = useRef<number>(0);
  const isLoadingMoreRef = useRef<boolean>(false);
  const lastScrollTop = useRef<number>(0);

  // Fetch Data (Pagination)
  const fetchMessages = useCallback(
    async (currentPage: number, isLoadMore = false) => {
      if (!projectId || (isLoadMore && !hasMore) || loading) return;

      setLoading(true);
      if (isLoadMore) {
        isLoadingMoreRef.current = true;
      }

      try {
        const skip = currentPage * pageSize;
        const response = await LogsServices(axiosCore).findVdo(projectId, skip, pageSize);

        if (Array.isArray(response)) {
          // Check if we got less than pageSize, meaning no more data
          if (response.length < pageSize) {
            setHasMore(false);
          }

          // Process response into ChatMessage format
          const formattedMessages: ChatMessage[] = [];
          const itemsToProcess = [...response].reverse();

          itemsToProcess.forEach((item: any) => {
            // User Message
            formattedMessages.push({
              type: 'user',
              content: item.prompt,
              username: item.users.fullname,
              time: item.createdAt,
              taskId: item.taskId,
              status: item.status,
            });
            // AI Message
            formattedMessages.push({
              type: 'ai',
              content: 'AICave Generated Video',
              images: item.imageUrls,
              username: 'AI Generator',
              time: item.createdAt,
              taskId: item.taskId,
              status: item.status,
            });
          });

          if (isLoadMore) {
            setMessages((prev) => {
              const existingTaskIds = new Set(prev.map((m) => m.taskId));
              const uniqueNewMessages = formattedMessages.filter((m) => !existingTaskIds.has(m.taskId));

              if (uniqueNewMessages.length === 0) {
                setHasMore(false);
                return prev;
              }
              // Add older messages at the beginning
              return [...uniqueNewMessages, ...prev];
            });
          } else {
            setMessages(formattedMessages);
            setTimeout(() => {
              bottomRef.current?.scrollIntoView({ behavior: 'instant' });
            }, 100);
          }
        }
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      } finally {
        setLoading(false);
        if (!isLoadMore) {
          isFirstLoad.current = false;
        }
      }
    },
    [projectId, hasMore, loading]
  );

  // Initial Load
  useEffect(() => {
    if (activeKey === 'vdo' && projectId) {
      setMessages([]);
      setPage(0);
      setHasMore(true);
      isFirstLoad.current = true;
      isLoadingMoreRef.current = false;
      fetchMessages(0);
    }
  }, [projectId, activeKey]);

  // Scroll Handling - Load more when scrolling to TOP
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrollTop = target.scrollTop;
      const scrollThreshold = 50; // Trigger when within 50px of top

      // Check if scrolling up and near the top
      if (
        scrollTop < scrollThreshold &&
        scrollTop < lastScrollTop.current &&
        hasMore &&
        !loading &&
        !isFirstLoad.current
      ) {
        scrollHeightRef.current = target.scrollHeight;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchMessages(nextPage, true);
      }

      lastScrollTop.current = scrollTop;
    },
    [hasMore, loading, page, fetchMessages]
  );

  // Restore scroll position after loading more
  useEffect(() => {
    if (isLoadingMoreRef.current && chatContainerRef.current) {
      const newScrollHeight = chatContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - scrollHeightRef.current;
      chatContainerRef.current.scrollTop = scrollDiff;
      isLoadingMoreRef.current = false;
    }
  }, [messages]);

  // Auto-scroll to bottom on new message submission
  useEffect(() => {
    if (!isFirstLoad.current && page === 0 && bottomRef.current && !isLoadingMoreRef.current && submitting) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, submitting]);

  const onDownloadVideo = async (videoName: string) => {
    try {
      // Assuming downloadImage works for files generally or we need a similar one for video
      const res = await GenerateImageServices(axiosCore).downloadImage(videoName);
      const blob = new Blob([res], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = videoName.split('/').pop() || 'video.mp4';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Download failed');
    }
  };

  const onFinish = async (values: ITFromGenerate) => {
    setCurrentPrompt(values.text);
    setSubmitting(true);

    try {
      const payload: ITFromGenerate = {
        ...values,
        projectId,
        userId,
        type: 'vdo',
      };

      // Handle file upload if any
      if (files.length > 0) {
        const formData = new FormData();
        formData.append('type', 'create-attend');
        files.forEach((file) => formData.append('files', file.originFileObj as Blob));
        const uploadedImages = await GenerateImageServices(axiosCore).upload(formData);
        payload.image = uploadedImages;
      }

      const response = await GenerateImageServices(axiosCore).create(payload);

      if (response.status === 400) {
        messageApi.error(`${response.data}`);
        setSubmitting(false);
        return;
      }

      // Clear form immediately after successful submission
      form.resetFields();
      setFiles([]);

      // Poll for task completion
      const checkStatus = async () => {
        try {
          const task = await GenerateImageServices(axiosCore).findById(response.data.id);

          if (task?.status === 'succeeded') {
            if (task && task.content) {
              const taskId = task.id;
              const updateData = {
                content: task.content,
                status: 'success',
                tokenUsed: task.usage?.total_tokens || 0,
              };

              const updateLogs = await LogsServices(axiosCore).findByTaskId(taskId, updateData);

              if (updateLogs) {
                messageApi.success('สร้างวิดีโอสำเร็จ');
                form.resetFields();
                setFiles([]);
                setCurrentPrompt('');
                setPage(0);
                setHasMore(true);
                await fetchMessages(0);
                setSubmitting(false);
                return;
              }
            } else {
              messageApi.error('ไม่มีข้อมูลวิดีโอที่ได้รับกลับมา');
              setSubmitting(false);
              return;
            }
          }

          if (task?.status === 'failed') {
            messageApi.error('การสร้างวิดีโอล้มเหลว');
            setSubmitting(false);
            return;
          }

          if (task?.status === 'processing' || task?.status === 'pending') {
            setTimeout(checkStatus, 3000);
            return;
          }

          console.warn('Unknown status:', task?.status);
          setTimeout(checkStatus, 3000);
        } catch (err) {
          console.error('Error checking status:', err);
          messageApi.error('เกิดข้อผิดพลาดระหว่างตรวจสอบสถานะ');
          setSubmitting(false);
        }
      };

      checkStatus();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'An error occurred';
      messageApi.error(msg);
      setSubmitting(false);
    }
  };

  async function onSetPromptText(id: number): Promise<void> {
    const prompt = await promptguideService.findById(String(id));
    const text = form.getFieldValue('text');
    form.setFieldValue('text', text ? text + '\n\n' + prompt.textPrompt : prompt.textPrompt);
  }

  // Common Ratios for Keyframe/Image-to-Video might be same
  const RATIO_SIZE_MAP: Record<string, { width: number; height: number }> = {
    '16:9': { width: 1280, height: 720 },
    '9:16': { width: 720, height: 1280 },
    '1:1': { width: 1024, height: 1024 },
  };

  const handleRatioChange = (ratio: string) => {
    const size = RATIO_SIZE_MAP[ratio];
    if (size) {
      form.setFieldsValue({
        width: size.width,
        height: size.height,
        ratio: ratio,
      });
    }
  };

  return (
    <div className={promptGuideOpenStatus ? 'grid md:grid-cols-4 sm:grid-cols-1 gap-2' : ''}>
      <div className={`h-[calc(100vh-200px)] ${promptGuideOpenStatus ? 'col-span-3' : ''}`}>
        {contextHolder}
        <div className='flex flex-col h-full bg-[#18181b] text-white overflow-hidden relative rounded-xl border border-white/10'>
          {/* Chat Area */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className='flex-1 overflow-y-auto px-4 py-6 scroll-smooth space-y-6 pb-40'
          >
            {/* Loading indicator at top when loading more */}
            {loading && !isFirstLoad.current && (
              <div className='flex justify-center py-4'>
                <div className='w-6 h-6 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin' />
              </div>
            )}

            {/* Empty State / Prompt Guides */}
            {!loading && messages.length === 0 && (
              <div className='text-white pt-10 px-5 flex-1 overflow-auto'>
                <h1 className='text-4xl font-light text-center mb-4'>{`AI Cave : Seedance`}</h1>
                <p className='text-gray-400 text-center mb-10'>
                  {`Kickstart your innovation process with our comprehensive selection of predefined prompts.`}
                </p>
                <div className='grid grid-cols-1 gap-8 max-w-6xl mx-auto'>
                  {promptGuideTypes.map((type) => (
                    <div key={type.id}>
                      <div className='flex items-center justify-center mb-3'></div>
                      <h3 className='text-xl font-semibold text-center mb-3'>{type.title}</h3>
                      <div className='space-y-3 w-full'>
                        {type.promptGuide?.map((item: TPromptGuide, index: number) => (
                          <Button
                            htmlType='button' // Prevent form submission
                            key={item.id || index}
                            size='large'
                            onClick={() => item.id && onSetPromptText(item.id)} // Assuming 'title' is the prompt text, or adjust if there's a specific 'prompt' field
                            className='w-full !bg-gradient-to-r !from-zinc-700 !to-zinc-900 hover:!from-zinc-600 hover:!to-zinc-800 !text-white py-3 px-4 rounded-lg !flex !items-center !justify-between transition-all duration-300 !border-none'
                          >
                            <span className='flex-1 text-left'>{item.title}</span>
                            <span className='ml-auto'>→</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={`${msg.taskId}-${index}`}
                className={`flex gap-4 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'ai' && <Avatar src={Avatars.src} size={40} className='border border-white/10' />}
                <div
                  className={`flex flex-col ${
                    msg.type === 'user' ? 'max-w-[80%] items-end' : 'max-w-full items-start min-w-[480px]'
                  }`}
                >
                  <div className='flex items-center gap-2 mb-1 text-xs text-gray-400'>
                    <span>{msg.username}</span>
                    <span>•</span>
                    <span>
                      {new Date(msg.time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {msg.content && (
                    <div
                      className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-md
                                        ${
                                          msg.type === 'user'
                                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm'
                                            : 'bg-[#27272a] text-gray-200 border border-white/5 rounded-tl-sm'
                                        }`}
                    >
                      {msg.content}
                    </div>
                  )}

                  {/* Video Grid */}
                  {msg.type === 'ai' && msg.images && msg.images.length > 0 && (
                    <div
                      className={`grid gap-4 mt-4 w-full max-w-6xl ${
                        msg.images.length === 1
                          ? 'grid-cols-1'
                          : msg.images.length === 2
                          ? 'grid-cols-1 md:grid-cols-2'
                          : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                      }`}
                    >
                      {msg.images.map((videoData, i) => (
                        <VideoItem key={i} videoData={videoData} onDownloadVideo={onDownloadVideo} />
                      ))}
                    </div>
                  )}
                </div>
                {msg.type === 'user' && (
                  <Avatar
                    icon={<UserOutlined />}
                    size={40}
                    className='bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10'
                  />
                )}
              </div>
            ))}

            {submitting && (
              <>
                {/* User's prompt message */}
                <div className='flex gap-4 justify-end'>
                  <div className='flex flex-col items-end gap-1 max-w-2xl'>
                    <div className='text-xs text-gray-400'>You • {new Date().toLocaleString()}</div>
                    <div className='flex gap-3 items-start'>
                      <div className='bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl px-5 py-3 shadow-lg'>
                        <p className='text-sm leading-relaxed'>{currentPrompt}</p>
                      </div>
                      <Avatar
                        icon={<UserOutlined />}
                        size={40}
                        className='bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10'
                      />
                    </div>
                  </div>
                </div>

                {/* AI loading response */}
                <div className='flex gap-4 justify-start'>
                  <Avatar src={Avatars.src} size={40} className='border border-white/10' />
                  <div className='bg-[#27272a] px-5 py-4 rounded-2xl rounded-tl-sm border border-white/5'>
                    <div className='flex gap-1'>
                      <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                      <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                      <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce'></div>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className='absolute bottom-0 left-0 right-0 p-4 z-10 bg-gradient-to-t from-[#18181b] via-[#18181b] to-transparent pt-10'>
            <div className='max-w-6xl mx-auto relative bg-[#27272a] rounded-3xl p-1 border border-white/10 focus-within:border-purple-500/50 transition-colors shadow-2xl'>
              <Form
                form={form}
                onFinish={onFinish}
                initialValues={{
                  type: 'vdo',
                  width: 1280,
                  height: 720,
                  images: 1,
                  ratio: '16:9',
                  resolution: '1080p',
                  duration: '10',
                }}
              >
                <Form.Item name='type' hidden>
                  <Input />
                </Form.Item>
                <Form.Item name='width' hidden>
                  <Input />
                </Form.Item>
                <Form.Item name='height' hidden>
                  <Input />
                </Form.Item>
                <Form.Item name='ratio' hidden>
                  <Input />
                </Form.Item>
                <Form.Item name='images' hidden>
                  <Input />
                </Form.Item>
                <Form.Item name='resolution' hidden>
                  <Input />
                </Form.Item>
                <Form.Item name='duration' hidden>
                  <Input />
                </Form.Item>

                <div className='flex flex-col gap-2'>
                  <Form.Item name='text' rules={[{ required: true, message: '' }]} style={{ margin: 0 }}>
                    <Input.TextArea
                      placeholder='Describe the video you want to create'
                      autoSize={{ minRows: 2, maxRows: 5 }}
                      className='!bg-transparent !border-none !text-white !placeholder-gray-500 !shadow-none !px-0 !text-base !resize-none !focus:ring-0'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (!submitting) {
                            form.submit();
                          }
                        }
                      }}
                    />
                  </Form.Item>

                  <div className='flex items-center justify-between pt-2'>
                    <div className='flex items-center gap-2'>
                      {/* File Upload (for Image-to-Video if supported) */}
                      <Form.Item name='image' className='mb-0' style={{ marginBottom: 0, lineHeight: 1 }}>
                        <Upload
                          listType='picture'
                          fileList={files}
                          multiple={false} // Maybe single image for video init?
                          maxCount={1}
                          showUploadList={true}
                          disabled={submitting}
                          itemRender={(originNode, file, fileList, actions) => (
                            <div className='flex items-center gap-2 bg-zinc-800 rounded-lg p-2'>
                              <img src={file.thumbUrl} alt='' className='w-12 h-12 object-cover rounded' />
                              <Button size='small' htmlType='button' onClick={actions.remove} type='link' danger>
                                <Trash width={15} />
                              </Button>
                            </div>
                          )}
                        >
                          <div className='w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer'>
                            <PaperClipOutlined className='text-lg' />
                          </div>
                        </Upload>
                      </Form.Item>
                      {/* Resolution Selector */}
                      <Form.Item
                        name='resolution'
                        className='w-full m-0'
                        initialValue={'1080p'}
                        style={{ marginBottom: 0, lineHeight: 1 }}
                      >
                        <Select
                          className='!bg-[#3f3f46] !h-8 !rounded-lg hover:!bg-[#52525b] transition-colors [&_.ant-select-selector]:!pl-3 [&_.ant-select-selector]:!pr-3 [&_.ant-select-selection-item]:!text-white [&_.ant-select-selection-item]:!text-xs [&_.ant-select-selection-item]:!leading-8 min-w-[70px]'
                          styles={{
                            popup: {
                              root: {
                                backgroundColor: '#3f3f46',
                                border: '1px solid #52525b',
                                borderRadius: '8px',
                                padding: '4px',
                              },
                            },
                          }}
                          optionFilterProp='label'
                          placeholder='เลือกความละเอียด'
                          options={[
                            { value: '480p', label: '480p - Standard' },
                            { value: '720p', label: '720p - HD' },
                            { value: '1080p', label: '1080p - Full HD' },
                          ]}
                        />
                      </Form.Item>
                      {/* Ratio Selector */}
                      <Form.Item<ITFromGenerate>
                        className='w-full'
                        name={`ratio`}
                        rules={[{ required: true, message: 'กรุณาเลือกอัตราส่วนของวิดีโอ!' }]}
                        style={{ marginBottom: 0, lineHeight: 1 }}
                      >
                        <Select
                          defaultValue='16:9'
                          onChange={handleRatioChange}
                          variant='borderless'
                          popupMatchSelectWidth={false}
                          className='!bg-[#3f3f46] !h-8 !rounded-lg hover:!bg-[#52525b] transition-colors [&_.ant-select-selector]:!pl-3 [&_.ant-select-selector]:!pr-3 [&_.ant-select-selection-item]:!text-white [&_.ant-select-selection-item]:!text-xs [&_.ant-select-selection-item]:!leading-8 min-w-[70px]'
                          styles={{
                            popup: {
                              root: {
                                backgroundColor: '#3f3f46',
                                border: '1px solid #52525b',
                                borderRadius: '8px',
                                padding: '4px',
                              },
                            },
                          }}
                          options={[
                            { value: '16:9', label: '16:9 - Widescreen' },
                            { value: '4:3', label: '4:3 - Standard' },
                            { value: '1:1', label: '1:1 - Square' },
                            { value: '3:4', label: '3:4 - Portrait' },
                            { value: '9:16', label: '9:16 - Vertical' },
                            { value: '21:9', label: '21:9 - Ultrawide' },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item<ITFromGenerate>
                        className='w-full'
                        name={`duration`}
                        rules={[{ required: true, message: 'กรุณาเลือกความยาวของวิดีโอ!' }]}
                        style={{ marginBottom: 0, lineHeight: 1 }}
                      >
                        <Select
                          className='!bg-[#3f3f46] !h-8 !rounded-lg hover:!bg-[#52525b] transition-colors [&_.ant-select-selector]:!pl-3 [&_.ant-select-selector]:!pr-3 [&_.ant-select-selection-item]:!text-white [&_.ant-select-selection-item]:!text-xs [&_.ant-select-selection-item]:!leading-8 min-w-[70px]'
                          styles={{
                            popup: {
                              root: {
                                backgroundColor: '#3f3f46',
                                border: '1px solid #52525b',
                                borderRadius: '8px',
                                padding: '4px',
                              },
                            },
                          }}
                          optionFilterProp='label'
                          placeholder='เลือกความยาว'
                          allowClear
                          options={[
                            { value: '5', label: '5 วินาที' },
                            { value: '10', label: '10 วินาที' },
                          ]}
                        />
                      </Form.Item>
                    </div>
                    <Button
                      htmlType='submit'
                      size='large'
                      disabled={submitting}
                      className='w-10 h-10 rounded-lg !bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center !border-none !text-zinc-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none'
                    >
                      <SendOutlined className='text-lg' />
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <div className={`${promptGuideOpenStatus ? ' h-[calc(100vh-200px)]  block' : 'hidden'}`}>
        <div className=' h-full bg-[#18181b] text-white overflow-hidden relative rounded-xl border border-white/10'>
          <div className='p-4 '>
            <h2 className='text-lg font-semibold mb-2'>Prompt Guide</h2>
            <div className='text-sm h-full '>
              <div className='flex-1 h-[calc(100vh-270px)] overflow-y-auto'>
                {promptGuideTypes.map((type) => (
                  <div key={type.id}>
                    <h3 className='text-sm font-semibold text-gray-400 mb-3 mt-2'>{type.title}</h3>
                    <div className='space-y-3 w-full'>
                      {type.promptGuide?.map((item: TPromptGuide, index: number) => (
                        <Button
                          htmlType='button' // Prevent form submission
                          key={item.id || index}
                          size='large'
                          onClick={() => item.id && onSetPromptText(item.id)} // Assuming 'title' is the prompt text, or adjust if there's a specific 'prompt' field
                          className='w-full  !whitespace-normal !break-words !h-auto !p-2 !bg-gradient-to-r !from-zinc-700 !to-zinc-900 hover:!from-zinc-600 hover:!to-zinc-800 !text-white py-3 px-4 rounded-lg !flex !items-center  transition-all duration-300 !border-none'
                        >
                          <Space className=' '>{item.title}</Space>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
