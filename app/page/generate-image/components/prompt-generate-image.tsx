import type { ITFromGenerate } from "@/app/common";
import { Button, Form, Input, Spin, Upload, type FormInstance, type UploadProps } from "antd";
import React, { type FC, type ReactElement } from "react";

import { DownloadOutlined, HomeOutlined, PictureOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons";

export interface props {
  formcreateImage: FormInstance;
  onFinish: (values: ITFromGenerate) => void;
  handleChangeFiles: UploadProps["onChange"];
  beforeUploadFiles: UploadProps["beforeUpload"];
  files: any;
  loading: boolean;
  getdata: any;
  setData: any;
}

const PromptGenerateImage: FC<props> = ({
  formcreateImage,
  onFinish,
  handleChangeFiles,
  beforeUploadFiles,
  files,
  loading,
  getdata,
  setData,
}): ReactElement => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="order-2 lg:order-1">
          <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8 shadow-2xl h-full">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              {`สร้างรูปภาพของคุณ`}
            </h2>
            <Form
              form={formcreateImage}
              name="form-generate"
              autoComplete="off"
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ type: "image" }}
              className="space-y-6">
              <Form.Item name="type" hidden>
                <Input />
              </Form.Item>
              {/* Prompt Input */}
              <Form.Item
                name="text"
                label={<span className="text-purple-300 font-semibold text-base">Prompt</span>}
                rules={[{ required: true, message: "กรุณากรอก prompt!" }]}>
                <Input.TextArea
                  placeholder="พิมพ์ prompt ของคุณที่นี่... เช่น 'A futuristic city with neon lights and flying cars'"
                  rows={6}
                  className="bg-purple-950/50 border-purple-400/50 hover:border-purple-400 focus:border-purple-400 text-white placeholder-purple-400/50 rounded-lg"
                />
              </Form.Item>
              <Form.Item name="image">
                <Upload
                  fileList={files}
                  onChange={handleChangeFiles}
                  beforeUpload={beforeUploadFiles}
                  multiple={false}
                  maxCount={1}
                  onPreview={() => {}}
                  listType="picture-card"
                  className="upload-dark">
                  <div className="text-purple-300 hover:text-purple-200 transition-colors flex flex-col items-center justify-center">
                    <PlusOutlined className="text-3xl mb-2" />
                    <div className="text-sm font-medium">{`เพิ่มรูปภาพ`}</div>
                    <div className="text-xs text-purple-400 mt-1">{`PNG, JPG (MAX. 5MB)`}</div>
                  </div>
                </Upload>
              </Form.Item>
              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SendOutlined />}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 border-0 hover:from-purple-600 hover:to-indigo-600 h-14 text-lg font-semibold">
                  {`สร้างรูปภาพด้วย AI`}
                </Button>
              </Form.Item>
            </Form>
            <div className="mt-8">
              {loading ? (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-12">
                  <div className="flex flex-col justify-center items-center space-y-4">
                    <div className="relative">
                      <Spin size="large" />
                      <div className="absolute inset-0 animate-ping bg-purple-500/20 rounded-full"></div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-white mb-2">กำลังสร้างรูปภาพ AI</h3>
                      <p className="text-gray-400">โปรดรอสักครู่ เรากำลังประมวลผล Prompt ของคุณ...</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {Array.isArray(getdata?.data) && getdata.data.length > 0 && getdata.data[0]?.url && (
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
                      {/* Image Header */}
                      <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 p-6 border-b border-gray-700/50">
                        <div className="flex items-center gap-3">
                          <PictureOutlined className="text-2xl text-purple-400" />
                          <h3 className="text-xl font-semibold text-white">รูปภาพที่สร้างเสร็จแล้ว</h3>
                          <div className="ml-auto px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">สำเร็จ</div>
                        </div>
                      </div>
                      {/* Image Content */}
                      <div className="p-8">
                        <div className="flex flex-col items-center space-y-6">
                          <div className="relative group">
                            <img
                              src={getdata.data[0].url}
                              width="600"
                              className="rounded-xl shadow-2xl border border-gray-600/50 group-hover:shadow-purple-500/20 transition-all duration-300 max-w-full h-auto"
                              alt="AI Generated Image"
                            />
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl -z-10 group-hover:from-purple-500/40 group-hover:to-cyan-500/40 transition-all duration-300"></div>
                          </div>
                          {/* Download Section */}
                          <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50 w-full max-w-md">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                                  <DownloadOutlined className="text-white" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-white">พร้อมดาวน์โหลด</h4>
                                  <p className="text-gray-400 text-sm">คลิกเพื่อบันทึกรูปภาพ</p>
                                </div>
                              </div>
                              <Button
                                className="bg-gradient-to-r from-green-500 to-emerald-500 border-none hover:from-green-600 hover:to-emerald-600 px-6 py-2 h-auto rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                onClick={() => {
                                  window.open(getdata.data[0].url, "_blank");
                                  setData({});
                                }}>
                                <DownloadOutlined className="mr-2" />
                                ดาวน์โหลด
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2 space-y-6">
          {/* Info Card */}
          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">{`คำแนะนำในการใช้งาน`}</h3>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-purple-300 font-semibold mb-3 flex items-center">
                  <span className="w-6 h-6 bg-purple-500/30 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
                  {` เขียน Prompt ที่ดี`}
                </h4>
                <ul className="text-purple-200 space-y-2 text-sm ml-8">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>{`ระบุรายละเอียดที่ชัดเจน เช่น สี, แสง, มุมมอง, สไตล์`}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>{`ใช้คำคุณศัพท์ที่เฉพาะเจาะจง เช่น "ultra detailed", "cinematic lighting"`}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">{`•`}</span>
                    <span>{`เพิ่มข้อมูลเกี่ยวกับสไตล์ศิลปะ เช่น "anime", "photorealistic", "oil painting"`}</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-purple-500/20 pt-6">
                <h4 className="text-purple-300 font-semibold mb-3 flex items-center">
                  <span className="w-6 h-6 bg-purple-500/30 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
                  การอัพโหลดรูปอ้างอิง
                </h4>
                <ul className="text-purple-200 space-y-2 text-sm ml-8">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>รองรับไฟล์ PNG, JPG ขนาดไม่เกิน 5MB</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>AI จะใช้รูปภาพเป็นแนวทางในการสร้างภาพใหม่</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>เหมาะสำหรับการปรับแต่งหรือสร้างแบบใหม่จากรูปเดิม</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Example Prompts */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
            <h3 className="text-purple-300 font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              {`ตัวอย่าง Prompt`}
            </h3>
            <div className="space-y-3">
              <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer">
                <p className="text-purple-200 text-sm">
                  {`A cyberpunk city at night with neon signs, rain, and flying cars, ultra detailed, cinematic lighting`}
                </p>
              </div>
              <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer">
                <p className="text-purple-200 text-sm">
                  {`Beautiful anime girl with long purple hair, detailed eyes, fantasy background, studio ghibli style`}
                </p>
              </div>
              <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer">
                <p className="text-purple-200 text-sm">
                  {`Majestic dragon flying over mountains, sunset, photorealistic, 8k resolution, epic composition`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PromptGenerateImage;
