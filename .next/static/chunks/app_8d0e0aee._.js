(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/config/menu.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MenuSider",
    ()=>MenuSider,
    "MenuSiderWithModule",
    ()=>MenuSiderWithModule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$antd$2f$es$2f$tooltip$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tooltip$3e$__ = __turbopack_context__.i("[project]/node_modules/antd/es/tooltip/index.js [app-client] (ecmascript) <export default as Tooltip>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$FieldTimeOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldTimeOutlined$3e$__ = __turbopack_context__.i("[project]/node_modules/@ant-design/icons/es/icons/FieldTimeOutlined.js [app-client] (ecmascript) <export default as FieldTimeOutlined>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$HomeOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HomeOutlined$3e$__ = __turbopack_context__.i("[project]/node_modules/@ant-design/icons/es/icons/HomeOutlined.js [app-client] (ecmascript) <export default as HomeOutlined>");
;
;
;
;
const MenuSider = [
    {
        key: "home",
        label: "Dashboard",
        // rule: ["user", "admin"],
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$HomeOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HomeOutlined$3e$__["HomeOutlined"], {}, void 0, false, {
            fileName: "[project]/app/config/menu.tsx",
            lineNumber: 13,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        key: "generate-image",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$FieldTimeOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldTimeOutlined$3e$__["FieldTimeOutlined"], {}, void 0, false, {
            fileName: "[project]/app/config/menu.tsx",
            lineNumber: 17,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        label: "Generate Image"
    },
    {
        key: "generate-vdo",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$FieldTimeOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldTimeOutlined$3e$__["FieldTimeOutlined"], {}, void 0, false, {
            fileName: "[project]/app/config/menu.tsx",
            lineNumber: 23,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        label: "Generate VDO"
    },
    {
        key: "users-management",
        // icon: gridIcon,
        label: "User Management"
    },
    {
        key: "setting",
        // icon: <Icon icon="uil:setting" width="15" height="15" />,
        label: "Setting",
        // rule: ["admin", "hr", "ma-user"],
        children: []
    }
].map(_c = (item)=>{
    return {
        ...item,
        label: !item.children ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: "/page/".concat(item.key),
                children: item.label
            }, void 0, false, {
                fileName: "[project]/app/config/menu.tsx",
                lineNumber: 45,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false) : item.label
    };
});
_c1 = MenuSider;
const MenuSiderWithModule = (modules)=>{
    //   if (modules) {
    const menuFilterChildren = MenuSider.map((menu)=>({
            ...menu,
            children: (menu === null || menu === void 0 ? void 0 : menu.children) ? menu.children// .filter((item: any) => {
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
                    label: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$antd$2f$es$2f$tooltip$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tooltip$3e$__["Tooltip"], {
                        placement: "right",
                        title: item.label,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: 140
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/page/".concat(item.key),
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
_c2 = MenuSiderWithModule;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, 'MenuSider$[\n  {\n    key: "home",\n    label: "Dashboard",\n    // rule: ["user", "admin"],\n    icon: <HomeOutlined />,\n  },\n  {\n    key: `generate-image`,\n    icon: <FieldTimeOutlined />,\n    label: `Generate Image`,\n    // rule: ["user", "admin", "hr"],\n  },\n  {\n    key: `generate-vdo`,\n    icon: <FieldTimeOutlined />,\n    label: `Generate VDO`,\n    // rule: ["user", "admin", "hr"],\n  },\n  {\n    key: `users-management`,\n    // icon: gridIcon,\n    label: `User Management`,\n    // rule: ["admin", "hr", "user"],\n  },\n  {\n    key: `setting`,\n    // icon: <Icon icon="uil:setting" width="15" height="15" />,\n    label: `Setting`,\n    // rule: ["admin", "hr", "ma-user"],\n    children: [],\n  },\n].map');
__turbopack_context__.k.register(_c1, "MenuSider");
__turbopack_context__.k.register(_c2, "MenuSiderWithModule");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/PrivateLayout.tsx [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/app/components/PrivateLayout.tsx'\n\nUnexpected token. Did you mean `{'}'}` or `&rbrace;`?");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
]);

//# sourceMappingURL=app_8d0e0aee._.js.map