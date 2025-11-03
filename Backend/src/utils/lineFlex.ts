import axios from "axios";

/**
 * ส่ง Flex Message แบบ SmartDorm (ใช้ Messaging API)
 */
export async function sendFlexMessage(
  userId: string,
  title: string,
  fields: { label: string; value: string; color?: string }[],
  buttonLabel: string,
  buttonUrl: string
) {
  if (!userId || !process.env.LINE_CHANNEL_TOKEN) {
    console.error("❌ Missing userId or LINE_CHANNEL_TOKEN");
    return;
  }

  const bodyContents = [
    {
      type: "text",
      text: title,
      weight: "bold",
      size: "lg",
      color: "#20c997",
      wrap: true,
    },
    { type: "separator", margin: "md" },
    ...fields.map((f) => ({
      type: "text",
      text: `${f.label} ${f.value}`,
      color: f.color || "#333333",
      wrap: true,
      margin: "sm",
    })),
  ];

  const flex = {
    type: "flex",
    altText: title,
    contents: {
      type: "bubble",
      hero: {
        type: "box",
        layout: "horizontal",
        backgroundColor: "#ffffff",
        contents: [
          {
            type: "image",
            url: "https://smartdorm-admin.biwbong.shop/assets/SmartDorm.png", // โลโก้ SmartDorm
            size: "xs",
            aspectMode: "fit",
            align: "start",
          },
          {
            type: "text",
            text: "🏫 SmartDorm 🎉",
            weight: "bold",
            color: "#20c997",
            size: "md",
            gravity: "center",
            margin: "md",
            wrap: true,
          },
        ],
        paddingAll: "12px",
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: bodyContents,
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#20c997",
            height: "sm",
            action: {
              type: "uri",
              label: buttonLabel,
              uri: buttonUrl,
            },
          },
          {
            type: "text",
            text: "ขอบคุณที่ใช้บริการ 🏫 SmartDorm 🎉",
            align: "center",
            size: "sm",
            color: "#20c997",
            weight: "bold",
            margin: "md",
            wrap: true,
          },
          {
            type: "text",
            text: "SmartDorm © 2025",
            align: "center",
            size: "xs",
            color: "#aaaaaa",
            margin: "sm",
          },
        ],
      },
      styles: {
        footer: { separator: true },
      },
    },
  };

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

  console.log(`✅ Flex Message sent to ${userId}: ${title}`);
}
