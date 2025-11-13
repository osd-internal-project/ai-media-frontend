"use client";
import { Button, Divider, Image } from "antd";
import type { FC } from "react";
import ReactPlayer from "react-player";
import { LoginOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const Page: FC = () => {
  const navigate = useRouter();
  return (
    <div className="px-80 py-20 flex flex-col items-center justify-center space-y-4 text-center">
      <span className="text-5xl font-bold">{`The Cave of Creation`}</span>
      <span className="text-lg text-gray-400 max-w-96">{`Elit eu odio interdum facilisis curabitur mauris phasellus vitae. Pretium fames vel tortor et arcu, faucibus semper egestas amet. Venenatis arcu viverra feugiat vel libero`}</span>

      <div className="mt-5 gap-2 flex mb-20">
        <Button className="!bg-[#3A3A3A] !text-white  transition-all !rounded-4xl w-[240px] !h-[60px] !text-xl">Explore sections</Button>
      </div>
      <div>
        <div className="grid grid-cols-2">
          <div className="col-span-1 flex flex-col items-start justify-start space-y-4 pr-10">
            <span>{`Product Highlight`}</span>
          </div>
          <div className="col-span-1 flex flex-col items-start justify-start">
            <div></div>
          </div>
        </div>
        <div className="grid grid-cols-2">
          <div className="col-span-1 flex flex-col items-start justify-start space-y-4 pr-10">
            <span>title 1</span>
            <span>description</span>
            <span>detail content 1</span>
          </div>
          <div className="col-span-1 flex flex-col items-start justify-start">
            <Image className="rounded-2xl" src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
