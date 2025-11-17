// "use client";
// import { Breadcrumb, Button, Card } from "antd";
// import React, { type FC } from "react";
// import { CheckCircleOutlined } from "@ant-design/icons";

// const Page: FC = () => {
//   return (
//     <div className="px-20 py-5">
//       <Breadcrumb
//         items={[
//           {
//             title: "Home",
//             href: "/page/home",
//           },
//           {
//             title: "Package",
//             href: "/page/package",
//           },
//         ]}
//       />
//       <div className="grid place-items-center mt-10 space-y-3 text-center">
//         <span className="text-4xl">AI Cave Package Pricing</span>
//         <span className="text-lg">
//           Start building free of charge with generous limits, then scale up with pay-as-you-go pricing for your production ready applications.
//         </span>
//       </div>
//       <div className="grid grid-cols-3 gap-3 mt-2">
//         <Card className="col col-span-1 !border-gray-400 ">
//           <div className="grid justify-start items-start">
//             <span>Free</span>
//             <span>For developers and small projects getting started with the Gemini API.</span>
//           </div>
//           <div className="mt-10 grid grid-cols-9 gap-2">
//             <div className="col col-span-1 ">
//               <CheckCircleOutlined />
//             </div>
//             <div className="col col-span-8">Limited access to certain models</div>
//           </div>
//           <div className="grid grid-cols-9 gap-2">
//             <div className="col col-span-1 ">
//               <CheckCircleOutlined />
//             </div>
//             <div className="col col-span-8">Free input & output tokens</div>
//           </div>
//           <div className="grid grid-cols-9 gap-2">
//             <div className="col col-span-1 ">
//               <CheckCircleOutlined />
//             </div>
//             <div className="col col-span-8">Google AI Studio access</div>
//           </div>
//           <div className="grid grid-cols-9 gap-2 mb-10">
//             <div className="col col-span-1 ">
//               <CheckCircleOutlined />
//             </div>
//             <div className="col col-span-8">Content used to improve our products</div>
//           </div>
//           <div className="w-full">
//             <Button
//               type={`default`}
//               className="w-full !bg-transparent !text-white !border-white hover:!bg-gray-800 hover:!text-gray-300 hover:!border-gray-300 transition-all">{`Get started for Free`}</Button>
//           </div>
//         </Card>
//         <Card className="col col-span-1 !border-gray-400">
//           <div className="grid justify-start items-start">
//             <span>Paid</span>
//             <span>For production applications that require higher volumes and advanced features.</span>
//           </div>
//           <div className="mt-10 grid grid-cols-9 gap-2">
//             <div className="col col-span-1 ">
//               <CheckCircleOutlined />
//             </div>
//             <div className="col col-span-8">Higher rate limits for production deployments</div>
//           </div>
//           <div className="grid grid-cols-9 gap-2">
//             <div className="col col-span-1 ">
//               <CheckCircleOutlined />
//             </div>
//             <div className="col col-span-8">Access to Context caching</div>
//           </div>
//           <div className="grid grid-cols-9 gap-2">
//             <div className="col col-span-1 ">
//               <CheckCircleOutlined />
//             </div>
//             <div className="col col-span-8">Batch API (50% cost reduction)</div>
//           </div>
//           <div className="grid grid-cols-9 gap-2">
//             <div className="col col-span-1 ">
//               <CheckCircleOutlined />
//             </div>
//             <div className="col col-span-8">Access to Google's most advanced models</div>
//           </div>
//           <div className="grid grid-cols-9 gap-2 mb-10">
//             <div className="col col-span-1 ">
//               <CheckCircleOutlined />
//             </div>
//             <div className="col col-span-8">Content *not* used to improve our products</div>
//           </div>
//           <div className="w-full">
//             <Button
//               type={`default`}
//               className="w-full !bg-transparent !text-white !border-white hover:!bg-gray-800 hover:!text-gray-300 hover:!border-gray-300 transition-all">{`Updrade to Paid`}</Button>
//           </div>
//         </Card>
//         <Card className="col col-span-1 !border-gray-400">
//           <div className="grid justify-start items-start">
//             <span>Enterprise</span>
//             <span>For large-scale deployments with custom needs for security, support, and compliance, powered</span>
//           </div>
//           <div className="mt-10 grid grid-cols-9 gap-2">
//             <div className="col col-span-1 ">
//               <CheckCircleOutlined />
//             </div>
//             <div className="col col-span-8">All features in Paid, plus optional access to:</div>
//           </div>
//           <div className="mt-10 grid grid-cols-9 gap-2">
//             <div className="col col-span-1 ">
//               <CheckCircleOutlined />
//             </div>
//             <div className="col col-span-8">Dedicated support channels</div>
//           </div>
//           <div className="grid grid-cols-9 gap-2">
//             <div className="col col-span-1 ">
//               <CheckCircleOutlined />
//             </div>
//             <div className="col col-span-8">Advanced security & compliance</div>
//           </div>
//           <div className="grid grid-cols-9 gap-2">
//             <div className="col col-span-1 ">
//               <CheckCircleOutlined />
//             </div>
//             <div className="col col-span-8">Provisioned throughput</div>
//           </div>
//           <div className="grid grid-cols-9 gap-2">
//             <div className="col col-span-1 ">
//               <CheckCircleOutlined />
//             </div>
//             <div className="col col-span-8">Volume-based discounts (based on usage)</div>
//           </div>
//           <div className="grid grid-cols-9 gap-2 mb-10">
//             <div className="col col-span-1 ">
//               <CheckCircleOutlined />
//             </div>
//             <div className="col col-span-8">ML ops, model garden and more</div>
//           </div>
//           <div className="w-full">
//             <Button
//               type={`default`}
//               className="w-full !bg-transparent !text-white !border-white hover:!bg-gray-800 hover:!text-gray-300 hover:!border-gray-300 transition-all">{`Contact Sales`}</Button>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Page;

"use client";
import React, { type FC } from "react";
import { CheckCircleOutlined, HomeOutlined } from "@ant-design/icons";

const Page: FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob top-0 -left-20"></div>
        <div className="absolute w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-0 -right-20"></div>
        <div className="absolute w-96 h-96 bg-purple-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      <div className="relative z-10 px-4 md:px-20 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-purple-300 mb-10">
          <a href="/page/home" className="flex items-center hover:text-purple-400 transition-colors">
            <HomeOutlined className="mr-1" />
            Home
          </a>
          <span className="text-purple-500">/</span>
          <a href="/page/package" className="hover:text-purple-400 transition-colors">
            Package
          </a>
        </nav>

        {/* Header Section */}
        <div className="grid place-items-center mt-10 space-y-3 text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            AI Cave Package Pricing
          </h1>
          <p className="text-lg text-purple-200 max-w-3xl">
            Start building free of charge with generous limits, then scale up with pay-as-you-go pricing for your production ready applications.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2 max-w-7xl mx-auto">
          {/* Free Plan */}
          <div className="col-span-1 bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8 hover:border-purple-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-2">
            <div className="grid justify-start items-start mb-8">
              <span className="text-2xl font-bold text-white mb-2">Free</span>
              <span className="text-purple-300 text-sm">For developers and small projects getting started with the Gemini API.</span>
            </div>

            <div className="space-y-4 mb-10">
              <div className="flex gap-3">
                <CheckCircleOutlined className="text-purple-400 text-lg mt-1 flex-shrink-0" />
                <span className="text-purple-200">Limited access to certain models</span>
              </div>
              <div className="flex gap-3">
                <CheckCircleOutlined className="text-purple-400 text-lg mt-1 flex-shrink-0" />
                <span className="text-purple-200">Free input & output tokens</span>
              </div>
              <div className="flex gap-3">
                <CheckCircleOutlined className="text-purple-400 text-lg mt-1 flex-shrink-0" />
                <span className="text-purple-200">Google AI Studio access</span>
              </div>
              <div className="flex gap-3">
                <CheckCircleOutlined className="text-purple-400 text-lg mt-1 flex-shrink-0" />
                <span className="text-purple-200">Content used to improve our products</span>
              </div>
            </div>

            <button className="w-full py-3 px-6 bg-transparent text-white border-2 border-purple-500/50 hover:bg-purple-600/20 hover:border-purple-400 rounded-lg transition-all duration-300 font-semibold">
              Get started for Free
            </button>
          </div>

          {/* Paid Plan - Featured */}
          <div className="col-span-1 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-xl rounded-2xl border-2 border-purple-500 p-8 relative overflow-hidden hover:shadow-2xl hover:shadow-purple-500/40 transform hover:-translate-y-2 transition-all duration-300">
            {/* Popular Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
              POPULAR
            </div>

            <div className="grid justify-start items-start mb-8 mt-4">
              <span className="text-2xl font-bold text-white mb-2">Paid</span>
              <span className="text-purple-200 text-sm">For production applications that require higher volumes and advanced features.</span>
            </div>

            <div className="space-y-4 mb-10">
              <div className="flex gap-3">
                <CheckCircleOutlined className="text-purple-300 text-lg mt-1 flex-shrink-0" />
                <span className="text-white">Higher rate limits for production deployments</span>
              </div>
              <div className="flex gap-3">
                <CheckCircleOutlined className="text-purple-300 text-lg mt-1 flex-shrink-0" />
                <span className="text-white">Access to Context caching</span>
              </div>
              <div className="flex gap-3">
                <CheckCircleOutlined className="text-purple-300 text-lg mt-1 flex-shrink-0" />
                <span className="text-white">Batch API (50% cost reduction)</span>
              </div>
              <div className="flex gap-3">
                <CheckCircleOutlined className="text-purple-300 text-lg mt-1 flex-shrink-0" />
                <span className="text-white">Access to Googles most advanced models</span>
              </div>
              <div className="flex gap-3">
                <CheckCircleOutlined className="text-purple-300 text-lg mt-1 flex-shrink-0" />
                <span className="text-white">Content *not* used to improve our products</span>
              </div>
            </div>

            <button className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 hover:from-purple-700 hover:to-indigo-700 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-purple-500/50">
              Upgrade to Paid
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="col-span-1 bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8 hover:border-purple-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-2">
            <div className="grid justify-start items-start mb-8">
              <span className="text-2xl font-bold text-white mb-2">Enterprise</span>
              <span className="text-purple-300 text-sm">
                For large-scale deployments with custom needs for security, support, and compliance, powered
              </span>
            </div>

            <div className="space-y-4 mb-10">
              <div className="flex gap-3">
                <CheckCircleOutlined className="text-purple-400 text-lg mt-1 flex-shrink-0" />
                <span className="text-purple-200">All features in Paid, plus optional access to:</span>
              </div>
              <div className="flex gap-3">
                <CheckCircleOutlined className="text-purple-400 text-lg mt-1 flex-shrink-0" />
                <span className="text-purple-200">Dedicated support channels</span>
              </div>
              <div className="flex gap-3">
                <CheckCircleOutlined className="text-purple-400 text-lg mt-1 flex-shrink-0" />
                <span className="text-purple-200">Advanced security & compliance</span>
              </div>
              <div className="flex gap-3">
                <CheckCircleOutlined className="text-purple-400 text-lg mt-1 flex-shrink-0" />
                <span className="text-purple-200">Provisioned throughput</span>
              </div>
              <div className="flex gap-3">
                <CheckCircleOutlined className="text-purple-400 text-lg mt-1 flex-shrink-0" />
                <span className="text-purple-200">Volume-based discounts (based on usage)</span>
              </div>
              <div className="flex gap-3">
                <CheckCircleOutlined className="text-purple-400 text-lg mt-1 flex-shrink-0" />
                <span className="text-purple-200">ML ops, model garden and more</span>
              </div>
            </div>

            <button className="w-full py-3 px-6 bg-transparent text-white border-2 border-purple-500/50 hover:bg-purple-600/20 hover:border-purple-400 rounded-lg transition-all duration-300 font-semibold">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
