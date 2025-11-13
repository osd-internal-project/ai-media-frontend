"use client";

import { Layout, Typography, Image, Button, Input } from "antd";
import { FacebookOutlined, InstagramOutlined } from "@ant-design/icons";
const { Footer } = Layout;
const { Text } = Typography;

interface FooterProps {
  darkMode?: boolean;
  setDarkMode?: (value: boolean) => void;
}

const OSDFooter: React.FC<FooterProps> = ({ darkMode, setDarkMode }) => {
  return (
    <Footer className="text-white !py-15 !px-20 border-t border-white">
      <div className=" mx-auto grid grid-cols-1 md:grid-cols-6 gap-8">
        <div className="flex col-span-3 flex-col !space-y-6">
          <div className="flex items-center space-x-2">
            <Image src="/images/Logo.png" alt="AI Cave Logo" />
          </div>
          <p className="text-gray-400 text-lg">SUBSCRIBE FOR ALL UPDATES</p>
          <div className="flex">
            <Input
              type="email"
              placeholder="E-mail"
              size="large"
              className="!h-15 !w-50 p-2 !rounded-l-full border !border-gray-600 !bg-transparent !outline-none !text-white"
            />
            <Button className="!h-15 !bg-white !text-black px-4 !rounded-r-full font-bold">SUBSCRIBE</Button>
          </div>
          <div className="grid grid-cols-2 mt-20">
            <div className="grid grid-cols-1 col-span-1 space-x-4 text-white">
              <div>
                <span className="text-white text-lg text-bold uppercase">{`socials`}</span>
              </div>
              <div className="flex justify-start items-center gap-3">
                <InstagramOutlined className="text-xl" />
                <FacebookOutlined className="text-xl" />
              </div>
            </div>
            <div className="col-span-1">
              <p className="text-gray-500 text-lg mt-4">Copyright © AI Cave Company. All rights reserved.</p>
            </div>
          </div>
        </div>

        <div className="flex col-span-1 flex-col space-y-2">
          <h3 className="font-semibold text-gray-400 text-2xl">Pages</h3>
          <a className="!text-white !hover:text-gray-400 uppercase text-lg">About</a>
          <a className="!text-white !hover:text-gray-400 uppercase text-lg">Services</a>
          <a className="!text-white !hover:text-gray-400 !mb-10 uppercase text-lg">Case Studies</a>
          <h3 className="font-semibold text-gray-400 text-2xl uppercase">powered by</h3>
          <a className="!text-white !hover:text-gray-400 uppercase !mb-8 text-lg">AI Cave</a>

          <h3 className="font-semibold text-gray-400 text-2xl uppercase">Support</h3>
          <a className="!text-white !hover:text-gray-400 uppercase text-lg">OSD Limited Company</a>
        </div>

        {/* 3. Pages Column 2 */}
        <div className="flex flex-col col-span-1 space-y-2">
          <h3 className="font-semibold text-gray-400 text-2xl">Pages</h3>
          <a className="!text-white !hover:text-gray-400 uppercase text-lg">About</a>
          <a className="!text-white !hover:text-gray-400 uppercase text-lg">Services</a>
          <a className="!text-white !hover:text-gray-400  uppercase text-lg">Case Studies</a>
          <a className="!text-white !hover:text-gray-400 uppercase text-lg">Blog</a>
          <a className="!text-white !hover:text-gray-400 uppercase text-lg">Testimonials</a>
          <a className="!text-white !hover:text-gray-400 uppercase !mb-10 text-lg">Career</a>
        </div>

        {/* 4. Powered by / Support */}
        <div className="flex flex-col col-span-1 space-y-2">
          <h3 className="font-semibold text-gray-400 text-2xl">Pages</h3>
          <a className="!text-white !hover:text-gray-400 uppercase text-lg">About</a>
          <a className="!text-white !hover:text-gray-400 uppercase text-lg">Services</a>
          <a className="!text-white !hover:text-gray-400  uppercase text-lg">Case Studies</a>
          <a className="!text-white !hover:text-gray-400 uppercase text-lg">Blog</a>
          <a className="!text-white !hover:text-gray-400 uppercase text-lg">Testimonials</a>
          <a className="!text-white !hover:text-gray-400 uppercase !mb-10 text-lg">Career</a>
        </div>
      </div>
    </Footer>
  );
};

export default OSDFooter;
