import { Button, Drawer, Select } from "antd";
import { BulbOutlined } from "@ant-design/icons";
import React, { useState, type FC } from "react";
import { LightbulbIcon } from "lucide-react";
import type { IProject } from "@/app/common/project.type";

export interface props {
  getProject?: IProject;
}

const HeaderGenerateImagePage: FC<props> = ({ getProject }) => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div className="grid grid-cols-2 bg-black w-full p-5 rounded-t-2xl">
      <div className="flex col-span-1 flex-col">
        <span className="text-2xl font-bold">{`${getProject?.name}`}</span>
        <span className="text-md text-[#9B9C9E]">{`Shake up your creativity with image generation`}</span>
      </div>
      <div className="flex col-span-1 justify-end">
        <Select
          styles={{
            popup: {
              root: {
                backgroundColor: "red",
              },
            },
          }}
          placeholder={`Model Version`}
          rootClassName="!text-white !bg-transparent "
          options={[
            { value: "4", label: "Seedream 4.0" },
            { value: "3", label: "Seedream 3.0" },
          ]}
        />
        <Button type="link" className="!text-[#686B6E]" icon={<BulbOutlined />} onClick={showDrawer}>{`Prompt Guide`}</Button>
        <Drawer
          title={
            <div className="flex items-center gap-2">
              <LightbulbIcon className="w-5 h-5" />
              <span>Prompt Guide</span>
            </div>
          }
          closable={{ "aria-label": "Close Button" }}
          onClose={onClose}
          open={open}
          width={600}
        >
          <div className="space-y-6">
            {/* Introduction */}
            <p className="text-gray-300 leading-relaxed">
              This article introduces prompt usage tips for Seedream 4.0's text-to-image generation, image editing, reference-based generation and
              multi-image creation, helping you quickly get started with video creation and turn ideas into image creations.
            </p>

            {/* General Guidelines Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">General Guidelines</h2>
              <p className="text-gray-300 leading-relaxed">
                Seedream 4.0 supports a wide range of tasks such as text-to-image generation, image editing, reference-based generation and
                multi-image creation. For optimal image creation results, consider the following best practices when crafting prompts:
              </p>
            </div>

            {/* Guidelines List */}
            <div className="space-y-6">
              {/* Guideline 1 */}
              <div>
                <h3 className="text-lg font-medium text-blue-400 mb-2">1. Clearly describe the scene using natural language</h3>
                <p className="text-gray-300 mb-3">
                  Use coherent natural language to describe the subject + action + environment. If aesthetics matter, include descriptors of style,
                  color, lighting, or composition.
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="text-gray-300">
                    <span className="text-green-400">• Recommended:</span> A girl in a lavish dress walking under a parasol along a tree-lined path,
                    in the style of a Monet oil painting.
                  </li>
                  <li className="text-gray-300">
                    <span className="text-red-400">• Avoid:</span> Girl, umbrella, tree-lined street, oil painting texture.
                  </li>
                </ul>
              </div>

              {/* Guideline 2 */}
              <div>
                <h3 className="text-lg font-medium text-blue-400 mb-2">2. Specify application scenario</h3>
                <p className="text-gray-300 mb-3">If you have a specific use case, explicitly state the image purpose and type in your prompt.</p>
                <ul className="space-y-2 ml-4">
                  <li className="text-gray-300">
                    <span className="text-green-400">• Recommended:</span> Design a logo for a gaming company. The logo features a dog playing with a
                    game controller. The company name "PITBULL" is written on it.
                  </li>
                  <li className="text-gray-300">
                    <span className="text-red-400">• Avoid:</span> An abstract image of a dog holding a controller, and the word PITBULL on it.
                  </li>
                </ul>
              </div>

              {/* Guideline 3 */}
              <div>
                <h3 className="text-lg font-medium text-blue-400 mb-2">3. Enhance stylistic rendering</h3>
                <p className="text-gray-300">
                  If a particular style is needed, use precise style keywords or reference images to achieve better results.
                </p>
              </div>

              {/* Guideline 4 */}
              <div>
                <h3 className="text-lg font-medium text-blue-400 mb-2">4. Improve text rendering accuracy</h3>
                <p className="text-gray-300 mb-3">Use double quotation marks for the text that needs to appear in the generated image.</p>
                <ul className="space-y-2 ml-4">
                  <li className="text-gray-300">
                    <span className="text-green-400">• Recommended:</span> Generate a poster with the title "Seedream 4.0".
                  </li>
                  <li className="text-gray-300">
                    <span className="text-red-400">• Avoid:</span> Generate a poster titled Seedream 4.0.
                  </li>
                </ul>
              </div>

              {/* Guideline 5 */}
              <div>
                <h3 className="text-lg font-medium text-blue-400 mb-2">5. Clearly define image editing goals and fixed elements</h3>
                <p className="text-gray-300 mb-3">
                  Use concise, unambiguous instructions for modifications. Avoid vague pronouns. If other elements should remain unchanged, specify
                  that explicitly.
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="text-gray-300">
                    <span className="text-green-400">• Recommended:</span> Dress the tallest panda in pink Peking Opera costume and headgear, keeping
                    its pose unchanged.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Drawer>
      </div>
    </div>
  );
};

export default HeaderGenerateImagePage;
