"use client";

import React, { useMemo, useState } from "react";
import { axiosCore } from "@/app/lib/axios/axios";
import { Card, Form, Input, Button } from "antd";
import ContactSaleLogServices from "@/app/services/contact-sale-log.service";
import { TContactSaleLog } from "@/app/common/contact-sale-log.type";
import { MessageInstance } from "antd/es/message/interface";
// import { message } from "antd";
interface props {
  messageApi: MessageInstance;
}
export default function ContactForm({ messageApi }: props) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const contactSaleLogService = useMemo(
    () => ContactSaleLogServices(axiosCore),
    [],
  );

  async function handleSubmitForm(values: TContactSaleLog) {
    try {
      setLoading(true);
      await contactSaleLogService.create(values);
      messageApi.success("Success! We have received your contact details.");
      // form.resetFields();
    } catch (error) {
      // console.error(error);
      messageApi.error("Failed to submit contact form.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section
        className="relative flex w-full flex-col items-center overflow-hidden bg-[#0a0a0f] bg-cover bg-center bg-no-repeat px-4 pb-10 pt-24 sm:px-5 sm:pb-12 sm:pt-28 md:pt-[112px]"
        style={{ backgroundImage: 'url("/images/herosection/bg.png")' }}
      >
        {/* <Navbar /> */}
        {/* Background Collage representing Image 2 */}

        {/* Gradient overlays to match Hero image 1 dark fading */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 0,
            background:
              "linear-gradient(to bottom, rgba(10, 10, 15, 0.8), rgba(10, 10, 15, 0.6), rgba(10, 10, 15, 1))",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 0,
            background:
              "radial-gradient(circle at center, transparent 0%, #0a0a0f 90%)",
            pointerEvents: "none",
          }}
        />
        <div className="z-10 w-full overflow-hidden pb-10 sm:pb-16">
          <div className="mx-auto w-full max-w-7xl px-0 sm:px-2 md:px-4">
            <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-14">
              <div className="order-2 flex flex-col justify-center md:order-1 md:items-start">
                <h1 className="max-w-xl text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-left md:text-4xl lg:text-5xl">
                  Unlock a New Standard of Creative Performance with{" "}
                  <span className=" bg-gradient-to-r from-[#6366F1] to-[#87DDDE] bg-clip-text text-transparent">
                    Ai Cave
                  </span>{" "}
                  .
                </h1>
                <p className="mt-4 max-w-xl text-center text-sm text-white/80 sm:text-base md:text-left md:text-lg">
                  From concept to production in minutes, AiCave enables
                  enterprises to accelerate content creation, optimize
                  resources, and lead every campaign with confidence and
                  clarity.
                </p>
              </div>
              <div className="order-1 flex flex-col justify-center md:order-2 md:items-end">
                <Card
                  bordered={false}
                  style={{
                    background: "rgba(30, 25, 45, 0.4)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
                    borderRadius: "28px",
                    width: "100%",
                    maxWidth: "640px",
                  }}
                  styles={{
                    body: { padding: "24px" },
                  }}
                  className="w-full max-w-[640px] sm:[&_.ant-card-body]:!p-8"
                >
                  <div className="mb-6 text-center sm:mb-8">
                    <p className="text-[11px] text-gray-300 font-bold uppercase tracking-[0.15em] mb-4">
                      Contact Us
                    </p>
                    <h2 className="text-xl font-medium leading-snug tracking-tight text-white sm:text-2xl">
                      Please fill out your details so our team can get back to
                      you promptly
                    </h2>
                  </div>

                  <Form
                    disabled={loading}
                    form={form}
                    layout="vertical"
                    className="w-full"
                    onFinish={handleSubmitForm}
                  >
                    <div className="flex flex-col gap-x-4 md:flex-row">
                      <Form.Item
                        name="firstName"
                        rules={[{ message: "Please Enter", required: true }]}
                        label={
                          <span className="text-gray-300 text-xs font-bold uppercase tracking-wide mb-1 block">
                            First Name
                          </span>
                        }
                        className="flex-1 mb-4"
                      >
                        <Input
                          placeholder="First Name"
                          className="h-12 rounded-full border-none bg-white px-5 text-base text-gray-900 shadow-sm placeholder:text-gray-600 sm:px-6"
                        />
                      </Form.Item>
                      <Form.Item
                        name="lastName"
                        rules={[{ message: "Please Enter", required: true }]}
                        label={
                          <span className="text-gray-300 text-xs font-bold uppercase tracking-wide mb-1 block">
                            Last Name
                          </span>
                        }
                        className="flex-1 mb-4"
                      >
                        <Input
                          placeholder="Last Name"
                          className="h-12 rounded-full border-none bg-white px-5 text-base text-gray-900 shadow-sm placeholder:text-gray-600 sm:px-6"
                        />
                      </Form.Item>
                    </div>

                    <Form.Item
                      name="companyName"
                      // rules={[{ message: "Please Enter", required: true }]}
                      label={
                        <span className="text-gray-300 text-xs font-bold uppercase tracking-wide mb-1 block">
                          Company Name
                        </span>
                      }
                      className="mb-4"
                    >
                      <Input
                        placeholder="Company name"
                        className="h-12 rounded-full border-none bg-white px-5 text-base text-gray-900 shadow-sm placeholder:text-gray-600 sm:px-6"
                      />
                    </Form.Item>

                    <Form.Item
                      name="email"
                      rules={[{ message: "Please Enter", required: true }]}
                      label={
                        <span className="text-gray-300 text-xs font-bold uppercase tracking-wide mb-1 block">
                          Email
                        </span>
                      }
                      className="mb-4"
                    >
                      <Input
                        placeholder="Email"
                        type="email"
                        className="h-12 rounded-full border-none bg-white px-5 text-base text-gray-900 shadow-sm placeholder:text-gray-600 sm:px-6"
                      />
                    </Form.Item>

                    <Form.Item
                      name="phoneNumber"
                      rules={[{ message: "Please Enter", required: true }]}
                      label={
                        <span className="text-gray-300 text-xs font-bold uppercase tracking-wide mb-1 block">
                          Phone Number
                        </span>
                      }
                      className="mb-4"
                    >
                      <Input
                        placeholder="Phone Number"
                        className="h-12 rounded-full border-none bg-white px-5 text-base text-gray-900 shadow-sm placeholder:text-gray-600 sm:px-6"
                      />
                    </Form.Item>

                    <Form.Item
                      name="message"
                      rules={[{ message: "Please Enter", required: true }]}
                      label={
                        <span className="text-gray-300 text-xs font-bold uppercase tracking-wide mb-1 block">
                          Message
                        </span>
                      }
                      className="mb-8"
                    >
                      <Input.TextArea
                        placeholder="Your message"
                        className="min-h-[140px] rounded-3xl border-none bg-white px-5 py-4 text-base text-gray-900 shadow-sm placeholder:text-gray-600 sm:px-6"
                      />
                    </Form.Item>

                    <div className="mt-2 flex justify-center md:justify-start">
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="h-[52px] min-w-[200px] w-full rounded-full border-none bg-[#6966FF] px-10 text-base font-medium shadow-lg hover:bg-[#5A55CC] sm:min-w-[240px] sm:text-lg md:w-auto"
                      >
                        Submit
                      </Button>
                    </div>
                  </Form>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
