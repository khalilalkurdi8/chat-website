import fs from "node:fs";

const workflow = {
  name: "Website Chat - Direct n8n",
  nodes: [
    {
      parameters: {
        httpMethod: "POST",
        path: "website-chat",
        responseMode: "responseNode",
        options: {},
      },
      type: "n8n-nodes-base.webhook",
      typeVersion: 2.1,
      position: [-560, 0],
      id: "0e8127e2-58f2-4d3d-a5d6-4f8e5d3dc5e4",
      name: "Website Chat Webhook",
      webhookId: "ca9f0fe2-7b0a-4a7b-9624-6c95f1e33d21",
    },
    {
      parameters: {
        mode: "runOnceForAllItems",
        jsCode: `const body = $json.body ?? {};
const event = String(body.event ?? "chat_opened");
const message = String(body.message ?? "").trim();
const sessionId = String(body.sessionId ?? "anonymous");
const hour = Number(new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Kuwait",
  hour: "numeric",
  hourCycle: "h23",
}).format(new Date()));

const menu = "اهلاً بك في شركة الشرق للوساطة المالية\\n قم بتحديد استفسارك عن طريق كتابة الرقم\\n١- فتح حساب\\n٢- طلب نقدي\\n٣- ايداع\\n٤- استفسار آخر";
const normalized = message
  .replace(/[١۱]/g, "1")
  .replace(/[٢۲]/g, "2")
  .replace(/[٣۳]/g, "3")
  .replace(/[٤۴]/g, "4");
const option = normalized.match(/^\\s*([1-4])\\s*[.\\-):]?\\s*$/)?.[1];

let reply;
if (hour < 8 || hour > 22) {
  reply = "الوقت خارج اوقات الدوام";
} else if (!message || !option) {
  reply = event === "chat_opened"
    ? menu
    : "يرجى اختيار رقم من القائمة:\\n\\n" + menu;
} else if (option === "1") {
  reply = "الاوراق المطلوبة لفتح الحساب\\n بطاقة مدنية\\n شهادة ايبان\\n اثبات جنسية\\n\\n البيانات المطلوبة\\nالهدف من فتح الحساب\\nالمبلغ المتوقع ادخاله للحساب\\nالاسم الثلاثي\\nرقم الهاتف\\nالايميل\\n\\nسيتم التواصل معك من قبل الموظف المختص خلال دقائق";
} else if (option === "2") {
  reply = "سيتم التواصل معك من قبل الموظف المختص خلال دقائق";
} else if (option === "3") {
  reply = "يرجى ارسال اشعار التحويل لمراقبة الايداع\\n\\nسيتم التواصل معك من قبل الموظف المختص خلال دقائق";
} else {
  reply = "يرجى كتابة استفسارك\\n\\nسيتم التواصل معك من قبل الموظف المختص خلال دقائق";
}

return [{
  json: {
    ok: true,
    event,
    sessionId,
    reply,
  },
}];`,
      },
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [-240, 0],
      id: "a06f67d8-b3e3-4f91-a8d8-e906ca36dfc2",
      name: "Website Chat Logic",
    },
    {
      parameters: {
        respondWith: "json",
        responseBody: "={{ $json }}",
        options: {},
      },
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.4,
      position: [80, 0],
      id: "f62b5b89-0e3e-44b7-99d2-a8db725f32e2",
      name: "Respond to Website Chat",
    },
  ],
  connections: {
    "Website Chat Webhook": {
      main: [[{ node: "Website Chat Logic", type: "main", index: 0 }]],
    },
    "Website Chat Logic": {
      main: [[{ node: "Respond to Website Chat", type: "main", index: 0 }]],
    },
  },
  active: false,
  settings: { executionOrder: "v1" },
  pinData: {},
  tags: [],
};

fs.writeFileSync("n8n-workflow-web-chat.json", `${JSON.stringify(workflow, null, 2)}\n`);
console.log("Created n8n-workflow-web-chat.json without Wasender nodes.");
