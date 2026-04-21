"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
// import Navbar from "./Navbar";
import PricingCards from "@/app/components/package/PricingCards";
import { useRouter } from "next/navigation";
import PlanServices from "@/app/services/plan.service";
import { TPlan, TPlanInterval } from "@/app/common/plan.type";
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
  const [windowWidth, setWindowWidth] = useState(1200);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);
  const [mounted, setMounted] = useState(false);
  const [form] = Form.useForm();

  const contactSaleLogService = useMemo(
    () => ContactSaleLogServices(axiosCore),
    [],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  async function handleSubmitForm(values: TContactSaleLog) {
    try {
      setLoading(true);
      await contactSaleLogService.create(values);
      messageApi.success("Success! We have received your contact details.");
      form.resetFields();
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
        ref={sectionRef}
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "112px",
          paddingBottom: "40px",
          paddingLeft: "16px",
          paddingRight: "16px",
          overflow: "hidden",
          backgroundColor: "#0a0a0f",
          backgroundImage: 'url("/images/herosection/bg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
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
        <div className=" pb-16 overflow-hidden z-10">
          <div className="container mx-auto px-4">
            <div className=" grid md:grid-cols-2 sm:grid-cols-1">
              <div className=" hidden  md:flex flex-col justify-center items-center">
                <h1 className="text-4xl md:text-4xl font-bold tracking-tight">
                  Unlock a New Standard of Creative Performance with{" "}
                  <span className=" bg-gradient-to-r from-[#6366F1] to-[#87DDDE] bg-clip-text text-transparent">
                    Ai Cave
                  </span>{" "}
                  .
                </h1>
                <p className="text-lg">
                  From concept to production in minutes, AiCave enables
                  enterprises to accelerate content creation, optimize
                  resources, and lead every campaign with confidence and
                  clarity.
                </p>
              </div>
              <div className="flex flex-col justify-center items-center">
                <Card
                  bordered={false}
                  style={{
                    background: "rgba(30, 25, 45, 0.4)",
                    // backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
                    borderRadius: "32px",
                    width: "100%",
                  }}
                  styles={{
                    body: { padding: "40px" },
                  }}
                >
                  <div className="text-center mb-8">
                    <p className="text-[11px] text-gray-300 font-bold uppercase tracking-[0.15em] mb-4">
                      Contact Us
                    </p>
                    <h2 className="text-2xl font-medium text-white tracking-tight leading-snug">
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
                    <div className="flex flex-col md:flex-row gap-x-4">
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
                          className="h-12 rounded-full px-6 bg-white border-none text-gray-900 placeholder:text-gray-600 text-base shadow-sm"
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
                          className="h-12 rounded-full px-6 bg-white border-none text-gray-900 placeholder:text-gray-600 text-base shadow-sm"
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
                        className="h-12 rounded-full px-6 bg-white border-none text-gray-900 placeholder:text-gray-600 text-base shadow-sm"
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
                        className="h-12 rounded-full px-6 bg-white border-none text-gray-900 placeholder:text-gray-600 text-base shadow-sm"
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
                        className="h-12 rounded-full px-6 bg-white border-none text-gray-900 placeholder:text-gray-600 text-base shadow-sm"
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
                        className="rounded-3xl px-6 py-4 bg-white border-none text-gray-900 placeholder:text-gray-600 text-base min-h-[140px] shadow-sm"
                      />
                    </Form.Item>

                    <div className="flex justify-center mt-2">
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="h-[52px] px-16 rounded-full bg-[#6966FF] hover:bg-[#5A55CC] border-none text-lg font-medium shadow-lg w-full md:w-auto min-w-[240px]"
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
