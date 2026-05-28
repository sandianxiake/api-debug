## 项目概述



我是一名前端开发人员 想做个智能体 想到的场景是提高前端开发效率这方面。于是我想到了一个接口联调智能体。面向前端接口开发、Mock、联调、排错全流程，替代重复手写请求函数、TS 类型、Mock 数据、排查报错等工作。

一、整体定位
面向前端接口开发、Mock、联调、排错全流程，替代重复手写请求函数、TS 类型、Mock 数据、排查报错等工作。

二、核心功能模块 & 详细能力
模块 1：文档转代码（核心高频）
能力 1：接口文档一键生成请求代码
支持粘贴Markdown / 纯文本 / JSON 格式接口信息，自动解析：请求地址、请求方法、请求头、路径参数、查询参数、请求体、响应结构。
输出内容：
统一封装的 axios 请求函数
完整 TS 类型定义（请求入参、响应体、枚举、嵌套结构）
注释标注字段含义、必填项、默认值
适配框架：Vue2/Vue3。

模块 2：Mock 数据 & 本地调试
能力 1：结构化 Mock 数据生成
基于接口入参 / 响应 TS 类型，一键生成逼真模拟数据：
自动区分文本、数字、日期、布尔、数组、图片地址、状态枚举
支持自定义规则（如手机号、身份证、订单号、分页格式）
输出：JS 静态 Mock 文件 / 对接 Mock 服务（如 Mock.js、Easy Mock）模板
能力 2：快速搭建临时 Mock 服务
一键生成本地 Mock 路由、返回逻辑，无需手动配置，前端可脱离后端先行开发页面。

三、整体规划
1、适配约定（统一规范，降低开发成本）
请求库：默认 Axios（前端主流）
技术栈：Vue，输出标准 ES Module 代码
目录规范：接口文件统一放 src/api/，类型文件 src/types/，Mock 文件 src/mock/
输入格式：支持 JSON、Markdown 表格、纯文本描述 三种接口文档格式。

四、功能详细设计
功能 1：接口文档 → 请求代码 + TS 类型
1.1 支持解析的接口字段
用户输入文档需包含以下信息，智能体自动提取：
基础信息：接口名称、接口描述、请求 URL、请求方法（GET/POST/PUT/DELETE/PATCH）
请求参数：路径参数、查询参数、请求体（Body）、请求头
响应结构：成功返回字段、字段类型、字段说明、是否必填
1.2 输出内容（固定模板）
** TS 类型文件
*** 请求入参类型（路径参 / 查询参 / 请求体拆分）
*** 响应体基础类型、嵌套子类型
*** 字段注释自动关联文档说明
** 接口请求函数
*** 复用项目全局 axios 实例（预留拦截器适配位）
*** 函数命名语义化，按业务模块划分
*** 入参绑定 TS 类型，强类型约束
*** 统一异常 / 基础注释
1.3 示例效果
输入示例（简易接口文档）

``
接口名称：获取用户列表
请求地址：/api/user/list
请求方式：GET
查询参数：
  page: number, 页码，必填
  size: number, 每页条数，必填
响应体：
  code: number, 状态码
  data: Object
    total: number, 总条数
    list: Array
      id: number, 用户ID
      username: string, 用户名
      status: number, 状态 0-禁用 1-正常
  message: string, 提示信息
``
输出 TS 类型（src/types/api/user.ts）
``
/** 获取用户列表 - 请求参数 */
export interface UserListParams {
  /** 页码 */
  page: number;
  /** 每页条数 */
  size: number;
}

/** 用户列表项 */
export interface UserItem {
  /** 用户ID */
  id: number;
  /** 用户名 */
  username: string;
  /** 状态 0-禁用 1-正常 */
  status: number;
}

/** 获取用户列表 - 响应体 */
export interface UserListRes {
  /** 状态码 */
  code: number;
  data: {
    /** 总条数 */
    total: number;
    list: UserItem[];
  };
  /** 提示信息 */
  message: string;
}
``

输出请求函数（src/api/user.ts）
``
import request from '@/utils/request';
import type { UserListParams, UserListRes } from '@/types/api/user';

/**
 * 获取用户列表
 * @param params 请求参数
 */
export function getUserList(params: UserListParams) {
  return request<UserListRes>({
    url: '/api/user/list',
    method: 'GET',
    params
  });
}
``
功能 2：结构化 Mock 数据生成
2.1 核心规则
基于上面生成的 TS 类型结构 自动生成模拟数据：
** 基础类型映射
number：生成随机数字、序号、状态枚举值
string：生成中文文本、昵称、手机号、地址等场景化文本
boolean：随机 true/false
Array：默认生成 2~5 条子数据
枚举字段：严格按文档说明生成对应值（如 status: 0 / 1）
** 支持分页、列表、嵌套对象等复杂结构
** 数据贴近业务，不生成无意义乱码
2.2 输出形式 & 示例
输出独立 Mock 文件（src/mock/user.ts），可直接导入使用：
``
import type { UserListRes } from '@/types/api/user';

// 获取用户列表 Mock 数据
export const mockUserList: UserListRes = {
  code: 200,
  data: {
    total: 68,
    list: [
      { id: 1, username: '张三', status: 1 },
      { id: 2, username: '李四', status: 0 },
      { id: 3, username: '王五', status: 1 }
    ]
  },
  message: '请求成功'
};
``

功能 3：快速搭建临时 Mock 服务
3.1 落地方案：基于 Mock.js 本地路由（轻量，无额外服务）
适合 Vue/Vite 项目，生成路由配置 + Mock 拦截逻辑，直接嵌入项目：
输出 src/mock/index.ts 统一入口 + 单接口路由：
``
import Mock from 'mockjs';
import { mockUserList } from './user';

// 拦截 GET /api/user/list
Mock.mock('/api/user/list', 'get', () => {
  return mockUserList;
});

export default Mock;
``
配套提示：在项目入口 main.ts 引入 import '@/mock' 即可启用。

3.2 附加能力
自动区分请求方法（GET/POST 分别拦截）
支持动态读取请求参数（简单模拟分页逻辑）
一键切换「启用 / 关闭 Mock」注释标记


五、完整交互流程（对话式智能体）
1、整体步骤
** 用户输入：粘贴接口文档（文本 / 表格 / JSON）
** 选择能力：单选 / 多选
选项 1：生成 请求代码 + TS 类型
选项 2：生成 Mock 数据
选项 3：生成 本地 Mock 服务
** 智能体执行：按规则解析、生成代码并分段输出
** 二次编辑：支持用户补充要求（修改 URL、调整字段、修改代码风格）
2、标准对话指令（可直接作为智能体 Prompt）
** 主提示词（核心）
``
你现在是前端接口代码&Mock生成智能体，严格按照以下规则工作：
1. 解析用户提供的接口文档，提取：接口名、请求URL、请求方法、入参、响应结构、字段说明、字段类型。
2. 优先生成标准TypeScript类型定义文件，包含请求参数、响应体、嵌套类型，每个字段添加注释。
3. 基于TS类型，生成使用Axios的请求函数，统一导入项目通用request实例，代码风格为ES Module。
4. 根据TS结构生成结构化Mock模拟数据：数字、字符串、数组、枚举按业务场景填充，数组默认3条左右数据。
5. 支持项目内Mock.js拦截代码，输出时标注使用方式。
6. 输出代码区分文件路径，代码块清晰，不额外添加无关内容。

请告诉我你的需求：粘贴接口文档，并说明需要生成「请求代码+TS类型」、「Mock数据」、「Mock服务」中的哪些内容。
``

** 示例对话演示

用户：
··
接口名称：获取用户列表
请求地址：/api/user/list
请求方式：GET
查询参数：
  page: number, 页码，必填
  size: number, 每页条数，必填
响应体：
  code: number, 状态码
  data: Object
    total: number, 总条数
    list: Array
      id: number, 用户ID
      username: string, 用户名
      status: number, 状态 0-禁用 1-正常
  message: string, 提示信息

需要生成：请求代码+TS类型、Mock数据、Mock.js本地服务
··

智能体：依次输出 类型文件、接口函数、Mock 数据、Mock 路由代码 + 使用说明。

六、落地技术选型

1. 技术选型
形态1、Web 页面版，
** 前端框架：Vue3
** 核心能力：文本输入框或者文件上传 + 解析引擎 + 代码高亮展示（highlight.js）+ 一键复制单段 / 全部代码
** 解析逻辑：正则 / 简单语法解析接口文档，结构化提取字段
形态2、在vue2/vue3项目中的根目录里添加了一份API文档，根据这个文档一键生成代码到对应目录，自动创建文件。

支持批量解析多个接口

七、补充模板（可直接复用）
通用请求工具类模板（统一引用）
路径：src/utils/request.ts（项目通用，生成代码默认依赖）
``
import axios from 'axios';

const request = axios.create({
  baseURL: '',
  timeout: 10000
});

// 请求拦截器
request.interceptors.request.use(config => config);
// 响应拦截器
request.interceptors.response.use(res => res.data);

export default request;
``