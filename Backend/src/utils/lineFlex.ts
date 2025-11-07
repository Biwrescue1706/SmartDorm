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
    ...fields.flatMap((f) => {
      const textContent = `${f.label}: ${f.value}`;
      const isLink = /^\[.*\]\(.*\)$/.test(f.value);

      if (isLink) {
        const [linkText, linkUrl] = f.value
          .substring(1, f.value.length - 1)
          .split("](");

        return {
          type: "box",
          layout: "horizontal",
          margin: "md",
          contents: [
            {
              type: "text",
              text: f.label,
              flex: 2,
              size: "sm",
              color: "#555555",
            },
            {
              type: "text",
              text: linkText,
              flex: 3,
              size: "sm",
              align: "start",
              color: "#007bff",
              decoration: "underline",
              action: { type: "uri", label: linkText, uri: linkUrl },
            },
          ],
        };
      }

      return {
        type: "box",
        layout: "horizontal",
        margin: "md",
        contents: [
          {
            type: "text",
            text: f.label,
            flex: 2,
            size: "sm",
            color: "#555555",
          },
          {
            type: "text",
            text: f.value,
            flex: 3,
            size: "sm",
            align: "start",
            color: f.color || "#111111",
            wrap: true,
          },
        ],
      };
    }),
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
            color: "#000000ff",
            size: "md",
            gravity: "center",
            margin: "center",
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
            color: "#000000ff",
            margin: "sm",
          },
        ],
      },
      styles: {
        footer: { separator: true },
      },
    },
  };

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
  } catch (error: any) {
    console.error("❌ LINE notify user failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }

}
