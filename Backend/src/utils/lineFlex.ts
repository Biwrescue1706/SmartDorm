// src/utils/lineFlex.ts

import axios from "axios";

// 🧩 Interface
export interface FlexButton {
  label: string;
  url: string;
  style?: "primary" | "secondary" | "link";
  color?: string;
}

/**
 * ส่ง Flex Message แบบ SmartDorm Branding
 *
 * @param userId LINE user ID ของผู้รับ
 * @param title หัวข้อหลักของข้อความ
 * @param fields ข้อมูลแต่ละบรรทัดในกล่อง body [{ label, value, color? }]
 * @param buttons ปุ่มใน footer [{ label, url, style?, color? }]
 * @param iconUrl (optional) URL รูป icon ที่ต้องการใช้แทนโลโก้ SmartDorm
 */
export async function sendFlexMessage(
  userId: string,
  title: string,
  fields: { label: string; value: string; color?: string }[],
  buttons: FlexButton[],
  iconUrl?: string
) {
  if (!userId || !process.env.LINE_CHANNEL_TOKEN) {
    console.error("❌ Missing userId or LINE_CHANNEL_TOKEN");
    return;
  }

  // 🧱 Body Contents
  const bodyContents = [
    {
      type: "text",
      text: title,
      weight: "bold",
      size: "lg",
      color: "#000000ff",
      wrap: true,
    },
    { type: "separator", margin: "md" },
    ...fields.map((f) => ({
      type: "box",
      layout: "horizontal",
      margin: "md",
      contents: [
        {
          type: "text",
          text: f.label,
          flex: 2,
          size: "sm",
          color: "#000000ff",
        },
        {
          type: "text",
          text: f.value,
          flex: 3,
          size: "sm",
          align: "start",
          color: f.color || "#000000ff",
          wrap: true,
        },
      ],
    })),
  ];

  // 🔘 Footer Buttons
  const footerContents = [
    ...(buttons?.length
      ? buttons.map((btn) => ({
          type: "button",
          style: btn.style || "primary",
          color: btn.color || "#0015ffff",
          height: "sm",
          action: {
            type: "uri",
            label: btn.label,
            uri: btn.url,
          },
        }))
      : []),
    {
      type: "text",
      text: "ขอบคุณที่ใช้บริการ 🏫 SmartDorm 🎉",
      align: "center",
      size: "sm",
      color: "#000000ff",
      weight: "bold",
      margin: "md",
      wrap: true,
    },
    {
      type: "text",
      text: "SmartDorm © 2025",
      align: "center",
      size: "xs",
      color: "#000000ff",
      margin: "sm",
    },
  ];

  // 💬 Flex Message Structure
  const flex = {
    type: "flex",
    altText: title.length > 390 ? title.slice(0, 390) + "..." : title,
    contents: {
      type: "bubble",
      hero: {
        type: "box",
        layout: "horizontal",
        backgroundColor: "#81f8c0ff",
        contents: [
          {
            type: "image",
            url:
              iconUrl ||
              "https://smartdorm-admin.biwbong.shop/assets/SmartDorm.webp",
            size: "xxs",
            aspectMode: "fit",
            align: "start",
            margin: "sm",
          },
          {
            type: "text",
            text: "🏫SmartDorm🎉",
            weight: "bold",
            color: "#000000",
            size: "md",
            align: "center",
            gravity: "center",
            wrap: true,
            margin: "none",
          },
        ],
        paddingAll: "10px",
        spacing: "md",
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: bodyContents,
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: footerContents,
      },
      styles: {
        footer: { separator: true },
      },
    },
  };

  // 🚀 ส่งข้อความผ่าน LINE API
  try {
    await axios.post(
      "https://api.line.me/v2/bot/message/push",
      { to: userId, messages: [flex] },
      {
        headers: {
          Authorization: `Bearer ${process.env.LINE_CHANNEL_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(` [LINE] ส่งข้อความ Flex สำเร็จ`);
  } catch (err: any) {
    console.error(" [LINE Flex] Error:", err.response?.data || err.message);
  }
}
