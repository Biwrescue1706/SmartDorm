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
      body: {
        type: "box",
        layout: "vertical",
        contents: bodyContents,
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
