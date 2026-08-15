import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the FailFirst adventure", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>FailFirst/);
  assert.match(html, /先失败，再开始/);
  assert.match(html, /进入行动实验/);
  assert.match(html, /冒险手册/);
});

test("keeps every adventure question at four choices", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const life = await readFile(new URL("../app/life-adventures.ts", import.meta.url), "utf8");
  for (const title of ["已读不回森林", "简历炼金工坊", "JD 怪兽来袭", "面试隐藏关", "Offer 召唤阵"]) assert.match(page, new RegExp(title));
  for (const title of ["未打开的旅行箱", "陌生城市", "语言森林", "独处夜晚", "远方灯塔"]) assert.match(life, new RegExp(title));

  const discoveryBlock = page.slice(page.indexOf("const discoveries"), page.indexOf("const events"));
  const discoveryChoiceGroups = [...discoveryBlock.matchAll(/choices:\s*\[([\s\S]*?)\n\s*\]\}/g)];
  assert.equal(discoveryChoiceGroups.length, 5);
  for (const [, choices] of discoveryChoiceGroups) assert.equal((choices.match(/^\s*\["/gm) ?? []).length, 4);

  const lifeChoiceGroups = [...life.matchAll(/choices:\s*\[([\s\S]*?)\n\s*\],/g)];
  assert.equal(lifeChoiceGroups.length, 5);
  for (const [, choices] of lifeChoiceGroups) assert.equal((choices.match(/\{ text:/g) ?? []).length, 4);
});

test("ships the handbook, Action Bugs, and Failure Museum", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const name of ["再等等怪", "脑内开会王", "收藏大户", "新手村村长", "完美拖延师", "明天再说侠"]) assert.match(page, new RegExp(name));
  for (const section of ["FailFirst 是什么", "为什么创建", "核心理念", "游戏玩法", "Action Bug 图鉴", "当前开放副本", "AI 在做什么", "后续地图", "项目档案"]) assert.match(page, new RegExp(section));
  assert.match(page, /带着不确定出发的人/);
  assert.match(page, /失败收藏卡/);
  for (const event of ["拒绝信掉落", "新人试炼场", "进度幻境"]) assert.match(page, new RegExp(event));
  assert.match(page, /行动角色解锁/);
  assert.match(page, /角色属性/);
  assert.match(page, /hiddenSkill/);
  assert.match(page, /保存我的失败收藏/);
  assert.match(page, /开启下一次冒险/);
  assert.doesNotMatch(page, /\bMAX\b|\bLOW\b|保存我的行动卡|再探索一次|性格测试|恐惧分析|拖延症|完美主义人格|装备焦虑区/);
});
