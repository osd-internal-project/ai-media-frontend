module.exports = [
"[project]/app/config/menu.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MenuSider",
    ()=>MenuSider,
    "MenuSiderWithModule",
    ()=>MenuSiderWithModule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$antd$2f$es$2f$tooltip$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Tooltip$3e$__ = __turbopack_context__.i("[project]/node_modules/antd/es/tooltip/index.js [app-ssr] (ecmascript) <export default as Tooltip>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$FieldTimeOutlined$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldTimeOutlined$3e$__ = __turbopack_context__.i("[project]/node_modules/@ant-design/icons/es/icons/FieldTimeOutlined.js [app-ssr] (ecmascript) <export default as FieldTimeOutlined>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$HomeOutlined$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HomeOutlined$3e$__ = __turbopack_context__.i("[project]/node_modules/@ant-design/icons/es/icons/HomeOutlined.js [app-ssr] (ecmascript) <export default as HomeOutlined>");
;
;
;
;
const MenuSider = [
    {
        key: "home",
        label: "Dashboard",
        // rule: ["user", "admin"],
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$HomeOutlined$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HomeOutlined$3e$__["HomeOutlined"], {}, void 0, false, {
            fileName: "[project]/app/config/menu.tsx",
            lineNumber: 13,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        key: `generate-image`,
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$FieldTimeOutlined$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldTimeOutlined$3e$__["FieldTimeOutlined"], {}, void 0, false, {
            fileName: "[project]/app/config/menu.tsx",
            lineNumber: 17,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        label: `Generate Image`
    },
    {
        key: `generate-vdo`,
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$FieldTimeOutlined$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldTimeOutlined$3e$__["FieldTimeOutlined"], {}, void 0, false, {
            fileName: "[project]/app/config/menu.tsx",
            lineNumber: 23,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        label: `Generate VDO`
    },
    {
        key: `users-management`,
        // icon: gridIcon,
        label: `User Management`
    },
    {
        key: `setting`,
        // icon: <Icon icon="uil:setting" width="15" height="15" />,
        label: `Setting`,
        // rule: ["admin", "hr", "ma-user"],
        children: []
    }
].map((item)=>{
    return {
        ...item,
        label: !item.children ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                href: `/page/${item.key}`,
                children: item.label
            }, void 0, false, {
                fileName: "[project]/app/config/menu.tsx",
                lineNumber: 45,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false) : item.label
    };
});
const MenuSiderWithModule = (modules)=>{
    //   if (modules) {
    const menuFilterChildren = MenuSider.map((menu)=>({
            ...menu,
            children: menu?.children ? menu.children// .filter((item: any) => {
            //   const rule = item.rule;
            //   // return !item.rule || modules.includes(item.rule);
            //   if (Array.isArray(rule)) {
            //     return rule.some((r) => modules.includes(r));
            //   }
            //   return modules.includes(rule);
            // })
            .map((item)=>{
                return {
                    ...item,
                    label: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$antd$2f$es$2f$tooltip$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Tooltip$3e$__["Tooltip"], {
                        placement: "right",
                        title: item.label,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: 140
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: `/page/${item.key}`,
                                children: item.label
                            }, void 0, false, {
                                fileName: "[project]/app/config/menu.tsx",
                                lineNumber: 73,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/app/config/menu.tsx",
                            lineNumber: 72,
                            columnNumber: 19
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/app/config/menu.tsx",
                        lineNumber: 71,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                };
            }) : null
        }));
    const menu = menuFilterChildren;
    //   .filter((item: any) => {
    //     const rule = item.rule;
    //     if (Array.isArray(rule)) {
    //       return rule.some((r) => modules.includes(r));
    //     }
    //     return modules.includes(rule);
    //   });
    return menu;
//   } else {
//     return [];
//   }
};
}),
"[project]/app/components/PrivateLayout.tsx [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/app/components/PrivateLayout.tsx'\n\nUnexpected token. Did you mean `{'}'}` or `&rbrace;`?");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
];

//# sourceMappingURL=app_e15c4fa0._.js.map