module.exports = [
"[project]/.next-internal/server/app/page/package/page/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[project]/app/favicon.ico.mjs { IMAGE => \"[project]/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/favicon.ico.mjs { IMAGE => \"[project]/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/page/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/page/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/page/package/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

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
}),
"[project]/app/page/package/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/page/package/page.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__83fb4382._.js.map