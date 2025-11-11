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
      <span className="text-5xl font-bold">{`CriAIve AI Media`}</span>
      <span className="text-lg text-gray-400">{`The fastest path from prompt to production by OSD`}</span>
      <div className="h-[500px] w-full rounded-3xl mt-5">
        <ReactPlayer
          className="react-player "
          src="https://www.youtube.com/watch?v=nsxnx9i3DX4&list=RDMMeyLJ1RlPHlI&index=3"
          width="100%"
          height="100%"
          playing={true}
          loop={true}
          controls={true}
          muted={true}
        />
      </div>
      <div className="mt-10 gap-2 flex mb-20">
        <Button className="!bg-transparent !text-white !border-white hover:!bg-gray-800 hover:!text-gray-300 hover:!border-gray-300 transition-all">
          seedream 4.0
        </Button>
        <Button className="!bg-transparent !text-white !border-white hover:!bg-gray-800 hover:!text-gray-300 hover:!border-gray-300 transition-all">
          seedance 4.0
        </Button>
      </div>
      <Divider style={{ borderColor: "#6b7280" }} />
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
      <div className="grid grid-cols-2">
        <div className="col-span-1 flex flex-col items-start justify-start space-y-4 pr-10">
          <span>title 2</span>
          <span>description</span>
          <span>detail content 2</span>
        </div>
        <div className="col-span-1 flex flex-col items-start justify-start">
          <Image className="rounded-2xl" src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" />
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="col-span-1 flex flex-col items-start justify-start space-y-4 pr-10">
          <span>title 3</span>
          <span>description</span>
          <span>detail content 3</span>
        </div>
        <div className="col-span-1 flex flex-col items-start justify-start">
          <Image className="rounded-2xl" src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" />
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="col-span-1 flex flex-col items-start justify-start space-y-4 pr-10">
          <span>title 4</span>
          <span>description</span>
          <span>detail content 4</span>
        </div>
        <div className="col-span-1 flex flex-col items-start justify-start">
          <Image className="rounded-2xl" src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" />
        </div>
      </div>
      <Divider style={{ borderColor: "#6b7280" }} />
      <span className="text-5xl font-bold">{`CriAIve AI Media`}</span>
      <span className="text-lg text-gray-400">{`Start exploring and building`}</span>
      <Button
        type="default"
        icon={<LoginOutlined />}
        className="!bg-transparent !text-white !border-white hover:!bg-gray-800 hover:!text-gray-300 hover:!border-gray-300 transition-all"
        onClick={() => navigate.push("/login")}>
        login Sign up and get started
      </Button>
    </div>
  );
};

export default Page;
